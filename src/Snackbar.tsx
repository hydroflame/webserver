import { Paper, Snackbar as Sb, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";

const EVENT_TYPE = "TOAST";
export const dispatchToast = (message: string): void => {
  document.dispatchEvent(
    new CustomEvent<string>(EVENT_TYPE, { detail: message })
  );
};

const subscribeToast = (sub: (message: string) => void): (() => void) => {
  const f = (e: any) => {
    sub(e.detail);
  };
  document.addEventListener(EVENT_TYPE as keyof DocumentEventMap, f);
  return () =>
    document.removeEventListener(EVENT_TYPE as keyof DocumentEventMap, f);
};

export const Snackbar = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    return subscribeToast((message) => {
      setOpen(true);
      setMessage(message);
    });
  }, []);

  return (
    <Sb
      open={open}
      anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
      autoHideDuration={2000}
      onClose={() => setOpen(false)}
    >
      <Paper elevation={9} sx={{ padding: "1em" }}>
        <Typography>{message}</Typography>
      </Paper>
    </Sb>
  );
};
