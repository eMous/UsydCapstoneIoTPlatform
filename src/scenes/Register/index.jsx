import React from "react";
import Register from "components/Register";
import useStyles from "./styles";

const RegisterScene = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Register />
    </div>
  );
};

export default RegisterScene;
