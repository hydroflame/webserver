import React, { useState, useEffect } from "react";
import { Toolbar } from "./Toolbar";
import AllFiles from "./example.json";
import fuzzysort from "fuzzysort";
import {
  copyToClipboard,
  makeFilenames,
  makeHighestTarget,
  mapSearchResult,
} from "./utils";
import { Box } from "@mui/system";
import { TreeView } from "@mui/lab";
import { Node } from "./Node";
import { Snackbar } from "./Snackbar";

function App() {
  const [files, setFiles] = useState(AllFiles);
  const [search, setSearch] = useState("");
  const allFilenames = makeFilenames(AllFiles);
  const results = search
    ? fuzzysort.go(search, allFilenames).map((f) => f.target)
    : allFilenames;
  const filenames = makeHighestTarget(results);
  const output = mapSearchResult(filenames, AllFiles);

  useEffect(() => {
    const r = output[0];
    if (!r) return;
    copyToClipboard(r.fullTitle);
  });

  return (
    <>
      <Toolbar search={search} setSearch={(v: string) => setSearch(v)} />
      <Box sx={{ padding: "1em" }}>
        <TreeView>
          {output.map((f, i) => (
            <Node key={i} node={f} />
          ))}
        </TreeView>
      </Box>
      <Snackbar />
    </>
  );
}

export default App;
