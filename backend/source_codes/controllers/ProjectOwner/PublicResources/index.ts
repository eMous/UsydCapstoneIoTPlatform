import cache from "../../../cache";
import { sensorTypes, GenderPrjRequirement } from "../../../models/data";

export const retrieveGenderTypes = (req, res): void => {
  const genderTypeObj = {};
  const genderEnums = GenderPrjRequirement.getValidGenders();

  genderTypeObj[genderEnums[genderEnums.Male]] = 1;
  genderTypeObj[genderEnums[genderEnums.Female]] = 2;
  genderTypeObj[genderEnums[genderEnums.Unknown]] = 3;

  res.json(genderTypeObj);
};

export const retrieveResourceFields = (req, res): void => {
  res.json(cache.getResearchFields());
};

export const retrieveSensors = async (req, res): Promise<void> => {
  res.json(await cache.getSensors());
};

export const retrieveSensorTypes = (req, res): void => {
  res.json(sensorTypes);
};

export const retrieveApiLevels = (req, res): void => {
  res.json(cache.getAPILevels());
};

export const retrieveDeviceModels = (req, res): void => {
  res.json(cache.getDeviceModels());
};

export const retrieveSensorFrequencies = (req, res): void => {
  // milliseconds, high is for debugging purpose, currently.
  // LOW: once every 60s
  // MEDIUM: once every 20s
  // HIGH: once every 0.5s
  res.json({ low: 60 * 1000, medium: 20 * 1000, high: 1 * 1000 });
};
