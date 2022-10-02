import React, { useState, useEffect } from "react";
import { Toolbar } from "./Toolbar";
import fuzzysort from "fuzzysort";
import {
  copyToClipboard,
  Folder,
  isFile,
  makeHighestTarget,
  mapSearchResult,
} from "./utils";
import { Box } from "@mui/system";
import { TreeView } from "@mui/lab";
import { Node } from "./Node";
import { dispatchCopy } from "./CurrentSelection";
import { Typography } from "@mui/material";
import { debounce } from "lodash";

function App({ files }: { files: string[] }) {
  const [search, setSearch] = useState("");

  const results = search
    ? fuzzysort.go(search, files).map((f) => f.target)
    : files;
  const targets = makeHighestTarget(results);

  const onChange = React.useRef(
    debounce((v: string) => setSearch(v), 300)
  ).current;

  useEffect(() => {
    const r = targets[0];
    if (!r) return;
    dispatchCopy(r);
  });

  return (
    <>
      <Toolbar search={search} setSearch={onChange} />
      <Box sx={{ padding: "1em" }}>
        {/* {filenames.map((r) => (
          <Typography key={r}>{r}</Typography>
        ))} */}
        {targets.map((f, i) => (
          <Node key={i} file={f} filenames={files} root={true} />
        ))}
      </Box>
    </>
  );
}

export default App;
