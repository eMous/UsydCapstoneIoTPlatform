import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    position: "fixed",
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    scrollBehavior: "smooth",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));

export default useStyles;
