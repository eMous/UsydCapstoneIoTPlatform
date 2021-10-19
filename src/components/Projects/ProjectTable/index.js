import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import useStyles from "../styles";
import Skeleton from "@material-ui/lab/Skeleton";
import routes from "routes";
import { useContext, useEffect, useState } from "react";
import AuthContext from "contexts/auth";
import Grid from "@material-ui/core/Grid";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { fetchProjectData, splitProjsCurrAndPast } from "../services";
import { FetchResearchFieldMap } from "services/api/ProjectOwner";
import Loading from "components/Loading";

const ProjectTable = ({ setProjectDetails }) => {
  const classes = useStyles();
  const { userToken } = useContext(AuthContext);
  const [currTab, setCurrTab] = useState("current");
  const handleTabChange = (event, newVal) => {
    setCurrTab(newVal);
  };
  const [currProjData, setCurrProjData] = useState(null);
  const [pastProjData, setPastProjData] = useState(null);
  const [dataToDisplay, setDataToDisplay] = useState(undefined);
  const tableHeaders = ["No.", "Title", "Research Field(s)", "Participants"];

  // The first time we load this page, we fetch all project-related data
  useEffect(() => {
    // We fetch the data from the backend
    const getProjData = async (userToken) => {
      const OwnerprojData = await fetchProjectData(userToken);
      const researchFieldMap = await FetchResearchFieldMap();
      const { current, past } = splitProjsCurrAndPast(
        OwnerprojData,
        researchFieldMap
      );
      setCurrProjData(current);
      setPastProjData(past);

      if (currTab === "current") {
        setDataToDisplay(current);
      } else if (currTab === "past") {
        setDataToDisplay(past);
      }
    };

    getProjData(userToken);
  }, []);

  useEffect(() => {
    switch (currTab) {
      // If the "Current Projects" tab is currently selected
      case "current": {
        // We update the data to display
        setDataToDisplay(currProjData);
        break;
      }

      // If the "Past Projects" tab is currently selected
      case "past": {
        // We update the data to display
        setDataToDisplay(pastProjData);
        break;
      }

      default:
        break;
    }
  }, [currTab]);

  return (
    <Grid
      container
      direction="column"
      justify="flex-start"
      alignItems="center"
      spacing={5}
    >
      <Grid item>
        <Tabs value={currTab} onChange={handleTabChange}>
          <Tab label="Current Projects" value="current" />
          <Tab label="Past Projects" value="past" />
        </Tabs>
      </Grid>
      {/* {dataToDisplay === null ? (
        <Grid item className={classes.noProjMsg}>
          <Typography variant="h5"> No projects currently.</Typography>
        </Grid>
      ) : ( */}
      <Grid item>
        <TableContainer className={classes.table}>
          <Table stickyHeader aria-label="header is fixed in table">
            <TableHead>
              <TableRow>
                {tableHeaders.map((eachHeader, idx) => (
                  <TableCell key={idx}>{eachHeader}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {dataToDisplay !== null && typeof dataToDisplay !== "undefined"
                ? dataToDisplay.map((eachProj, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <Link
                          variant="body2"
                          color="textSecondary"
                          onClick={() => {
                            setProjectDetails(eachProj);
                          }}
                        >
                          {eachProj.prjTitle}
                        </Link>
                      </TableCell>
                      <TableCell>{eachProj.prjResearchField}</TableCell>
                      <TableCell>{`${eachProj.inprojectparticipantsNum} / ${eachProj.desiredParticipantNumber}`}</TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
          {Array.isArray(dataToDisplay) && dataToDisplay.length === 0 ? (
            <Typography className={classes.noProjMsg}>
              {`You have no ${currTab} projects at the moment.`}
            </Typography>
          ) : null}
        </TableContainer>
      </Grid>
    </Grid>
  );
};

export default ProjectTable;
