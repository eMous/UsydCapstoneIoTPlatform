import cache from "./cache";
import { fcmTool } from "./fcm_utility";
import * as models from "./models/data";
import { shuffle } from "./prepare";
import { getParticipantNecessaryData } from "./controllers/Participant/Logic"

class FailedResults {
  emails: string[] = undefined;
}
export async function matchmakingAndInvite(projectId: string) {
  const currentProject = (await cache.mongoGet({
    collection: models.Project.name,
    docId: projectId,
  })) as models.Project;
  if (!currentProject.matchmakingEnable) {
    return;
  }
  const matchedParticipantEmails = await matchmaking(projectId);
  console.log(`MATCHMAKING & INVITE, PROJ ID: ${projectId}`);
  console.log(`MATCHED PARTICIPANT EMAILS: ${JSON.stringify(matchedParticipantEmails)}`);
  await invite(projectId, matchedParticipantEmails);

  setTimeout(matchmakingAndInvite.bind(null, projectId), 1000 * 3600 * 24);
  // setTimeout(matchmakingAndInvite.bind(null, projectId), 5000);
}

async function matchmaking(projectId: string): Promise<Set<string>> {
  // if is full
  const pathOfProject = { collection: models.Project.name, docId: projectId };
  const currentProject = (await cache.mongoGet(
    pathOfProject
  )) as models.Project;
  
  // We added a 10% increased number of participants factor to send invites out to
  // Refer to this study: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4938277
  const NON_RESP_COMPENSATE_FACTOR = 1.1;

  let leftSpace =
    Math.ceil(currentProject.desiredParticipantNumber * NON_RESP_COMPENSATE_FACTOR) -
    currentProject.inProjectParticipants.length;
  if (leftSpace == 0) {
    return new Set();
  }

  // Create the participant pool
  let allParticipants = await cache.mongoGetAllParticipantsCached();

  // Filter out
  const inviteBlackList = new Set(currentProject.inviteBlackList);
  const allInvitedParticipants = new Set(currentProject.allInvitedParticipants);
  const inMatchMakingParticipants = new Set(
    currentProject.inMatchMakingParticipants
  );
  const participantsReachUnsentNotificationLimit =
    await cache.mongoGetAllParticipantsReachedUnsentLimit();

  // If inmatchmaking changes, then need to update
  let needToUpdate = false;
  // supplement them into inMatch
  allParticipants = shuffle(allParticipants);
  for (const key in allParticipants) {
    const par = allParticipants[key];
    // I dont know why it is undefined
    if (par == undefined) {
      continue;
    }
    const email = par.email;

    // if (inMatchMakingParticipants.size >= leftSpace * 10) break;
    if (inviteBlackList.has(email)) continue;
    if (allInvitedParticipants.has(email)) continue;
    if (inMatchMakingParticipants.has(email)) continue;
    if (participantsReachUnsentNotificationLimit.has(email)) continue;

    if (
      (await cache.mongoGet({
        collection: models.ParticipantNotifications.name,
        docId: email,
      })) == undefined
    )
      continue;

    if (
      (
        (await cache.mongoGet({
          collection: models.Participant.name,
          docId: email,
        })) as models.Participant
      ).gender == undefined
    )
      continue;
    
    // If the user isn't logged in, we don't send them an invite
    if (!(await fcmTool.userIsLoggedIn(email))) continue;
    // if (Object.prototype.hasOwnProperty.call(allParticipants, key)) {
    inMatchMakingParticipants.add(email);
    leftSpace--;
    needToUpdate = true;
    // }
  }

  if (needToUpdate) {
    currentProject.inMatchMakingParticipants = Array.from(
      inMatchMakingParticipants
    );
    await cache.mongoUpdate(pathOfProject, currentProject);
  }
  const matchedEmails = await exactMatchMaking(
    currentProject,
    inMatchMakingParticipants
  );
  
  return matchedEmails;
}

async function invite(
  projectId: string,
  participantEmails: Set<string>
): Promise<any> {
  const keyArr = [cache._mongoCacheKey(models.Project.name,projectId)];
  [...participantEmails].map((ptcpEmail) => {
    keyArr.push(cache._mongoCacheKey(models.ParticipantNotifications.name,ptcpEmail));
  });

  await cache.lock.acquire(keyArr, async function() {
    const pathOfProject = { collection: models.Project.name, docId: projectId };
    const currentProject = (await cache.mongoGet(
      pathOfProject
    )) as models.Project;
    // Check sendingOrDrop participants' send time, and put the unresponds ones into blacklist
    const inSendingOrDroppedParticipants =
      currentProject.inSendingOrDroppedParticipants;
    const blackList = currentProject.inviteBlackList;
    let i = inSendingOrDroppedParticipants.length;
    while (i--) {
      const email = inSendingOrDroppedParticipants[i].email;
      const sentTimeStr = inSendingOrDroppedParticipants[i]
        .sentTime as unknown as string;
      const sentTimeNumber = Date.parse(sentTimeStr);
      const nowDateNumber = Date.now();

      const diff = nowDateNumber - sentTimeNumber;
      // const timeToThrow = 14;
      const timeToThrow = 14 * 24 * 3600 * 1000;

      // If the difference between the time the invitation was sent is greater than
      // the threshold to throw away the invitation
      if (diff > timeToThrow) {
        // We remove the user's invitation
        inSendingOrDroppedParticipants.splice(i, 1);
        // and blacklist them
        blackList.push(email);

        // update participants notification model
        const participantNotifications = (await cache.mongoGet({
          collection: models.ParticipantNotifications.name,
          docId: email,
        })) as models.ParticipantNotifications;
        const inSendingOrDroppedInvitationsSet = new Set(
          participantNotifications.inSendingOrDroppedInvitations
        );
        inSendingOrDroppedInvitationsSet.delete(projectId);
        participantNotifications.inSendingOrDroppedInvitations = Array.from(
          inSendingOrDroppedInvitationsSet
        );
        await cache.mongoUpdate(
          { collection: models.ParticipantNotifications.name, docId: email },
          participantNotifications
        );

        const confOfBlackListParticipantNotification = (await models.getConf(
          participantNotifications
        )) as models.ConstantConf;
        if (
          confOfBlackListParticipantNotification.PARTICIPANTNOTIFICATIONS_INSENDING_INVITATION_LIMIT >
          participantNotifications.inSendingOrDroppedInvitations.length
        ) {
          // the participant can get other invitation from other project
          await cache.mongoDb
            .collection(models.ParticipantReachedUnsentLimit.name)
            .deleteOne({ _id: email });
        }
      }
    }

    let participantEmailsIter = participantEmails.values();
    for (let i = 0; i < participantEmails.size; ++i) {
      const email = participantEmailsIter.next().value;
      const now = new Date();

      // For each of the participants that we want to invite, we need to initialize:
      // 1. The ProjectInParticipantProfile
      const projectInParProfile = new models.ProjectInParticipantProfile();
      projectInParProfile.inviteTime = new Date();
      projectInParProfile.issues = [];
      projectInParProfile.joinTime = null;
      projectInParProfile.prjStartTime = currentProject.prjStartTime;
      projectInParProfile.leaveTime = undefined;
      projectInParProfile.projectId = projectId;
      projectInParProfile.sensorConfs = [];
      projectInParProfile.sensorRecords = [];
      projectInParProfile.isFullRedeemOnly = currentProject.isFullRedeemOnly;

      // Retrieve the sensor configuration for the project
      const projSensorReqs = currentProject.prjRequirements.find(
        (reqObj) => reqObj.requirementType === "SensorPrjRequirement"
      ) as models.ProjectRequirement;
      if (typeof projSensorReqs["sensors"] !== "undefined") {
        // For each of the project's required sensors
        projSensorReqs["sensors"].forEach((snsr) => {
          // We store a SensorConf object in the ProjectInParticipantProfile for the Participant
          const sensorConfReq = new models.SensorConf();
          sensorConfReq.enabledSensorName = snsr.sensorId;
          sensorConfReq.sensorFrequency = snsr.minimumFrequency;
          projectInParProfile.sensorConfs.push(sensorConfReq);

          // We create a history record for this sensor's last data received datetime
          const sensorHistory = new models.SensorRecordHistory();
          sensorHistory.sensorId = snsr.sensorId;
          sensorHistory.lastSensed = null;  // We set this to null to indicate that no data has been received before
          projectInParProfile.sensorLastUpdated.push(sensorHistory);
        });
      }

      // Retrieve the goals of this project
      currentProject.prjGoals.forEach((eachGoal) => {
        // We create a sensorRecords array for each of the sensor goals that
        // we need to collect
        const simpSensorRecord = new models.SimpleSensorRecord();
        simpSensorRecord.sensorId = eachGoal.sensorId;
        simpSensorRecord.number = 0;
        simpSensorRecord.required = Math.ceil(eachGoal.recordsNum / currentProject.desiredParticipantNumber);
        projectInParProfile.sensorRecords.push(simpSensorRecord);
      });

      // We retrieve the Participant that we are sending the project invite to
      const participant = await cache.mongoGet({ 
        collection: models.Participant.name, docId: email 
      }) as models.Participant;

      // We add this model of a project that a Participant has joined,
      // to the Participant's list of projects
      participant.projects.push(projectInParProfile);
      // If the Participant does not have a ** LIST ** of project wallets
      // i.e. All the project wallets that they have across all projects they have joined
      if (!participant.projectWallets) {
        // We instantiate one for them
        participant.projectWallets = [];
      }

      // And create a project wallet for THIS particular project
      const projectWallet = {} as models.ProjectWalletInParProfile;
      // We initialize all the details of this project wallet
      projectWallet.projectId = projectId;
      projectWallet.exchangeable = !(
        typeof currentProject.inFundingAccount == "undefined"
      );
      projectWallet.existingPoints = 0;
      projectWallet.exchangedMoney = 0;
      projectWallet.conversionRate = currentProject.inFundingAccount.conversionRate;
      projectWallet.maxExchangeable = currentProject.inFundingAccount.totalFund / currentProject.desiredParticipantNumber;

      // We add this project wallet, to the list of project wallets belonging to the Participant
      participant.projectWallets.push(projectWallet);
      // Update the cache and database
      await cache.mongoUpdate(
        { collection: models.Participant.name, docId: email },
        participant
      );
      
      console.log(`prj ${currentProject["_id"]} has send invit to ${email}`);

      currentProject.allInvitedParticipants.push(email);
      currentProject.inSendingOrDroppedParticipants.push({
        email: email,
        sentTime: now,
      });

      const participantNotifications = (await cache.mongoGet({
        collection: models.ParticipantNotifications.name,
        docId: email,
      })) as models.ParticipantNotifications;
      participantNotifications.inSendingOrDroppedInvitations.push(projectId);
      await cache.mongoUpdate(
        { collection: models.ParticipantNotifications.name, docId: email },
        participantNotifications
      );

      const confOfParticipantNotification = (await models.getConf(
        participantNotifications
      )) as models.ConstantConf;
      // If the number of project invitations that are being sent to the participant
      // are >= the maximum number of project invitations that a participant is allowed to have
      if (
        participantNotifications.inSendingOrDroppedInvitations.length >=
        confOfParticipantNotification.PARTICIPANTNOTIFICATIONS_INSENDING_INVITATION_LIMIT
      ) {
        // The participant's email address will be placed in a database collection of a list
        // of people who should not be sent more project invitations
        const reachLimitRecord = new models.ParticipantReachedUnsentLimit();
        reachLimitRecord.participantId = email;
        await cache.mongoUpdate(
          { collection: models.ParticipantReachedUnsentLimit.name, docId: email },
          reachLimitRecord
        );
      }
    }
    
    // Tell the system that these people have already been matched, don't
    // consider them next time
    const inMatchSet = new Set(currentProject.inMatchMakingParticipants);
    const resultMatch = new Set(
      [...inMatchSet].filter((x) => !participantEmails.has(x))
    );
    currentProject.inMatchMakingParticipants = Array.from(resultMatch);
    // Update the database for Project.inMatchMakingParticipants
    await cache.mongoUpdate(
      { collection: models.Project.name, docId: projectId },
      currentProject
    );
    
    participantEmailsIter = participantEmails.values();
    // Iterate through all participants and send the FCM notification to each one of them
    for (let i = 0; i < participantEmails.size; ++i) {
      const email = participantEmailsIter.next().value;
      const now = new Date();
      const notificationResult = await fcmTool.sendNotificationToUser(
        email,
        buildNotificationTitle(currentProject),
        buildNotificationContent(currentProject),
        buildNotificationDataForInivitation(currentProject, now)
      );

      const parData = new models.ParticipantData();
      parData.participantProfile = true;
      parData.projectIds.push(projectId);
      fcmTool.sendNotificationToUser(
        email,
        "",
        "",
        await getParticipantNecessaryData(email, parData)
      );

      if (notificationResult instanceof Error) {
        const code = notificationResult["errorInfo"]["code"];
        if (code == "messaging/registration-token-not-registered") {
          // Make remove this email/token pair in FCMUser
          const fcmToken = notificationResult["fcmToken"];
          await cache.mongoDb
            .collection(models.FCMUser.name)
            .deleteOne({ email: email, fcmToken: fcmToken });

          // Remove the user from inMatchmaking array of the project
          let i = currentProject.inMatchMakingParticipants.length;
          while (i--) {
            if (currentProject.inMatchMakingParticipants[i] == email) {
              currentProject.inMatchMakingParticipants.splice(i, 1);
              break;
            }
          }
          continue;
        } else {
          console.error(notificationResult);
        }
      }
    }
  })
}

async function exactMatchMaking(
  project: models.Project,
  participantEmails: Set<string>,
): Promise<Set<string>> {
  // We initialize an array of Participant objects that qualify for the matchmaking
  let matchmadePtcps = [];

  // We get the list of requirements from the project that we currently support for matchmaking
  const snsrReqs = project.prjRequirements.find((req) => req.requirementType === models.SensorPrjRequirement.name);
  const mobileSysReqs = project.prjRequirements.find((req) => req.requirementType === models.MobileSystemPrjRequirement.name);
  const androidApiReqs = project.prjRequirements.find((req) => req.requirementType === models.AndroidAPIPrjRequirement.name);
  const genderReqs = project.prjRequirements.find((req) => req.requirementType === models.GenderPrjRequirement.name);
  const mobileDeviceTypeReqs = project.prjRequirements.find((req) => req.requirementType === models.MobileDeviceTypePrjRequirement.name);

  // We will use the "seriousness" of each requirement to indicate the importance of each requirement
  // 5 indicates "must have" - If the participant does not have i
  // 1 indicates "good to have"
  // anything in-between is the scale of importance of having the participant meet this requirement

  // If there are any must-haves, then we retrieve the participants that meet these must-haves first
  // We format the must-have requirements into an object for searching for participants
  const mustHaveReqs = {};
  const goodToHaveReqs = {};
  
  if (typeof snsrReqs !== "undefined") {
    if (snsrReqs.seriousness == 5) { 
      mustHaveReqs["sensorsInDevice"] = {
        $all: snsrReqs["sensors"].map((eachSnsrReq) => ({
          $elemMatch: { id: eachSnsrReq.sensorId }
        }))
      }
    } else {
      goodToHaveReqs["sensorsInDevice"] = snsrReqs["sensors"].map((eachSnsrReq) => eachSnsrReq.sensorId)
    }
  }

  if (typeof mobileSysReqs !== "undefined") {
    if (mobileSysReqs.seriousness == 5) { 
      mustHaveReqs["mobileSystem"] = {
        $in: mobileSysReqs["mobileSystems"]
      }
    } else {
      goodToHaveReqs["mobileSystem"] = mobileSysReqs["mobileSystems"];
    }
  }

  if (typeof androidApiReqs !== "undefined") {
    if (androidApiReqs.seriousness == 5) {
      mustHaveReqs["androidAPI"] = {};
      if (typeof androidApiReqs["minAPILevel"] !== "undefined" && androidApiReqs["minAPILevel"] !== null) {
        mustHaveReqs["androidAPI"]["$gte"] = androidApiReqs["minAPILevel"];
      }
      if (typeof androidApiReqs["maxAPILevel"] !== "undefined" && androidApiReqs["maxAPILevel"] !== null) {
        mustHaveReqs["androidAPI"]["$lte"] = androidApiReqs["maxAPILevel"];
      }
    } else {
      goodToHaveReqs["androidAPI"] = {};
      if (typeof androidApiReqs["minAPILevel"] !== "undefined" && androidApiReqs["minAPILevel"] !== null) {
        goodToHaveReqs["androidAPI"]["minAPILevel"] = androidApiReqs["minAPILevel"];
      }
      if (typeof androidApiReqs["maxAPILevel"] !== "undefined" && androidApiReqs["maxAPILevel"] !== null) {
        goodToHaveReqs["androidAPI"]["maxAPILevel"] = androidApiReqs["maxAPILevel"];
      }
    }
  }

  if (typeof genderReqs !== "undefined") {
    if (genderReqs.seriousness == 5) { 
      mustHaveReqs["gender"] = {
        $in: genderReqs["genders"]
      }
    } else {
      goodToHaveReqs["gender"] = genderReqs["genders"];
    }
  }

  if (typeof mobileDeviceTypeReqs !== "undefined") {
    if (mobileDeviceTypeReqs.seriousness == 5) {
      mustHaveReqs["mobileDeviceType"] = {
        $in: mobileDeviceTypeReqs["mobileDeviceTypes"]
      }
    } else {
      goodToHaveReqs["mobileDeviceType"] = mobileDeviceTypeReqs["mobileDeviceTypes"];
    }
  }

  // If we have any must-have requirements, we query the database for participants that match these requirements
  if (Object.keys(mustHaveReqs).length > 0) {
    mustHaveReqs["email"] = { $in: Array.from(participantEmails) }
    matchmadePtcps = await cache.mongoGetParticipantsMatchReqs(mustHaveReqs) as models.Participant[];
    // console.log(`Found ${matchingPtcps.length} matching participants`);
  } else {
    // Otherwise if there are no must-have requirements, we retrieve all the participants whom
    // should be match made
    matchmadePtcps = await cache.mongoGetParticipantsById(Array.from(participantEmails)) as models.Participant[];
  }

  const ptcpToProjReqScore = {};
  // Out of the (possibly remaining) participants, we check for other seriousness < 5 requirements
  // and calculate their project requirements score
  if (Object.keys(goodToHaveReqs).length > 0 && matchmadePtcps.length > 0) {
    // For each participant
    for (let i = 0; i < matchmadePtcps.length; i += 1) {
      const currPtcp = matchmadePtcps[i];
      let projReqScore = 0;
      // Sum of all project requirements' seriousness
      // NOTE: For the sensors, it's "1 seriousness" value for each sensor
      let totalPossibleProjReqScore = 0;

      // We iterate through the good-to-have requirements
      Object.keys(goodToHaveReqs).forEach((req) => {
        if (req == "sensorsInDevice") {
          goodToHaveReqs[req].forEach((eachSnsr) => {
            if (currPtcp.sensorsInDevice.find((ptcpSnsr) => ptcpSnsr.id == eachSnsr)) {
              projReqScore += snsrReqs.seriousness;
            }
            totalPossibleProjReqScore += snsrReqs.seriousness;
          });
        } else if (req == "mobileSystem") {
          if (goodToHaveReqs[req].includes(currPtcp.mobileSystem)) {
            projReqScore += mobileSysReqs.seriousness;
          }
          totalPossibleProjReqScore += mobileSysReqs.seriousness;
        } else if (req == "androidAPI") {
          // If there is min and max API levels
          if (goodToHaveReqs[req]["minAPILevel"] && goodToHaveReqs[req]["maxAPILevel"]){
            // Check if the participant's min API level is >= the min API level
            // and if the participant's max API level is <= the max API level
            if (currPtcp.androidAPI >= goodToHaveReqs[req]["minAPILevel"] && currPtcp.androidAPI <= goodToHaveReqs[req]["maxAPILevel"]) {
              projReqScore += androidApiReqs.seriousness;
            }
            totalPossibleProjReqScore += androidApiReqs.seriousness;
          } else if (goodToHaveReqs[req]["minAPILevel"]) {
            // Else if there's only the minimum API level
            if (currPtcp.androidAPI >= goodToHaveReqs[req]["minAPILevel"]) {
              projReqScore += androidApiReqs.seriousness;
            }
            totalPossibleProjReqScore += androidApiReqs.seriousness;
          } else if (goodToHaveReqs[req]["maxAPILevel"]) {
            // Else if there's only the maximum API level
            if (currPtcp.androidAPI <= goodToHaveReqs[req]["maxAPILevel"]) {
              projReqScore += androidApiReqs.seriousness;
            }
            totalPossibleProjReqScore += androidApiReqs.seriousness;
          }
        } else if (req == "gender") {
          if (goodToHaveReqs[req].includes(currPtcp.gender)) {
            projReqScore += genderReqs.seriousness;
          }
          totalPossibleProjReqScore += genderReqs.seriousness;
        } else if (req == "mobileDeviceType") {
          if (goodToHaveReqs[req].includes(currPtcp.mobileDeviceType)) {
            projReqScore += mobileDeviceTypeReqs.seriousness;
          }
          totalPossibleProjReqScore += mobileDeviceTypeReqs.seriousness;
        }
      });

      // We get the participant's actual project requirement score and store it
      ptcpToProjReqScore[currPtcp.email] = projReqScore / totalPossibleProjReqScore;
    }
  }

  // ASSUMPTION: The participant's ability to contribute to the project is EQUALLY IMPORTANT
  // as compared to the data that this participant has contributed before to other projects
  // that is needed for this project
  const PROJ_CONTRIB_IMPTANCE = 0.5;
  const DATA_SIMILAR_IMPTANCE = 0.5;
  const ADD_FACTOR_IMPTANCE = 0.5;
  const PTCP_RATING_IMPTANCE = 0.5;
  const ptcpMatchmadeScore = {};
  // Then we calculate the (possibly remaining) participants' previous data contribution similarity score
  if (matchmadePtcps.length > 0) {
    // For each participant
    for (let i = 0; i < matchmadePtcps.length; i += 1) {
      const currPtcp = matchmadePtcps[i];
      
      let numSensorsContributedBefore = 0;

      // We get a list of projects which they have joined
      const joinedProjs = currPtcp.projects.filter((proj) => proj.joinTime !== null && typeof proj.joinTime !== "undefined");

      // For each of the sensors required for this project
      const prjGoalSensors = project.prjGoals.map((snsr) => snsr.sensorId);
      for (let j = 0; j < prjGoalSensors.length; j += 1) {
        const snsrId = prjGoalSensors[j];
        // We check if there are any projects that have this sensor
        // AND have completed the sensor contributions for that project
        for (let k = 0; k < joinedProjs.length; k += 1) {
          if (joinedProjs[k].sensorRecords.find(
            (snsrContributed) => (snsrContributed.sensorId == snsrId) && (snsrContributed.number === snsrContributed.required))
          ) {
            numSensorsContributedBefore += 1;
            break;
          }
        }
      }

      // We calculate the data similarity score
      // This will be a score between [0.0, 1.0]
      const dataSimilarityScore = numSensorsContributedBefore / project.prjGoals.length;
      // The participant's project requirement will also be [0.0, 1.0]
      // And calculate the additional factor score (the participant's ability to contribute to the current project)
      const addFactorScore = (PROJ_CONTRIB_IMPTANCE * ptcpToProjReqScore[currPtcp.email]) + (DATA_SIMILAR_IMPTANCE * dataSimilarityScore);
      // to calculate the matchmaking score
      const MAX_USER_RATING = 5;
      ptcpMatchmadeScore[currPtcp.email] = (ADD_FACTOR_IMPTANCE * addFactorScore) + (PTCP_RATING_IMPTANCE * (currPtcp.rating / MAX_USER_RATING));
    }
  }

  // We only select participants whose score hits at least a threshold
  // This threshold is now determined by the median score from the pool of
  // qualified participants
  const allPtcpScores = Object.values(ptcpMatchmadeScore).sort() as number[];
  let SELECTION_THRESHOLD = 0;
  if (allPtcpScores.length > 0) {
    if (allPtcpScores.length % 2 === 0) {
      SELECTION_THRESHOLD = (
        allPtcpScores[allPtcpScores.length / 2] + allPtcpScores[(allPtcpScores.length / 2) - 1]
      ) / 2;
    } else {
      SELECTION_THRESHOLD = allPtcpScores[Math.floor(allPtcpScores.length / 2)];
    }
  }

  SELECTION_THRESHOLD = Number.isNaN(SELECTION_THRESHOLD) ? 0 : SELECTION_THRESHOLD;

  const selectedPtcps = new Set<string>();
  Object.keys(ptcpMatchmadeScore).forEach((ptcpEmail) => {
    if (ptcpMatchmadeScore[ptcpEmail] >= SELECTION_THRESHOLD) {
      selectedPtcps.add(ptcpEmail);
    }
  })

  return selectedPtcps;
}

function buildNotificationTitle(project: models.Project, participantId?) {
  return `Project ${project.prjTitle} is iniviting you!`;
}
function buildNotificationContent(project: models.Project, participantId?) {
  return `Project Description: ${project.prjDescription}; 
    Project Start Time: ${project.prjStartTime}`;
}
function buildNotificationDataForInivitation(
  project: models.Project,
  inviteTime: Date,
  participantId?
) {
  const ret = new models.FCMCutomizedData(
    true,
    models.fcmCustomProtocol.INVITATION_COMMAND,
    new models.InvitationCommand(project["_id"], inviteTime.toDateString())
  );
  return ret;
}
