import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import MuiAlert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import useStyles from "./styles";
import resetUserPassword from "./services/sendPasswordReset";

const ForgotPassword = () => {
  const classes = useStyles();

  const [emailAddr, setEmailAddr] = useState("");
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isBtnDisabled, setIsBtnDisabled] = useState(false);

  const closeSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setIsSnackbarOpen(false);
  };

  const btnDebounce = async () => {
    try {
      // Attempt to make a password reset request
      await resetUserPassword(emailAddr);

      // If successful, we generate a success message to the user
      setIsSnackbarOpen(true);
      setErrorMsg("");

      // We disable the button
      setIsBtnDisabled(true);

      // After a fixed amount of time, we enable the button again
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 5000);
    } catch (error) {
      // Otherwise if there's an error, display the error message to the user
      setErrorMsg(error.toString());
    }
  };

  return (
    <Paper className={classes.paper} variant="outlined">
      <form className={classes.textFieldRoot}>
        <Grid container direction="column" spacing={4}>
          <Grid item>
            <Typography variant="h5">Forgot Password</Typography>
          </Grid>
          <Grid item>
            <TextField
              required
              variant="outlined"
              id="email-addr"
              label="Email address"
              type="email"
              value={emailAddr}
              onChange={(e) => {
                setEmailAddr(e.target.value);
              }}
              error={!!errorMsg}
              helperText={errorMsg}
              fullWidth
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              disabled={isBtnDisabled}
              onClick={btnDebounce}
            >
              Reset my password
            </Button>
          </Grid>
        </Grid>
        <Snackbar
          open={isSnackbarOpen}
          autoHideDuration={5000}
          onClose={closeSnackbar}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={closeSnackbar}
            severity="success"
          >
            Your password reset link has been sent to your email address!
          </MuiAlert>
        </Snackbar>
      </form>
    </Paper>
  );
};

export default ForgotPassword;
