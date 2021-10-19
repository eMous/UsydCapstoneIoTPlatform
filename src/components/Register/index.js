import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import useStyles from "./styles";
import { validateUserCred, createNewUser } from "./services";
import { editProfile } from "services/api/ProjectOwner";
import { ErrorTypes } from "utils/Error";
import routes from "routes";
import { Link } from "react-router-dom";

const Register = () => {
  let history = useHistory();
  const classes = useStyles();
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [emailAddr, setEmailAddr] = useState("");
  const defaultErrorMsgs = {
    name: "",
    org: "",
    email: "",
    pwd: "",
  };
  const [errorMsgs, setErrorMsgs] = useState(defaultErrorMsgs);
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [isCreateBtnDisabled, setIsCreateBtnDisabled] = useState(false);

  const createUserBtnDebounce = async () => {
    try {
      // Disable the button first
      setIsCreateBtnDisabled(true);
      // Validate the credentials
      validateUserCred(name, org, emailAddr, pwd, confirmPwd);
      // Create a new user
      const userIdToken = await createNewUser(emailAddr, pwd);
      // If successful, update the user's name in the database
      editProfile({ name, organisation: org, balance: 0 }, userIdToken);
      // If successful, re-route the user to the dashboard page
      // NOTE: No need to re-enable the button, no longer relevant as the button will not exist anymore
      history.push(`${routes.authenticated.url}${routes.dashboard.url}`);
    } catch (error) {
      if (error.type === ErrorTypes.REGISTER_PWD) {
        setErrorMsgs({ ...defaultErrorMsgs, pwd: error.toString() });
      } else if (error.type === ErrorTypes.REGISTER_NAME) {
        setErrorMsgs({ ...defaultErrorMsgs, name: error.toString() });
      } else if (error.type === ErrorTypes.REGISTER_ORG) {
        setErrorMsgs({ ...defaultErrorMsgs, org: error.toString() });
      } else {
        setErrorMsgs({ ...defaultErrorMsgs, email: error.toString() });
      }
      // Enable the button if an error was occurred, so the user can try again
      setIsCreateBtnDisabled(false);
    }
  };

  return (
    <Paper className={classes.paper} variant="outlined">
      <form className={classes.textFieldRoot}>
        <Grid container direction="column" spacing={2}>
          <Grid item className={classes.RegisterTitle}>
            Register
          </Grid>
          <Grid item>
            <TextField
              required
              id="register-name"
              aria-label="Name"
              label="Name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              error={!!errorMsgs.name}
              helperText={errorMsgs.name}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              required
              id="register-org"
              aria-label="Organisation"
              label="Organisation"
              type="text"
              value={org}
              onChange={(e) => {
                setOrg(e.target.value);
              }}
              error={!!errorMsgs.org}
              helperText={errorMsgs.org}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              required
              id="email-addr"
              aria-label="Email address"
              label="Email address"
              type="email"
              value={emailAddr}
              onChange={(e) => {
                setEmailAddr(e.target.value);
              }}
              error={!!errorMsgs.email}
              helperText={errorMsgs.email}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              required
              id="pwd"
              aria-label="Password"
              label="Password"
              type="password"
              value={pwd}
              onChange={(e) => {
                setPwd(e.target.value);
              }}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              required
              id="confirm-pwd"
              aria-label="Confirm Password"
              label="Confirm Password"
              type="password"
              value={confirmPwd}
              onChange={(e) => {
                setConfirmPwd(e.target.value);
              }}
              error={!!errorMsgs.pwd}
              helperText={errorMsgs.pwd}
              fullWidth
            />
          </Grid>
          <Grid item>
            <Button
              className={classes.submit}
              variant="contained"
              disabled={isCreateBtnDisabled}
              onClick={createUserBtnDebounce}
              fullWidth
            >
              Create
            </Button>
          </Grid>
          <Grid container direction="row" justify="center" item>
            <Grid item>
              <Button
                onClick={() => {
                  history.push(routes.login.url);
                }}
              >
                Already have an account?
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default Register;
