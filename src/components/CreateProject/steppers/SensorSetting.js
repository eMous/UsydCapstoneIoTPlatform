import React, { useEffect, useState } from "react";
import {
  OutlinedInput,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  List,
  ListItem,
  ListItemText,
  FormHelperText,
  IconButton,
  Slider,
  Fab,
  ListItemSecondaryAction,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { useStyles, LightTooltip } from "../styles";
import { BindSensors } from "../services";
import AddIcon from "@material-ui/icons/Add";
import HighlightOffRoundedIcon from "@material-ui/icons/HighlightOffRounded";
import { TextField } from "@material-ui/core";

export function SensorSetting({ setSensorData, sensorData }) {
  const classes = useStyles();
  const [errors, setErrors] = useState([]);
  const sensorFrequency = [
    {
      value: 1,
      label: "Low",
    },
    {
      value: 2,
      label: "medium",
    },
    {
      value: 3,
      label: "High",
    },
  ];

  let newSensor = {
    sensorId: "",
    sensorName: "",
    minimumFrequency: 0,
    frequencyLevel: "",
    recordsNum: 0,
  };

  const [sensorSelector, setSensorSelector] = useState([]);

  const handleNewSensor = (prop) => (event) => {
    switch (prop) {
      case "sensorId":
        newSensor.sensorId = event.target.value[0];
        newSensor.sensorName = event.target.value[1];
        break;
      case "minimumFrequency":
        newSensor.minimumFrequency = parseInt(event.target.value[0]);
        newSensor.frequencyLevel = event.target.value[1];
        break;
      case "recordsNum":
        newSensor.recordsNum = parseInt(event.target.value);
        break;

      default:
        break;
    }
  };

  const handleErrors = (error) => {
    setErrors([error]);
  };

  const handleDelete = (index) => () => {
    let copy = JSON.parse(JSON.stringify(sensorData));
    copy.splice(index, 1);
    setSensorData(copy);
  };

  const CheckList = () => {
    let result = true;
    for (let i = 0; i < sensorData.length; i++) {
      if (sensorData[i].sensorId === newSensor.sensorId) {
        result = false;
        break;
      }
    }
    return result;
  };

  const handleSensors = () => {
    setErrors([]);
    if (newSensor.sensorId !== "") {
      if (newSensor.minimumFrequency > 0) {
        if (CheckList()) {
          const stateCopy = JSON.parse(JSON.stringify(sensorData));
          stateCopy.push(newSensor);
          setSensorData(stateCopy);
        } else {
          handleErrors("You have already chose this setting.");
        }
      } else {
        handleErrors("You must choose a frequency for the sensor.");
      }
    } else {
      handleErrors("you must choose a sensor.");
    }
  };

  useEffect(() => {
    async function getData() {
      setSensorSelector(await BindSensors());
    }
    getData();
  }, []);
  return (
    <div>
      {errors.length > 0 &&
        errors.map((error) => {
          return <Alert severity="error">{error}</Alert>;
        })}
      <div id="sensor setting" className={classes.sensorSetting}>
        <FormControl
          id="sensor-control"
          required
          variant="outlined"
          className={classes.sensorDrop}
        >
          <InputLabel>Select Sensor</InputLabel>
          <Select
            id="sensor-selector"
            onChange={handleNewSensor("sensorId")}
            labelWidth={120}
          >
            {sensorSelector.map((sensor) => (
              <MenuItem key={sensor._id} value={[sensor._id, sensor.name]}>
                {sensor.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          id="sensor-frequency"
          required
          variant="outlined"
          className={classes.fslider}
        >
          <InputLabel>Frequency</InputLabel>
          <Select
            id="frequency-selector"
            onChange={handleNewSensor("minimumFrequency")}
            labelWidth={90}
          >
            <MenuItem key={1} value={["1", "Low"]}>
              Low
            </MenuItem>
            <MenuItem key={2} value={["2", "Medium"]}>
              Medium
            </MenuItem>
            <MenuItem key={3} value={["3", "High"]}>
              High
            </MenuItem>
          </Select>
        </FormControl>
      </div>
      <Fab
        size="small"
        color="secondary"
        aria-label="add-sensor"
        onClick={handleSensors}
      >
        <AddIcon />
      </Fab>
      <Divider />
      <div>
        <List>
          {sensorData.map((tSensor) => (
            <ListItem>
              <ListItemText
                primary={tSensor.sensorName}
                secondary={"Frequency: " + tSensor.frequencyLevel}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={handleDelete(sensorData.indexOf(tSensor))}
                >
                  <HighlightOffRoundedIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  );
}
