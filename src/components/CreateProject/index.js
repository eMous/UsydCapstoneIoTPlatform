import React, { useEffect, useState } from "react";
import Container from "@material-ui/core/Container";
import {
  LoginApi,
  CreateAProject,
  FetchFrequencies,
} from "services/api/ProjectOwner";
import { BindApiRange } from "./services";
import routes from "routes";
import { useHistory } from "react-router-dom";
import { CustomException, ErrorTypes } from "utils/Error";
import { Button, Divider, IconButton } from "@material-ui/core";
import ArrowBackIosRoundedIcon from "@material-ui/icons/ArrowBackIosRounded";
import ArrowForwardIosRoundedIcon from "@material-ui/icons/ArrowForwardIosRounded";
import { useStyles } from "./styles";
import { Step, Stepper, StepLabel } from "@material-ui/core";
import { DemographicSetting } from "./steppers/DemographicSetting";
import { SensorSetting } from "./steppers/SensorSetting";
import { BasicSetting } from "./steppers/BasicSetting";
import { Review } from "./steppers/Review";
import Swal from "sweetalert2";

function CreateProject() {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());
  const tomorrowDate = new Date(
    new Date().setDate(new Date().getDate() + 1)
  ).toLocaleDateString("en-CA");
  const steps = [
    "Basic setting",
    "Sensors & Matchmaking",
    "Demographic Setting",
    "Review",
  ];
  let history = useHistory();
  let copyRequirement = [];
  let copyGoals = [];

  const [basicData, setBasicData] = useState({
    prjTitle: "", //required
    prjDescription: "", //required
    prjResearchField: 0, // integer //required
    prjStartTime: new Date(tomorrowDate).toISOString(), //required
    prjFunding: 1, //required
    conversionRate: 1, //required
    prjDuration: 1,
    desiredParticipantNumber: 1,
    isFullRedeemOnly: false,
  });
  const [sensorData, setSensorData] = useState([]);
  const [optionalData, setOptionalData] = useState({
    GenderPrjRequirement: {
      seriousness: 5,
      genders: [],
    },
    MobileSystemPrjRequirement: {
      seriousness: 5,
      mobileSystems: ["Android"],
    },
    MobileDeviceTypePrjRequirement: {
      seriousness: 5,
      mobileDeviceTypes: [],
    },
    AndroidAPIPrjRequirement: {
      seriousness: 5,
      minAPILevel: 0,
      maxAPILevel: 0,
    },
  });

  const [frequencies, setFrequencies] = useState([]);

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const setFinalData = () => {
    copyRequirement = [
      {
        requirementType: "SensorPrjRequirement",
        seriousness: 5,
        sensors: [],
      },
    ];
    for (let i = 0; i < sensorData.length; i++) {
      copyRequirement[0].sensors.push({
        sensorId: sensorData[i].sensorId,
        minimumFrequency: sensorData[i].minimumFrequency,
      });
    }

    Object.keys(optionalData).forEach((eachOptionalReq) => {
      switch (eachOptionalReq) {
        case "GenderPrjRequirement": {
          if (optionalData[eachOptionalReq].genders.length > 0) {
            optionalData.GenderPrjRequirement.requirementType =
              "GenderPrjRequirement";
            copyRequirement.push(optionalData.GenderPrjRequirement);
          }
          break;
        }
        case "MobileSystemPrjRequirement": {
          if (optionalData[eachOptionalReq].mobileSystems.length > 0) {
            optionalData.MobileSystemPrjRequirement.requirementType =
              "MobileSystemPrjRequirement";
            copyRequirement.push(optionalData.MobileSystemPrjRequirement);
          }
          break;
        }
        case "MobileDeviceTypePrjRequirement": {
          if (optionalData[eachOptionalReq].mobileDeviceTypes.length > 0) {
            optionalData.MobileDeviceTypePrjRequirement.requirementType =
              "MobileDeviceTypePrjRequirement";
            copyRequirement.push(optionalData.MobileDeviceTypePrjRequirement);
          }
          break;
        }
        case "AndroidAPIPrjRequirement": {
          if (
            optionalData[eachOptionalReq].minAPILevel != 1 ||
            optionalData[eachOptionalReq].minAPILevel != 30
          ) {
            optionalData.AndroidAPIPrjRequirement.requirementType =
              "AndroidAPIPrjRequirement";
            copyRequirement.push(optionalData.AndroidAPIPrjRequirement);
          }
          break;
        }
      }
    });
    for (let i = 0; i < sensorData.length; i++) {
      copyGoals.push({
        sensorId: sensorData[i].sensorId,
        recordsNum:
          (basicData.prjDuration *
            basicData.desiredParticipantNumber *
            86400000) /
          frequencies[sensorData[i].minimumFrequency - 1],
      });
    }
  };

  useEffect(() => {
    async function getData() {
      var copyOfFrequencies = Object.values(await FetchFrequencies());
      setFrequencies(copyOfFrequencies);
    }
    getData();
  }, []);

  const handleSubmit = async () => {
    await setFinalData();
    const ToBeSentData = {
      prjTitle: basicData.prjTitle.trim(), //required
      prjDescription: basicData.prjDescription.trim(), //required
      prjResearchField: basicData.prjResearchField, // integer //required
      prjStartTime: basicData.prjStartTime, //required
      prjFunding: basicData.prjFunding, //required
      conversionRate: basicData.conversionRate,
      matchmakingEnable: true,
      prjRequirements: copyRequirement,
      prjGoals: copyGoals,
      matchmakingEnable: true,
      desiredParticipantNumber: parseInt(basicData.desiredParticipantNumber),
      isFullRedeemOnly: basicData.isFullRedeemOnly,
    };

    var noErrors = true;

    try {
      await Object.values(ToBeSentData).map((element) => {
        if (
          element == "" ||
          element == 0 ||
          element == null ||
          element == undefined
        ) {
          Swal.fire({
            title: "Error!",
            text: "You must fill all the required box",
            icon: "error",
          });
          noErrors = false;
          return;
        }
      });
      const retrievedToken = await firebase.auth().currentUser.getIdToken();
      // Make API call to backend for creating a session
      await LoginApi(retrievedToken);
      const result = await CreateAProject(ToBeSentData, retrievedToken);

      if (result && noErrors) {
        Swal.fire({
          title: "Congrats!",
          text: "You created a new project!",
          icon: "success",
        });
        history.push(`${routes.authenticated.url}${routes.dashboard.url}`);
      }
    } catch (error) {
      handleErrors([]);
      if (error.type === ErrorTypes.CREAT_PROJECT) {
        handleErrors([error.toString()]);
      } else {
        handleErrors([error.toString()]);
      }
    }
  };

  const handleDelete = (chipToDelete) => () => {
    setFieldChipData((Chips) =>
      Chips.filter((chip) => chip.key !== chipToDelete.key)
    );
  };

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
      case 2:
        return (
          <DemographicSetting
            setOptionalData={setOptionalData}
            optionalData={optionalData}
          />
        );
      case 3:
        return (
          <Review
            basicData={basicData}
            sensorData={sensorData}
            optionalData={optionalData}
          />
        );
      default:
        return "Unknown step";
    }
  }

  useEffect(() => {
    async function getData() {
      const apiData = await BindApiRange();
      var l = apiData.length - 1;
      setOptionalData({
        ...optionalData,
        AndroidAPIPrjRequirement: {
          seriousness: 5,
          minAPILevel: apiData[0],
          maxAPILevel: apiData[l],
        },
      });
    }
    getData();
  }, []);

  return (
    <Container className={classes.root}>
      <Container className={classes.stepper}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => {
            const stepProps = {};
            if (isStepSkipped(index)) {
              stepProps.completed = false;
            }
            return (
              <Step key={label} {...stepProps}>
                <StepLabel>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        <Divider />
      </Container>
      <div className={classes.steps}>
        <div className={classes.btnGroup}>
          <IconButton
            aria-label="back"
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            <ArrowBackIosRoundedIcon />
          </IconButton>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            className={classes.button}
          >
            Back
          </Button>
        </div>

        <Container className={classes.instructions}>
          {getStepContent(activeStep)}
        </Container>
        <div className={classes.btnGroup}>
          {activeStep !== steps.length - 1 ? (
            <div>
              <IconButton aria-label="next" onClick={handleNext} size="large">
                <ArrowForwardIosRoundedIcon />
              </IconButton>
              <Button
                color="secondary"
                onClick={handleNext}
                className={classes.button}
              >
                Next
              </Button>
            </div>
          ) : (
            <div>
              <IconButton aria-label="next" onClick={handleSubmit} size="large">
                <ArrowForwardIosRoundedIcon />
              </IconButton>
              <Button
                onClick={handleSubmit} // submitted
                className={classes.button}
              >
                Create
              </Button>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

export default CreateProject;
