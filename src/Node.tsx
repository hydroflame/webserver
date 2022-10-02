import { Typography } from "@mui/material";
import React, { useState } from "react";
import { dispatchCopy } from "./CurrentSelection";
import { isFile, makeHighestTarget, SearchResult } from "./utils";

interface IProps {
  file: string;
  filenames: string[];
  root?: boolean;
}
export const Node = ({ file, filenames, root }: IProps): React.ReactElement => {
  const children = filenames.filter((f) => f.startsWith(file + "/"));
  const onClick = () => {
    dispatchCopy(file);
  };
  if (children.length === 0) {
    const title = root ? file : file.slice(file.lastIndexOf("/") + 1);
    return <Typography onClick={onClick}>{title}</Typography>;
  } else {
    return <FolderNode file={file} filenames={children} root={root} />;
  }
};

const FolderNode = ({ file, filenames, root }: IProps): React.ReactElement => {
  const [open, setOpen] = useState(false);

  const targets = makeHighestTarget(filenames);

  const onClick = (event: any) => {
    event.preventDefault();
    setOpen((o) => !o);
    dispatchCopy(file);
  };
  const title = root ? file : file.slice(file.lastIndexOf("/") + 1);
  return (
    <details open={open}>
      <summary onClick={onClick}>{title}</summary>

      <fieldset>
        {targets.map((c, i) =>
          open ? <Node key={i} file={c} filenames={filenames} /> : <></>
        )}
      </fieldset>
    </details>
  );
};
