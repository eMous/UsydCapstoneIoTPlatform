import { createContext } from "react";

const AuthContext = createContext({
  userToken: null,
  isLoggingIn: true,
  setIsLoggingIn: () => {},
});

export default AuthContext;
