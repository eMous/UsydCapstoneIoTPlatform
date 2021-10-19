import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    marginLeft: "auto",
  },

  welcomeIcon: {
    float: "left",
    marginLeft: 10,
    marginRight: 5,
  },

  welcomeText: {
    float: "left",
    marginLeft: 5,
    marginRight: 10,
  },
}));

export default useStyles;
