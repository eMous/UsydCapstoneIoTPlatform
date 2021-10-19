import { useContext, useEffect, useState } from "react";
import AuthContext from "contexts/auth";
import Grid from "@material-ui/core/Grid";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import ProjectTable from "./ProjectTable";
import { fetchProjectData, splitProjsCurrAndPast } from "./services";
import { FetchResearchFieldMap } from "services/api/ProjectOwner";
import { ProjectDetails } from "./ProjectDetail/index";

const Projects = () => {
  const [projectDetails, setProjectDetails] = useState(undefined);

  function getStepContent(step) {
    //step component from material ui
    switch (step) {
      case 0:
        return (
          <BasicSetting setBasicData={setBasicData} basicData={basicData} />
        );
      case 1:
        return (
          <SensorSetting
            setSensorData={setSensorData}
            sensorData={sensorData}
          />
        );
      default:
        return "Unknown step";
    }
  }

  return (
    <Grid
      container
      direction="column"
      justify="flex-start"
      alignItems="center"
      spacing={5}
    >
      {projectDetails == undefined ? (
        <ProjectTable setProjectDetails={setProjectDetails} />
      ) : (
        <ProjectDetails
          projectDetails={projectDetails}
          setProjectDetails={setProjectDetails}
        />
      )}
    </Grid>
  );
};

export default Projects;
