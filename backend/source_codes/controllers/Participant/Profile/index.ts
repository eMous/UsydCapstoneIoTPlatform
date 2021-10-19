import { async } from "@firebase/util";
import { matchedData } from "express-validator";
import cache from "../../../cache";
import {
  Participant,
  ParticipantGeo,
  ParticipantNotifications,
  Success,
} from "../../../models/data";

module.exports.retrieveNotifications = async (req, res) => {
  const participantEmail = req["user"].email;
  const path = {
    collection: ParticipantNotifications.name,
    docId: participantEmail,
  };
  const ret = await cache.mongoGet(path);
  res.json(ret);
};

module.exports.retrieveProfile = async (req, res) => {
  const participantEmail = req["user"].email;
  const path = { collection: Participant.name, docId: participantEmail };
  const ret = await cache.mongoGet(path);
  res.json(ret);
};

module.exports.createProfile = async (req, res) => {
  const updateData = matchedData(req);
  const participantEmail = req["user"].email;
  const path = { collection: Participant.name, docId: participantEmail };

  const keyArr = [
    cache._mongoCacheKey(Participant.name, participantEmail),
    cache._mongoCacheKey(ParticipantNotifications.name, participantEmail)
  ];

  await cache.lock.acquire(keyArr, async function() {
    console.log(`gender updated is `, updateData.gender);

    (await cache.mongoUpdate(path, updateData)) as Participant;
    const ret = (await cache.mongoGet(path)) as Participant;
    res.json(ret);

    console.log(
      `A new participant update its profile, its email is ${participantEmail}, updated value `,
      ret.gender
    );

    // init ParticipantNotifications
    if (
      !(await cache.mongoGet({
        collection: ParticipantNotifications.name,
        docId: participantEmail,
      }))
    ) {
      const participantNotificationsToInit = new ParticipantNotifications();
      participantNotificationsToInit.constantConf = (
        await cache.getTheLatestConf()
      ).id;
      participantNotificationsToInit.participantId = participantEmail;

      await cache.mongoUpdate(
        { collection: ParticipantNotifications.name, docId: participantEmail },
        participantNotificationsToInit
      );
    }
  })
};

module.exports.updateLocation = async (req, res) => {
  const updateData = matchedData(req);
  const participantEmail = req["user"].email;
  const path = { collection: ParticipantGeo.name, docId: participantEmail };
  const parGeo = new ParticipantGeo();
  // lat
  parGeo.lastGPS.push(updateData["lat"]);
  // lon
  parGeo.lastGPS.push(updateData["lon"]);
  parGeo.participant = participantEmail;
  await cache.mongoUpdate(path, parGeo);

  res.json(new Success(true));
};
