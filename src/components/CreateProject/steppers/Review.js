import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import { useStyles } from "../styles";

export function Review({ basicData, sensorData, optionalData }) {
  const classes = useStyles();

  return (
    <div className={classes.reviewStep}>
      <div className={classes.reviewlines}>
        <Typography variant="overline">Project Title:</Typography>
        <Typography variant="body1" color="secondary">
          {basicData.prjTitle}
        </Typography>
      </div>
      <div className={classes.reviewlines}>
        <Typography variant="overline">Project Description:</Typography>
        <Typography
          variant="body1"
          color="secondary"
          gutterBottom="true"
          noWrap="false"
        >
          {basicData.prjDescription}
        </Typography>
      </div>
      <div className={classes.reviewlines}>
        <Typography variant="overline">Start date:</Typography>
        <Typography variant="body1" color="secondary">
          {new Date(basicData.prjStartTime).toLocaleDateString("en-CA")}
        </Typography>
      </div>
      <div className={classes.reviewlines}>
        <Typography variant="overline">Funding amount:</Typography>
        <Typography variant="body1" color="secondary">
          {basicData.prjFunding} AUD
        </Typography>
      </div>
      <div className={classes.reviewlines}>
        <Typography variant="overline">Sensors:</Typography>
        <List>
          {sensorData.map((tSensor) => (
            <ListItem>
              <ListItemText
                primary={tSensor.sensorName}
                secondary={"Frequency: " + tSensor.frequencyLevel}
              />
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  );
}
