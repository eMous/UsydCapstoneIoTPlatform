/*global firebase*/
import { GetUserInfoApi } from "services/api/ProjectOwner";
import { CustomException, ErrorTypes } from "utils/Error";

export const BindBalance = async () => {
  try {
    const retrievedToken = await firebase.auth().currentUser.getIdToken();
    const data = await GetUserInfoApi(retrievedToken);
    return data.balance;
  } catch (error) {
    throw new CustomException(
      "Get-user-error",
      { error },
      ErrorTypes.BACKEND_PROFILE
    );
  }
};
