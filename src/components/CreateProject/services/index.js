/*global firebase*/
import {
  FetchResearchFieldMap,
  FetchGenderTypes,
  FetchSensors,
  FetchApiRange,
} from "services/api/ProjectOwner";
import { CustomException, ErrorTypes } from "utils/Error";

export const Validation = () => {};

export const BindResearch = async () => {
  try {
    const data = await FetchResearchFieldMap();
    return data;
  } catch (error) {
    throw new CustomException(
      "Fetch-research-field-error",
      { error },
      ErrorTypes.FETCH_RESEARCH_FIELDS
    );
  }
};

export const BindGender = async () => {
  try {
    const genderData = await FetchGenderTypes();
    return genderData;
  } catch (error) {
    throw new CustomException(
      "Fetch-gender-types-error",
      { error },
      ErrorTypes.FETCH_GENDER_TYPES
    );
  }
};

export const BindSensors = async () => {
  try {
    const sensorsData = await FetchSensors();
    return sensorsData;
  } catch (error) {
    throw new CustomException(
      "Fetch-sensors-error",
      { error },
      ErrorTypes.FETCH_SENSORS
    );
  }
};

export const BindApiRange = async () => {
  try {
    const apiRange = await FetchApiRange();
    return apiRange;
  } catch (error) {
    throw new CustomException(
      "Fetch-api-error",
      { error },
      ErrorTypes.FETCH_API
    );
  }
};
