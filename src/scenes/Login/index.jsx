import React, { useContext, useState, useEffect } from "react";
import AuthContext from "contexts/auth";
import Login from "components/Login";
import useStyles from "./styles";
import Loading from "components/Loading";
import { useHistory } from "react-router-dom";
import routes from "routes";

const LoginScene = () => {
  const classes = useStyles();
  const { userToken, isLoggingIn } = useContext(AuthContext);
  const history = useHistory();

  useEffect(() => {
    // If the user has logged in
    if (isLoggingIn && userToken !== null) {
      history.push(`${routes.authenticated.url}${routes.dashboard.url}`);
    } else {
      console.log(userToken);
    }
  }, [userToken, isLoggingIn]);

  return (
    <div className={classes.root}>
      <Login />
    </div>
  );
};

export default LoginScene;
