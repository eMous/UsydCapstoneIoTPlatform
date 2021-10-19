import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650,
    minHeight: "10rem",
  },

  noProjMsg: {
    marginTop: 20,
  },

  loading: {
    marginTop: 20,
  },
  details: {
    padding: theme.spacing(5),
    marginTop: "3rem",
    display: "flex",
    flexFlow: "column wrap",
    justifyContent: "flex-end",
    scrollBehavior: "auto",
    width: "80%",
  },
  backButton: {
    width: "20%",
    fontSize: "15px",
  },
  detailsPaper: {
    margin: "1rem auto",
    padding: theme.spacing(5),
    backgroundColor: theme.palette.background.paper,
    maxWidth: "40rem",
    width: "80%",
    borderRadius: "5px",
  },
  prjTitle: {
    display: "flex",
    flexFlow: "column wrap",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    alignContent: "flex-start",
    marginBottom: "1rem",
  },
  sensors: {
    display: "flex",
    flexFlow: "column wrap",
    justifyItems: "flex-start",
    marginBottom: "1rem",
    width: "100%",
  },
}));

export default useStyles;
