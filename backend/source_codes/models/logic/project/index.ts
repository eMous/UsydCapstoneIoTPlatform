import { ProjectInParticipantProfile, Project } from "../../data";

/**
 * This function checks if the participant has completed all their sensor record responsibilities for the project.
 * @param prjInPtcpProfile The ProjectInParticipantProfile object
 * @returns True if the participant has completed all their sensor record responsibilities for the project, false otherwise
 */
export const hasPtcpCompletedProj = (
  prjInPtcpProfile: ProjectInParticipantProfile,
  prj: Project
): boolean => {
  const projGoalSensorIds = prj.prjGoals.map((goal) => goal.sensorId);
  const collectedSensorIds = prjInPtcpProfile.sensorRecords.map((snsrRecord) => snsrRecord.sensorId);
  const didPtcpCollectAllGoalTypes = projGoalSensorIds.every(
    (goalSnsrId) => collectedSensorIds.includes(goalSnsrId)
  );

  if (didPtcpCollectAllGoalTypes) {
    const isAllGoalsComplete = prjInPtcpProfile.sensorRecords.every(
      (snsrRecord) => snsrRecord.number === snsrRecord.required
    );
    return isAllGoalsComplete;
  }

  return false;
}