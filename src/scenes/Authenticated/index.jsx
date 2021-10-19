import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import routes from "../../routes";
import Authenticated from "components/Authenticated";
import Dashboard from "components/Dashboard";
import Projects from "components/Projects";
import Profile from "components/Profile";
import CreateProject from "components/CreateProject";
import Balance from "components/Balance";
import { ProjectDetails } from "components/Projects/ProjectDetail";

const AuthenticatedScene = () => {
  let { path, url } = useRouteMatch();

  return (
    <Switch>
      <Route
        path={`${path}${routes.dashboard.url}`}
        render={() => <Authenticated ProtectedComponent={Dashboard} />}
      />
      <Route
        path={`${path}${routes.projects.url}`}
        render={() => <Authenticated ProtectedComponent={Projects} />}
      />
      <Route
        path={`${path}${routes.profile.url}`}
        render={() => <Authenticated ProtectedComponent={Profile} />}
      />
      <Route
        path={`${path}${routes.createProject.url}`}
        render={() => <Authenticated ProtectedComponent={CreateProject} />}
      />
      <Route
        path={`${path}${routes.balance.url}`}
        render={() => <Authenticated ProtectedComponent={Balance} />}
      />
      <Route
        path={`${path}${routes.projectDetails.url}`}
        render={() => <Authenticated ProtectedComponent={ProjectDetails} />}
      />
    </Switch>
  );
};

export default AuthenticatedScene;
