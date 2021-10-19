import React, { useEffect, useState } from "react";
import { useStyles, LightTooltip } from "../styles";
import { BindResearch } from "../services";
import { BindBalance } from "components/Balance/services";
import Loading from "components/Loading";
import {
  TextField,
  OutlinedInput,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  ListItemText,
  InputAdornment,
  Link,
  CircularProgress,
  FormHelperText,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";
import { Typography } from "@material-ui/core";
import routes from "routes";

export function BasicSetting({ setBasicData, basicData }) {
  const classes = useStyles();
  const [fields, setField] = useState([]);
  const [errors, setErrors] = useState([]);
  const todayDate = new Date().toLocaleDateString("en-CA");
  const [load, setLoad] = useState(true);
  const [currentBalance, setCurrentBalance] = useState();

  const handleErrors = (error) => {
    setErrors({ ...error, errors: error });
  };

  const handleChange = (prop) => (dataType) => (event) => {
    switch (dataType) {
      case "float":
        if (parseFloat(event.target.value) <= currentBalance) {
          if (parseFloat(event.target.value) > 0) {
            return setBasicData({
              ...basicData,
              [prop]: parseFloat(event.target.value),
            });
          } else {
            handleErrors("Please type the right amount of funding.");
          }
        } else handleErrors("Please top up your balance first.");
        break;
      case "bool":
        return setBasicData({ ...basicData, [prop]: event.target.checked });
        break;
      case "":
        return setBasicData({ ...basicData, [prop]: event.target.value });
        break;
    }
  };

  useEffect(() => {
    async function getData() {
      const ReseachData = await BindResearch();
      //put values into an array
      var valueArray = Object.values(ReseachData);
      //put the keys into an array
      var keyArray = Object.keys(ReseachData);
      //the number of the object elements
      var count = Object.keys(ReseachData).length;
      var balance = await BindBalance();
      setCurrentBalance(balance.toFixed(2));
      await setField([]);
      for (var i = 0; i < count; i++) {
        setField((field) => [
          ...field,
          { key: parseInt(keyArray[i]), value: valueArray[i] },
        ]);
      }
      setLoad(false);
    }
    getData();
  }, []);
  return load ? (
    <CircularProgress color="secondary" />
  ) : (
    <div>
      <TextField
        className={classes.textBox}
        type="text"
        id="project-title"
        variant="outlined"
        required
        fullWidth
        label="Project Title"
        value={basicData.prjTitle}
        onChange={handleChange("prjTitle")("")}
        inputProps={{ maxLength: 100 }}
      />
      <TextField
        className={classes.textBox}
        id="project-description"
        variant="outlined"
        multiline
        rows={4}
        label="Description"
        required
        fullWidth
        value={basicData.prjDescription}
        onChange={handleChange("prjDescription")("")}
        inputProps={{ maxLength: 400 }}
      />
      <div className={classes.margin}>
        <FormControl variant="outlined" required className={classes.date}>
          <InputLabel>Start Date</InputLabel>
          <OutlinedInput
            type="date"
            inputProps={{ min: todayDate }}
            value={new Date(basicData.prjStartTime).toLocaleDateString("en-CA")}
            onChange={handleChange("prjStartTime")("")}
            labelWidth={80}
          />
        </FormControl>
        <FormControl variant="outlined" required className={classes.right}>
          <InputLabel>Duration</InputLabel>
          <OutlinedInput
            type="number"
            value={basicData.prjDuration}
            inputProps={{ min: 1 }}
            onChange={handleChange("prjDuration")("")}
            endAdornment={<InputAdornment position="end">Days</InputAdornment>}
            labelWidth={70}
          />
        </FormControl>
        <FormControl variant="outlined" required className={classes.right}>
          <InputLabel>Participants</InputLabel>
          <OutlinedInput
            type="number"
            value={basicData.desiredParticipantNumber}
            inputProps={{ min: 1 }}
            onChange={handleChange("desiredParticipantNumber")("")}
            endAdornment={<InputAdornment position="end">PPL</InputAdornment>}
            labelWidth={90}
          />
        </FormControl>
      </div>
      <div className={classes.margin}>
        <FormControl
          variant="outlined"
          required
          className={classes.funding}
          fullWidth
        >
          <InputLabel htmlFor="outlined-adornment-funding">Funding</InputLabel>
          <OutlinedInput
            type="number"
            value={basicData.prjFunding}
            inputProps={{ max: currentBalance, min: 1 }}
            onChange={handleChange("prjFunding")("float")}
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
            endAdornment={<InputAdornment position="end">AUD</InputAdornment>}
            labelWidth={70}
          />
          <FormHelperText id="outlined-helper-text">
            Current balance:{currentBalance} AUD
          </FormHelperText>
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={basicData.isFullRedeemOnly}
              onChange={handleChange("isFullRedeemOnly")("bool")}
              name="checkedB"
              color="primary"
            />
          }
          label="No partial rewards"
        />

        {/* <LightTooltip
          title="This number means how many points is equals to 1 dollar, e.g.: 10 means 10 points = 1 AUD."
          arrow
        >
          <FormControl variant="outlined" required className={classes.date}>
            <FormHelperText>Conversion Rate</FormHelperText>
            <OutlinedInput
              type="number"
              value={basicData.conversionRate}
              onChange={handleChange("conversionRate")("int")}
            />
          </FormControl>
        </LightTooltip> */}
      </div>

      <FormControl required variant="outlined" className={classes.formControl}>
        <InputLabel>Research Field</InputLabel>
        <Select
          id="research-selector"
          value={basicData.prjResearchField}
          onChange={handleChange("prjResearchField")("")}
          labelWidth={120}
        >
          {fields.map((field) => (
            <MenuItem key={field.key} value={field.key}>
              <ListItemText primary={field.value} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
