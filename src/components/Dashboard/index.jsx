import { useContext, useEffect, useState } from "react";
import AuthContext from "contexts/auth";
import Grid from "@material-ui/core/Grid";
import PaidFunds from "./PaidFunds";
import HoldingFunds from "./HoldingFunds";
import OverallProjects from "./OverallProjects";
import TotalDataCollected from "./TotalDataCollected";
import { GetUserInfoApi } from "services/api/ProjectOwner";

const Dashboard = () => {
  const { userToken } = useContext(AuthContext);
  const initDashboardData = {
    paidFundAmt: 0,
    holdFundAmt: 0,
    totalProjs: 0,
    totalData: 0,
  };
  const [dashboardData, setDashboardData] = useState(initDashboardData);

  /**
   * The reason for having the API calls done here instead of the individual
   * dashboard components, is because we don't have an API call specifically
   * for these statistics.
   *
   * We need to make a GET call for each of the projects the user has and
   * amalgamate the values for each statistic we want.
   *
   * To save API calls, we perform it once in this parent component, instead
   * of having each component perform their own set of API calls (repeated).
   */
  useEffect(() => {
    const fetchProjData = async () => {
      const userProfileData = await GetUserInfoApi(userToken);
      let updatedDashboardData = { ...initDashboardData, ...{} };

      if (userProfileData !== null && typeof userProfileData !== "undefined") {
        if (
          Object.hasOwnProperty.call(userProfileData, "totalHasFundedMoney")
        ) {
          updatedDashboardData.paidFundAmt =
            userProfileData.totalHasFundedMoney;
        }

        if (Object.hasOwnProperty.call(userProfileData, "balance")) {
          updatedDashboardData.holdFundAmt = userProfileData.balance;
        }

        if (Object.hasOwnProperty.call(userProfileData, "projects")) {
          updatedDashboardData.totalProjs = userProfileData.projects.length;
        }

        if (
          Object.hasOwnProperty.call(
            userProfileData,
            "totalAmountDataCollected"
          )
        ) {
          updatedDashboardData.totalData =
            userProfileData.totalAmountDataCollected;
        }

        setDashboardData(updatedDashboardData);
      }
    };

    fetchProjData();
  }, []);

  return (
    <Grid container direction="row" justify="center" spacing={3}>
      <Grid item>
        <PaidFunds fundsAmt={dashboardData.paidFundAmt} />
      </Grid>
      <Grid item>
        <HoldingFunds fundsAmt={dashboardData.holdFundAmt} />
      </Grid>
      <Grid item>
        <OverallProjects numProjs={dashboardData.totalProjs} />
      </Grid>
      <Grid item>
        <TotalDataCollected numRecords={dashboardData.totalData} />
      </Grid>
    </Grid>
  );
};

export default Dashboard;
