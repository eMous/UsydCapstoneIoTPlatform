/* global firebase */
import { CustomException } from "utils/Error";

const confirmPasswordReset = async (authCode, newPwd) => {
  try {
    await firebase.auth().confirmPasswordReset(authCode, newPwd);
    return true;
  } catch (error) {
    const errorName = "Forgot Password Error";
    switch (error.code) {
      case "auth/expired-action-code": {
        throw new CustomException(
          errorName,
          "The password reset code used has expired. Please request for a new code."
        );
      }

      case "auth/invalid-action-code": {
        throw new CustomException(
          errorName,
          "The password reset code used is invalid."
        );
      }

      case "auth/user-disabled": {
        throw new CustomException(
          errorName,
          "This user account has been disabled. Unable to reset this account's password."
        );
      }

      case "auth/user-not-found": {
        throw new CustomException(
          errorName,
          "This user account does not exist. Unable to reset this account's password."
        );
      }

      case "auth/weak-password": {
        throw new CustomException(
          errorName,
          "The new password used is too weak, please use a stronger password."
        );
      }

      default: {
        throw new CustomException(
          errorName,
          "A generic error has occurred while confirming the password reset."
        );
      }
    }
  }
};

export default confirmPasswordReset;
