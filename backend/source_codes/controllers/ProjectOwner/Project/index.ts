import { matchedData } from "express-validator";
import {
  Project,
  ProjectOwner,
  InFundingAccount,
  SensorRecord,
  Participant,
  Points,
  ParticipantData,
} from "../../../models/data";
import cache from "../../../cache";
import { purifyFromTemplate } from "../../../routers/router_basic";
import { v4 as uuidv4 } from "uuid";
import { matchmakingAndInvite } from "../../../matchmaking";
import {
  exportToCSV,
  dataFiltersToMongoFilters,
  sanitizeDataFields,
} from "../../../models/logic/utils";
import { notifyParticipantsDataUsed } from "../../../models/logic/statistics/projectOwner";
import fs = require("fs");
import path = require("path");
import { fcmTool } from "../../../fcm_utility";
import { getParticipantNecessaryData } from "../../Participant/Logic";

export const editProjectDetails = async (req, res) => {
  // We retrieve the project ID
  const { projectId } = req.body;

  // const keyArr = [
  //   cache._mongoCacheKey(Participant.name, participantEmail),
  //   cache._mongoCacheKey(Project.name, participantEmail),

  // ];

  // cache.lock.acquire(keyArr, async function() {

  // If the project ID is of type string
  if (typeof projectId == "string") {
    // Check if the project ID belongs to this Project Owner
    const projOwnerEmail = req["user"].email;
    const projOwnerDoc = (await cache.mongoGet({
      collection: ProjectOwner.name,
      docId: projOwnerEmail,
    })) as ProjectOwner;
    if (projOwnerDoc.projects.includes(projectId)) {
      // We look for the inFundingAccount for this project
      const projInFundAcc = projOwnerDoc.inFundingAccounts[projectId];
      if (typeof projInFundAcc !== "undefined") {
        // We get the Project document matching this project ID
        const projDoc = (await cache.mongoGet({
          collection: Project.name,
          docId: projectId,
        })) as Project;
        // We get all Participant emails who are either in the project, or who were in the project in the past
        const allRelevantPtcps = projDoc.inProjectParticipants.concat(
          projDoc.leftParticipants
        );
        // We update all Participant document's project wallet's ProjectWalletInParProfile's conversion rate
        allRelevantPtcps.forEach(async (ptcpEmail) => {
          // We get the Participant document
          const relevantPtcp = (await cache.mongoGet({
            collection: Participant.name,
            docId: ptcpEmail,
          })) as Participant;
          // We look for this Participant's Project Wallet belonging to this project
          const matchingWallet = relevantPtcp.projectWallets.find(
            (wallet) => wallet.projectId == projectId
          );
          // Update the Participant document
          await cache.mongoUpdate(
            { collection: Participant.name, docId: ptcpEmail },
            relevantPtcp
          );
        });
        // Update the Project document
        await cache.mongoUpdate(
          { collection: Project.name, docId: projectId },
          projDoc
        );
        // Update the Project Owner document
        await cache.mongoUpdate(
          { collection: ProjectOwner.name, docId: projOwnerEmail },
          projOwnerDoc
        );
        // We are done - Send a success response
        res.sendStatus(204);
      } else {
        return Promise.reject({
          message:
            "This project has no funding account.",
        });
      }
    } else {
      return Promise.reject({
        message: "You do not have ownership of this project.",
      });
    }
  } else {
    return Promise.reject({
      message:
        "The syntax for editing project details is wrong, or the data types provided is incorrect.",
    });
  }
};

export const retrieveProjectData = async (req, res) => {
  // We retrieve the project ID in the request
  const { projectId } = req.query;
  if (typeof projectId !== "undefined") {
    // then look for all SensorRecords that have this project ID
    const matchingSensorRecords = (await cache.mongoGetProjectSensorRecords(
      projectId
    )) as SensorRecord[];
    exportToCSV(matchingSensorRecords, projectId);
    const fileLocation = path.join(
      __dirname,
      `../../../../resources/tmp/${projectId}/`,
      "sensor_record_download.csv"
    );
    res.download(fileLocation, "sensor_record_download.csv", async (err) => {
      if (err) {
        console.log(err);
      }
      // Delete the file and folder from the temporary resources folder
      fs.rmdirSync(
        path.join(__dirname, `../../../../resources/tmp/${projectId}/`),
        { recursive: true }
      );

      // Send a notification to all users to let them know that their data has been downloaded by the Project Owner
      await notifyParticipantsDataUsed(projectId);
    });
  } else {
    res.status(500).send({ reason: "Missing projectId in query parameters." });
  }
};

module.exports.retrieveDataPreview = (req, res) => {};

export const retrieveProjectDetails = async (req, res) => {
  const projectId = matchedData(req).projectId;
  const projectOwnerEmail = req["user"].email;
  const path = { collection: Project.name, docId: projectId };
  const ret = (await cache.mongoGet(path)) as Project;

  // Hide detail information of participants
  ret["inMatchMakingParticipantsNum"] =
    typeof ret.inMatchMakingParticipants == "undefined"
      ? 0
      : ret.inMatchMakingParticipants.length;
  delete ret.inMatchMakingParticipants;

  ret["allinvitedparticipantsNum"] =
    typeof ret.allInvitedParticipants == "undefined"
      ? 0
      : ret.allInvitedParticipants.length;
  delete ret.allInvitedParticipants;

  ret["acceptedparticipantsNum"] =
    typeof ret.acceptedParticipants == "undefined"
      ? 0
      : ret.acceptedParticipants.length;
  delete ret.acceptedParticipants;

  ret["inprojectparticipantsNum"] =
    typeof ret.inProjectParticipants == "undefined"
      ? 0
      : ret.inProjectParticipants.length;
  delete ret.inProjectParticipants;

  // Hide constantConf
  delete ret.constantConf;

  // Highlight Issues
  if (typeof ret.highlightedIssues == "undefined") {
    ret.highlightedIssues = [];
  }

  res.json(ret);
};

// For creating a new project
export const createProject = async (req, res) => {
  // We initialise a new project template
  const projectObjectTemplate = new Project();
  const projectPost = matchedData(req);
  // in case the matchedData didnt totally purify the data
  purifyFromTemplate(
    projectObjectTemplate,
    projectPost,
    "prjFunding",
    "conversionRate",
    "isFullRedeemOnly",
  );

  const projectOwnerEmail = req["user"].email;
  const pathProfile = {
    collection: ProjectOwner.name,
    docId: projectOwnerEmail,
  };
  // We retrieve the ProjectOwner profile from the cache / MongoDB
  const keyArr = [
    cache._mongoCacheKey(ProjectOwner.name, projectOwnerEmail),
  ];

  await cache.lock.acquire(keyArr, async function() {
    const profile = (await cache.mongoGet(pathProfile)) as ProjectOwner;

    // using uuid helps expedite the development progress by easily ensuring everything in a single transaction.
    const projectId = uuidv4();
    const projFunds = projectPost.prjFunding;
    // If we have a field called project funding (prjFunding) in the request sent
    if (typeof projectPost.prjFunding != "undefined") {
      // If the project owner's profile has no field called "balance", OR
      // if the the project owner's funding balance is insufficient
      if (
        typeof profile.balance == "undefined" ||
        !(profile.balance >= projectPost.prjFunding)
      ) {
        // We reject the use of the project funding field in the request
        return Promise.reject({ message: "The balance is not enough to fund." });
      } else {
        // Else if there is sufficient balance and the project owner does have a "balance" field
        // We deduct the funding that we want to use for this project, from the Project Owner's funding balance
        profile.balance -= projectPost.prjFunding;
        // We instantiate a funding account template for the project owner
        const inFundingAccount = new InFundingAccount();
        // We set the exchanged amount in the funding account to 0
        // (because the project was just created, no Participants have exchanged any points for funding yet)
        inFundingAccount.exchangedAmount = 0;
        // We set the total funding for the project to be what was requested
        inFundingAccount.totalFund = projectPost.prjFunding;
        // We set the funding account's project ID to our generated project ID
        inFundingAccount.projectId = projectId;
        // We set the project's funding account to our instantiated template
        projectPost.inFundingAccount = inFundingAccount;

        // If the project owner's profile does not have the field "inFundingAccounts"
        if (typeof profile.inFundingAccounts == "undefined") {
          // We instantiate it to be an object
          profile.inFundingAccounts = {};
        }

        /**
         * Then we assign the project ID to this inFundingAccount:
         * {
         *   Project ID: inFundingAccount
         * }
         */
        profile.inFundingAccounts[projectId] = inFundingAccount;
      }
    }

    // Like prjFunding', 'conversionRate' in the req, they are not a standardized input to the model
    // After the above procedure, these properties can be removed by the following statement
    purifyFromTemplate(projectObjectTemplate, projectPost, "isFullRedeemOnly");
    Object.assign(projectObjectTemplate, projectPost);

    // If the profile does not have a "projects" field
    if (typeof profile.projects == "undefined") {
      // We instantiate one
      profile.projects = [];
    }

    // We add this project ID to the list of projects this Project Owner has
    profile.projects.push(projectId);

    projectObjectTemplate.prjOwner = projectOwnerEmail
    // We initialise statistic information for the project
    projectObjectTemplate.prjStatistic = [];
    // We get the list of sensors from the cache and iterate through it
    let totalSensorRecordsReq = 0;
    (await cache.getSensors()).forEach((eachSensor) => {
      // We instantiate the collected number of records to be 0
      // (since the project has just started, no records have been collected yet)
      const collectedNum = 0;
      // We instantiate the initial number of records that the project owner wants to collect
      // to be 0 FIRST
      let goalNum = 0;

      // We check if out of the project goals that have been set
      projectObjectTemplate.prjGoals.some(({ sensorId, recordsNum }) => {
        // If we find a project goal that matches this particular sensor ID
        if (eachSensor._id === sensorId) {
          // We set the goal number to be the number of records defined in the project goal
          goalNum = recordsNum;
          // and we add an object of the project statistics to the list of project statistics
          projectObjectTemplate.prjStatistic.push({
            collectedNum: collectedNum,
            goalNum: goalNum,
            sensorId: eachSensor._id,
          });

          totalSensorRecordsReq += goalNum;
          // Since we found what we are looking for, we return true to terminate the 'some' method
          return true;
        }
      });
    });

    if (typeof projFunds != "undefined") {
      // We update the conversion rate
      // We get the amount of funding that has been assigned to the project
      const projFunding = profile.inFundingAccounts[projectId].totalFund;
      // We get the number of desired participants for the project
      const numPtcpsReq = projectObjectTemplate.desiredParticipantNumber;
      // We get the average funding per participant for the project
      const avgPtcpFund = projFunding / numPtcpsReq;
      profile.inFundingAccounts[projectId].conversionRate = (totalSensorRecordsReq * Points.getBasePoints()) / avgPtcpFund;
    }

    // We set some cache-related configuration to the project
    projectObjectTemplate.constantConf = (await cache.getTheLatestConf()).id;

    // when create a project, the Profile document needs to update also
    await cache.mongoUpdate(pathProfile, profile);
    const docPathOfProject = {
      collection: Project.name,
      docId: projectId,
    };
    await cache.mongoUpdate(docPathOfProject, projectObjectTemplate);
    res.json(projectId);

    // matchmaking and invite
    /**
     * This is the loop for matchmaking after creating THIS project
     */
    matchmakingAndInvite(projectId);
  })
};

export const adjustMatchmakingSetting = async (req, res) => {
  const postData = matchedData(req);
  const docPath = {
    collection: Project.name,
    docId: postData.projectId,
  };

  const keyArr = [
    cache._mongoCacheKey(Project.name, postData.projectId),
  ];

  await cache.lock.acquire(keyArr, async function() {
    const project = (await cache.mongoGet(docPath)) as Project;
    const currentEnable = project.matchmakingEnable;
    if (currentEnable != postData.matchmakingEnable) {
      project.matchmakingEnable = postData.matchmakingEnable;
      await cache.mongoUpdate(docPath, project);
      // TODO
    }
    res.json(postData);
  });
};

/**
 * This method moves funds from the Project Owner's current account balance,
 * to a specific project's account
 */
export const addFundsToProject = async (req, res) => {
  const postData = matchedData(req);
  const projectOwnerEmail = req["user"].email;
  const docPathOfProfile = {
    collection: ProjectOwner.name,
    docId: projectOwnerEmail,
  };

  const keyArr = [
    cache._mongoCacheKey(ProjectOwner.name, projectOwnerEmail),
    cache._mongoCacheKey(Project.name, postData.projectId)
  ];

  await cache.lock.acquire(keyArr, async function() {
    const profile = (await cache.mongoGet(docPathOfProfile)) as ProjectOwner;
    if (profile.balance < postData.addValue) {
      return Promise.reject({ message: "The balance is not enough to fund." });
    }

    const docPathOfProject = {
      collection: Project.name,
      docId: postData.projectId,
    };

    const project = (await cache.mongoGet(docPathOfProject)) as Project;

    // Calculate the conversion rate
    // 1. Get the number of participants required for the project
    const numReqPtcps = project.desiredParticipantNumber;

    if (!project.inFundingAccount) {
      // it is the first time to set a funding
      const inFundingAccount = new InFundingAccount();
      // 2. Get the average amount of funding per participant
      const avgFundPerPtcp = Number.parseFloat(postData.addValue) / numReqPtcps;
      // 3. Get the total number of points a participant will earn if they complete all the sensor goals
      const initialPts = 0;
      const totalPtsEarned = project.prjGoals.reduce((acc, goal) => {
        return acc + goal.recordsNum
      }, initialPts) * Points.getBasePoints();
      inFundingAccount.conversionRate = totalPtsEarned / avgFundPerPtcp;
      inFundingAccount.exchangedAmount = 0;
      inFundingAccount.projectId = postData.projectId;
      inFundingAccount.totalFund = Number.parseFloat(postData.addValue);
      project.inFundingAccount = inFundingAccount;
    } else {
      project.inFundingAccount.totalFund += Number.parseFloat(postData.addValue);
      // Update the conversion rate of the project
      // 2. Get the average amount of funding per participant
      const avgFundPerPtcp = project.inFundingAccount.totalFund / numReqPtcps;
      // 3. Get the total number of points a participant will earn if they complete all the sensor goals
      const initialPts = 0;
      const totalPtsEarned = project.prjGoals.reduce((acc, goal) => {
        return acc + goal.recordsNum
      }, initialPts) * Points.getBasePoints();
      project.inFundingAccount.conversionRate = totalPtsEarned / avgFundPerPtcp;
    }
    
    const ptcpToUpdate = [];
    // We update the Participant's project wallet conversion rate
    // and the wallet's maximum exchangeable amount
    for (let i = 0; i < project.inProjectParticipants.length; i += 1) {
      const ptcpEmail = project.inProjectParticipants[i];
      const ptcp = await cache.mongoGet({ collection: Participant.name, docId: ptcpEmail }) as Participant;
      const matchingProjWallet = ptcp.projectWallets.find((wallet) => wallet.projectId === postData.projectId);

      if (typeof matchingProjWallet !== "undefined") {
        matchingProjWallet.conversionRate = project.inFundingAccount.conversionRate;
        matchingProjWallet.maxExchangeable = project.inFundingAccount.totalFund / numReqPtcps;
      }

      await cache.mongoUpdate({ collection: Participant.name, docId: ptcpEmail }, ptcp);
      ptcpToUpdate.push(ptcpEmail);
    }

    profile.balance -= postData.addValue;
    if (!profile.inFundingAccounts) {
      profile.inFundingAccounts = {};
    }

    profile.inFundingAccounts[postData.projectId] = project.inFundingAccount;

    await cache.mongoUpdate(docPathOfProject, project);
    await cache.mongoUpdate(docPathOfProfile, profile);
    // await cache.firebaseBatchSet({ fullObj: project, docPath: docPathOfProject }, { fullObj: profile, docPath: docPathOfProfile });

    // Send a FCM notification to all participants in this project
    // to update project wallet conversion rate
    // and to update the maximum exchangeable amount
    for (let i = 0; i < ptcpToUpdate.length; i += 1) {
      const ptcpEmail = ptcpToUpdate[i];
      const parData = new ParticipantData();
      parData.participantProfile = true;
      parData.projectIds = [postData.projectId];
      fcmTool.sendNotificationToUser(
        ptcpEmail,
        "",
        "",
        await getParticipantNecessaryData(ptcpEmail, parData)
      );
    }

    res.json({
      projectId: postData.projectId,
      currentFundLeft:
        project.inFundingAccount.totalFund -
        project.inFundingAccount.exchangedAmount,
      currentBalance: profile.balance,
    });
  });
};

/**
 * This function will filter the data based on the filter inputs by the Project Owner
 * NOTE: Data filters are CHAINED 'AND' operators,
 * while the types within the data filter will be 'OR' operators
 *
 * e.g. If we provide filters for MobileDeviceType and DeviceModelRecords,
 * then we are filtering for sensor records which are of a certain mobile device type AND model.
 * For instance, we want sensor record data of WEARABLE DEVICES that are of the APPLE model.
 *
 * WITHIN A FILTER, if we provide more than one type for the filter, then we want sensor data records
 * that are if either types provided.
 *
 * e.g. Say for the MobileDeviceType filter, we provide the types "Mobile Phone" and "Wearable Device",
 * then we are looking for sensor data records that are either "Mobile Phone" OR "Wearable Device"
 */
export const filterData = async (req, res) => {
  const postData = matchedData(req);
  const projectId = postData["projectId"];
  const filters = postData["filters"];

  const mongoFilters = dataFiltersToMongoFilters(filters);

  const matchingSensorRecords = (await cache.mongoGetProjectSensorRecords(
    projectId,
    mongoFilters,
    100
  )) as SensorRecord[];
  const sanitizedDataset = sanitizeDataFields(matchingSensorRecords);
  // exportToCSV(matchingSensorRecords, projectId);
  // const fileLocation = path.join(__dirname, `../../../../resources/tmp/${projectId}/`, "sensor_record_download.csv");
  // res.download(fileLocation, "sensor_record_download.csv", (err) => {
  //   if (err) {
  //     console.log(err);
  //   }
  //   // Delete the file and folder from the temporary resources folder
  //   fs.rmdirSync(path.join(__dirname, `../../../../resources/tmp/${projectId}/`), { recursive: true });
  // });

  res.status(200).json(sanitizedDataset);
};
