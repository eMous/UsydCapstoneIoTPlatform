import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    width: "100%",
    height: "100%",
    display: "flex",
    position: "fixed",
    justifyContent: "center",
    alignItems: "center",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));

export default useStyles;
