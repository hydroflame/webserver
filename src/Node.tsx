import { Typography } from "@mui/material";
import React from "react";
import { dispatchCopy } from "./CurrentSelection";
import { isFile, SearchResult } from "./utils";

interface IProps {
  node: SearchResult;
}
export const Node = ({ node }: IProps): React.ReactElement => {
  const onClick = () => {
    dispatchCopy(node.fullTitle);
  };
  const r = node.result;
  if (isFile(r)) {
    return <Typography onClick={onClick}>{node.fullTitle}</Typography>;
  } else {
    return (
      <details onClick={onClick}>
        <summary>{node.fullTitle}</summary>

        <fieldset>
          {r.files.map((f, i) =>
            isFile(f) ? (
              <Node
                key={i}
                node={{ fullTitle: `${r.title}/${f}`, result: f }}
              />
            ) : (
              <Node key={i} node={{ fullTitle: f.title, result: f }} />
            )
          )}
        </fieldset>
      </details>
    );
  }
};
