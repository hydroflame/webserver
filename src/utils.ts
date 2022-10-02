export interface Folder {
  title: string;
  files: Folder[] | string[];
}

export const isFile = (f: unknown): f is string => typeof f === "string";

export const makeHighestTarget = (filenames: string[]): string[] => {
  filenames = Array.from(filenames);
  const out: string[][] = [];
  filenames.forEach((f) => {
    const parts = f.split("/");
    const found = out.find((o) => o.every((p, i) => p === parts[i]));
    if (found) return;
    out.push(parts);
  });
  return out.map((o) => o.join("/"));
};

const findResult = (
  title: string,
  parts: string[],
  folder: Folder
): SearchResult | undefined => {
  if (parts.length === 0) return { fullTitle: title, result: folder };
  const files = folder.files;
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (isFile(f)) {
      if (files[i] === parts[0]) {
        return { fullTitle: `${title}/${parts[0]}`, result: files[i] };
      }
    } else if (f.title === parts[0]) {
      return findResult(`${title}/${parts[0]}`, parts.slice(1), f);
    }
  }
  return undefined;
};

export interface SearchResult {
  fullTitle: string;
  result: Folder | string;
}

export const mapSearchResult = (
  results: string[],
  folders: Folder[]
): SearchResult[] => {
  return results
    .map((r) => {
      const parts = r.split("/");
      const f = folders.find((f) => parts[0] === f.title);
      if (!f) return;
      return findResult(parts[0], parts.slice(1), f);
    })
    .filter((f): f is SearchResult => f !== undefined);
};

export const copyToClipboard = (s: string): void => {
  // navigator clipboard api needs a secure context (https)
  if (navigator.clipboard && window.isSecureContext) {
    // navigator clipboard api method'
    navigator.clipboard.writeText(s);
  } else {
    // text area method
    let textArea = document.createElement("textarea");
    textArea.value = s;
    // make the textarea out of viewport
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);

    textArea.select();
    document.execCommand("copy");
    textArea.remove();
  }
};
