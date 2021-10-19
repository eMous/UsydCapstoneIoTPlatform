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
// import { fcmTool } from "../fcm_utility";
// import { fAdmin } from "../conf";
// import {
//   getParticipantNecessaryData,
//   persistentSensors,
//   hasProjectComplete,
// } from "./participant_logical_business";

// // auth router
// export const authRouter = Router();
// authRouter.post(
//   "/login",
//   middleware,
//   // oneOf([
//   //     // Testing use only
//   //     [body(['password']).exists().bail(), body('email').isEmail()],
//   // ]),
//   body("fcmToken").isString().notEmpty(),
//   body("sensors").notEmpty(),
//   validatorErrorMiddleware,
//   async (req, res, next) => {
//     try {
//       const data = matchedData(req);
//       const participantEmail = req["user"].email;
//       console.log(`participant ${participantEmail} loggedin!`);
//       const path = {
//         collection: models.Participant.name,
//         docId: participantEmail,
//       };
//       let profile = (await cache.mongoGet(path)) as models.Participant;
//       // Device Checking for different sensors.
//       var removeConfs = false;
//       if (profile == undefined) {
//         profile = new models.Participant();
//         profile.email = participantEmail;
//       }

//       if (
//         profile.sensorsInDevice == undefined ||
//         profile.sensorsInDevice.length == 0
//       ) {
//         profile.sensorsInDevice = data.sensors;
//         persistentSensors(data.sensors);
//       } else {
//         if (
//           JSON.stringify(profile.sensorsInDevice) !=
//           JSON.stringify(data.sensors)
//         ) {
//           // different devices
//           const projectsInPar =
//             profile.projects as models.ProjectInParticipantProfile[];
//           if (projectsInPar) {
//             for (let i = 0; i < projectsInPar.length; ++i) {
//               if (projectsInPar[i].leaveTime != undefined) {
//                 // The par is in a project!!
//                 res.json(
//                   new models.Success(
//                     false,
//                     `Sorry you are in a project, and you can not switch device with different sensors to login.`
//                   )
//                 );
//                 return;
//               }
//             }
//             // The par is not in a project!!
//             profile.sensorConfsTemplate = [];
//             removeConfs = true;
//           }
//         }
//       }
//       await cache.mongoUpdate(path, profile);

//       const currentFCMUser = (await fcmTool.updateUser(
//         participantEmail,
//         data.fcmToken,
//         true
//       )) as unknown as models.FCMUser;
//       if (removeConfs) {
//         console.log("removeConfs[");
//         const parData = new models.ParticipantData();
//         parData.participantProfile = true;
//         fcmTool.rawSendNotification(
//           data.fcmToken,
//           "",
//           "",
//           await getParticipantNecessaryData(participantEmail, parData)
//         );
//         res.json(new models.Success(true));
//         return;
//       }

//       // fcmTool.rawSendNotification(data.fcmToken, '', '', await getParticipantNecessaryData(participantEmail));
//       if (currentFCMUser.isFirstSession) {
//         console.log(`${participantEmail} is first fcm login!!!`);
//         // Check is it a old user but switched devices
//         const participantProfile = (await cache.mongoGet({
//           collection: models.Participant.name,
//           docId: participantEmail,
//         })) as models.Participant;
//         if (participantProfile && participantProfile.gender != undefined) {
//           // This is a old user but in new device; Use FCM to push all necessary data
//           // setTimeout(async () => {
//           const parData = new models.ParticipantData();
//           parData.participantProfile = true;
//           parData.participantNotifications = true;
//           fcmTool.rawSendNotification(
//             data.fcmToken,
//             "",
//             "",
//             await getParticipantNecessaryData(participantEmail, parData)
//           );
//           // }, 1000);
//         }
//       }
//       res.json(new models.Success(true));
//     } catch (err) {
//       err.statusCode = 400;
//       next(err);
//       return;
//     }
//   }
// );
// authRouter.post(
//   "/logout",
//   middleware,
//   body("fcmToken").isString().notEmpty(),
//   async (req, res, next) => {
//     try {
//       const participantEmail = req["user"].email;
//       const logoutData = matchedData(req);
//       res.cookie("__session", null, { maxAge: 0, httpOnly: true });
//       res.json({ success: true });
//       fcmTool.updateUser(participantEmail, logoutData["fcmToken"], false);
//     } catch (error) {
//       next(error);
//       return;
//     }
//   }
// );
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

// // profile router
// export const profileRouter = Router();
// profileRouter.post(
//   "/",
//   oneOf([
//     [body("gender").notEmpty().isInt({ min: 1, max: 4 })],
//     [body("name").notEmpty()],
//     [body("deviceModel").notEmpty()],
//     [body("androidAPI").notEmpty()],
//     [body("mobileSystem").notEmpty()],
//     [body("mobileDeviceType").notEmpty()],
//     [body("sensorConfsTemplate").notEmpty()],
//   ]),
//   validatorErrorMiddleware,
//   async (req, res) => {
//     const updateData = matchedData(req);
//     const participantEmail = req["user"].email;
//     const path = {
//       collection: models.Participant.name,
//       docId: participantEmail,
//     };

//     console.log(`gender updated is `, updateData.gender);

//     (await cache.mongoUpdate(path, updateData)) as models.Participant;
//     const ret = (await cache.mongoGet(path)) as models.Participant;
//     res.json(ret);
//     console.log(
//       `A new participant update its profile, its email is ${participantEmail}, updated value `,
//       ret.gender
//     );
//     // init ParticipantNotifications
//     if (
//       !(await cache.mongoGet({
//         collection: models.ParticipantNotifications.name,
//         docId: participantEmail,
//       }))
//     ) {
//       const participantNotificationsToInit =
//         new models.ParticipantNotifications();
//       participantNotificationsToInit.constantConf = (
//         await cache.getTheLatestConf()
//       ).id;
//       participantNotificationsToInit.participantId = participantEmail;
//       cache.mongoUpdate(
//         {
//           collection: models.ParticipantNotifications.name,
//           docId: participantEmail,
//         },
//         participantNotificationsToInit
//       );
//     }
//   }
// );
// profileRouter.get("/", async (req, res) => {
//   const participantEmail = req["user"].email;
//   const path = { collection: models.Participant.name, docId: participantEmail };
//   const ret = await cache.mongoGet(path);
//   res.json(ret);
// });
// profileRouter.get("/participantNotifications", async (req, res) => {
//   const participantEmail = req["user"].email;
//   const path = {
//     collection: models.ParticipantNotifications.name,
//     docId: participantEmail,
//   };
//   const ret = await cache.mongoGet(path);
//   res.json(ret);
// });
// // project router
// export const projectRouter = Router();
// projectRouter.post(
//   "/",
//   [
//     body("projectId")
//       .isString()
//       .notEmpty()
//       .custom(async (projectId: string, { req }) => {
//         console.log("receive get project detail");
//         const participantEmail = req["user"].email;
//         const participant = (await cache.mongoGet({
//           collection: models.Participant.name,
//           docId: participantEmail,
//         })) as models.Participant;
//         if (
//           participant.projects &&
//           participant.projects.some((val) => val.projectId == projectId)
//         ) {
//           return;
//         }
//         const prj = (await cache.mongoGet({
//           collection: models.Project.name,
//           docId: projectId,
//         })) as models.Project;
//         if (prj && prj.allInvitedParticipants.includes(participantEmail)) {
//           return;
//         }
//         return Promise.reject();
//       }),
//   ],
//   validatorErrorMiddleware,
//   async (req, res) => {
//     const gotData = matchedData(req);
//     const projectId = gotData["projectId"];
//     const project = await cache.mongoGet({
//       collection: models.Project.name,
//       docId: projectId,
//     });
//     res.json(project);
//   }
// );
// projectRouter.post(
//   "/received",
//   [body("projectId").notEmpty()],
//   validatorErrorMiddleware,
//   async (req, res) => {
//     const gotData = matchedData(req);
//     const participantEmail = req["user"].email;
//     const projectId = gotData["projectId"];

//     // project document
//     const project = (await cache.mongoGet({
//       collection: models.Project.name,
//       docId: projectId,
//     })) as models.Project;
//     if (project == undefined) {
//       console.error(`prj doesnt found`, projectId);
//       const parNotification = (await cache.mongoGet({
//         collection: models.ParticipantNotifications.name,
//         docId: participantEmail,
//       })) as models.ParticipantNotifications;
//       return res.json(parNotification);
//     }
//     let i = project.inSendingOrDroppedParticipants.length;
//     let inviteDTime = null;
//     while (i--) {
//       if (project.inSendingOrDroppedParticipants[i].email == participantEmail) {
//         inviteDTime = project.inSendingOrDroppedParticipants[i].sentTime;
//         project.inSendingOrDroppedParticipants.splice(i, 1);
//         project.receivedButNotAnsweredParticipants.push(participantEmail);
//         break;
//       }
//     }
//     project.inSendingOrDroppedParticipants =
//       project.inSendingOrDroppedParticipants.filter((el) => {
//         el.email != participantEmail;
//       });
//     await cache.mongoUpdate(
//       { collection: models.Project.name, docId: projectId },
//       project
//     );

//     // participant notification document
//     const parNotification = (await cache.mongoGet({
//       collection: models.ParticipantNotifications.name,
//       docId: participantEmail,
//     })) as models.ParticipantNotifications;
//     i = parNotification.inSendingOrDroppedInvitations.length;
//     while (i--) {
//       if (parNotification.inSendingOrDroppedInvitations[i] == projectId) {
//         parNotification.inSendingOrDroppedInvitations.splice(i, 1);
//         if (!inviteDTime) {
//           console.error(
//             `inviteTime == null, when handle invitation got message.`
//           );
//         }
//         parNotification.unhandledInvitations.push({
//           projectId: projectId,
//           invitedTime: inviteDTime,
//           receivedTime: new Date(),
//         });
//         break;
//       }
//     }
//     await cache.mongoUpdate(
//       {
//         collection: models.ParticipantNotifications.name,
//         docId: participantEmail,
//       },
//       parNotification
//     );
//     // reachlimit
//     const conf = (await models.getConf(parNotification)) as models.ConstantConf;
//     if (
//       parNotification.inSendingOrDroppedInvitations.length <
//       conf.PARTICIPANTNOTIFICATIONS_INSENDING_INVITATION_LIMIT
//     ) {
//       await cache.mongoDb
//         .collection(models.ParticipantReachedUnsentLimit.name)
//         .deleteOne({ participantId: participantEmail });
//     }
//     res.json(parNotification);
//   }
// );
// projectRouter.post(
//   "/accept",
//   [
//     body("projectId")
//       .isString()
//       .notEmpty()
//       .custom(async (projectId: string, { req }) => {
//         const participantEmail = req["user"].email;
//         const parNotifications = (await cache.mongoGet({
//           collection: models.ParticipantNotifications.name,
//           docId: participantEmail,
//         })) as models.ParticipantNotifications;
//         if (
//           parNotifications &&
//           parNotifications.unhandledInvitations.some(
//             (el) => el.projectId == projectId
//           )
//         ) {
//           return;
//         }
//         return Promise.reject();
//       }),
//   ],
//   [body("accept").isBoolean()],
//   validatorErrorMiddleware,
//   async (req, res) => {
//     const gotData = matchedData(req);
//     const participantEmail = req["user"].email;
//     const projectId = gotData["projectId"];
//     const isAccept = gotData["accept"];
//     const parNotifications = (await cache.mongoGet({
//       collection: models.ParticipantNotifications.name,
//       docId: participantEmail,
//     })) as models.ParticipantNotifications;
//     let invitedTime;
//     // ParticipantNotification document
//     let i = parNotifications.unhandledInvitations.length;
//     while (i--) {
//       if (parNotifications.unhandledInvitations[i].projectId == projectId) {
//         invitedTime = parNotifications.unhandledInvitations[i].invitedTime;
//         parNotifications.unhandledInvitations.splice(i, 1);
//         break;
//       }
//     }
//     await cache.mongoUpdate(
//       {
//         collection: models.ParticipantNotifications.name,
//         docId: participantEmail,
//       },
//       parNotifications
//     );

//     const project = (await cache.mongoGet({
//       collection: models.Project.name,
//       docId: projectId,
//     })) as models.Project;
//     i = project.receivedButNotAnsweredParticipants.length;
//     while (i--) {
//       if (project.receivedButNotAnsweredParticipants[i] == participantEmail) {
//         project.receivedButNotAnsweredParticipants.splice(i, 1);
//         break;
//       }
//     }

//     if (!isAccept) {
//       // if refuse
//       project.deniedParticipants.push(participantEmail);
//       await cache.mongoUpdate(
//         { collection: models.Project.name, docId: projectId },
//         project
//       );
//       res.json({
//         success: true,
//         message: "",
//         participantNotifications: parNotifications,
//       });
//     } else {
//       // Check whether project is full
//       const desireNumber = project.desiredParticipantNumber;
//       project.acceptedParticipants.push(participantEmail);
//       if (project.inProjectParticipants.length >= desireNumber) {
//         await cache.mongoUpdate(
//           { collection: models.Project.name, docId: projectId },
//           project
//         );
//         return res.json({
//           success: false,
//           message: "Sorry the project is full.",
//           participantNotifications: parNotifications,
//         });
//       }
//       project.inProjectParticipants.push(participantEmail);
//       await cache.mongoUpdate(
//         { collection: models.Project.name, docId: projectId },
//         project
//       );

//       const participant = (await cache.mongoGet({
//         collection: models.Participant.name,
//         docId: participantEmail,
//       })) as models.Participant;
//       if (!participant.projects) {
//         participant.projects = [];
//       }
//       const projectInParProfile = new models.ProjectInParticipantProfile();
//       projectInParProfile.inviteTime = invitedTime;
//       projectInParProfile.issues = [];
//       projectInParProfile.joinTime = new Date();
//       projectInParProfile.prjStartTime = project.prjStartTime;
//       projectInParProfile.leaveTime = undefined;
//       projectInParProfile.projectId = projectId;
//       projectInParProfile.sensorConfs = []; // TODO
//       participant.projects.push(projectInParProfile);
//       if (!participant.projectWallets) {
//         participant.projectWallets = [];
//       }
//       const projectWallet = {} as models.ProjectWalletInParProfile;
//       projectWallet.projectId = projectId;
//       projectWallet.exchangeable = !(project.inFundingAccount == undefined);
//       projectWallet.existingPoints = 0;
//       projectWallet.exchangedMoney = 0;
//       participant.projectWallets.push(projectWallet);
//       await cache.mongoUpdate(
//         { collection: models.Participant.name, docId: participantEmail },
//         participant
//       );
//       res.json({
//         success: true,
//         message: "",
//         participantNotifications: parNotifications,
//         projectId: projectId,
//       });
//     }
//   }
// );
// projectRouter.post(
//   "/leave",
//   [body("projectId").notEmpty()],
//   validatorErrorMiddleware,
//   async (req, res: Response) => {
//     const gotData = matchedData(req);
//     const participantEmail = req["user"].email;
//     const projectId = gotData["projectId"];

//     // validation
//     const project = (await cache.mongoGet({
//       collection: models.Project.name,
//       docId: projectId,
//     })) as models.Project;
//     if (project == undefined) {
//       const ret = new models.Success(false, "");
//       res.json(ret);
//       return;
//     }
//     const participantIndex = project.inProjectParticipants.findIndex(
//       (el) => el == participantEmail
//     );
//     if (participantIndex == -1) {
//       const ret = new models.Success(
//         false,
//         `You are not in project ${projectId}`
//       );
//       res.json(ret);
//       return;
//     }
//     project.inProjectParticipants.splice(participantIndex, 1);
//     project.leftParticipants.push(participantEmail);
//     await cache.mongoUpdate(
//       { collection: models.Project.name, docId: projectId },
//       project
//     );

//     const participant = (await cache.mongoGet({
//       collection: models.Participant.name,
//       docId: participantEmail,
//     })) as models.Participant;
//     const parProjects =
//       participant.projects as models.ProjectInParticipantProfile[];
//     const parProject = parProjects.find((el) => el.projectId == projectId);
//     parProject.leaveTime = new Date();
//     await cache.mongoUpdate(
//       { collection: models.Participant.name, docId: participantEmail },
//       participant
//     );

//     res.json(
//       new models.Success(true, `Leave project ${projectId} successfully!`)
//     );

//     const parData = new models.ParticipantData();
//     parData.participantProfile = true;
//     fcmTool.sendNotificationToUser(
//       participantEmail,
//       ``,
//       ``,
//       await getParticipantNecessaryData(participantEmail, parData)
//     );
//   }
// );

// projectRouter.post(
//   "/sensingData",
//   [body("data").notEmpty()],
//   async (req, res: Response) => {
//     const gotData = matchedData(req);
//     const participantEmail = req["user"].email;
//     const sensingData = gotData.data as models.SensorRecord[];
//     if (sensingData == undefined) {
//       return res.json(new models.Success(false, `No sensing data provided.`));
//     }
//     const par = (await cache.mongoGet({
//       collection: models.Participant.name,
//       docId: participantEmail,
//     })) as models.Participant;
//     const prjs = {} as Record<string, models.Project>;
//     for (let i = 0; i < par.projects.length; ++i) {
//       const prjId = par.projects[i].projectId;
//       const prj = (await cache.mongoGet({
//         collection: models.Project.name,
//         docId: prjId,
//       })) as models.Project;
//       prjs[prjId] = prj;
//     }
//     for (let i = 0; i < sensingData.length; ++i) {
//       const eachData = sensingData[i];
//       const dataCreateTime = new Date(eachData.createDetailedTime);
//       if (dataCreateTime.getTime() > par.lastSenseDataTime.getTime()) {
//         par.lastSenseDataTime = dataCreateTime;
//       }
//       let partTotalAdd = false;
//       const completePrjsForSuchSensor = [];
//       eachData.projectList = eachData.projectList.filter(
//         (prjId) => prjs[prjId] != undefined && !prjs[prjId].prjComplete
//       );
//       eachData.projectList.forEach((prjId) => {
//         const prj = prjs[prjId];
//         if (prj == undefined) return;
//         const prjInPar = par.projects.find((el) => el.projectId == prjId);
//         if (prjInPar == undefined) return;

//         if (dataCreateTime.getTime() > prjInPar.lastSenseDataTime.getTime()) {
//           prjInPar.lastSenseDataTime = dataCreateTime;
//         }
//         let sensorStatisticInPrj = prj.prjStatistic.find((el) => {
//           const nu = 8;
//           const k = el.sensorId.charCodeAt(nu);
//           const b = eachData.sensorId.charCodeAt(nu);
//           const ret = el.sensorId == eachData.sensorId;
//           return ret;
//         });
//         if (sensorStatisticInPrj == undefined) {
//           sensorStatisticInPrj = new models.SensorStatistic();
//           const goal = prj.prjGoals.find(
//             (el) => el.sensorId == eachData.sensorId
//           );
//           if (goal == undefined) {
//             return;
//           } else {
//             sensorStatisticInPrj.goalNum = goal.recordsNum;
//           }
//           sensorStatisticInPrj.collectedNum = 0;
//           sensorStatisticInPrj.sensorId = eachData.sensorId;
//           prj.prjStatistic.push(sensorStatisticInPrj);
//         }
//         if (sensorStatisticInPrj.collectedNum >= sensorStatisticInPrj.goalNum) {
//           completePrjsForSuchSensor.push(prjId);
//         } else {
//           sensorStatisticInPrj.collectedNum++;
//           partTotalAdd = true;
//           if (hasProjectComplete(prj)) {
//             prj.prjComplete = true;
//             prjInPar.prjComplete = true;
//           }
//         }
//       });

//       // If for some prj, this sensor goal is complete, this data will not add for that prj
//       eachData.projectList = eachData.projectList.filter(
//         (prjId) => completePrjsForSuchSensor.indexOf(prjId) === -1
//       );

//       if (partTotalAdd) {
//         par.totalRecordsNumber++;
//       }
//       await cache.mongoUpdate(
//         { collection: models.Participant.name, docId: participantEmail },
//         par
//       );
//       for (let i = 0; i < Object.keys(prjs).length; ++i) {
//         const prjId = Object.keys(prjs)[i];
//         await cache.mongoUpdate(
//           { collection: models.Project.name, docId: prjId },
//           prjs[prjId]
//         );
//       }

//       const recordId = eachData.id;
//       delete eachData.id;
//       if (eachData.projectList.length > 0) {
//         await cache.mongoUpdate(
//           { collection: models.SensorRecord.name, docId: recordId },
//           eachData
//         );
//       }
//     }

//     // TODO push to other relevant people, different prjs relevant people

//     const parData = new models.ParticipantData();
//     parData.participantProfile = true;
//     parData.participantNotifications = true;
//     parData.projectIds = Object.keys(prjs);
//     fcmTool.sendNotificationToUser(
//       participantEmail,
//       "",
//       "",
//       await getParticipantNecessaryData(participantEmail, parData)
//     );
//     // console.log(participantEmail, sensingData);
//     res.json(new models.Success(true));
//   }
// );
