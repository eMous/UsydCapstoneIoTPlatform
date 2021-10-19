import {
  Participant,
  ParticipantIncentiveTier,
} from "../../data/index";

/**
 * This function checks if the data received currently is considered reliable in terms of sensor frequency requirements,
 * relative to the last time this sensor data was collected
 * @param dataCollectInterval The time in milliseconds between the time the data was collected on the device, and the last time it was collected
 * @param sensorCollectFreq The frequency in terms of milliseconds, required by the project's sensor requirements
 * @returns 1 if the data record frequency is reliable, i.e. The time between the last data collected and the current data collected is within the frequency requirements
 */
export const isDataRecordFreqReliable = (dataCollectInterval: number, sensorCollectFreq: number): number => {
  const LENIENCY_FACTOR = 2.0;
  const maxAllowableElapsedTime = sensorCollectFreq * LENIENCY_FACTOR;

  if (dataCollectInterval <= maxAllowableElapsedTime) {
    return 1;
  }

  return 0;
};

export const updateUserRating = (ptcp: Participant): void => {
  // Count the number of successfully completed projects by this participant
  // 1. Get the number of projects that the participant has joined
  const totalProjsJoined = ptcp.projects.length;
  // 2. Get the number of projects that the participant has left
  const totalProjsLeft = ptcp.projects.filter(
    (proj) => (typeof proj.leaveTime !== "undefined" && proj.leaveTime !== null)
  ).length;

  // 3. We calculate the dropout rate
  // If the user hasn't joined any projects, then their dropout rate is 0
  // If they have, then we calculate the dropout rate as:
  // total no. of projects left / total no. of projects joined
  // This is a scale between 0 to 1.0
  const dropoutRate =
    totalProjsJoined === 0
      ? 0
      : totalProjsLeft / totalProjsJoined;

  // 4. Count the average reliability score per project, across projects,
  // to get an average overall reliability score
  let overallReliabilityScore = 0;
  // For each of the projects this participant has JOINED
  const joinedProjs = ptcp.projects.filter((proj) => proj.joinTime !== null && typeof proj.joinTime !== "undefined");
  for (let i = 0; i < joinedProjs.length; i += 1) {
    let projReliabilityScore = 0;
    // For each of the sensor reliabilities for the project
    for (let j = 0; j < joinedProjs[i].sensorReliability.length; j += 1) {
      const eachSnsrReliability = joinedProjs[i].sensorReliability[j];
      // We add the reliability score of this sensor for this project to the project reliability score
      projReliabilityScore += (eachSnsrReliability.numReliableRecords / eachSnsrReliability.numRecordsReceived);
    }

    // We average out the sensor reliability scores for this project, across all sensors,
    // i.e. If you have 60% reliability in sensor 1, 80% reliability in sensor 2, and 100% reliability in sensor 3,
    // the average project reliability score would be (60 + 80 + 100) / 3 = 80%
    projReliabilityScore /= joinedProjs[i].sensorReliability.length;

    // Then we add the averaged project reliability score for this project
    // to the overall reliability score
    overallReliabilityScore += projReliabilityScore;
  }

  // Once we have all the summed average project reliability scores, we average it across all projects
  // that the participant has JOINED
  if (joinedProjs.length > 0) {
    overallReliabilityScore /= joinedProjs.length;
  }
  
  // We assume we consider the dropout rate and reliability in providing data to be equally important
  const DROPOUT_IMPTANCE = 0.5;
  const RELIABLE_IMPTANCE = 0.5;
  const MAX_RATING = 5;

  const recalcRating = (DROPOUT_IMPTANCE * MAX_RATING * (1 - dropoutRate)) + (RELIABLE_IMPTANCE * MAX_RATING * overallReliabilityScore);
  ptcp.rating = recalcRating || 3;

  /**
   * We will use an alternative method to calculate the user's incentive tier.
   * Each project for a participant will now have a ptcpTierRating, which basically
   * the participant's performance (Bronze / Silver / Gold) for a particular project
   * 
   * We calculate the AVERAGE performance across all their projects to determine their
   * overall incentive tier
   */
  
  // We get all the projects which this participant has completed
  const ptcpCompletedProjs = ptcp.projects.filter((proj) => proj.prjComplete === true);
  let avgProjPerf = 0;
  // For each of those completed projects
  ptcpCompletedProjs.forEach((projInPtcpProfile) => {
    // We sum up the project's performance
    avgProjPerf += projInPtcpProfile.ptcpTierRating;
  })
  // And average it across all completed projects
  avgProjPerf /= ptcpCompletedProjs.length;

  const recalcTier = ParticipantIncentiveTier.getRatingToTierMapping(avgProjPerf);
  ptcp.incentiveTier = recalcTier;

  const recalcTierMultiplier = ParticipantIncentiveTier.getTierMultiplier(recalcTier);
  ptcp.tierMultiplier = recalcTierMultiplier;
};
