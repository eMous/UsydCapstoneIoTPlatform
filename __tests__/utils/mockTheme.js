import { ThemeProvider } from "@material-ui/core/styles";
import theme from "../../src/theme";

const MockThemeProvider = ({ children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default MockThemeProvider;
