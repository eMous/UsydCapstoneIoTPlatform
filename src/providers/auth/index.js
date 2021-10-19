/* global firebase */
import React, { useEffect, useState } from "react";
import AuthContext from "contexts/auth";
import { CustomException } from "utils/Error";

const AuthProvider = ({ children }) => {
  const [loginState, setLoginState] = useState({
    userToken: null,
    isLoggingIn: true,
    setIsLoggingIn: (isUserLoggingIn) => {
      setLoginState({ ...loginState, isLoggingIn: Boolean(isUserLoggingIn) });
    },
  });

  useEffect(() => {
    firebase.auth().onAuthStateChanged(async (authUser) => {
      // If the user is signed in
      if (authUser) {
        let retrievedToken = null;
        try {
          retrievedToken = await authUser.getIdToken();
          return;
        } catch (error) {
          throw new CustomException(
            "Firebase Auth Error",
            "Could not retrieve the user's Firebase ID token."
          );
        } finally {
          setLoginState({
            ...loginState,
            userToken: retrievedToken,
            isLoggingIn: false,
          });
        }
      } else {
        // Else if the user signs out
        // Make API call to backend: /api/projectowner/auth/logout
        setLoginState({
          ...loginState,
          userToken: null,
          isLoggingIn: false,
        });
      }
    });
  }, [loginState.userToken]);

  return (
    <AuthContext.Provider value={loginState}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
