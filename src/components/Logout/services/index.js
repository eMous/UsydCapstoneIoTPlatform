/*global firebase*/
import { CustomException, ErrorTypes } from "utils/Error";

export const FirebaseSignout = async () => {
  await firebase.auth().signOut();
};
