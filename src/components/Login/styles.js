import { makeStyles } from "@material-ui/core/styles";
import LoginImg from "../../Asset/LoginImg.png";

const useStyles = makeStyles((theme) => ({
  loginContainer: {
    width: "70%",
    minWidth: "50rem",
    minHeight: "25rem",
    maxWidth: "70rem",
    maxHeight: "40rem",
    height: "70%",
    display: "flex",
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    padding: "0px",
  },

  loginBox: {
    height: "100%",
    minHeight: "25rem",
    maxWidth: "50%",
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  insideBox: {},
  loginImg: {
    height: "100%",
    maxWidth: "50%",
    backgroundImage: `url(${LoginImg})`,
    backgroundPositionX: "center",
    backgroundPositionY: "100%",
    backgroundRepeat: "no-repeat",
    display: "flex",
    alignItems: "center",
  },
  loginTitle: {
    color: theme.palette.primary.light,
    marginTop: "1.5px",
    fontSize: "27px",
    letterSpacing: "5px",
    fontWeight: "bolder",
  },
  loginError: {
    Height: "2.7rem",
  },
  loginForm: {
    margin: theme.spacing(3),
  },
  textBox: {
    marginBottom: "1.5rem",
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.light,
    fontSize: "20px",
    fontWeight: "bolder",
    height: "50px",
    letterSpacing: "5px",
  },
  baseLine: {
    alignItems: "center",
    fontSize: "13px",
    marginBottom: "10px",
    color: theme.palette.primary.light,
  },
  links: {
    color: theme.palette.primary.dark,
    fontSize: "12px",
  },
  imgText: {
    color: theme.palette.common.white,
    marginBottom: "2rem",
    fontSize: "300%",
    letterSpacing: "5px",
    fontWeight: "bolder",
    textAlign: "right",
  },
}));

export default useStyles;
