/*global firebase*/
import { CustomException, ErrorTypes } from "utils/Error";
import { LoginApi } from "services/api/ProjectOwner";

export const firebaseAuth = async (email, password) => {
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    const retrievedToken = await firebase.auth().currentUser.getIdToken();
    // Make API call to backend for creating a session
    await LoginApi(retrievedToken);
  } catch (error) {
    let errorName = "Login Error";

    switch (error.code) {
      case "auth/invalid-email": {
        throw new CustomException(
          errorName,
          "Wrong email format!",
          ErrorTypes.LOGIN_EMAIL
        );
      }

      case "auth/user-disabled": {
        throw new CustomException(
          errorName,
          "This email has been disabled",
          ErrorTypes.LOGIN_EMAIL
        );
      }

      case "auth/user-not-found": {
        throw new CustomException(
          errorName,
          "This email hasn't been registered.",
          ErrorTypes.LOGIN_EMAIL
        );
      }

      case "auth/wrong-password": {
        throw new CustomException(
          errorName,
          "the password is invalid for the given email.",
          ErrorTypes.LOGIN_PWD
        );
      }

      default: {
        throw new CustomException(errorName, error.message);
      }
    }
  }
};
