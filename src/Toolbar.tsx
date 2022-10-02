import { AppBar, Box, TextField, Toolbar as Tb } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { CurrentSelection } from "./CurrentSelection";
import { useState, useRef, useEffect } from "react";

const EVENT_TYPE = "FOCUS";
export const dispatchFocus = (): void => {
  document.dispatchEvent(new CustomEvent<string>(EVENT_TYPE));
};

const subscribeFocus = (sub: () => void): (() => void) => {
  const f = (e: any) => {
    sub();
  };
  document.addEventListener(EVENT_TYPE as keyof DocumentEventMap, f);
  return () =>
    document.removeEventListener(EVENT_TYPE as keyof DocumentEventMap, f);
};

interface IProps {
  search: string;
  setSearch: (v: string) => void;
}

export const Toolbar = ({ search, setSearch }: IProps): React.ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    return subscribeFocus(() => {
      if (!ref.current) return;
      ref.current.focus();
    });
  }, []);
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Tb sx={{ margin: "15px", display: "flex" }}>
          <Box sx={{ width: "100%" }}>
            <TextField
              inputRef={ref}
              autoComplete="never"
              value={text}
              onChange={(e) => {
                setSearch(e.target.value);
                setText(e.target.value);
              }}
              fullWidth
              autoFocus
              InputProps={{
                startAdornment: <SearchIcon sx={{ margin: ".5em" }} />,
              }}
            />
            <hr />

            <CurrentSelection />
          </Box>
        </Tb>
      </AppBar>
    </Box>
  );
};
