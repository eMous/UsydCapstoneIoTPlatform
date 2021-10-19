import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(4),
    width: "100%",
    maxWidth: "25rem",
    margin: "auto",
  },

  textFieldRoot: {
    "& .MuiTextField-root": {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  },
}));

export default useStyles;
