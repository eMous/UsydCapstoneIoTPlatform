import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import WelcomeIcon from "./WelcomeIcon";
import ProfileButton from "./ProfileButton";
import useStyles from "./styles";

const Headerbar = () => {
  const classes = useStyles();

  return (
    <AppBar position="fixed" color="secondary" className={classes.appBar}>
      <Toolbar>
        <WelcomeIcon />
        <ProfileButton />
      </Toolbar>
    </AppBar>
  );
};

export default Headerbar;
