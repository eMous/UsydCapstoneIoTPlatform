import React from "react";
import ForgotPassword from "components/ForgotPassword";
import useStyles from "./styles";

const ForgotPasswordScene = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <ForgotPassword />
    </div>
  );
};

export default ForgotPasswordScene;
