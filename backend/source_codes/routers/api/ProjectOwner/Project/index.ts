import express = require("express");
const rootRouter = express.Router();
import { body } from "express-validator";
import {
  ProjectOwner,
  ProjectRequirement,
  SensorPrjRequirement,
  RecordFilter,
} from "../../../../models/data";
import cache from "../../../../cache";
import {
  validatorErrorMiddleware,
  AuthMiddleware,
} from "../../../../middleware";
import ProjectController = require("../../../../controllers/ProjectOwner/Project");

// To retrieve all sensor data records for a project
rootRouter.get("/records", AuthMiddleware, ProjectController.retrieveProjectData);

// NOTE: There is no body in a GET request, hence we used a POST request
// To retrieve the details about a specific project
rootRouter.post(
  "/projDetails",
  AuthMiddleware,
  [
    body("projectId").notEmpty(),
    body("projectId", "Sorry you don't have this project.").custom(
      async (value: string, { req }) => {
        const projectOwnerEmail = req["user"].email;
        // get the pro's profile, in which there is his project list
        const path = {
          collection: ProjectOwner.name,
          docId: projectOwnerEmail,
        };
        const profile = (await cache.mongoGet(path)) as ProjectOwner;
        if (
          typeof profile.projects != "undefined" &&
          profile.projects.includes(value)
        ) {
          return;
        }
        return Promise.reject();
      }
    ),
    validatorErrorMiddleware,
  ],
  ProjectController.retrieveProjectDetails
);

// To edit a project
rootRouter.patch(
  "/",
  AuthMiddleware,
  [
    // and we check that they have provided a Project ID
    body("projectId").notEmpty(),
    body("projectId", "Sorry you don't have this project.").custom(
      async (value: string, { req }) => {
        const projectOwnerEmail = req["user"].email;
        // get the pro's profile, in which there is his project list
        const path = {
          collection: ProjectOwner.name,
          docId: projectOwnerEmail,
        };
        const profile = (await cache.mongoGet(path)) as ProjectOwner;
        if (
          typeof profile.projects != "undefined" &&
          profile.projects.includes(value)
        ) {
          return;
        }
        return Promise.reject();
      }
    ),
  ],
  validatorErrorMiddleware,
  ProjectController.editProjectDetails
);

// To create a project
rootRouter.post(
  "/",
  AuthMiddleware,
  [
    body("prjTitle").isString(),
    body("prjDescription").isString(),
    body("prjResearchField")
      .isInt()
      .bail()
      .custom((value: number, { req }) => {
        return value in cache.getResearchFields();
      }),

    // requirement
    body("prjRequirements").isArray({ min: 1 }).bail(),
    body("prjRequirements").customSanitizer((requirements) => {
      const retObj = [];
      const allRequirements = ProjectRequirement.getAllRequirements();
      for (const key in requirements) {
        const currentRequirement = requirements[key];
        const requirementType = allRequirements.find(
          (el) => el.name === currentRequirement["requirementType"]
        );
        if (requirementType) {
          const purifiedRequirementObj = {};
          const allPropertiesInTemplate = Object.getOwnPropertyNames(
            new requirementType()
          );
          allPropertiesInTemplate.forEach((propertyName) => {
            purifiedRequirementObj[propertyName] =
              currentRequirement[propertyName];
          });
          retObj.push(purifiedRequirementObj);
        }
      }
      return retObj;
    }),
    body("prjRequirements").custom(async (requirements) => {
      const requirementTypes = [];
      const allRequirements = ProjectRequirement.getAllRequirements();
      for (const key in requirements) {
        const currentRequirement = requirements[key];
        const requirementTypeStr = currentRequirement["requirementType"];
        // check the type name is valid
        const requirementType = allRequirements.find(
          (el) => el.name === requirementTypeStr
        );
        if (!requirementType) {
          return Promise.reject(
            `RequirementType ${requirementTypeStr} is not allowed.`
          );
        }
        // check the requirement has only the one (of this type) in the array
        if (requirementTypes.includes(requirementTypeStr)) {
          return Promise.reject(
            `RequirementType ${requirementTypeStr} can be only set once.`
          );
        }
        requirementTypes.push(requirementTypeStr);

        // make the input into the exact requirement type
        const requirementTemplate = new requirementType();
        Object.assign(requirementTemplate, currentRequirement);

        // use polymorphism to validate
        await requirementTemplate.validate();
      }
    }),
    // goals
    body("prjGoals").isArray({ min: 1 }).bail(),
    body("prjGoals").custom(async (goals) => {
      const sensors = [];
      if (goals.length != 0) {
        for (const key in goals) {
          const element = goals[key];
          const sensorId = element["sensorId"];
          if (typeof sensorId == "undefined") {
            return Promise.reject('"sensorId" should be a key in a goal.');
          }
          if (!(await SensorPrjRequirement.validSensorId(sensorId))) {
            return Promise.reject("sensor's id is not valid.");
          }
          if (sensors.includes(sensorId)) {
            return Promise.reject("A sensor can not have multiple goals.");
          }
          sensors.push(sensorId);

          const recordsNum = Number(element["recordsNum"]);

          if (!(Number.isInteger(recordsNum) && recordsNum > 0)) {
            return Promise.reject(
              "recordsNum should exist and be a positive number."
            );
          }
        }
      }
      return true;
    }),
    // Funding related
    body("prjFunding")
      .custom(async (value) => {
        if (typeof value != "undefined") {
          if (!(Number(value) > 0)) {
            return Promise.reject(
              "prjFunding has to be a positive number(larger than 0)"
            );
          }
        }
        return true;
      })
      .bail()
      .if(body("prjFunding").exists())
      .customSanitizer((value) => {
        const prjFunding = parseInt(value);
        return prjFunding;
      }),
    body("prjStartTime")
      .custom(async (value) => {
        if (typeof value != "undefined" && isNaN(Date.parse(value))) {
          return Promise.reject(
            "prjStartTime should be a ISO8601 style string."
          );
        }
      })
      .customSanitizer((value) => {
        const nowDate = new Date();
        if (value == undefined || Date.parse(value) < nowDate.getTime()) {
          return nowDate.toISOString();
        }
        return value;
      }),
    body("matchmakingEnable").default(true).isBoolean(),
    body("desiredParticipantNumber").customSanitizer(async (number) => {
      const latestConf = await cache.getTheLatestConf();
      const purifiedNumber = Number(number);
      if (
        Number.isInteger(number) &&
        purifiedNumber <= latestConf.PROJECT_MAX_PARTICIPANT_NUM_IN_A_PRJ &&
        purifiedNumber >= 1
      ) {
        return purifiedNumber;
      } else {
        return latestConf.PROJECT_DEFAULT_PARTICIPANT_NUM_IN_A_PRJ;
      }
    }),
    // Incentive model-related - For indicating if participants are allowed to redeem points
    // when the project is not yet complete, or not
    body("isFullRedeemOnly").isBoolean().exists(),
  ],
  validatorErrorMiddleware,
  ProjectController.createProject
);

// To toggle the matchmaking setting for the project
rootRouter.post(
  "/matchmakingsetting",
  AuthMiddleware,
  body("projectId").notEmpty(),
  body("projectId", "Sorry you don't have this project.").custom(
    async (value: string, { req }) => {
      const projectOwnerEmail = req["user"].email;
      // get the pro's profile, in which there is his project list
      const path = { collection: ProjectOwner.name, docId: projectOwnerEmail };
      const profile = (await cache.mongoGet(path)) as ProjectOwner;
      if (
        typeof profile.projects != "undefined" &&
        profile.projects.includes(value)
      ) {
        return;
      }
      return Promise.reject();
    }
  ),
  body("matchmakingEnable").isBoolean(),
  validatorErrorMiddleware,
  ProjectController.adjustMatchmakingSetting
);

// To add funds to a specific project
rootRouter.post(
  "/addFund",
  AuthMiddleware,
  body("projectId", "Sorry you don't have this project.").custom(
    async (value: string, { req }) => {
      const projectOwnerEmail = req["user"].email;
      // get the Project Owner's profile and check that this project ID is in their profile's
      // list of projects
      const path = { collection: ProjectOwner.name, docId: projectOwnerEmail };
      const profile = (await cache.mongoGet(path)) as ProjectOwner;
      // If there is a project list (i.e. not undefined)
      // and this project ID is in the project list
      if (
        typeof profile.projects != "undefined" &&
        profile.projects.includes(value)
      ) {
        // We return true
        return;
      }
      // Otherwise we reject the outcome of this middleware
      return Promise.reject();
    }
  ),
  body("addValue", "The add value must larger than 1.")
    .isFloat({ min: 1 })
    .bail(),
  validatorErrorMiddleware,
  ProjectController.addFundsToProject
);

// To filter data for this project
rootRouter.post(
  "/filter",
  AuthMiddleware,
  body("projectId").notEmpty(),
  body("projectId", "Sorry you don't have this project.").custom(
    async (value: string, { req }) => {
      const projectOwnerEmail = req["user"].email;
      // get the Project Owner's profile and check that this project ID is in their profile's
      // list of projects
      const path = { collection: ProjectOwner.name, docId: projectOwnerEmail };
      const profile = (await cache.mongoGet(path)) as ProjectOwner;
      // If there is a project list (i.e. not undefined)
      // and this project ID is in the project list
      if (
        typeof profile.projects != "undefined" &&
        profile.projects.includes(value)
      ) {
        // We return true
        return;
      }
      // Otherwise we reject the outcome of this middleware
      return Promise.reject();
    }
  ),
  // filter
  body("filters").isArray({ min: 0 }).bail(),
  body("filters").customSanitizer((filters) => {
    const retObj = [];
    const allFilters = RecordFilter.getRecordFilters();
    for (const key in filters) {
      const currentFilter = filters[key];
      const recordType = allFilters.find(
        (el) => el.name === currentFilter["filterType"]
      );
      if (recordType) {
        const purifiedFilterObj = {};
        const recordTypeTemplate = new recordType();
        const allPropertiesInTemplate =
          Object.getOwnPropertyNames(recordTypeTemplate);
        allPropertiesInTemplate.forEach((propertyName) => {
          purifiedFilterObj[propertyName] = currentFilter[propertyName];
        });
        Object.assign(recordTypeTemplate, purifiedFilterObj);
        retObj.push(recordTypeTemplate);
      }
    }
    return retObj;
  }),
  body("filters").custom(async (filters) => {
    const filterTypes = [];
    const allFilters = RecordFilter.getRecordFilters();
    for (const key in filters) {
      const currentFilter = filters[key];
      const filterTypeStr = currentFilter["filterType"];
      // check that the filter type name is valid
      const filterType = allFilters.find((el) => el.name === filterTypeStr);
      if (!filterType) {
        return Promise.reject(`FilterType ${filterTypeStr} is not allowed.`);
      }
      // check that there is only one of this filter type in the array provided
      if (filterTypes.includes(filterTypeStr)) {
        return Promise.reject(
          `FilterType ${filterTypeStr} can be only set once.`
        );
      }
      filterTypes.push(filterTypeStr);

      // use polymorphism to validate
      await currentFilter.validate();
      return true;
    }
  }),
  ProjectController.filterData
);

module.exports = rootRouter;
