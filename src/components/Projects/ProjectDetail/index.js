import { React, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { BindSensors } from "components/CreateProject/services";
import { LightTooltip } from "components/CreateProject/styles";
import useStyles from "../styles";
import PropTypes from "prop-types";
import ArrowBackIosRoundedIcon from "@material-ui/icons/ArrowBackIosRounded";
import VisibilityRoundedIcon from "@material-ui/icons/VisibilityRounded";
import GetAppRoundedIcon from "@material-ui/icons/GetAppRounded";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  LinearProgress,
  IconButton,
} from "@material-ui/core";
import { CSVLink, CSVDownload } from "react-csv";
import Loading from "components/Loading";
import { LoginApi, DataPreview } from "services/api/ProjectOwner";
import routes from "routes";

export function ProjectDetails({ projectDetails, setProjectDetails }) {
  const classes = useStyles();
  const [sensorList, setSensorList] = useState([]);
  const [dataPreview, setDataPreview] = useState();
  const frequency = ["Low", "Medium", "High"];
  var i = 0;
  let history = useHistory();

  function LinearProgressWithLabel(props) {
    return (
      <Box display="flex" alignItems="center">
        <Box width="100%" mr={1}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box minWidth={35}>
          <Typography variant="body2" color="textSecondary">{`${parseFloat(
            props.value
          ).toFixed(2)}%`}</Typography>
        </Box>
      </Box>
    );
  }

  async function handlePreview() {
    window.open(routes.api.datadownload + projectDetails._id, "_parent");
  }

  useEffect(() => {
    async function getData() {
      setSensorList(await BindSensors());
    }
    getData();
  }, []);

  return (
    <div className={classes.details}>
      <Button
        color="secondary"
        className={classes.backButton}
        onClick={() => setProjectDetails(undefined)}
        startIcon={<ArrowBackIosRoundedIcon />}
      >
        Back
      </Button>
      <Paper elevation={10} className={classes.detailsPaper}>
        <div className={classes.prjTitle}>
          <Typography variant="overline" color="textSecondary">
            Project:
          </Typography>
          <Typography align="left" variant="h6" color="secondary">
            {projectDetails.prjTitle}
          </Typography>
        </div>
        <div className={classes.prjTitle}>
          <Typography variant="overline" color="textSecondary">
            Description:
          </Typography>
          <Typography align="justify" variant="body2" color="secondary">
            {projectDetails.prjDescription}
          </Typography>
        </div>
        <div className={classes.prjTitle}>
          <Typography variant="overline" color="textSecondary">
            Start Time:
          </Typography>
          <Typography align="justify" variant="body2" color="secondary">
            {projectDetails.prjStartTime.split("T")[0]}
          </Typography>
        </div>
        <div className={classes.prjTitle}>
          <Button
            color="secondary"
            variant="contained"
            onClick={handlePreview}
            startIcon={<GetAppRoundedIcon fontSize="small" />}
          >
            Download Data
          </Button>
        </div>
        <div className={classes.prjTitle}>
          <Typography variant="overline" color="textSecondary">
            Sensors:
          </Typography>
        </div>
        <Paper elevation={0}>
          {projectDetails.prjStatistic.map((statistic) =>
            sensorList.map((sensor) => {
              if (statistic.sensorId == sensor._id) {
                i++;
                return (
                  <Box
                    display="flex"
                    alignItems="flex-start"
                    justifyContent="space-between"
                  >
                    <div className={classes.sensors}>
                      <Typography variant="caption">
                        Frequency:
                        {
                          frequency[
                            projectDetails.prjRequirements[0].sensors[i - 1]
                              .minimumFrequency - 1
                          ]
                        }
                      </Typography>
                      <Typography variant="caption">{sensor.name}</Typography>
                      <LinearProgressWithLabel
                        value={parseFloat(
                          (statistic.collectedNum / statistic.goalNum) * 100
                        ).toString()}
                      />
                    </div>
                  </Box>
                );
              }
            })
          )}
        </Paper>
      </Paper>
    </div>
  );
}
