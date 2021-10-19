import express = require("express");
const rootRouter = express.Router();
import { body } from "express-validator";
import cache from "../../../../cache";
import {
  Participant,
  ParticipantNotifications,
  Project,
} from "../../../../models/data";
import {
  validatorErrorMiddleware,
  AuthMiddleware,
} from "../../../../middleware";
import ProjectController = require("../../../../controllers/Participant/Project");
import { logger } from "../../../../models/logic/utils";

// This is a POST request to mark retrieval notifications as read
rootRouter.post(
  "/retrievalNotifyRead",
  AuthMiddleware,
  // Check that there exists a retrieval ID that this participant wants to mark as read
  [
    body("retrievalId")
      .isString()
      .notEmpty()
      .custom(async (retrievalId: string, { req }) => {
        const ptcpEmail = req["user"].email;
        const ptcpNotify = (await cache.mongoGet({
          collection: ParticipantNotifications.name,
          docId: ptcpEmail,
        })) as ParticipantNotifications;
        // We check if there is a matching retrieval ID in the list of notifications for data retrieval for this participant
        const matchingNotify = ptcpNotify.retrieveDataNotifications.find(
          (ntfy) => ntfy.retrievalId == retrievalId
        );

        if (typeof matchingNotify === "undefined") {
          return Promise.reject();
        }

        return true;
      }),
  ],
  validatorErrorMiddleware,
  ProjectController.markDataRetrievalNotifyRead
);

// This is a POST request to redeem points from a project wallet
rootRouter.post(
  "/exchange",
  AuthMiddleware,
  // Check that a valid project ID exists
  [
    body("projectId")
      .isString()
      .notEmpty()
      .custom(async (projectId: string, { req }) => {
        const participantEmail = req["user"].email;
        const participant = (await cache.mongoGet({
          collection: Participant.name,
          docId: participantEmail,
        })) as Participant;
        // We check:
        // 1. If this project ID belongs to the participant's project wallet(s), AND
        if (
          participant.projectWallets.some(
            (wallet) => wallet.projectId == projectId
          )
        ) {
          // 2. If this project ID belongs to a project that the participant is in
          if (
            participant.projects.some((proj) => proj.projectId == projectId)
          ) {
            return;
          }
        }

        return Promise.reject();
      }),
  ],
  // Check that the amount that the participant wants to redeem is valid
  [
    body("pointsToRedeem")
      .notEmpty()
      .isInt()
      .custom(async (amt: number, { req }) => {
        const participantEmail = req["user"].email;
        const participant = (await cache.mongoGet({
          collection: Participant.name,
          docId: participantEmail,
        })) as Participant;
        // We check:
        // 1. If the points in the wallet are exchangeable points
        const matchingWallet = participant.projectWallets.find(
          (wallet) => wallet.projectId == req.body.projectId
        );
        if (matchingWallet.exchangeable) {
          return;
        }

        return Promise.reject();
      }),
  ],
  validatorErrorMiddleware,
  ProjectController.redeemPoints
);

// Retrieve the project details for a Participant
// NOTE: It's a POST request because we need the request body
rootRouter.post(
  "/",
  AuthMiddleware,
  [
    body("projectId")
      .isString()
      .notEmpty()
      .custom(async (projectId: string, { req }) => {
        console.log("receive get project detail")
        const participantEmail = req["user"].email;
        const participant = (await cache.mongoGet({
          collection: Participant.name,
          docId: participantEmail,
        })) as Participant;
        const participantNotification = (await cache.mongoGet({
          collection: ParticipantNotifications.name,
          docId: participantEmail,
        })) as ParticipantNotifications;
        // We check if (1 AND 2) OR 3:
        // 1. The Participant has a list of projects they are participating in, AND
        // 2. In the list of projects, one of them belongs to the project ID which they are looking for, OR
        if (
          participant.projects &&
          participant.projects.some((val) => val.projectId == projectId)
        ) {
          return true;
        }

        // 3. This project has sent an invitation to the user (either invitation is "on the way" or has "has been received but not yet responded")
        const prj = (await cache.mongoGet({
          collection: Project.name,
          docId: projectId,
        })) as Project;
        if (prj && prj.allInvitedParticipants.includes(participantEmail)) {
          return true;
        }

        console.error("VALIDATOR FOR RETRIEVE PROJECT DETAILS FAILED!");
        console.error(participantEmail);
        console.error(JSON.stringify(participant));
        console.error(JSON.stringify(participantNotification));
        return Promise.reject();
      }),
  ],
  validatorErrorMiddleware,
  ProjectController.retrieveProjectDetails
);

// Change the project's invitation status to "received" instead of "on the way"
rootRouter.post(
  "/received",
  AuthMiddleware,
  [body("projectId").notEmpty()],
  validatorErrorMiddleware,
  ProjectController.retrieveReceivedNotifications
);

// Handle the project invitation (either accept or reject)
rootRouter.post(
  "/accept",
  AuthMiddleware,
  [
    body("projectId")
      .isString()
      .notEmpty()
      .custom(async (projectId: string, { req }) => {
        const participantEmail = req["user"].email;
        const parNotifications = (await cache.mongoGet({
          collection: ParticipantNotifications.name,
          docId: participantEmail,
        })) as ParticipantNotifications;
        if (
          parNotifications &&
          parNotifications.unhandledInvitations.some(
            (el) => el.projectId == projectId
          )
        ) {
          return;
        }
        return Promise.reject();
      }),
  ],
  [body("accept").isBoolean()],
  validatorErrorMiddleware,
  ProjectController.handleInvitation
);

// Leave a project
rootRouter.post(
  "/leave",
  AuthMiddleware,
  [body("projectId").notEmpty()],
  validatorErrorMiddleware,
  ProjectController.leaveProject
);

// Update the sensor data collected by this Participant
rootRouter.post(
  "/sensingData",
  AuthMiddleware,
  [body("data").notEmpty()],
  ProjectController.updateSensorData
);

module.exports = rootRouter;
