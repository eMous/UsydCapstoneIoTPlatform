/*global firebase*/
import Icon from "@material-ui/core/Icon";
import Typography from "@material-ui/core/Typography";
import useStyles from "./styles";
import { GetUserInfoApi } from "services/api/ProjectOwner";
import { CustomException, ErrorTypes } from "utils/Error";
import { useEffect, useState } from "react";

const WelcomeIcon = () => {
  const classes = useStyles();
  const [userName, setUserName] = useState();

  useEffect(() => {
    async function getData() {
      try {
        const retrievedToken = await firebase.auth().currentUser.getIdToken();
        const data = await GetUserInfoApi(retrievedToken);
        setUserName(data.name);
      } catch (error) {
        throw new CustomException(
          "Get-user-error",
          { error },
          ErrorTypes.BACKEND_PROFILE
        );
      }
    }
    getData();
  }, []);

  return (
    <div className={classes.root}>
      <Icon className={classes.welcomeIcon}>account_circle</Icon>
      <Typography className={classes.welcomeText}>
        Welcome back, {userName}!
      </Typography>
    </div>
  );
};

export default WelcomeIcon;
