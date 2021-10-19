import { makeStyles, withStyles } from "@material-ui/core/styles";
import { Badge } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  profileBox: {
    minHeight: "30rem",
    maxWidth: "70%",
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(3),
  },
  leftBox: {
    width: "auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
  rightBox: {
    maxWidth: "25rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    marginLeft: theme.spacing(3),
    padding: theme.spacing(2),
  },
  profileTitle: {
    color: theme.palette.primary.light,
    marginTop: "0.5rem",
    marginBottom: "0.5rem",
    fontSize: "1.5rem",
    letterSpacing: "3px",
    fontWeight: "bolder",
  },
  largeAvatar: {
    width: theme.spacing(15),
    height: theme.spacing(15),
    marginBottom: theme.spacing(3),
  },
  FixedInfo: {
    marginBottom: "1rem",
    color: theme.palette.text.primary,
    fontSize: "1rem",
    fontWeight: "bold",
  },

  formControl: {
    width: "100%",
    height: "auto",
  },
  textBox: {
    marginBottom: "2rem",
  },

  researchPaper: {
    display: "flex",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    listStyle: "none",
    padding: theme.spacing(0.5),
    margin: 0,
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
    maxHeight: "5rem",
  },

  chip: {
    margin: theme.spacing(0.5),
  },

  submit: {
    margin: theme.spacing(3, 0, 1),
    color: "#ffffff",
    backgroundColor: "#3FD2C7",
    fontSize: "20px",
    fontWeight: "bolder",
    height: "50px",
    letterSpacing: "5px",
  },
}));

export const StyledBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.background.paper,
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
}))(Badge);
