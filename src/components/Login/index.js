import React, { useContext, useState, useEffect } from "react";
import AuthContext from "contexts/auth";
import Container from "@material-ui/core/Container";
import Alert from "@material-ui/lab/Alert";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import { TextField } from "@material-ui/core";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import useStyles from "./styles";
import routes from "routes";
import { firebaseAuth } from "./services";
import { ErrorTypes } from "utils/Error";
import Loading from "components/Loading";

function Login() {
  const classes = useStyles();
  const history = useHistory();
  const { userToken, isLoggingIn } = useContext(AuthContext);
  const [values, setValues] = useState({
    email: "",
    password: "",
    errors: [],
    showPassword: false,
  });

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleErrors = (error) => {
    setValues({ ...values, errors: error });
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const validateInput = () => {
    const { email, password } = values;
    if (email === "" || password === "") {
      handleErrors(["Please fill in all the required fields."]);
      return false;
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      handleErrors(["Email format is invalid. Please fill in again."]);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    const { email, password } = values;
    if (validateInput()) {
      try {
        await firebaseAuth(email, password);
        history.push(`${routes.authenticated.url}${routes.dashboard.url}`);
      } catch (error) {
        handleErrors([]);
        if (error.type === ErrorTypes.LOGIN_EMAIL) {
          handleErrors([error.toString()]);
        } else {
          handleErrors([error.toString()]);
        }
      }
    }
  };

  return (
    <Container className={classes.loginContainer}>
      <Container className={classes.loginBox}>
        <Box>
          <div className={classes.loginTitle}>Login</div>
          <div className={classes.loginError}>
            {values.errors.length > 0 &&
              values.errors.map((error) => {
                return <Alert severity="error">{error}</Alert>;
              })}
          </div>
          <form className={classes.loginForm} noValidate>
            <TextField
              type="email"
              id="login-email"
              className={classes.textBox}
              variant="standard"
              required
              fullWidth
              autoFocus
              label="Email"
              value={values.email}
              onChange={handleChange("email")}
            />
            <TextField
              className={classes.textBox}
              type={values.showPassword ? "text" : "password"}
              variant="standard"
              name="password"
              label="Password"
              required
              fullWidth
              value={values.password}
              onChange={handleChange("password")}
            />
            <Link className={classes.links} to="/forgot-pwd">
              Forget the password?
            </Link>
            <Button
              fullWidth
              variant="contained"
              className={classes.submit}
              onClick={handleSubmit}
            >
              Login
            </Button>
            <div className={classes.baseLine}>
              Don't have an account? &nbsp;
              <Link className={classes.links} to={routes.register.url}>
                Create an account.
              </Link>
            </div>
          </form>
        </Box>
      </Container>
      <Container className={classes.loginImg}>
        <Box>
          <div className={classes.imgText}>Welcome</div>
          <div className={classes.imgText}>Back</div>
        </Box>
      </Container>
    </Container>
  );
}

export default Login;
