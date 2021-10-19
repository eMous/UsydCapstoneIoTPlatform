import { matchedData } from "express-validator";
import {
  Participant,
  ProjectInParticipantProfile,
  Success,
  FCMUser,
  ParticipantData,
  ParticipantNotifications,
} from "../../../models/data";
import cache from "../../../cache";
import {
  getParticipantNecessaryData,
  persistentSensors,
  hasProjectComplete,
} from "../Logic";
import { fcmTool } from "../../../fcm_utility";
import { register as firebaseRegister } from "../../../firebaseConfig";

module.exports.register = async (req, res) => {
  try {
    await firebaseRegister(req.body.email, req.body.password);
    res.sendStatus(200);
  } catch (err) {
    return res.status(400).send(err);
  }
};

module.exports.logout = (req, res, next) => {
  try {
    const participantEmail = req["user"].email;
    const logoutData = matchedData(req);
    res.cookie("__session", null, { maxAge: 0, httpOnly: true });
    res.json({ success: true });
    fcmTool.updateUser(participantEmail, logoutData["fcmToken"], false);
  } catch (error) {
    next(error);
    return;
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const data = matchedData(req);
    const participantEmail = req["user"].email;
    console.log(`participant ${participantEmail} loggedin!`);
    const path = { collection: Participant.name, docId: participantEmail };
    let profile = (await cache.mongoGet(path)) as Participant;
    // Device Checking for different sensors.
    let removeConfs = false;
    if (typeof profile == "undefined") {
      profile = new Participant();
      profile.email = participantEmail;
    }

    if (
      typeof profile.sensorsInDevice == "undefined" ||
      profile.sensorsInDevice.length == 0
    ) {
      profile.sensorsInDevice = data.sensors;
      persistentSensors(data.sensors);
    } else {
      if (
        JSON.stringify(profile.sensorsInDevice) != JSON.stringify(data.sensors)
      ) {
        // different devices
        const projectsInPar = profile.projects as ProjectInParticipantProfile[];
        if (projectsInPar) {
          for (let i = 0; i < projectsInPar.length; ++i) {
            if (typeof projectsInPar[i].leaveTime != "undefined") {
              // The par is in a project!!
              res.json(
                new Success(
                  false,
                  `Sorry you are in a project, and you can not switch device with different sensors to login.`
                )
              );
              return;
            }
          }
          // The par is not in a project!!
          profile.sensorConfsTemplate = [];
          removeConfs = true;
        }
      }
    }

    await cache.mongoUpdate(path, profile);

    // We update the current user as the logged in user
    const currentFCMUser = (await fcmTool.updateUser(
      participantEmail,
      data.fcmToken,
      true
    )) as unknown as FCMUser;
    // We log out all other instances of users with this FCM token
    await fcmTool.flagOtherUsersAsLoggedOut(
      participantEmail,
      data.fcmToken
    );

    if (removeConfs) {
      console.log("removeConfs[");
      const parData = new ParticipantData();
      parData.participantProfile = true;
      // Retrieve all projects which the participant is in, or are invited to
      const parProjIds: Set<string> = new Set();
      for (let i = 0; i < profile.projects.length; i += 1) {
        parProjIds.add(profile.projects[i].projectId);
      }
      // and retrieve all the projects which are in the participant's notifications
      const ptcpNotify = (await cache.mongoGet({
        collection: ParticipantNotifications.name,
        docId: participantEmail
      }));
      for (let i = 0; i < ptcpNotify["inSendingOrDroppedInvitations"].length; i += 1) {
        parProjIds.add(ptcpNotify["inSendingOrDroppedInvitations"][i]);
      }
      for (let i = 0; i < ptcpNotify["retrieveDataNotifications"].length; i += 1) {
        parProjIds.add(ptcpNotify["retrieveDataNotifications"][i].projectId);
      }
      for (let i = 0; i < ptcpNotify["unhandledInvitations"].length; i += 1) {
        parProjIds.add(ptcpNotify["unhandledInvitations"][i].projectId);
      }

      parData.projectIds = Array.from(parProjIds);
      fcmTool.rawSendNotification(
        data.fcmToken,
        "",
        "",
        await getParticipantNecessaryData(participantEmail, parData)
      );
      res.json(new Success(true));
      return;
    }

    // fcmTool.rawSendNotification(data.fcmToken, '', '', await getParticipantNecessaryData(participantEmail));
    if (currentFCMUser.isFirstSession) {
      console.log(`${participantEmail} is first fcm login!!!`);
      // Check is it a old user but switched devices
      const participantProfile = (await cache.mongoGet({
        collection: Participant.name,
        docId: participantEmail,
      })) as Participant;
      if (participantProfile && participantProfile.gender != undefined) {
        // This is a old user but in new device; Use FCM to push all necessary data
        // setTimeout(async () => {
        const parData = new ParticipantData();
        parData.participantProfile = true;
        parData.participantNotifications = true;
        // Retrieve all projects which the participant is in, or are invited to
        const parProjIds: Set<string> = new Set();
        for (let i = 0; i < participantProfile.projects.length; i += 1) {
          parProjIds.add(participantProfile.projects[i].projectId);
        }
        // and retrieve all the projects which are in the participant's notifications
        const ptcpNotify = (await cache.mongoGet({
          collection: ParticipantNotifications.name,
          docId: participantEmail
        }));
        for (let i = 0; i < ptcpNotify["inSendingOrDroppedInvitations"].length; i += 1) {
          parProjIds.add(ptcpNotify["inSendingOrDroppedInvitations"][i]);
        }
        for (let i = 0; i < ptcpNotify["retrieveDataNotifications"].length; i += 1) {
          parProjIds.add(ptcpNotify["retrieveDataNotifications"][i].projectId);
        }
        for (let i = 0; i < ptcpNotify["unhandledInvitations"].length; i += 1) {
          parProjIds.add(ptcpNotify["unhandledInvitations"][i].projectId);
        }

        parData.projectIds = Array.from(parProjIds);

        fcmTool.rawSendNotification(
          data.fcmToken,
          "",
          "",
          await getParticipantNecessaryData(participantEmail, parData)
        );
        // }, 1000);
      }
    }
    res.json(new Success(true));
  } catch (err) {
    err.statusCode = 400;
    next(err);
    return;
  }
};
