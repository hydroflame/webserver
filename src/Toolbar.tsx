import { AppBar, Box, TextField, Toolbar as Tb } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { CurrentSelection } from "./CurrentSelection";
import { useState } from "react";

interface IProps {
  search: string;
  setSearch: (v: string) => void;
}

export const Toolbar = ({ search, setSearch }: IProps): React.ReactElement => {
  const [text, setText] = useState("");
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Tb sx={{ margin: "15px", display: "flex" }}>
          <Box sx={{ width: "100%" }}>
            <TextField
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
