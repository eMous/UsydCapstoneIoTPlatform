import { Project, ProjectIncentiveTier, ProjectInParticipantProfile } from "../../data";

export const calculatePtcpProjPerf = (
  projInPtcpProfile: ProjectInParticipantProfile,
  proj: Project,
): void => {
  const numGoals = proj.prjGoals.length;
  let avgGoalCompletion = 0;
  
  // We iterate through the list of project goals
  proj.prjGoals.forEach((goal) => {
    // We look for a matching sensor record that the participant has provided
    // that is a part of the project's goals
    const matchingSensorRecords = projInPtcpProfile.sensorRecords.find((record) => record.sensorId === goal.sensorId);
    
    // If we find one, we calculate the goal completion for this sensor
    if (typeof matchingSensorRecords !== "undefined") {
      // The goal completion is counted as the number of records provided by the participant
      // divided by the number of records required to be uploaded PER PARTICIPANT
      avgGoalCompletion += (matchingSensorRecords.number / matchingSensorRecords.required);
    }
  });

  // We divide the sum of the participant's completion rate across all sensors for this project,
  // by the number of sensor goals for the project
  avgGoalCompletion /= numGoals;

  // We get the incentive tier for the project based on the participant's average goal completion
  const determinedProjTier = ProjectIncentiveTier.getProjIncentiveTier(avgGoalCompletion);
  projInPtcpProfile.ptcpTierRating = determinedProjTier;
}