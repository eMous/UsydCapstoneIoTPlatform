import CircularProgress from "@material-ui/core/CircularProgress";
import useStyles from "./styles";

const Loading = () => {
  const classes = useStyles();

  return <CircularProgress className={classes.spinner} />;
};

export default Loading;
