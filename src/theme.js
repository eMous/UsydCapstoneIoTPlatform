import { createMuiTheme } from "@material-ui/core/styles";

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    common: {
      black: "#424242",
      white: "#ffffff",
    },
    primary: {
      light: "#3FD2C7",
      main: "#99DDFF",
      dark: "#00458B",
    },
    secondary: {
      main: "#00458B",
    },
    error: {
      main: "#d32f2f",
      contrastText: "#ffffff",
    },
    text: {
      primary: "#00458B",
      secondary: "#424242",
    },
    background: {
      default: "#99DDFF",
      paper: "#ffffff",
    },
    highlight: {
      main: "#e54861",
    },
  },
});

export default theme;
