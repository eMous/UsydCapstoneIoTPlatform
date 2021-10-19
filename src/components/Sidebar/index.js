import React from "react";
import Drawer from "@material-ui/core/Drawer";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItemLink from "./ListItemLink";
import CreateProjectButton from "./CreateProjectBtn";
import useStyles from "./styles";
import routes from "../../routes";
import icons from "./icons";

const Sidebar = () => {
  const classes = useStyles();
  const navBarRoutes = [
    routes.dashboard,
    routes.projects,
    routes.profile,
    routes.balance,
  ];

  return (
    <Drawer
      className={classes.drawer}
      variant="permanent"
      anchor="left"
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      {/* This is so the content of the Sidebar starts below the App bar */}
      <div className={classes.toolbar} />
      <Divider />
      <List>
        {navBarRoutes.map((route, idx) => (
          <ListItemLink
            key={idx}
            to={`${routes.authenticated.url}${route.url}`}
            primary={route.title}
            iconName={icons[route.title]}
            className={classes.listItems}
          />
        ))}
      </List>
      <CreateProjectButton />
    </Drawer>
  );
};

export default Sidebar;
