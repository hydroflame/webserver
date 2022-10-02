interface Folder {
  title: string;
  files: Folder[] | string[];
}

export const isFile = (f: unknown): f is string => typeof f === "string";

const makeFolderFilenames = (folder: Folder): string[] => {
  const filenames: string[] = [];
  folder.files.forEach((f) => {
    if (!isFile(f)) {
      filenames.push(...makeFolderFilenames(f));
    } else {
      filenames.push(f);
    }
  });
  return filenames.map((f) => `${folder.title}/${f}`).concat([folder.title]);
};

export const makeFilenames = (folders: Folder[]): string[] => {
  const filenames: string[] = [];
  folders.forEach((f) => filenames.push(...makeFolderFilenames(f)));
  return filenames;
};

export const makeHighestTarget = (filenames: string[]): string[] => {
  filenames.sort();
  const out: string[][] = [];
  filenames.forEach((f) => {
    const parts = f.split("/");
    const found = out.find((o) => o.every((p, i) => p === parts[i]));
    if (found) return;
    out.push(parts);
  });
  return out.map((o) => o.join("/")).sort((a, b) => a.length - b.length);
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
        console.log(`${title}/${parts[0]}`);
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
  navigator.clipboard.writeText(s);
};
