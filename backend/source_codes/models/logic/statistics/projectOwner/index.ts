import cache from "../../../../cache";
import {
  ProjectOwner,
  Project,
  ParticipantNotifications,
  DataRetrieveCommand,
} from "../../../data";
import { v4 as uuidv4 } from "uuid";
import { fcmTool } from "../../../../fcm_utility";
import { getParticipantDataRetrievalData } from "../../utils";

export const notifyParticipantsDataUsed = async (projId: string) => {
  // Retrieve the project that the data is being downloaded from
  const proj = (await cache.mongoGet({
    collection: Project.name,
    docId: projId,
  })) as Project;

  if (proj !== null && typeof proj !== "undefined") {
    // Look for all Participants in the project, (those that are currently in the project, and those who have left)
    const parInProj = proj.inProjectParticipants;
    const parLeftProj = proj.leftParticipants;
    const allParOfProj = parInProj.concat(parLeftProj);

    // For each Participant
    allParOfProj.forEach(async (parEmail) => {
      // Retrieve their ParticipantNotification object
      const parNotify = (await cache.mongoGet({
        collection: ParticipantNotifications.name,
        docId: parEmail,
      })) as ParticipantNotifications;
      let retrievalId = uuidv4();

      // If there is no retrieval notification array set on the object, we create one
      if (!Array.isArray(parNotify.retrieveDataNotifications)) {
        parNotify.retrieveDataNotifications = [];
      }

      // Set the retrieval notification
      parNotify.retrieveDataNotifications.push({
        retrieveTime: new Date(),
        hasBeenRead: false,
        projectId: projId,
        retrievalId: retrievalId,
      });
      // Update the database
      await cache.mongoUpdate(
        { collection: ParticipantNotifications.name, docId: parEmail },
        parNotify
      );

      // For testing
      // const test = await cache.mongoGet({ collection: ParticipantNotifications.name, docId: parEmail }) as ParticipantNotifications;
      // console.log(typeof test.retrieveDataNotifications[0].retrieveTime.getMonth === "function");

      const dataRetrieveInfo = new DataRetrieveCommand();
      dataRetrieveInfo.retrieveId = retrievalId;

      // Send out the notification to the Participant
      fcmTool.sendNotificationToUser(
        parEmail,
        `Sensor Data Downloaded for Project: ${proj.prjTitle}`,
        `Your sensor data contributions have been downloaded by the Project Owner.`,
        await getParticipantDataRetrievalData(dataRetrieveInfo)
      );
    });
  }
};

/**
 * This function takes in a list of project IDs that the sensor data is contributing to,
 * and updates each Project Owner's total number of sensor data records collected
 * @param projIds A list of project IDs that the sensor data is contributing to
 */
export const updateOneToTotalDataRecords =  (
  projectOwners: ProjectOwner[]
) => {

  for (let i = 0; i < projectOwners.length; i += 1) {
    const projOwner = projectOwners[i] as ProjectOwner;

    // If the ProjectOwner has a field called totalAmountDataCollected
    if (typeof projOwner.totalAmountDataCollected !== "undefined") {
      // Add one to the total number of data records
      projOwner.totalAmountDataCollected += 1;
    } else {
      projOwner.totalAmountDataCollected = 1;
    }

    // // Then we update the data record
    // await cache.mongoUpdate(
    //   { collection: ProjectOwner.name, docId: mongoDbObjArr[i]["_id"] },
    //   projOwner
    // );
  }
};
// export const updateOneToTotalDataRecords = async (
//   projIds: string[]
// ): Promise<void> => {
//   // We look for the ProjectOwner(s) that own these project IDs
//   const mongoDbObjArr = (await cache.mongoGetProjectOwnersFromProjIds(
//     projIds
//   )) as unknown[];

//   for (let i = 0; i < mongoDbObjArr.length; i += 1) {
//     const projOwner = mongoDbObjArr[i] as ProjectOwner;

//     // If the ProjectOwner has a field called totalAmountDataCollected
//     if (typeof projOwner.totalAmountDataCollected !== "undefined") {
//       // Add one to the total number of data records
//       projOwner.totalAmountDataCollected += 1;
//     } else {
//       projOwner.totalAmountDataCollected = 1;
//     }

//     // Then we update the data record
//     await cache.mongoUpdate(
//       { collection: ProjectOwner.name, docId: mongoDbObjArr[i]["_id"] },
//       projOwner
//     );
//   }
// };
