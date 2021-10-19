import "./App.css";
import { Route, Switch } from "react-router-dom";
import routes from "./routes";
import LoginScene from "./scenes/Login";
import RegisterScene from "./scenes/Register";
import ForgotPasswordScene from "./scenes/ForgotPassword";
import AuthenticatedScene from "./scenes/Authenticated";

function App() {
  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
      <Switch>
        <Route exact path="/" render={() => <LoginScene />} />
        <Route
          exact
          path={routes.register.url}
          render={() => <RegisterScene />}
        />
        <Route
          exact
          path={routes.forgotPwd.url}
          render={() => <ForgotPasswordScene />}
        />
        <Route exact path={routes.login.url} render={() => <LoginScene />} />
        <Route
          path={routes.authenticated.url}
          render={() => <AuthenticatedScene />}
        />
      </Switch>
    </div>
  );
}

export default App;
