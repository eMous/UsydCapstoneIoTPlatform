import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  btn: {
    marginLeft: 30,
    marginRight: 30,
    marginTop: 80,
    height: "3rem",
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
    fontSize: "1rem",
    fontWeight: "bold",
  },
}));

export default useStyles;
