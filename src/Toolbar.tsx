import { AppBar, Box, TextField, Toolbar as Tb } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export const Toolbar = (): React.ReactElement => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Tb sx={{ margin: "15px", display: "flex" }}>
          <Box sx={{ width: "100%" }}>
            <TextField
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
