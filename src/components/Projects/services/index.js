import { GetUserInfoApi, FetchProjectInfo } from "services/api/ProjectOwner";

export const splitProjsCurrAndPast = (projList, researchFieldMap) => {
  let output = {
    current: [],
    past: [],
  };

  // For each project
  if (projList !== null) {
    projList.map((eachProj) => {
      // We check the project statistics and look if the number of collected records reach the targeted number, for all goals
      let isProjOver = eachProj.prjStatistic.every((sensor) => {
        if (sensor.goalNum === 0) {
          return true;
        } else {
          if (sensor.collectedNum >= sensor.goalNum) {
            return true;
          } else {
            return false;
          }
        }
      });

      eachProj.prjResearchField = researchFieldMap[eachProj.prjResearchField];

      if (isProjOver) {
        output.past.push(eachProj);
      } else {
        output.current.push(eachProj);
      }
    });
  }

  return output;
};

export const fetchProjectData = async (userToken) => {
  // FOR NOW: We fetch the profile information first to get the list of project IDs
  // FOR NOW: then we make an API call for each of the project IDs to retrieve the information of the project

  const { projects } = await GetUserInfoApi(userToken);
  // If we get information about the project ID
  if (
    typeof projects !== "undefined" &&
    projects !== null &&
    projects.length > 0
  ) {
    // For each of the project IDs, we make an API call
    const projDetailsPromises = projects.map((projId) => {
      return FetchProjectInfo(projId, userToken);
    });
    const resolvedProjDetails = await Promise.all(projDetailsPromises);
    return resolvedProjDetails;
  } else {
    // Otherwise if there are no project IDs (either unable to retrieve or none at all)
    // then we return null
    return null;
  }
};
