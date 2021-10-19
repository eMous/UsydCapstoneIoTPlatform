/* global firebase */
import { CustomException } from "utils/Error";

const resetUserPassword = async (email) => {
  try {
    // Setting the language of the password reset email
    firebase.auth().useDeviceLanguage();
    await firebase.auth().sendPasswordResetEmail(email);
    return true;
  } catch (error) {
    const errorName = "Forgot Password Error";
    switch (error.code) {
      case "auth/invalid-email": {
        throw new CustomException(
          errorName,
          "The email address provided is invalid."
        );
      }

      case "auth/missing-continue-uri": {
        throw new CustomException(
          errorName,
          "No URL was provided in the password reset request."
        );
      }

      case "auth/invalid-continue-uri": {
        throw new CustomException(
          errorName,
          "The URL provided in the password reset request is invalid."
        );
      }

      case "auth/unauthorized-continue-uri": {
        throw new CustomException(
          errorName,
          "The domain of the password reset request URL is not authorized."
        );
      }

      case "auth/user-not-found": {
        throw new CustomException(
          errorName,
          "There is no user associated with this email address. Unable to reset password."
        );
      }

      default: {
        throw new CustomException(
          errorName,
          "A general error has occurred while trying to reset the user's password."
        );
      }
    }
  }
};

export default resetUserPassword;
