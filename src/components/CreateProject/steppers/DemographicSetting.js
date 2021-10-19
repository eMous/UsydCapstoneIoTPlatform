import React, { useEffect, useState } from "react";
import { useStyles, IOSSwitch, LightTooltip } from "../styles";
import { BindGender, BindApiRange } from "../services";
import { Seriousness } from "./Seriousness";

import {
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormControlLabel,
  ListItemText,
  Typography,
  Slider,
  Grid,
  Paper,
  CircularProgress,
  Checkbox,
} from "@material-ui/core";

export function DemographicSetting({ setOptionalData, optionalData }) {
  const classes = useStyles();
  const [genderSelector, setGenderSelector] = useState([]);
  const [errors, setErrors] = useState([]);
  const [load, setLoad] = useState(true);
  const handleErrors = (error) => {
    setErrors({ ...error, errors: error });
  };
  const [min, setMin] = useState();
  const [max, setMax] = useState();

  const handleChangeApiRange = (event, newValue) => {
    let copyofAndroidAPIPrjRequirement = JSON.parse(
      JSON.stringify(optionalData.AndroidAPIPrjRequirement)
    );
    copyofAndroidAPIPrjRequirement.minAPILevel = newValue[0];
    copyofAndroidAPIPrjRequirement.maxAPILevel = newValue[1];
    setOptionalData({
      ...optionalData,
      AndroidAPIPrjRequirement: copyofAndroidAPIPrjRequirement,
    });
  };

  //gender seriousness value getting
  const handleGenderSeriousness = (seriousnessValue) => {
    let copyOfGenderPrjRequirement = JSON.parse(
      JSON.stringify(optionalData.GenderPrjRequirement)
    );
    copyOfGenderPrjRequirement.seriousness = seriousnessValue;
    setOptionalData({
      ...optionalData,
      GenderPrjRequirement: copyOfGenderPrjRequirement,
    });
  };

  const handleGenderChanges = (event) => {
    if (event.target.value !== "") {
      let copyOfGenderPrjRequirement = JSON.parse(
        JSON.stringify(optionalData.GenderPrjRequirement)
      );
      copyOfGenderPrjRequirement.genders = event.target.value;
      setOptionalData({
        ...optionalData,
        GenderPrjRequirement: copyOfGenderPrjRequirement,
      });
    }
  };

  //OS seriousness value getting
  const handleOSSeriousness = (seriousnessValue) => {
    let copyOfMobileSystemPrjRequirement = JSON.parse(
      JSON.stringify(optionalData.MobileSystemPrjRequirement)
    );
    copyOfMobileSystemPrjRequirement.seriousness = seriousnessValue;
    setOptionalData({
      ...optionalData,
      MobileSystemPrjRequirement: copyOfMobileSystemPrjRequirement,
    });
  };

  //Device seriousness value getting
  const handleDeviceSeriousness = (seriousnessValue) => {
    let copyOfMobileDeviceTypePrjRequirement = JSON.parse(
      JSON.stringify(optionalData.MobileDeviceTypePrjRequirement)
    );
    copyOfMobileDeviceTypePrjRequirement.seriousness = seriousnessValue;
    setOptionalData({
      ...optionalData,
      MobileDeviceTypePrjRequirement: copyOfMobileDeviceTypePrjRequirement,
    });
  };

  const handleDeviceChanges = (event) => {
    if (event.target.value !== "") {
      let copyOfMobileDeviceTypePrjRequirement = JSON.parse(
        JSON.stringify(optionalData.MobileDeviceTypePrjRequirement)
      );
      copyOfMobileDeviceTypePrjRequirement.mobileDeviceTypes =
        event.target.value;
      setOptionalData({
        ...optionalData,
        MobileDeviceTypePrjRequirement: copyOfMobileDeviceTypePrjRequirement,
      });
    }
  };

  //API seriousness value getting
  const handleAPISeriousness = (seriousnessValue) => {
    let copyOfAndroidAPIPrjRequirement = JSON.parse(
      JSON.stringify(optionalData.AndroidAPIPrjRequirement)
    );
    copyOfAndroidAPIPrjRequirement.seriousness = seriousnessValue;
    setOptionalData({
      ...optionalData,
      AndroidAPIPrjRequirement: copyOfAndroidAPIPrjRequirement,
    });
  };

  const handleAPIChanges = (event, value) => {
    let copyOfAndroidAPIPrjRequirement = JSON.parse(
      JSON.stringify(optionalData.AndroidAPIPrjRequirement)
    );
    copyOfAndroidAPIPrjRequirement.minAPILevel = parseInt(value[0]);
    copyOfAndroidAPIPrjRequirement.maxAPILevel = parseInt(value[1]);
    setOptionalData({
      ...optionalData,
      AndroidAPIPrjRequirement: copyOfAndroidAPIPrjRequirement,
    });
  };

  useEffect(() => {
    async function getData() {
      const genderData = await BindGender();
      const apiData = await BindApiRange();
      var l = apiData.length - 1;
      setMin(apiData[0]);
      setMax(apiData[l]);
      var genderValues = Object.values(genderData);
      var generKeys = Object.keys(genderData);
      await setGenderSelector([]);
      for (var j = 0; j < Object.keys(genderData).length; j++) {
        setGenderSelector((selector) => [
          ...selector,
          { key: generKeys[j], value: genderValues[j] },
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
      <div id="matchmaking-setting" className={classes.optionalSetting}>
        {/* Matchmaking toggle */}
        <LightTooltip
          title="By turning it on, your project will be sent to matching-users according to your setting."
          arrow
        >
          <Typography variant="body1" color="secondary">
            Matchmaking
          </Typography>
        </LightTooltip>
        <FormControlLabel
          control={<IOSSwitch checked={true} name="Matchmaking" />}
        />
      </div>
      <Divider />
      <div className={classes.optionalSetting}>
        <Typography color="textPrimary" variant="overline">
          (Settings below are optional, it will affect your matchmaking
          results.)
        </Typography>
        <div className={classes.optionalSetting}>
          <Paper id="gender-paper" className={classes.optionalPaper}>
            {/* <Typography variant="overline" align="left">
              Gender
            </Typography> */}
            <FormControl variant="standard" className={classes.optionalSelect}>
              <InputLabel id="gender-select">Gender</InputLabel>
              <Select
                margin="dense"
                multiple
                value={optionalData.GenderPrjRequirement.genders}
                onChange={handleGenderChanges}
                label="gender"
                renderValue={(selected) => (
                  <div className={classes.chips}>
                    {selected.map((value) =>
                      genderSelector.map((gender) => {
                        if (value === gender.value)
                          return <div>{gender.key},</div>;
                      })
                    )}
                  </div>
                )}
              >
                {genderSelector.map((gender) => (
                  <MenuItem key={gender.value} value={parseInt(gender.value)}>
                    <Checkbox
                      checked={
                        optionalData.GenderPrjRequirement.genders.indexOf(
                          gender.value
                        ) > -1
                      }
                    />
                    <ListItemText primary={gender.key} />
                    {/* {gender.key} */}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Seriousness
              currentSeriousness={optionalData.GenderPrjRequirement.seriousness}
              getValue={handleGenderSeriousness}
              disabled={optionalData.GenderPrjRequirement.genders.length === 0}
            />
          </Paper>
          <Paper id="OS-paper" className={classes.optionalPaper}>
            <FormControl
              margin="dense"
              disabled
              variant="standard"
              className={classes.optionalSelect}
            >
              <InputLabel id="OS-select-disabled">Operation System</InputLabel>
              <Select label="OS" defaultValue="Android">
                <MenuItem selected value="Android">
                  Android
                </MenuItem>
              </Select>
            </FormControl>
            <Seriousness
              currentSeriousness={
                optionalData.MobileSystemPrjRequirement.seriousness
              }
              getValue={handleOSSeriousness}
              disabled={false}
            />
          </Paper>
          <Paper id="Devices-paper" className={classes.optionalPaper}>
            <FormControl variant="standard" className={classes.optionalSelect}>
              <InputLabel id="device-select">Devices</InputLabel>
              <Select
                margin="dense"
                value={
                  optionalData.MobileDeviceTypePrjRequirement.mobileDeviceTypes
                }
                label="devices"
                multiple
                onChange={handleDeviceChanges}
                renderValue={(selected) => (
                  <div className={classes.chips}>
                    {selected.map((device) => (
                      <div>{device},</div>
                    ))}
                  </div>
                )}
              >
                <MenuItem value="Mobile Phone">
                  <Checkbox
                    checked={
                      optionalData.MobileDeviceTypePrjRequirement.mobileDeviceTypes.indexOf(
                        "Mobile Phone"
                      ) > -1
                    }
                  />
                  <ListItemText primary="Mobile Phone" />
                </MenuItem>
                <MenuItem value="Wearable Device">
                  <Checkbox
                    checked={
                      optionalData.MobileDeviceTypePrjRequirement.mobileDeviceTypes.indexOf(
                        "Wearable Device"
                      ) > -1
                    }
                  />
                  <ListItemText primary="Wearable Device" />
                </MenuItem>
              </Select>
            </FormControl>

            <Seriousness
              currentSeriousness={
                optionalData.MobileDeviceTypePrjRequirement.seriousness
              }
              getValue={handleDeviceSeriousness}
              disabled={
                optionalData.MobileDeviceTypePrjRequirement.mobileDeviceTypes
                  .length === 0
              }
            />
          </Paper>
          <Paper id="Andriod-API-paper" className={classes.optionalPaper}>
            <div className={classes.optionalSelect}>
              <Typography
                id="API-select"
                color="textSecondary"
                align="left"
                variant="caption"
                display="block"
              >
                API Version Range
              </Typography>
              <Slider
                value={[
                  optionalData.AndroidAPIPrjRequirement.minAPILevel,
                  optionalData.AndroidAPIPrjRequirement.maxAPILevel,
                ]}
                aria-labelledby="api-range-slider"
                valueLabelDisplay="auto"
                onChange={handleAPIChanges}
                min={min}
                max={max}
              />
            </div>
            <Seriousness
              currentSeriousness={
                optionalData.AndroidAPIPrjRequirement.seriousness
              }
              getValue={handleAPISeriousness}
              disabled={false}
            />
          </Paper>
        </div>
      </div>
    </div>
  );
}
