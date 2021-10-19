// import { json, Router } from "express";
// import {
//   authByPassword,
//   authByIdToken,
//   middleware,
//   register,
// } from "../authentication";
// import { body, oneOf, matchedData, check } from "express-validator";
// import { validatorErrorMiddleware, purifyFromTemplate } from "./router_basic";

// import { Request, Response } from "express";
// import cache from "../cache";
// import * as models from "../models/data";
// import { v4 as uuidv4 } from "uuid";
// import { async } from "@firebase/util";
// import { matchmakingAndInvite } from "../matchmaking";
// // auth router
// export const authRouter = Router();
// authRouter.post(
//   "/login",
//   oneOf([
//     // Testing use only
//     [body(["password"]).exists().bail(), body("email").isEmail()],
//     [body("idToken").exists().bail()],
//   ]),
//   validatorErrorMiddleware,
//   async (req, res, next) => {
//     let idToken;
//     try {
//       if (req.body.email && req.body.password) {
//         idToken = await authByPassword(req.body.email, req.body.password);
//       } else {
//         idToken = req.body.idToken;
//       }
//       res.cookie("__session", idToken, { maxAge: 3500 * 1000, httpOnly: true });
//       res.json(new models.Success(true));
//     } catch (err) {
//       err.statusCode = 400;
//       next(err);
//       return;
//     }
//   }
// );
// authRouter.post("/logout", middleware, async (req, res, next) => {
//   try {
//     res.cookie("__session", null, { maxAge: 0, httpOnly: true });
//     res.sendStatus(200);
//   } catch (error) {
//     next(error);
//     return;
//   }
// });
// // Testing use only
// authRouter.post(
//   "/register",
//   body(["email", "password"]),
//   body("email").isEmail(),
//   validatorErrorMiddleware,
//   async (req, res) => {
//     try {
//       await register(req.body.email, req.body.password);
//       res.sendStatus(200);
//     } catch (err) {
//       return res.status(400).send(err);
//     }
//   }
// );
// authRouter.get("/access_test", middleware, async (req, res, next) => {
//   try {
//     res.send("Welcome to privilege page.");
//   } catch (err) {
//     err.statusCode = 400;
//     return next(err);
//   }
// });
// exports.authRouter = authRouter;

// export const publicResourcesRouter = Router();
// publicResourcesRouter.get("/researchFields", async (req, res) => {
//   res.json(cache.getResearchFields());
// });

// publicResourcesRouter.get("/sensors", async (req, res) => {
//   res.json(await cache.getSensors());
// });
// publicResourcesRouter.get("/sensorTypes", async (req, res) => {
//   res.json(models.sensorTypes);
// });
// publicResourcesRouter.get("/apiLevels", async (req, res) => {
//   res.json(cache.getAPILevels());
// });

// publicResourcesRouter.get("/deviceModels", async (req, res) => {
//   res.json(cache.getDeviceModels());
// });
// // profile router
// export const profileRouter = Router();
// profileRouter.post(
//   "/",
//   oneOf([
//     [body("organisation").notEmpty()],
//     [body("name").notEmpty()],
//     [body("phoneNum").notEmpty().isMobilePhone("any")],
//     [body("imageBase64").notEmpty().isBase64()],
//     [
//       body("researchFields").isArray(),
//       body("researchFields.*", "The reseachField doesn't exist.").custom(
//         (value: number, { req }) => {
//           return value in cache.getResearchFields();
//         }
//       ),
//     ],
//   ]),
//   validatorErrorMiddleware,
//   async (req, res) => {
//     const updateData = matchedData(req);
//     const projectOwnerEmail = req["user"].email;
//     const path = {
//       collection: models.ProjectOwner.name,
//       docId: projectOwnerEmail,
//     };
//     const ret = await cache.mongoUpdate(path, updateData);
//     res.json(ret);
//     console.log(
//       `A new user update its profile, its email is ${projectOwnerEmail}, updated value ${ret}`
//     );
//   }
// );
// profileRouter.get("/", async (req, res) => {
//   const projectOwnerEmail = req["user"].email;
//   const path = {
//     collection: models.ProjectOwner.name,
//     docId: projectOwnerEmail,
//   };
//   const ret = await cache.mongoGet(path);
//   res.json(ret);
// });
// profileRouter.post(
//   "/addBalance",
//   [
//     body(
//       "addValue",
//       "Number must be larger than 10 and less than 9999"
//     ).isFloat({ gt: 10, lt: 9999 }),
//   ],
//   validatorErrorMiddleware,
//   async (req, res) => {
//     const objToAdd = matchedData(req);
//     const addValue = parseFloat(objToAdd.addValue).toFixed(2);
//     const projectOwnerEmail = req.user.email;
//     const path = {
//       collection: models.ProjectOwner.name,
//       docId: projectOwnerEmail,
//     };

//     const profile = (await cache.mongoGet(path)) as models.ProjectOwner;

//     if (profile.balance == undefined) {
//       profile.balance = 0;
//     }
//     profile.balance += parseFloat(addValue);
//     await cache.mongoUpdate(path, profile);

//     res.json({ balance: profile.balance });
//   }
// );

// // project router
// export const projectRouter = Router();
// // Get the project
// projectRouter.use(
//   "/detail",
//   [
//     body("projectId").notEmpty(),
//     body("projectId", "Sorry you don't have this project.").custom(
//       async (value: string, { req }) => {
//         const projectOwnerEmail = req["user"].email;
//         // get the pro's profile, in which there is his project list
//         const path = {
//           collection: models.ProjectOwner.name,
//           docId: projectOwnerEmail,
//         };
//         const profile = (await cache.mongoGet(path)) as models.ProjectOwner;
//         if (profile.projects != undefined && profile.projects.includes(value)) {
//           return;
//         }
//         return Promise.reject();
//       }
//     ),
//     validatorErrorMiddleware,
//   ],
//   async (req: Request, res: Response) => {
//     const projectId = matchedData(req).projectId;
//     const projectOwnerEmail = req["user"].email;
//     const path = { collection: models.Project.name, docId: projectId };
//     const ret = (await cache.mongoGet(path)) as models.Project;

//     // Hide detail information of participants
//     ret["inMatchMakingParticipantsNum"] =
//       typeof ret.inMatchMakingParticipants == "undefined"
//         ? 0
//         : ret.inMatchMakingParticipants.keys.length;
//     delete ret.inMatchMakingParticipants;

//     ret["allinvitedparticipantsNum"] =
//       typeof ret.allInvitedParticipants == "undefined"
//         ? 0
//         : ret.allInvitedParticipants.keys.length;
//     delete ret.allInvitedParticipants;

//     ret["acceptedparticipantsNum"] =
//       typeof ret.acceptedParticipants == "undefined"
//         ? 0
//         : ret.acceptedParticipants.keys.length;
//     delete ret.acceptedParticipants;

//     ret["inprojectparticipantsNum"] =
//       typeof ret.inProjectParticipants == "undefined"
//         ? 0
//         : ret.inProjectParticipants.keys.length;
//     delete ret.inProjectParticipants;
//     // Hide constantConf
//     delete ret.constantConf;
//     // Highlight Issues
//     if (typeof ret.highlightedIssues == "undefined") ret.highlightedIssues = [];
//     res.json(ret);
//   }
// );

// /**
//  * CREATE A PROJECT
//  */
// projectRouter.post(
//   "/",
//   [
//     body("prjTitle").isString(),
//     body("prjDescription").isString(),
//     body("prjResearchField")
//       .isInt()
//       .bail()
//       .custom((value: number, { req }) => {
//         return value in cache.getResearchFields();
//       }),
//     // requirement
//     body("prjRequirements").isArray({ min: 1 }).bail(),
//     body("prjRequirements").customSanitizer((requirements) => {
//       const retObj = [];
//       const allRequirements = models.ProjectRequirement.getAllRequirements();
//       for (let key in requirements) {
//         const currentRequirement = requirements[key];
//         const requirementType = allRequirements.find(
//           (el) => el.name === currentRequirement["requirementType"]
//         );
//         if (requirementType) {
//           const purifiedRequirementObj = {};
//           const allPropertiesInTemplate = Object.getOwnPropertyNames(
//             new requirementType()
//           );
//           allPropertiesInTemplate.forEach((propertyName) => {
//             purifiedRequirementObj[propertyName] =
//               currentRequirement[propertyName];
//           });
//           retObj.push(purifiedRequirementObj);
//         }
//       }
//       return retObj;
//     }),
//     body("prjRequirements").custom(async (requirements) => {
//       const requirementTypes = [];
//       const allRequirements = models.ProjectRequirement.getAllRequirements();
//       for (let key in requirements) {
//         const currentRequirement = requirements[key];
//         const requirementTypeStr = currentRequirement["requirementType"];
//         // check the type name is valid
//         const requirementType = allRequirements.find(
//           (el) => el.name === requirementTypeStr
//         );
//         if (!requirementType) {
//           return Promise.reject(
//             `RequirementType ${requirementTypeStr} is not allowed.`
//           );
//         }
//         // check the requirement has only the one (of this type) in the array
//         if (requirementTypes.includes(requirementTypeStr)) {
//           return Promise.reject(
//             `RequirementType ${requirementTypeStr} can be only set once.`
//           );
//         }
//         requirementTypes.push(requirementTypeStr);

//         // make the input into the exact requirement type
//         const requirementTemplate = new requirementType();
//         Object.assign(requirementTemplate, currentRequirement);

//         // use polymorphism to validate
//         await requirementTemplate.validate();
//       }
//     }),
//     // goals
//     body("prjGoals").isArray({ min: 1 }).bail(),
//     body("prjGoals").custom(async (goals) => {
//       const sensors = [];
//       if (goals.length != 0)
//         for (let key in goals) {
//           const element = goals[key];
//           const sensorId = element["sensorId"];
//           if (sensorId == undefined) {
//             return Promise.reject('"sensorId" should be a key in a goal.');
//           }
//           if (!(await models.SensorPrjRequirement.validSensorId(sensorId))) {
//             return Promise.reject("sensor's id is not valid.");
//           }
//           if (sensors.includes(sensorId)) {
//             return Promise.reject("A sensor can not have multiple goals.");
//           }
//           sensors.push(sensorId);

//           const recordsNum = Number(element["recordsNum"]);
//           if (!(Number.isInteger(recordsNum) && recordsNum > 0)) {
//             return Promise.reject(
//               "recordsNum should exist and be a positive number."
//             );
//           }
//         }
//       return true;
//     }),
//     // Funding related
//     body("prjFunding")
//       .custom(async (value) => {
//         if (value != undefined) {
//           if (!(Number(value) > 1)) {
//             return Promise.reject(
//               "prjFunding has to be a positive number(larger than 1)"
//             );
//           }
//         }
//         return true;
//       })
//       .bail()
//       .if(body("prjFunding").exists())
//       .customSanitizer((value) => {
//         let prjFunding = parseInt(value);
//         return prjFunding;
//       }),
//     body(
//       "conversionRate",
//       "conversionRate(positive number) has to provided, if there is prjFunding"
//     )
//       .if(body("conversionRate").exists())
//       .custom((value, { req }) => req.body["prjFunding"])
//       .withMessage(
//         "the positive conversionRate is not allowed without a prjFunding"
//       )
//       .isFloat({ min: 1 }),
//     body("prjStartTime")
//       .custom(async (value) => {
//         if (value != undefined && isNaN(Date.parse(value))) {
//           return Promise.reject(
//             "prjStartTime should be a ISO8601 style string."
//           );
//         }
//       })
//       .customSanitizer((value) => {
//         let nowDate = new Date();
//         if (value == undefined || Date.parse(value) < nowDate.getTime()) {
//           return nowDate.toISOString();
//         }
//         return value;
//       }),
//     body("matchmakingEnable").default(true).isBoolean(),
//     body("desiredParticipantNumber").customSanitizer(async (number) => {
//       const latestConf = await cache.getTheLatestConf();
//       const purifiedNumber = Number(number);
//       if (
//         Number.isInteger(number) &&
//         purifiedNumber <= latestConf.PROJECT_MAX_PARTICIPANT_NUM_IN_A_PRJ &&
//         purifiedNumber >= 1
//       ) {
//         return purifiedNumber;
//       } else {
//         return latestConf.PROJECT_DEFAULT_PARTICIPANT_NUM_IN_A_PRJ;
//       }
//     }),
//     validatorErrorMiddleware,
//   ],
//   async (req: Request, res: Response) => {
//     const projectObjectTemplate = new models.Project();
//     const projectPost = matchedData(req);
//     // in case the matchedData didnt totally purify the data
//     purifyFromTemplate(
//       projectObjectTemplate,
//       projectPost,
//       "prjFunding",
//       "conversionRate"
//     );

//     const projectOwnerEmail = req["user"].email;
//     const pathProfile = {
//       collection: models.ProjectOwner.name,
//       docId: projectOwnerEmail,
//     };
//     const profile = (await cache.mongoGet(pathProfile)) as models.ProjectOwner;
//     // using uuid helps expedite the development progress by easily ensuring everything in a single transaction.
//     var projectId = uuidv4();
//     if (projectPost.prjFunding != undefined) {
//       if (
//         profile.balance == undefined ||
//         !(profile.balance > projectPost.prjFunding)
//       ) {
//         return Promise.reject({
//           message: "The balance is not enough to fund.",
//         });
//       } else {
//         profile.balance -= projectPost.prjFunding;
//         var inFundingAccount = new models.InFundingAccount();
//         inFundingAccount.exchangedAmount = 0;
//         inFundingAccount.totalFund = projectPost.prjFunding;
//         inFundingAccount.conversionRate = projectPost.conversionRate;
//         inFundingAccount.projectId = projectId;
//         projectPost.inFundingAccount = inFundingAccount;

//         if (profile.inFundingAccounts == undefined) {
//           profile.inFundingAccounts = {};
//         }
//         profile.inFundingAccounts[projectId] = inFundingAccount;
//       }
//     }
//     // Like prjFunding', 'conversionRate' in the req, they are not a standardized input to the model
//     // After the above procedure, these properties can be removed by the following statement
//     purifyFromTemplate(projectObjectTemplate, projectPost);
//     Object.assign(projectObjectTemplate, projectPost);
//     if (profile.projects == undefined) {
//       profile.projects = [];
//     }
//     profile.projects.push(projectId);
//     // statistic information for the project
//     projectObjectTemplate.prjStatistic = [];
//     (await cache.getSensors()).forEach((eachSensor) => {
//       const collectedNum = 0;
//       let goalNum = 0;
//       projectObjectTemplate.prjGoals.some(({ sensorId, recordsNum }) => {
//         if (eachSensor._id === sensorId) {
//           goalNum = recordsNum;
//           projectObjectTemplate.prjStatistic.push({
//             collectedNum: collectedNum,
//             goalNum: goalNum,
//             sensorId: eachSensor._id,
//           });
//           // due to it is `some`, when return true, the `some` stop iterating
//           return true;
//         }
//       });
//     });
//     projectObjectTemplate.constantConf = (await cache.getTheLatestConf()).id;
//     // when create a project, the Profile document needs to update also
//     // TODO trasaction
//     await cache.mongoUpdate(pathProfile, profile);
//     const docPathOfProject = {
//       collection: models.Project.name,
//       docId: projectId,
//     };
//     await cache.mongoUpdate(docPathOfProject, projectObjectTemplate);
//     // await cache.firebaseBatchSet({ fullObj: profile, docPath: pathProfile }, { fullObj: projectPost, docPath: `${models.Project.name}/${projectId}` });
//     // TODO Matchmaking trigger
//     res.json(projectId);

//     // matchmaking and invite
//     /**
//      * This is the loop for matchmaking after creating THIS project
//      */
//     matchmakingAndInvite(projectId);
//   }
// );
// projectRouter.post(
//   "/matchmakingsetting",
//   body("projectId").notEmpty(),
//   body("projectId", "Sorry you don't have this project.").custom(
//     async (value: string, { req }) => {
//       const projectOwnerEmail = req["user"].email;
//       // get the pro's profile, in which there is his project list
//       const path = {
//         collection: models.ProjectOwner.name,
//         docId: projectOwnerEmail,
//       };
//       const profile = (await cache.mongoGet(path)) as models.ProjectOwner;
//       if (profile.projects != undefined && profile.projects.includes(value)) {
//         return;
//       }
//       return Promise.reject();
//     }
//   ),
//   body("matchmakingEnable").isBoolean(),
//   validatorErrorMiddleware,
//   async (req: Request, res: Response) => {
//     const postData = matchedData(req);
//     const docPath = {
//       collection: models.Project.name,
//       docId: postData.projectId,
//     };
//     const project = (await cache.mongoGet(docPath)) as models.Project;
//     const currentEnable = project.matchmakingEnable;
//     if (currentEnable != postData.matchmakingEnable) {
//       project.matchmakingEnable = postData.matchmakingEnable;
//       cache.mongoUpdate(docPath, project);
//       // TODO
//     }
//     res.json(postData);
//   }
// );

// projectRouter.post(
//   "/addFund",
//   body("projectId").notEmpty(),
//   body("projectId", "Sorry you don't have this project.").custom(
//     async (value: string, { req }) => {
//       const projectOwnerEmail = req["user"].email;
//       // get the pro's profile, in which there is his project list
//       const path = {
//         collection: models.ProjectOwner.name,
//         docId: projectOwnerEmail,
//       };
//       const profile = (await cache.mongoGet(path)) as models.ProjectOwner;
//       if (profile.projects != undefined && profile.projects.includes(value)) {
//         return;
//       }
//       return Promise.reject();
//     }
//   ),
//   body("addValue", "The add value must larger than 1.")
//     .isFloat({ min: 1 })
//     .bail(),
//   body("conversionRate")
//     .if(body("conversionRate").exists())
//     .isFloat({ min: 1 })
//     .withMessage("If conversionRate provided, it has to be larger than 1"),
//   validatorErrorMiddleware,
//   async (req: Request, res: Response) => {
//     const postData = matchedData(req);
//     const projectOwnerEmail = req["user"].email;
//     const docPathOfProfile = {
//       collection: models.ProjectOwner.name,
//       docId: projectOwnerEmail,
//     };
//     const profile = (await cache.mongoGet(
//       docPathOfProfile
//     )) as models.ProjectOwner;
//     if (profile.balance < postData.addValue) {
//       return Promise.reject({ message: "The balance is not enough to fund." });
//     }

//     const docPathOfProject = {
//       collection: models.Project.name,
//       docId: postData.projectId,
//     };
//     const project = (await cache.mongoGet(docPathOfProject)) as models.Project;
//     if (postData.conversionRate) {
//       if (project.inFundingAccount) {
//         return Promise.reject({
//           message: `The the conversionRate can not set twice, current value is ${project.inFundingAccount.conversionRate}.`,
//         });
//       }
//       // it is the first time to set a funding
//       const inFundingAccount = new models.InFundingAccount();
//       inFundingAccount.conversionRate = postData.conversionRate;
//       inFundingAccount.exchangedAmount = 0;
//       inFundingAccount.projectId = postData.projectId;
//       inFundingAccount.totalFund = postData.addValue;
//       project.inFundingAccount = inFundingAccount;
//     } else {
//       // it has to be a previous inFundingAccount set
//       if (!project.inFundingAccount) {
//         // We consider it is not the first time, but it indeed is the first time, and it didnt provide a conversionRate
//         return Promise.reject({
//           message: `The the conversionRate has to be set for the first time funding.`,
//         });
//       }
//       project.inFundingAccount.totalFund += postData.addValue;
//     }

//     profile.balance -= postData.addValue;
//     if (!profile.inFundingAccounts) {
//       profile.inFundingAccounts = {};
//     }
//     profile.inFundingAccounts[postData.projectId] = project.inFundingAccount;

//     await cache.mongoUpdate(docPathOfProject, project);
//     await cache.mongoUpdate(docPathOfProfile, profile);
//     // await cache.firebaseBatchSet({ fullObj: project, docPath: docPathOfProject }, { fullObj: profile, docPath: docPathOfProfile });

//     res.json({
//       projectId: postData.projectId,
//       currentFundLeft:
//         project.inFundingAccount.totalFund -
//         project.inFundingAccount.exchangedAmount,
//       currentBalance: profile.balance,
//     });
//   }
// );
// projectRouter.post(
//   "/filter",
//   body("projectId").notEmpty(),
//   body("projectId", "Sorry you don't have this project.").custom(
//     async (value: string, { req }) => {
//       const projectOwnerEmail = req["user"].email;
//       // get the pro's profile, in which there is his project list
//       const path = {
//         collection: models.ProjectOwner.name,
//         docId: projectOwnerEmail,
//       };
//       const profile = (await cache.mongoGet(path)) as models.ProjectOwner;
//       if (profile.projects != undefined && profile.projects.includes(value)) {
//         return;
//       }
//       return Promise.reject();
//     }
//   ),
//   // filter
//   body("filters").isArray({ min: 0 }).bail(),
//   body("filters").customSanitizer((filters) => {
//     const retObj = [];
//     const allFilters = models.RecordFilter.getRecordFilters();
//     for (let key in filters) {
//       const currentFilter = filters[key];
//       const recordType = allFilters.find(
//         (el) => el.name === currentFilter["filterType"]
//       );
//       if (recordType) {
//         const purifiedFilterObj = {};
//         const recordTypeTemplate = new recordType();
//         const allPropertiesInTemplate =
//           Object.getOwnPropertyNames(recordTypeTemplate);
//         allPropertiesInTemplate.forEach((propertyName) => {
//           purifiedFilterObj[propertyName] = currentFilter[propertyName];
//         });
//         Object.assign(recordTypeTemplate, purifiedFilterObj);
//         retObj.push(recordTypeTemplate);
//       }
//     }
//     return retObj;
//   }),
//   body("filters").custom(async (filters) => {
//     const filterTypes = [];
//     const allFilters = models.RecordFilter.getRecordFilters();
//     for (let key in filters) {
//       const currentFilter = filters[key];
//       const filterTypeStr = currentFilter["filterType"];
//       // check the type name is valid
//       const filterType = allFilters.find((el) => el.name === filterTypeStr);
//       if (!filterType) {
//         return Promise.reject(`FilterType ${filterTypeStr} is not allowed.`);
//       }
//       // check the filter has only the one (of this type) in the array
//       if (filterTypes.includes(filterTypeStr)) {
//         return Promise.reject(
//           `FilterType ${filterTypeStr} can be only set once.`
//         );
//       }
//       filterTypes.push(filterTypeStr);

//       // use polymorphism to validate
//       await currentFilter.validate();
//       return true;
//     }
//   }),
//   validatorErrorMiddleware,
//   async (req: Request, res: Response) => {
//     const postData = matchedData(req);
//     const projectId = postData["projectId"];
//     const filters = postData["filters"];

//     const projectOwnerEmail = req["user"].email;

//     res.sendStatus(200);
//   }
// );
