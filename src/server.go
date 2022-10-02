package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"
	"text/template"
)

var (
	videoExts = []string{".webm", ".mkv", ".flv", ".flv", ".vob", ".vob",
		".ogv", ".ogg", ".drc", ".gif", ".gifv", ".g", ".webm", ".gifv", ".mng",
		".avi", ".MTS", ".M2TS", ".mov", ".qt", ".wmv", ".net", ".yuv", ".rm",
		".rmvb", ".asf", ".amv", ".mp4", ".m4p", ".m4v", ".mpg", ".mp2",
		".mpeg", ".mpe", ".mpv", ".mpg", ".mpeg", ".m2v", ".m4v", ".svi",
		".3gp", ".3g2", ".mxf", ".roq", ".nsv", ".flv", ".f4v", ".f4p",
		".f4a", ".f4b"}
)

var rootDir = flag.String("root", "root", "the root directory of the tree to generate.")
var listenAddr = flag.String("listen", ":80", "the root directory of the tree to generate.")

type Folder struct {
	Title string        `json:"title"`
	Files []interface{} `json:"files"`
}

func treemaker(root string) ([]string, error) {
	var files []string

	f := func(path string, f os.FileInfo, err error) error {
		if f.IsDir() {
			return nil
		}

		parts := strings.SplitN(path, string(filepath.Separator), 2)
		for _, ext := range videoExts {
			if strings.HasSuffix(parts[1], ext) {
				fmt.Println(parts[1])
				files = append(files, parts[1])
			}
		}
		return nil
	}
	if err := filepath.Walk(*rootDir, f); err != nil {
		return nil, err
	}
	return files, nil
}

func escapeNoSlash(s string) string {
	parts := strings.Split(s, "/")
	for i, part := range parts {
		parts[i] = url.PathEscape(part)
	}

	return path.Join(parts...)
}

func main() {
	flag.Parse()

	index := func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./index.html")
	}

	http.HandleFunc("/", index)
	http.HandleFunc("/index.html", index)

	static := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", static))

	raw := http.FileServer(http.Dir(*rootDir))
	http.Handle("/raw/", http.StripPrefix("/raw/", raw))

	http.HandleFunc("/api/files", apiFiles)

	http.HandleFunc("/vlc/", loadVLC)

	fmt.Println("starting server on " + *listenAddr)
	if err := http.ListenAndServe(*listenAddr, nil); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
func loadVLC(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.String(), "/vlc/")
	path = strings.TrimSuffix(path, ".xspf")
	path, err := url.QueryUnescape(path)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Println(filepath.Join(*rootDir, path))
	file, err := os.Open(filepath.Join(*rootDir, path))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	stat, err := file.Stat()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if stat.IsDir() {
		generateVLCPlaylist(w, r, path)
	} else {
		generateVLCFile(w, r, path)
	}
}

func apiFiles(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	tree, err := treemaker(*rootDir)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	json.NewEncoder(w).Encode(tree)
}

// VLCPlaylistTemplate is the template to generate a VLC playlist file.
var VLCPlaylistTemplate *template.Template

func init() {
	var err error
	VLCPlaylistTemplate, err = template.New("vlcplaylist").Parse(`<?xml version="1.0" encoding="UTF-8"?>
	<playlist xmlns="http://xspf.org/ns/0/" xmlns:vlc="http://www.videolan.org/vlc/playlist/ns/0/" version="1">
		<title>{{ .Name }}</title>
		<trackList>
{{- range $index, $video := .Videos }}
			<track>
				<location>{{ $video.URL }}</location>
				<title>{{ $video.Name }}</title>
				<extension application="http://www.videolan.org/vlc/playlist/0">
					<vlc:id>{{ $index }}</vlc:id>
					<vlc:option>network-caching=1000</vlc:option>
				</extension>
			</track>
{{- end }}
		</trackList>
		<extension application="http://www.videolan.org/vlc/playlist/0">
{{- range $index, $video := .Videos }}
			<vlc:item tid="{{ $index }}"/>
{{- end }}
		</extension>
	</playlist>
`)
	if err != nil {
		panic(err)
	}
}

type PlaylistItem struct {
	URL  string
	Name string
}

type PlaylistTemplate struct {
	Name   string
	Videos []PlaylistItem
}

func escapeAmp(s string) string { return strings.Replace(s, "&", "&amp;", -1) }

func generateVLCFile(w http.ResponseWriter, r *http.Request, osPath string) {
	r.Header.Set("Content-Type", "application/xml")
	err := VLCPlaylistTemplate.Execute(w, PlaylistTemplate{
		Name: strings.TrimSuffix(osPath, filepath.Ext(osPath)),
		Videos: []PlaylistItem{
			{
				URL:  escapeAmp(fmt.Sprintf("http://%s/raw/%s", r.Host, url.PathEscape(osPath))),
				Name: escapeAmp(strings.TrimSuffix(osPath, filepath.Ext(osPath))),
			},
		},
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func generateVLCPlaylist(w http.ResponseWriter, r *http.Request, osPath string) {
	finfos, err := ioutil.ReadDir(filepath.Join(*rootDir, osPath))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	playlistName := strings.Replace(osPath, "/", " - ", -1)

	var names []string
	for _, finfo := range finfos {
		if finfo.IsDir() {
			continue
		}
		names = append(names, finfo.Name())
	}
	sort.Strings(names)

	parts := strings.Split(osPath, "/")
	for i, part := range parts {
		parts[i] = url.PathEscape(part)
	}

	var items []PlaylistItem
	for _, name := range names {
		items = append(items, PlaylistItem{
			URL:  escapeAmp(fmt.Sprintf("http://%s/raw/%s/%s", r.Host, path.Join(parts...), url.PathEscape(name))),
			Name: escapeAmp(name),
		})
	}
	print(items)

	r.Header.Set("Content-Type", "application/xml")
	err = VLCPlaylistTemplate.Execute(w, PlaylistTemplate{
		Name:   playlistName,
		Videos: items,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func print(v interface{}) {
	e := json.NewEncoder(os.Stdout)
	e.SetIndent("", "  ")
	e.Encode(v)
}
