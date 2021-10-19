import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import AuthContext from "contexts/auth";
import Headerbar from "components/Headerbar";
import Sidebar from "components/Sidebar";
import Loading from "components/Loading";
import routes from "routes";
import useStyles from "./styles";

const Authenticated = ({ ProtectedComponent }) => {
  const classes = useStyles();
  const { userToken, isLoggingIn } = useContext(AuthContext);
  let history = useHistory();

  useEffect(() => {
    // If the user is not in the middle of logging in but there is no user token
    if (!isLoggingIn && userToken === null) {
      history.push(routes.login.url);
      return null;
    }
  }, [userToken, isLoggingIn]);

  return isLoggingIn && userToken === null ? (
    <Loading />
  ) : (
    <div className={classes.root}>
      <Headerbar />
      <Sidebar />
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <ProtectedComponent />
      </main>
    </div>
  );
};

export default Authenticated;
