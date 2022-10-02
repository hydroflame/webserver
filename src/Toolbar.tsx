import { AppBar, Box, TextField, Toolbar as Tb } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface IProps {
  search: string;
  setSearch: (v: string) => void;
}

export const Toolbar = ({ search, setSearch }: IProps): React.ReactElement => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Tb sx={{ margin: "15px", display: "flex" }}>
          <Box sx={{ width: "100%" }}>
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              autoFocus
              InputProps={{
                startAdornment: <SearchIcon sx={{ margin: ".5em" }} />,
              }}
            />
          </Box>
        </Tb>
      </AppBar>
    </Box>
  );
};
