import { matchedData } from "express-validator";
import cache from "../../../cache";
import {
  Project,
  ParticipantNotifications,
  getConf,
  ConstantConf,
  ParticipantReachedUnsentLimit,
  Participant,
  ProjectInParticipantProfile,
  ProjectWalletInParProfile,
  Success,
  ParticipantData,
  SensorRecord,
  SensorStatistic,
  SimpleSensorRecord,
  ProjectRequirement,
  SensorConf,
  SensorFrequencies,
  ParticipantPointStatistics,
  SensorRecordHistory,
  SensorDataReliability,
  ProjectOwner,
} from "../../../models/data";
import { fcmTool } from "../../../fcm_utility";
import { getParticipantNecessaryData, hasProjectComplete } from "../Logic";
import { updateOneToTotalDataRecords } from "../../../models/logic/statistics/projectOwner";
import { isDataRecordFreqReliable, updateUserRating } from "../../../models/logic/participantRating";
import { updateUserPoints } from "../../../models/logic/points";
import { hasPtcpCompletedProj } from "../../../models/logic/project";
import { calculatePtcpProjPerf } from "../../../models/logic/participantProjectTier";
import { purifyFromTemplate } from "../../../routers/router_basic";
import { getCurrentQuarter, sensorRecordDateTimeCompare } from "../../../models/logic/utils";
import { v4 as uuidv4 } from "uuid";

export const markDataRetrievalNotifyRead = async (req, res) => {
  const ptcpEmail = req["user"].email;

  const keyArr = [
    cache._mongoCacheKey(ParticipantNotifications.name, ptcpEmail)
  ];

  await cache.lock.acquire(keyArr, async function() {
    const ptcpNotify = (await cache.mongoGet({
      collection: ParticipantNotifications.name,
      docId: ptcpEmail,
    })) as ParticipantNotifications;
    const matchingNotify = ptcpNotify.retrieveDataNotifications.find(
      (ntfy) => ntfy.retrievalId == req.body.retrievalId
    );

    // At this point there should be a matching notification, otherwise it should have been caught by the middleware
    if (matchingNotify) {
      matchingNotify.hasBeenRead = true;
      await cache.mongoUpdate(
        { collection: ParticipantNotifications.name, docId: ptcpEmail },
        ptcpNotify
      );
      res.json(
        new Success(
          true,
          "Successfully marked data retrieval notification as read."
        )
      );
    } else {
      res.json(new Success(false, "No matching notification found."));
    }
  });
};

export const redeemPoints = async (req, res) => {
  const ptcpEmail = req["user"].email;
  const responseMsg = {
    success: false,
    msg: "",
    successfulRedeemedPoint: 0,
    successfulExchangedFunding: 0,
    remainingPoints: 0,
    participantProfile: null,
    project: null,
  };

  const tmpProj = await cache.mongoGet({ collection: Project.name, docId: req.body.projectId }) as Project;

  const keyArr = [
    cache._mongoCacheKey(Project.name, req.body.projectId),
    cache._mongoCacheKey(Participant.name, ptcpEmail),
    cache._mongoCacheKey(ProjectOwner.name, tmpProj.prjOwner)
    // ((await cache.mongoGet({ collection: Project.name, docId: req.body.projectId })) as Project).prjOwner;
  ];

  await cache.lock.acquire(keyArr, async function() {
    // We retrieve the wallet from the Participant
    const ptcp = (await cache.mongoGet({
      collection: Participant.name,
      docId: ptcpEmail,
    })) as Participant;
    // If the Participant is valid
    if (ptcp !== null && typeof ptcp !== "undefined") {
      const relevantWallet = ptcp.projectWallets.find(
        (wallet) => wallet.projectId == req.body.projectId
      );
      // If the wallet is valid
      if (relevantWallet !== null && typeof relevantWallet !== "undefined") {
        // We look for the project that we want to redeem from
        const relevantProj = (await cache.mongoGet({
          collection: Project.name,
          docId: relevantWallet.projectId,
        })) as Project;
        // If the project is valid
        if (relevantProj !== null && typeof relevantProj !== "undefined") {
          // We check if redemption is allowed for partially completed projects
          const relevantProjInPtcpProfile = ptcp.projects.find(
            (proj) => (proj.projectId === req.body.projectId) && (proj.joinTime !== null && typeof proj.joinTime !== "undefined")
          );
          if (typeof relevantProjInPtcpProfile !== "undefined") {
            let allowedToProceed = true;
            // If the project only allows for redemption on completion of the project
            // Check the state of the project's completeness for this participant
            // (Otherwise no check required)
            if (relevantProj.isFullRedeemOnly) {
              // If the user has not completed the project or if we cannot find this matching project
              // we end the function here and return an error
              if (relevantProjInPtcpProfile.prjComplete === false) {
                responseMsg.msg = "Not allowed to redeem points, project must be completed first.";
                allowedToProceed = false;
              }
            }

            // If we can proceed
            if (allowedToProceed) {
              // Make sure there are at least positive number of existing point in the wallet // Modified by Tom
              if (relevantWallet.existingPoints > 0) {
                // Make sure that this project has an inFundingAccount for this project ID
                if (
                  relevantProj.inFundingAccount.projectId === relevantWallet.projectId
                ) {
                  // Find the matching project owner for this project
                  const projOwner = await cache.mongoGet({ collection: ProjectOwner.name, docId: relevantProj.prjOwner }) as ProjectOwner;
                  if (typeof projOwner !== "undefined") {
                    // Find the matching project funding account for this project owner
                    const matchingProjOwnerFundAccIdx = Object.keys(projOwner.inFundingAccounts).includes(req.body.projectId);
                    if (matchingProjOwnerFundAccIdx === true) {
                      // Make sure there are at least positive number of existing funding for the project // Modified by Tom
                      // NOTE: Since we do not update the amount of funds available in the project, we will calculate the remaining funds
                      // upon redemption
                      const prjRemainingFund =
                      relevantProj.inFundingAccount.totalFund -
                      relevantProj.inFundingAccount.exchangedAmount;
                      if (prjRemainingFund > 0) {
                        let ptsToRedeem = req.body.pointsToRedeem;

                        // If the user has indicated 0 or less to redeem, OR
                        // more than what they have in the account
                        if (
                          ptsToRedeem <= 0 ||
                          ptsToRedeem > relevantWallet.existingPoints
                        ) {
                          // Then we set the points to redeem, to be what is in the current wallet
                          ptsToRedeem = relevantWallet.existingPoints;
                        }

                        let valueToRedeem =
                          Number.parseInt(ptsToRedeem) /
                          relevantProj.inFundingAccount.conversionRate;

                        // We need to check if the amount to redeem is within the 
                        // If there is insufficient amount to redeem from the project
                        if (valueToRedeem > prjRemainingFund) {
                          // We redeem what we can from the project
                          valueToRedeem = prjRemainingFund;
                          // and set the actual points that will be used to redeem
                          ptsToRedeem =
                            prjRemainingFund *
                            relevantProj.inFundingAccount.conversionRate;
                        }

                        // We also need to check if the amount to redeem is within
                        // the remaining maximum allowable redemption value for this participant
                        if (valueToRedeem > (relevantWallet.maxExchangeable - relevantWallet.exchangedMoney)) {
                          // We redeem what is available for this participant to redeem
                          valueToRedeem = relevantWallet.maxExchangeable - relevantWallet.exchangedMoney;
                          // and set the actual points that will be used for redemption
                          ptsToRedeem = (relevantWallet.maxExchangeable - relevantWallet.exchangedMoney) * relevantProj.inFundingAccount.conversionRate;
                        }

                        // PROJECT-OWNER RELATED
                        // We get the matching project
                        const matchingFundingAcc = projOwner.inFundingAccounts[req.body.projectId];
                        matchingFundingAcc.exchangedAmount += valueToRedeem;

                        // Update the ProjectOwner in the database
                        await cache.mongoUpdate(
                          { collection: ProjectOwner.name, docId: relevantProj.prjOwner },
                          projOwner
                        );

                        // PROJECT-RELATED
                        // We update the project's exchanged amount
                        relevantProj.inFundingAccount.exchangedAmount += valueToRedeem; // Modified by Tom

                        // Update the project in the database
                        await cache.mongoUpdate(
                          { collection: Project.name, docId: relevantWallet.projectId },
                          relevantProj
                        );

                        // PARTICIPANT-RELATED
                        // We update the participant's wallet's exchanged amount
                        relevantWallet.exchangedMoney += valueToRedeem; // Modified by Tom
                        // And deduct the existing points available in the wallet
                        relevantWallet.existingPoints -= Number.parseInt(ptsToRedeem);
                        // And update the participant's lifetime balance (amount exchanged across all projects)
                        ptcp.balance += valueToRedeem;
                        // We update the points redeemed statistic for the participant
                        let matchingPtStatistics = ptcp.pointStatistics.find(
                          (sts) =>
                            sts.year === new Date().getFullYear() &&
                            sts.mth === new Date().getMonth()
                        );
                        if (typeof matchingPtStatistics === "undefined") {
                          matchingPtStatistics = new ParticipantPointStatistics();
                          matchingPtStatistics.year = new Date().getFullYear();
                          matchingPtStatistics.mth = new Date().getMonth();
                          matchingPtStatistics.qtr = getCurrentQuarter();
                          matchingPtStatistics.pointsRedeemed =
                            Number.parseInt(ptsToRedeem);
                          ptcp.pointStatistics.push(matchingPtStatistics);
                        } else {
                          matchingPtStatistics.pointsRedeemed +=
                            Number.parseInt(ptsToRedeem);
                        }

                        // Update the participant in the database
                        await cache.mongoUpdate(
                          { collection: Participant.name, docId: ptcpEmail },
                          ptcp
                        );

                        // Update the response message
                        responseMsg.success = true;
                        responseMsg.successfulRedeemedPoint = ptsToRedeem;
                        responseMsg.successfulExchangedFunding = valueToRedeem;
                        responseMsg.remainingPoints = relevantWallet.existingPoints;
                        responseMsg.participantProfile = ptcp;
                        responseMsg.project = relevantProj;
                      } else {
                        responseMsg.msg = "Funding is not enough for the redemption.";
                      }
                    } else {
                      responseMsg.msg = "Could not find a matching funding account for this project by this project owner.";
                    }
                  } else {
                    responseMsg.msg = "Could not find the project owner for this project.";
                  }
                } else {
                  // Else there is no relevant inFundingAccount for this project ID
                  responseMsg.msg = "No funding account found for this project.";
                }
              } else {
                responseMsg.msg = "No existing redeemable points for this project.";
              }
            }
          } else {
            responseMsg.msg = "Could not find this project in the participant's profile.";
          }
        } else {
          // We could not locate the relevant project
          responseMsg.msg = "Could not find this project.";
        }
      } else {
        // We could not locate the relevant wallet belonging to this participant
        responseMsg.msg = "Could not find participant's project wallet.";
      }
    } else {
      // We could not locate the relevant participant
      responseMsg.msg = "Could not find this participant.";
    }
    res.status(200).send(responseMsg);
  })
};

export const updateSensorData = async (req, res): Promise<void> => {
  console.log(new Date());
  const gotData = matchedData(req);
  const participantEmail = req["user"].email;
  const sensingData = gotData.data as SensorRecord[];
  console.log(sensingData.length);

  const emptyProjList = sensingData.filter((data) => data.projectList.length === 0);

  let projsUpdatedArr = [];
  // We check if we have received valid sensor data
  if (typeof sensingData == "undefined") {
    // If we didn't, return a response to the user indicating that no sensor data was provided
    return res.json(new Success(false, `No sensing data provided.`));
  }

  // We retrieve the Participant from the cache / database
  const keyArr = new Set();
  keyArr.add(cache._mongoCacheKey(Participant.name, participantEmail));

  let par = (await cache.mongoGet({
    collection: Participant.name,
    docId: participantEmail,
  })) as Participant;
  // We iterate through the Participant's projects (of type ProjectInParticipantProfile)
  for (let i = 0; i < par.projects.length; ++i) {
    // We only care about projects (ProjectInParticipantProfile) which the user hasn't left yet
    // AND projects that are not completed
    // If there is no "leaveTime", i.e. The Participant has not left the project yet
    if (
      (typeof par.projects[i].leaveTime === "undefined" ||
      par.projects[i].leaveTime === null) &&
      par.projects[i].prjComplete === false
    ) {
      const prjId = par.projects[i].projectId;
      // retrieve the Project from the cache / database
      const prj = (await cache.mongoGet({
        collection: Project.name,
        docId: prjId,
      })) as Project;
      keyArr.add(cache._mongoCacheKey(ProjectOwner.name, prj.prjOwner));
    }
  }

  // Set a placeholder date
  // let latestUpdateDate = new Date("1900-01-01T00:00:00.000+00:00");

  await cache.lock.acquire(Array.from(keyArr), async function() {
    const prjIdToProjectOwners = {};
    const prjs = {} as Record<string, Project>;
    par = (await cache.mongoGet({
      collection: Participant.name,
      docId: participantEmail,
    })) as Participant;

    const projsUpdated = new Set();

    // We iterate through the Participant's projects (of type ProjectInParticipantProfile)
    for (let i = 0; i < par.projects.length; ++i) {
      // We only care about projects (ProjectInParticipantProfile) which the user hasn't left yet
      // AND projects that are not completed
      // If there is no "leaveTime", i.e. The Participant has not left the project yet
      if (
        (typeof par.projects[i].leaveTime === "undefined" ||
        par.projects[i].leaveTime === null) &&
        par.projects[i].prjComplete === false
      ) {
        const prjId = par.projects[i].projectId;
        // retrieve the Project from the cache / database
        const prj = (await cache.mongoGet({
          collection: Project.name,
          docId: prjId,
        })) as Project;
        // we add this project to the instantiated object
        prjs[prjId] = prj;
        const prjOwnerEmail = prj.prjOwner;
        prjIdToProjectOwners[prjId] = await cache.mongoGet({collection:ProjectOwner.name,docId:prjOwnerEmail})
      }

      // Sort the records first
      sensingData.sort(sensorRecordDateTimeCompare);

      let fcmPush = false;
      
      const emptyProjListTwo = sensingData.filter((data) => data.projectList.length === 0);
      // Now we iterate through the sensor data collected
      const areLengthsDiff = emptyProjList.length !== emptyProjListTwo.length;
      const oneIsEmpty = emptyProjList.length !== 0 || emptyProjListTwo.length !== 0;

      for (let i = 0; i < sensingData.length; ++i) {
        let eachData = sensingData[i];
        const sensedData = new SensorRecord() as SensorRecord;
        purifyFromTemplate(sensedData, eachData);
        Object.assign(sensedData, eachData);
        sensedData.createDetailedTime = new Date(sensedData.createDetailedTime);
        eachData = sensedData;

        // This flag will mark if we should add to the total count of the Participant's contributed sensor data
        // NOTE: We need this flag because not all sensor data contributions may be valid ones
        let partTotalAdd = false;
        const completePrjsForSuchSensor = [];

        // We update the list of projects that require this sensor data,
        // with projects that exist for this project ID, AND, are not yet complete (i.e. Goals not met yet)
        // REMEMBER: prjs are projects that this participant is in
        eachData.projectList = eachData.projectList.filter(
          (prjId) => typeof prjs[prjId] != "undefined" && !prjs[prjId].prjComplete
        );

        // For THIS sensor data, we look for ProjectInParticipantProfiles where the sensor record goals for
        // this participant hasn't been completed yet
        const ptcpNotYetCompleted = par.projects.filter((prj) => {
          if (eachData.projectList.includes(prj.projectId) && prj.prjComplete === false) {
            const matchingSensorRecord = prj.sensorRecords.find((snsrRecord) => snsrRecord.sensorId === eachData.sensorId);
            if (typeof matchingSensorRecord !== "undefined") {
              if (matchingSensorRecord.number < matchingSensorRecord.required) {
                return true;
              } else {
                return false;
              }
            } 
            else {
              return true;
            }
          }

          return false;
        });

        eachData.projectList = ptcpNotYetCompleted.map((projInPtcpProf) => projInPtcpProf.projectId);

        // We then iterate through this filtered list
        // of projects that exist and are not complete (as a whole project)
        // and are not completed by this participant
        for (let i = 0; i < eachData.projectList.length; i += 1) {
          const prjId = eachData.projectList[i];
          const prj = prjs[prjId];
          // If this project does not exist, we skip this iteration, go to the next
          if (typeof prj == "undefined") continue;

          // We try to look for this project in this Participant's list of projects,
          // based on its project ID
          const prjInPar = par.projects.find(
            (el) => (el.projectId == prjId) && (el.joinTime !== null && typeof el.joinTime !== "undefined")
          );
          // If we cannot find this project, we skip this iteration, go to the next
          if (typeof prjInPar == "undefined") continue;

          // A time window to accept or ignore data sent by the user based on the project's minimum frequency
          // This is to accept the sensor data according to the requirements of the project's sensor frequency settings
          // We check if the sensor data contributed falls within the acceptable range of the frequency that we want to accept
          const dataCollectedTime = eachData.createDetailedTime.getTime();
          const matchingSensorHistory = prjInPar.sensorLastUpdated.find(
            (snsrHist) => snsrHist.sensorId == eachData.sensorId
          );

          // If the lastSensed time is null, then this is the first time we're getting the data
          // otherwise we use the last sensed time
          const lastCollectedTime = matchingSensorHistory.lastSensed === null ?
            new Date("1900-01-01T00:00:00.000+00:00").getTime() :
            matchingSensorHistory.lastSensed.getTime();

          const sensorFreq = prjInPar.sensorConfs.find(
            (conf) => conf.enabledSensorName == eachData.sensorId
          ).sensorFrequency;

          // If the sensor frequency type is valid
          if (typeof sensorFreq !== "undefined") {
            const freqInterval = SensorFrequencies.getFrequency(sensorFreq);

            // If the time between the collected data and the last data collected time is at least the frequency interval
            // then we continue
            if (dataCollectedTime - lastCollectedTime >= freqInterval) {
              // This is a flag to know if this project has a sensor statistic set up for this project
              let sensorStatisticInPrj = prj.prjStatistic.find((el) => {
                // DEBUG CODE START:
                // The next 3 lines of code here are for debugging purposes
                // The reason here is because in Postman, when we send a request, the whitespace character sometimes becomes
                // a different ASCII number (160 instead of 32). This causes an invalidation, so we check the code here
                const nu = 8; // 8 is the index at which the whitespace appears (whether ASCII 160 or 32)
                const k = el.sensorId.charCodeAt(nu); // The ASCII character at that index for the current SensorStatistic
                const b = eachData.sensorId.charCodeAt(nu); // The ASCII character at that index for the current sensor data
                // DEBUG CODE END

                // We return a boolean value to see if the sensor ID for this sensor statistic
                // is equal this current sensor data's sensor ID
                const ret = el.sensorId == eachData.sensorId;
                return ret;
              });

              // If the statistics for this sensor in the project cannot be found
              if (typeof sensorStatisticInPrj == "undefined") {
                // We instantiate one
                sensorStatisticInPrj = new SensorStatistic();
                // We look for the this particular sensor in the project's goals
                const goal = prj.prjGoals.find(
                  (el) => el.sensorId == eachData.sensorId
                );
                // If we don't find one
                if (typeof goal == "undefined") {
                  continue;
                } else {
                  // Otherwise if we find the project's target number of records to collect for this sensor,
                  // we set the goal number (i.e. number of records to collect for this sensor to complete this goal)
                  // for this sensor's statistics goal number
                  sensorStatisticInPrj.goalNum = goal.recordsNum;
                }

                // Since we cannot find the sensor statistic for this project and we are instantiating it,
                // we set the collected number to 0
                sensorStatisticInPrj.collectedNum = 0;
                // and set the sensor ID for this sensor statistic, to this sensor data's sensor ID
                sensorStatisticInPrj.sensorId = eachData.sensorId;
                // And add this sensor statistic, to the project's statistics
                prj.prjStatistic.push(sensorStatisticInPrj);
              }
              // Otherwise we HAVE the sensor statistics for this project
              // We check if the collected number of sensor data records is >= number we need to collect to accomplish the goal
              if (sensorStatisticInPrj.collectedNum > sensorStatisticInPrj.goalNum) {
                // We add this project ID into a list of completed projects for this particular sensor
                // completePrjsForSuchSensor.push(prjId);
              } else {
                // NOTE: At this point we consider the data to be OK to add to the participant's
                // ProjectInParticipantProfile because we've already vetted the list of project IDs
                // to be those that are strictly < the project's goal number

                // Else this means we haven't met the goal number yet
                // and we just add 1 (because we are looking at 1 sensor data entry)
                // to the collected number of records in this sensor statistic for this project
                
                // Mark this project as something we need to update
                projsUpdated.add(prj);
                sensorStatisticInPrj.collectedNum++;
              
                if (sensorStatisticInPrj.collectedNum >= sensorStatisticInPrj.goalNum){
                  completePrjsForSuchSensor.push(prjId);
                }

                // At this point we mark the flag which decides if the Participant's contributed sensor data is valid,
                // to be true
                partTotalAdd = true;

                // Update the latest datetime that this project has received data from THIS participant
                prjInPar.lastSenseDataTime = eachData.createDetailedTime;

                // Update the latest datetime that this sensor configuration in this project has received data from this participant
                matchingSensorHistory.lastSensed = eachData.createDetailedTime;

                // We try and get the reliability scores of this project, for this sensor data
                let projReliableScores = prjInPar.sensorReliability.find((sdr) => sdr.sensorId === eachData.sensorId);

                // If there isn't one, we initialise one
                if (typeof projReliableScores === "undefined") {
                  projReliableScores = new SensorDataReliability();
                  projReliableScores.sensorId = eachData.sensorId;
                  projReliableScores.numRecordsReceived = 1;
                  prjInPar.sensorReliability.push(projReliableScores);
                } else {
                  projReliableScores.numRecordsReceived += 1;
                }

                // We check if the contributing data is reliable, relative to the project's sensor frequency requirements
                // Reliable means the time at which the data was most recently collected, is within the sensor frequency
                // requirements of this sensor for this project
                let reliabilityLastCollectTime = lastCollectedTime;
                // If there is no available history, then we use the current data's time
                // as an initialisation for the last collected time
                if (matchingSensorHistory.lastSensed === null) {
                  reliabilityLastCollectTime = eachData.createDetailedTime.getTime()
                }

                projReliableScores.numReliableRecords += isDataRecordFreqReliable(
                  dataCollectedTime - reliabilityLastCollectTime,
                  freqInterval
                );
                
                // If there ISN'T an array containing sensor records
                if (!Array.isArray(prjInPar.sensorRecords)) {
                  // We create one
                  prjInPar.sensorRecords = [];
                } 
                
                // Then we check if there is a particular SimpleSensorRecord that matches this sensor ID
                const matchingSensorRecord = prjInPar.sensorRecords.find(
                  (ele) => ele.sensorId == eachData.sensorId
                );

                // If there is one, we update the number
                if (typeof matchingSensorRecord !== "undefined") {
                  // If the matching sensor record's PARTICIPANT goal hasn't been met yet
                  if (matchingSensorRecord.number + 1 <= matchingSensorRecord.required) {
                    matchingSensorRecord.number += 1;
                  }
                } else {
                  // Otherwise we create a new SimpleSensorRecord and add it to sensorRecords field in ProjectInParticipantProfile
                  const snsrGoal = prj.prjGoals.find((goal) => goal.sensorId === eachData.sensorId);
                  if (typeof snsrGoal !== "undefined") {
                    const brandNewSimpleSensorRecord = new SimpleSensorRecord();
                    brandNewSimpleSensorRecord.sensorId = eachData.sensorId;
                    brandNewSimpleSensorRecord.number = 1;
                    brandNewSimpleSensorRecord.required = Math.ceil(snsrGoal.recordsNum / prj.desiredParticipantNumber);
                    prjInPar.sensorRecords.push(brandNewSimpleSensorRecord);
                  }
                }

                // Check if the participant has completed their own project responsibilities
                // i.e. They have collected the required number of sensor records for all the sensors needed in the project
                if (hasPtcpCompletedProj(prjInPar, prj)) {
                  prjInPar.prjComplete = true;
                  // If they have completed the project, we calculate and update their project performance (tier for THIS project)
                  calculatePtcpProjPerf(prjInPar, prj);
                  // and we update their overall user rating
                  updateUserRating(par);
                }
              
                // 1. Push the data if it is valid
                // 2. Check if the project has been completed
                // 3. Then we check if the sensor goals are complete
                // Here we check if adding this record makes the project complete
                if (hasProjectComplete(prj)) {
                  // If it has, we set the project to completed
                  prj.prjComplete = true;
                }
              }
            }
          }
        }

        // If for some prj, this sensor goal is complete, this data will not add for that prj
        eachData.projectList = eachData.projectList.filter(
          (prjId) => {
            // We check that if the project has not been completed yet for this sensor
            const projStillNotComplete = completePrjsForSuchSensor.indexOf(prjId) === -1;
            // Check that the participant's own goals have not yet been completed
            let ptcpGoalNotComplete = false;
            const ptcpProj = par.projects.find((proj) => proj.projectId === prjId);
            
            if (ptcpProj) {
              // We look for the sensor in the project
              const matchingSensor = ptcpProj.sensorRecords.find((snsr) => snsr.sensorId === eachData.sensorId);
              if (matchingSensor) {
                ptcpGoalNotComplete = matchingSensor.number < matchingSensor.required;

                return ptcpGoalNotComplete && projStillNotComplete;
              }
            }

            return false;
          }
        );

        // If the flag that determines that the Participant's sensor data is valid, is true,
        if (partTotalAdd) {
          // We mark the flag for the FCM push to be true, so that we send a notification to the participant
          fcmPush = true;
          // then we update the Participant's total number of contributed records
          par.totalRecordsNumber++;
          // Update the latest date that the Participant contributed data
          par.lastSenseDataTime = eachData.createDetailedTime;
          // and we update the Participant's number of points that they have earned in the respective PROJECT Wallet(s)
          // and update the Participant's Lifetime Wallet
          // NOTE: 1 sensor data record only earns them points ONCE in the Lifetime Wallet
          updateUserPoints(par, eachData.projectList);
          // and we update the total number of records collected by the various Project Owners
          // provided that the sensor goal isn't already completed
          updateOneToTotalDataRecords(eachData.projectList.map(prjId=>prjIdToProjectOwners[prjId]));
        }

        const recordId = eachData.id;
        // We delete the ID because we don't need to store as a field in the Mongo document
        // (we already store it as the document ID)
        delete eachData.id;
        eachData["_id"] = recordId;
      }
      const newSensingData = sensingData.filter(eachData => eachData.projectList.length > 0);
      await cache.mongoDb.collection(SensorRecord.name).insertMany(newSensingData);

      // Push the data changes to other relevant Participants
      // in projects that have this sensor data as part of their goals
      // and the Participants in these projects
      if (fcmPush) {
        // We update the Participant in the cache and database
        await cache.mongoUpdate(
          { collection: Participant.name, docId: participantEmail },
          par
        );

        // We iterate through all the project IDs
        projsUpdatedArr = Array.from(projsUpdated);
        for (let i = 0; i < projsUpdatedArr.length; i += 1) {
          const prjId = projsUpdatedArr[i]["_id"];
          // We update the project based on the project ID
          await cache.mongoUpdate(
            { collection: Project.name, docId: prjId },
            projsUpdatedArr[i]
          );
        }

        const prjOwnersToUpdate = Object.values(prjIdToProjectOwners);
        for (let i = 0; i < prjOwnersToUpdate.length; i += 1) {
          await cache.mongoUpdate(
            { collection: ProjectOwner.name, docId: prjOwnersToUpdate[i]["_id"] }, prjOwnersToUpdate[i]
          );
        }
      }
    }

    if (projsUpdatedArr.length > 0) {
      const parData = new ParticipantData();
      parData.participantProfile = true;
      // Instead of sending ALL the project IDs to the user,
      // only send the project IDs for which the projects have been updated
      parData.projectIds = projsUpdatedArr.map((eachPrj) => eachPrj["_id"]);
      fcmTool.sendNotificationToUser(
        participantEmail,
        "",
        "",
        await getParticipantNecessaryData(participantEmail, parData)
      );
    }
    res.json(new Success(true));
  });
};

export const leaveProject = async (req, res): Promise<void> => {
  const gotData = matchedData(req);
  const participantEmail = req["user"].email;
  const projectId = gotData["projectId"];

  const keyArr = [
    cache._mongoCacheKey(Project.name,projectId),
    cache._mongoCacheKey(Participant.name, participantEmail)
  ];

  await cache.lock.acquire(keyArr, async function() {
    // Validation check:
    // check if there is a project with this project ID in the database
    const project = (await cache.mongoGet({
      collection: Project.name,
      docId: projectId,
    })) as Project;
    // If we cannot find one in the database
    if (typeof project == "undefined") {
      // We create a response to notify the user and end the function here
      const ret = new Success(false, "");
      res.json(ret);
      return;
    }
    // Otherwise we look for the index of this Participant's email,
    // in this project's list of participants
    const participantIndex = project.inProjectParticipants.findIndex(
      (el) => el == participantEmail
    );
    // If we cannot find it
    if (participantIndex == -1) {
      // We send a response to notify the user and end the function here
      const ret = new Success(false, `You are not in project ${projectId}`);
      res.json(ret);
      return;
    }

    // Otherwise if we can find it, we remove the Participant from the project's list of Participants
    project.inProjectParticipants.splice(participantIndex, 1);
    // We add the Participant's email to the project's list of Participants who have left the project
    project.leftParticipants.push(participantEmail);
    // and update the cache and database
    await cache.mongoUpdate(
      { collection: Project.name, docId: projectId },
      project
    );

    // We retrieve the Participant from the database
    const participant = (await cache.mongoGet({
      collection: Participant.name,
      docId: participantEmail,
    })) as Participant;
    // and get its list of projects that they have been involved with
    const parProjects = participant.projects as ProjectInParticipantProfile[];
    // We look for the project element index in the list which matches this project ID
    const parProject = parProjects.find(
      (el) => (el.projectId == projectId) && (el.joinTime !== null && typeof el.joinTime !== "undefined")
    );
    // And set the time which they have left, to the current server's date
    parProject.leaveTime = new Date();
    // We update the cache and database of this Participant's details
    await cache.mongoUpdate(
      { collection: Participant.name, docId: participantEmail },
      participant
    );
    // We send a successful response to the Participant of them leaving the project successfully
    res.json(new Success(true, `Leave project ${projectId} successfully!`));

    // We instantiate the model of the Participant's data
    const parData = new ParticipantData();
    parData.participantProfile = true;
    parData.projectIds.push(projectId);
    // We send the notification to the Participant using the Firebase Cloud Messaging tool
    fcmTool.sendNotificationToUser(
      participantEmail,
      ``,
      ``,
      await getParticipantNecessaryData(participantEmail, parData)
    );
  });
};

export const handleInvitation = async (req, res) => {
  const gotData = matchedData(req);
  const participantEmail = req["user"].email;
  const projectId = gotData["projectId"];
  const isAccept = gotData["accept"];

  const keyArr = [
    cache._mongoCacheKey(Project.name, projectId), 
    cache._mongoCacheKey(ParticipantNotifications.name, participantEmail),
    cache._mongoCacheKey(Participant.name, participantEmail)
  ];

  await cache.lock.acquire(keyArr, async function() {
    // We retrieve the participant's notifications
    const parNotifications = (await cache.mongoGet({
      collection: ParticipantNotifications.name,
      docId: participantEmail,
    })) as ParticipantNotifications;

    let invitedTime;

    // In the participant's notifications, we look for this project
    // in the list of unhandledInvitations (i.e. The participant must have first received the invitation)
    const receivedInvitation = parNotifications.unhandledInvitations.find((invite) => invite.projectId == projectId);
    // If we find a matching invite
    if (typeof receivedInvitation !== "undefined") {
      // We take note of the invite time
      invitedTime = receivedInvitation.invitedTime;

      // We remove this invitation from the participant's list of received (but unhandled) invitations
      parNotifications.unhandledInvitations.splice(
        parNotifications.unhandledInvitations.map((e) => e.projectId).indexOf(projectId),
        1
      );

      // We retrieve the Project object
      const project = (await cache.mongoGet({
        collection: Project.name,
        docId: projectId,
      })) as Project;

      // We look through the project's invitations to check if the invitation was meant for this participant
      const projInviteForPtcp = project.receivedButNotAnsweredParticipants.find((ptcpEmail) => ptcpEmail == participantEmail);
      const projInviteForPtcpIdx = project.receivedButNotAnsweredParticipants.findIndex((ptcpEmail) => ptcpEmail == participantEmail);
      // If we find that this invitation response is from the intended recipient
      if (typeof projInviteForPtcp !== "undefined") {
        // We remove this invitation's classification as "received but not answered"
        project.receivedButNotAnsweredParticipants.splice(
          projInviteForPtcpIdx,
          1
        );

        // Now we check if the participant has accepted or rejected the invitation
        // If the participant has REJECTED the invitation
        if (!isAccept) {
          // We add this Participant's email address to the project's list of denied participants
          project.deniedParticipants.push(participantEmail);

          // Update the ParticipantNotification object in the database
          await cache.mongoUpdate(
            { collection: ParticipantNotifications.name, docId: participantEmail },
            parNotifications
          );

          // Update the Project object in the database
          await cache.mongoUpdate(
            { collection: Project.name, docId: projectId },
            project
          );

          // Return a response to the user
          res.json({
            success: true,
            message: "",
            participantNotifications: parNotifications,
          });

          return;

        } else {
          // If the participant has ACCEPTED the invitation
          // We mark the participant's acceptance first
          project.acceptedParticipants.push(participantEmail);

          // We check if the project is full
          const projCapacity = project.desiredParticipantNumber;
          // If the project is already equal to (or greater than for some reason) the project capacity
          if (project.inProjectParticipants.length >= projCapacity) {
            // We reject the user's acceptance
            // Update the ParticipantNotification object in the database
            await cache.mongoUpdate(
              { collection: ParticipantNotifications.name, docId: participantEmail },
              parNotifications
            );

            // Update the Project object in the database
            await cache.mongoUpdate(
              { collection: Project.name, docId: projectId },
              project
            );

            // We reject the user's acceptance
            res.json({
              success: false,
              message: "Sorry the project is full.",
              participantNotifications: parNotifications,
            });

            return;
          } else {
            // Otherwise if there's still space in the project
            // We add the participant to the project
            project.inProjectParticipants.push(participantEmail);

            // We retrieve the Participant object from the database
            const participant = (await cache.mongoGet({
              collection: Participant.name,
              docId: participantEmail,
            })) as Participant;

            // If the participant does not have a "projects" field,
            // something has gone wrong
            if (!participant.projects) {
              // Return a response to the user
              res.json({
                success: false,
                message: "Something has gone wrong: The participant does not have an initialised list of projects.",
                participantNotifications: parNotifications,
              });

              return;
            } else {
              // We look for the project that a Participant has joined
              const projectInParProfile = participant.projects.find(
                (proj) => (proj.projectId === projectId)
              );
              
              // If there is such a project in the participant's list of projects
              if (typeof projectInParProfile !== "undefined") {
                projectInParProfile.inviteTime = invitedTime;
                projectInParProfile.joinTime = new Date();

                // Update the Participant object in the database
                await cache.mongoUpdate(
                  { collection: Participant.name, docId: participantEmail },
                  participant
                );

                // Update the ParticipantNotification object in the database
                await cache.mongoUpdate(
                  { collection: ParticipantNotifications.name, docId: participantEmail },
                  parNotifications
                );

                // Update the Project object in the database
                await cache.mongoUpdate(
                  { collection: Project.name, docId: projectId },
                  project
                );
                
                // Send a successful response to the participant
                res.json({
                  success: true,
                  message: "",
                  participantNotifications: parNotifications,
                  projectId: projectId,
                });

                return;

              } else {
                // Return a response to the user
                res.json({
                  success: false,
                  message: "Something has gone wrong: The participant does not this project that they're trying to accept the invitation for.",
                  participantNotifications: parNotifications,
                });

                return;
              }
            }
          }
        }
      }
    }
  });
};

export const retrieveReceivedNotifications = async (req: Request, res): Promise<void> => {
  const uuid = uuidv4();
  const gotData = matchedData(req);
  const participantEmail = req["user"].email;
  const projectId = gotData["projectId"];

  const keyArr = [cache._mongoCacheKey(Project.name,projectId), cache._mongoCacheKey(ParticipantNotifications.name, participantEmail)];

  await cache.lock.acquire(keyArr, async function() {
    // console.log(`RETRIEVING NOTIFICATIONS, UUID IS: ${uuid}, user is: ${participantEmail}`);
    // We retrieve the Project from the database
    const project = (await cache.mongoGet({
      collection: Project.name,
      docId: projectId,
    })) as Project;

    // If we can't find the project ID in the database
    if (typeof project == "undefined") {
      // We send an error response to the Participant
      console.error(`prj doesnt found`, projectId);
      const parNotification = (await cache.mongoGet({
        collection: ParticipantNotifications.name,
        docId: participantEmail,
      })) as ParticipantNotifications;
      console.log(`COULD NOT FIND PROJECT ID: ${projectId}, UUID IS: ${uuid}, user is: ${participantEmail}`);
      return res.json(parNotification);
    }

    // We get the maximum length of the array of the
    // project's list of invitations which are being sent or dropped
    // i.e. "on the way"
    let i = project.inSendingOrDroppedParticipants.length;
    let inviteDTime = null;

    while (i--) {
      // If we find an invitation which is "on the way" that matches this Participant's email
      // IN THE PROJECT
      if (project.inSendingOrDroppedParticipants[i].email == participantEmail) {
        inviteDTime = project.inSendingOrDroppedParticipants[i].sentTime;
        // We remove the invitation's status as "on the way"
        project.inSendingOrDroppedParticipants.splice(i, 1);
        // and change it to "received but not yet responded by the Participant"
        project.receivedButNotAnsweredParticipants.push(participantEmail);

        // We retrieve the Participant's notifications
        const parNotification = (await cache.mongoGet({
          collection: ParticipantNotifications.name,
          docId: participantEmail,
        })) as ParticipantNotifications;

        let j = parNotification.inSendingOrDroppedInvitations.length;
        // Look through the list of project invitations that this participant has
        // and change their invitation status from "on the way" to "received by participant but not responded to yet"
        while (j--) {
          // If we find THIS project ID in the Participant's list of notifications that are "on the way"
          if (parNotification.inSendingOrDroppedInvitations[j] == projectId) {
            // We change its status from "on the way"
            parNotification.inSendingOrDroppedInvitations.splice(j, 1);
            if (!inviteDTime) {
              console.error(
                `inviteTime == null, when handle invitation got message.`
              );
            }
            // to a new status: "received but not yet responded"
            parNotification.unhandledInvitations.push({
              projectId: projectId,
              invitedTime: inviteDTime,
              receivedTime: new Date(),
            });

            // console.log(`PUSHED TO UNHANDLED NOTIFICATION, UUID IS: ${uuid}, USER IS: ${participantEmail}`);
            break;
          }
        }

        // We update the Participant's notification object in the database
        await cache.mongoUpdate(
          { collection: ParticipantNotifications.name, docId: participantEmail },
          parNotification
        );
        
        // Here we check if we have hit the limit of invitations sent out
        const conf = (await getConf(parNotification)) as ConstantConf;
        // If the participant has not hit the maximum limit of project invitations to receive
        if (
          parNotification.inSendingOrDroppedInvitations.length <
          conf.PARTICIPANTNOTIFICATIONS_INSENDING_INVITATION_LIMIT
        ) {
          // We remove the participant from the list of people to stop sending project invitations to
          await cache.mongoDb
            .collection(ParticipantReachedUnsentLimit.name)
            .deleteOne({ participantId: participantEmail });
        }

        // console.log(`i is now: ${i}. Project for ${projectId} WILL BE updated. Request ID: ${req.toString()}`);
        // and update the cache and database of the project's list of "on the way" invitations
        // console.log(`UPDATING PROJECT IN MONGO, UUID IS: ${uuid}, USER IS: ${participantEmail}`);
        await cache.mongoUpdate(
          { collection: Project.name, docId: projectId },
          project
        );
        // console.log(`i is now: ${i}. Project for ${projectId} HAS BEEN updated. Request ID: ${req.toString()}`);
        // console.log(`COMPLETE UPDATE PROJECT IN MONGO, UUID IS: ${uuid}, USER IS: ${participantEmail}`);
        res.json(parNotification);
        return;
      }
    }
    // console.log(`UUID IS: ${uuid}, USER IS: ${participantEmail}`);
    res.json(
      new Success(false, "Project inSendingOrDroppedParticipants is empty.")
    );
  });
};

export const retrieveProjectDetails = async (req, res): Promise<void> => {
  const gotData = matchedData(req);
  const projectId = gotData["projectId"];
  const project = await cache.mongoGet({
    collection: Project.name,
    docId: projectId,
  });
  res.json(project);
};
