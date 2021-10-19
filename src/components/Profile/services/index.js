/*global firebase*/
import {
  GetUserInfoApi,
  FetchResearchFieldMap,
} from "services/api/ProjectOwner";
import { CustomException, ErrorTypes } from "utils/Error";

export const BindInfo = async () => {
  try {
    const retrievedToken = await firebase.auth().currentUser.getIdToken();
    const data = await GetUserInfoApi(retrievedToken);
    return data;
  } catch (error) {
    throw new CustomException(
      "profile-info-binding-error",
      { error },
      ErrorTypes.BIND_PROFILE
    );
  }
};

export const BindResearch = async () => {
  try {
    const researchData = await FetchResearchFieldMap();
    return researchData;
  } catch (error) {
    throw new CustomException(
      "Fetch-research-field-error",
      { error },
      ErrorTypes.FETCH_RESEARCH_FIELDS
    );
  }
};
