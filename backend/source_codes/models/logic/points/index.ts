import {
  Participant,
  ParticipantPointStatistics,
  ParticipantIncentiveTier,
  Points
} from "../../data";
import { getCurrentQuarter } from "../utils";

const BASE_POINTS = Points.getBasePoints();

/**
 * This function updates the user's points collected for each of their project wallets,
 * that the sensor data is contributing to. It will also add base number of points to
 * their Lifetime Wallet ONCE for THIS sensor data record contributed.
 * @param ptcp The Participant who is contributing the sensor data
 * @param projIds The list of project IDs that the sensor data is contributing to
 * @returns
 */
export const updateUserPoints = (ptcp: Participant, projIds: string[]) => {
  // We will also add (and initialize if it doesn't exist) the points earned in
  // the Participant's statistics
  if (typeof ptcp.pointStatistics === "undefined") {
    ptcp.pointStatistics = [];
  } else {
    // Otherwise if it exists, we try and look for the point statistic belonging to this year and month
    let matchingPtStatistics = ptcp.pointStatistics.find(
      (sts) =>
        sts.year === new Date().getFullYear() &&
        sts.mth === new Date().getMonth()
    );

    // If one doesn't exist, we create one
    if (typeof matchingPtStatistics === "undefined") {
      matchingPtStatistics = new ParticipantPointStatistics();
      matchingPtStatistics.year = new Date().getFullYear();
      matchingPtStatistics.mth = new Date().getMonth();
      matchingPtStatistics.qtr = getCurrentQuarter();
      ptcp.pointStatistics.push(matchingPtStatistics);
    }

    // We retrieve the current point multiplier based on the Participant's tier
    const ptcpPtMultiplier = ParticipantIncentiveTier.getTierMultiplier(
      ptcp.incentiveTier
    );

    // Add the base number of points to the Participant's Lifetime Wallet
    ptcp.lifeTimeWallet += BASE_POINTS * ptcpPtMultiplier;

    // and we update the point statistic for the lifetime points
    matchingPtStatistics.lifeTimePointsEarned += BASE_POINTS * ptcpPtMultiplier;

    // We iterate through the list of Project Wallets that this participant has
    for (let i = 0; i < ptcp.projectWallets.length; i += 1) {
      // For each wallet, we check if the project ID belongs to the list of project IDs that the sensor data is contributing to
      if (projIds.includes(ptcp.projectWallets[i].projectId)) {
        // We set the wallet's points equals to the number of records x base points
        const matchingProj = ptcp.projects.find((proj) => proj.projectId === ptcp.projectWallets[i].projectId);
        if (matchingProj) {
          let totalRecordsContributed = 0;
          for (let i = 0; i < matchingProj.sensorRecords.length; i += 1) {
            totalRecordsContributed += matchingProj.sensorRecords[i].number;
          }

          ptcp.projectWallets[i].existingPoints = totalRecordsContributed * BASE_POINTS;

          // and update the point statistic for the redeemable points
          matchingPtStatistics.redeemablePointsEarned = totalRecordsContributed * BASE_POINTS;
        }
      }
    }
  }
};
