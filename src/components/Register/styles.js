import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(4),
    maxWidth: "100%",
    margin: "auto",
    scrollBehavior: "auto",
    minHeight: "35rem",
  },

  RegisterTitle: {
    color: theme.palette.primary.light,
    marginTop: "1.5px",
    fontSize: "27px",
    letterSpacing: "5px",
    fontWeight: "bolder",
  },

  textFieldRoot: {
    width: "25rem",
    "& .MuiTextField-root": {
      marginTop: theme.spacing(1.5),
      marginBottom: theme.spacing(1.5),
    },
  },
  submit: {
    margin: theme.spacing(1.5, 0, 1),
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.light,
    fontSize: "20px",
    fontWeight: "bolder",
    height: "50px",
    letterSpacing: "5px",
  },
  links: {
    color: theme.palette.primary.dark,
    fontSize: "12px",
  },
}));

export default useStyles;
