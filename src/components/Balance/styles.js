import { makeStyles, withStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    scrollBehavior: "auto",
    width: "50%",
    minWidth: "30rem",
    //backgroundColor: theme.palette.common.white,
  },
  paper: {
    margin: "3rem auto",
    height: "12rem",
    width: "20rem",
    borderRadius: "15px",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: "1rem",
  },
  box: {
    margin: "2rem auto",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    alignContent: "center",
  },
  text: {
    width: "100%",
    color: theme.palette.primary.main,
    marginBottom: "1.5rem",
  },
  balance: {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    width: "100%",
    justifyContent: "flex-start",
    color: theme.palette.primary.main,
  },
  topUp: {
    margin: "0rem auto",
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "column",
    alignItems: "center",
    width: "80%",
    height: "auto",
  },
  moneyIcon: {
    color: theme.palette.common.white,
  },
  button: {
    marginTop: "1rem",
    backgroundColor: theme.palette.common.white,
    color: theme.palette.primary.dark,
    borderRadius: "30px",
  },
}));
