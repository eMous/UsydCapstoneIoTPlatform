import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    backgroundColor: theme.palette.background.default,
    width: "100%",
    height: "100%",
    position: "fixed",
    alignItems: "center",
    justifyContent: "center",
    overflow: "auto",
  },

  content: {
    flexGrow: 1,
    overflow: "auto",
  },

  toolbar: theme.mixins.toolbar,
}));

export default useStyles;
