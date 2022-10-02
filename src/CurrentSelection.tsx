import { TextField } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import React, { useState, useEffect } from "react";
import { copyToClipboard } from "./utils";
import { config } from "./config";

const EVENT_TYPE = "COPY";
export const dispatchCopy = (link: string): void => {
  document.dispatchEvent(new CustomEvent<string>(EVENT_TYPE, { detail: link }));
};

const subscribeCopy = (sub: (message: string) => void): (() => void) => {
  const f = (e: any) => {
    sub(e.detail);
  };
  document.addEventListener(EVENT_TYPE as keyof DocumentEventMap, f);
  return () =>
    document.removeEventListener(EVENT_TYPE as keyof DocumentEventMap, f);
};

export const CurrentSelection = (): React.ReactElement => {
  const [selection, setSelection] = useState("");

  useEffect(() => {
    return subscribeCopy((message) => {
      setSelection(message);
      copyToClipboard(
        `http://${config.host || location.host}/vlc/${encodeURIComponent(
          message
        )}.xspf`
      );
    });
  }, []);

  return (
    <TextField
      value={selection}
      disabled
      fullWidth
      autoFocus
      InputProps={{
        startAdornment: <ContentCopyIcon sx={{ margin: ".5em" }} />,
      }}
    />
  );
};
