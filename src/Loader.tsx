import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import App from "./App";
import { config } from "./config";
import { Folder } from "./utils";

const generateAllFiles = (files: string[]): string[] => {
  const uniq = new Set<string>();
  for (const file of files) {
    const parts = file.split("/");
    for (let i = 1; i <= parts.length; i++) {
      uniq.add(parts.slice(0, i).join("/"));
    }
  }
  return Array.from(uniq.values());
};

export const Loader = (): React.ReactElement => {
  const [folders, setFolders] = useState<string[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(`http://${config.host}/api/files`).then(async (f) => {
      const resp = await f.json();
      if ("error" in resp) {
        setError(resp.error);
      } else {
        setFolders(generateAllFiles(resp));
      }
    });
  }, []);
  if (!error && folders.length === 0) {
    return (
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        style={{ minHeight: "100vh" }}
      >
        <Grid item>
          <CircularProgress size={300} color="primary" />
        </Grid>
      </Grid>
    );
  }
  if (error) {
    return <Typography>{error}</Typography>;
  }
  return <App files={folders} />;
};
