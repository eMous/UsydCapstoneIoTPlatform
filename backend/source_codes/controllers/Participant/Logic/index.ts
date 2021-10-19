import cache from "../../../cache";
import * as models from "../../../models/data";

export async function getParticipantNecessaryData(
  participantEmail: string,
  participantData: models.ParticipantData
): Promise<models.FCMCutomizedData> {
  const fcmCutomizedData = new models.FCMCutomizedData(
    false,
    models.fcmCustomProtocol.PARTICIPANT_DATA_COMMAND,
    new models.ParticipantData()
  );
  fcmCutomizedData.commandData = participantData;
  return fcmCutomizedData;
}

export async function persistentSensors(sensors: models.SimpleSensor[]) {
  for (let i = 0; i < sensors.length; ++i) {
    const path = {
      collection: models.SensorStored.name,
      docId: `${sensors[i].id}`,
    };
    const sensor = (await cache.mongoGet(path)) as models.SensorStored;
    if (sensor == undefined) {
      await cache.mongoUpdate(path, sensors[i]);
    }
  }
}

export function hasProjectComplete(prj: models.Project): boolean {
  const prjStatistic = prj.prjStatistic;
  for (let i = 0; i < prjStatistic.length; ++i) {
    if (prjStatistic[i].goalNum < 0) continue;
    if (prjStatistic[i].goalNum > prjStatistic[i].collectedNum) return false;
  }
  return true;
}
