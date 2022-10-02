import { TreeItem } from "@mui/lab";
import React from "react";
import { dispatchToast } from "./Snackbar";
import { isFile, SearchResult } from "./utils";

interface IProps {
  node: SearchResult;
}
export const Node = ({ node }: IProps): React.ReactElement => {
  const r = node.result;
  if (isFile(r)) {
    return (
      <TreeItem
        nodeId={node.fullTitle}
        label={r}
        onClick={() => dispatchToast(`VLC copied!`)}
      />
    );
  } else {
    return (
      <TreeItem nodeId={node.fullTitle} label={node.fullTitle}>
        {r.files.map((f, i) =>
          isFile(f) ? (
            <Node node={{ fullTitle: `${r.title}/${f}`, result: f }} />
          ) : (
            <Node node={{ fullTitle: f.title, result: f }} />
          )
        )}
      </TreeItem>
    );
  }
};
