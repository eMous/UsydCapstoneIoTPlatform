/* global firebase */
import { CustomException, ErrorTypes } from "utils/Error";
import { LoginApi } from "services/api/ProjectOwner";

export const createNewUser = async (email, pwd) => {
  try {
    // Retrieve the user's credentials
    await firebase.auth().createUserWithEmailAndPassword(email, pwd);
    // Once the user successfully logs in, the listener will update the userToken
    const retrievedToken = await firebase.auth().currentUser.getIdToken();
    // Make API call to backend for creating a session
    await LoginApi(retrievedToken);
    return retrievedToken;
  } catch (error) {
    let errorName = "Registration Error";

    switch (error.code) {
      case "auth/weak-password": {
        throw new CustomException(
          errorName,
          "The provided password is too weak, please use a stronger password.",
          ErrorTypes.REGISTER_PWD
        );
      }

      case "auth/email-already-in-use": {
        throw new CustomException(
          errorName,
          "This email has already been registered.",
          ErrorTypes.REGISTER_EMAIL
        );
      }

      case "auth/operation-not-allowed": {
        throw new CustomException(
          errorName,
          "This account type is not available. Please contact an administrator.",
          ErrorTypes.REGISTER_EMAIL
        );
      }

      case "auth/invalid-email": {
        throw new CustomException(
          errorName,
          "The email address provided is not valid, please check the email address again.",
          ErrorTypes.REGISTER_EMAIL
        );
      }

      default: {
        throw new CustomException(errorName, error.message);
      }
    }
  }
};

export const validateUserCred = (name, org, email, pwd, confirmPwd) => {
  const errorName = "Registration Error";

  if (!validateName(name)) {
    throw new CustomException(
      errorName,
      "Please provide a valid name.",
      ErrorTypes.REGISTER_NAME
    );
  }

  if (!validateOrg(org)) {
    throw new CustomException(
      errorName,
      "Please enter the organisation that you are representing.",
      ErrorTypes.REGISTER_ORG
    );
  }

  if (!validateEmailAddr(email)) {
    throw new CustomException(
      errorName,
      "The email address is not in a valid format.",
      ErrorTypes.REGISTER_EMAIL
    );
  }

  if (!validatePasswordNotEmpty(pwd, confirmPwd)) {
    throw new CustomException(
      errorName,
      "Please ensure that your passwords have been filled for both fields.",
      ErrorTypes.REGISTER_PWD
    );
  }

  if (!validatePasswordMatches(pwd, confirmPwd)) {
    throw new CustomException(
      errorName,
      "The passwords do not match, please check your passwords again.",
      ErrorTypes.REGISTER_PWD
    );
  }
};

const validateOrg = (org) => {
  if (org.trim() === "") {
    return false;
  }

  if (org == null) {
    return false;
  }

  if (org === undefined) {
    return false;
  }

  return true;
};

const validateName = (name) => {
  if (name.trim() === "") {
    return false;
  }

  if (name == null) {
    return false;
  }

  if (name === undefined) {
    return false;
  }
  if (!/^[a-zA-Z]+$/.test(name)) {
    return false;
  }

  return true;
};

const validateEmailAddr = (email) => {
  const validEmailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (email.trim() === "") {
    return false;
  }

  if (email == null) {
    return false;
  }

  if (email === undefined) {
    return false;
  }

  if (email.search(validEmailRegex) === -1) {
    return false;
  }

  return true;
};

const validatePasswordNotEmpty = (pwd, confirmPwd) => {
  if (pwd.trim() === "" || confirmPwd.trim() === "") {
    return false;
  }
  return true;
};

const validatePasswordMatches = (pwd, confirmPwd) => {
  if (pwd !== confirmPwd) {
    return false;
  }
  return true;
};
