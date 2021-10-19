import React, { useEffect, useState } from "react";
import Container from "@material-ui/core/Container";
import { LoginApi, editProfile } from "services/api/ProjectOwner";
import Headerbar from "components/Headerbar";
import {
  Button,
  Box,
  FormControl,
  InputLabel,
  Chip,
  TextField,
  Avatar,
  Select,
  MenuItem,
  ListItemText,
  Input,
  InputAdornment,
  FormHelperText,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import Alert from "@material-ui/lab/Alert";
import { BindInfo, BindResearch } from "./services";
import { useStyles, StyledBadge } from "./styles";
import { ErrorTypes } from "utils/Error";
import Loading from "components/Loading";
import { IconButton } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import routes from "routes";
import Swal from "sweetalert2";

function Profile() {
  const classes = useStyles();
  const [fields, setField] = useState([]);
  const [values, setValues] = useState({
    email: "email",
    name: "",
    organisation: "",
    phoneNum: "",
    researchFields: [],
  });

  const [errors, setErrors] = useState([]);
  const [load, setLoad] = useState(true);
  let history = useHistory();

  const ProfileIconButton = () => {
    return (
      <IconButton aria-label="edit">
        <EditIcon fontSize="small" />
      </IconButton>
    );
  };

  const handleErrors = (error) => {
    setErrors([error]);
  };

  const BindingAllInfo = async (data) => {
    if (data.researchFields) {
      setValues({
        email: data._id,
        name: data.name,
        phoneNum: data.phoneNum,
        organisation: data.organisation,
        researchFields: data.researchFields,
      });
    } else {
      setValues({
        email: data._id,
        name: data.name,
        phoneNum: data.phoneNum,
        organisation: data.organisation,
        researchFields: [],
      });
    }
  };

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const validateInput = () => {
    if (
      values.name === "" ||
      values.phoneNum === "" ||
      values.researchFields.length === 0
    ) {
      handleErrors("Please fill in all the required fields.");
      return false;
    } else if (
      !/^(?:\+?(61))? ?(?:\((?=.*\)))?(0?[2-57-8])\)? ?(\d\d(?:[- ](?=\d{3})|(?!\d\d[- ]?\d[- ]))\d\d[- ]?\d[- ]?\d{3})$/gm.test(
        values.phoneNum
      )
    ) {
      handleErrors("Please type the right format of mobile number.");
      return false;
    } else if (!/^[a-zA-Z]+$/.test(values.name)) {
      handleErrors("Your name can only contains English letters.");
      return false;
    } else {
      return true;
    }
  };

  const handleSubmit = async () => {
    setErrors([]);
    if (validateInput()) {
      try {
        //update
        const retrievedToken = await firebase.auth().currentUser.getIdToken();
        // Make API call to backend for creating a session
        await LoginApi(retrievedToken);
        editProfile(values, retrievedToken);
        //notification
        Swal.fire({
          title: "Congrats!",
          text: "Your profile has been updated!",
        }).then((result) => {
          Swal.close(location.reload());
        });
      } catch (error) {
        handleErrors([]);
        if (error.type === ErrorTypes.BACKEND_PROFILE) {
          handleErrors([error.toString()]);
        } else {
          handleErrors([error.toString()]);
        }
      }
    }
  };

  //get current information
  useEffect(() => {
    async function getData() {
      //bind research fields
      const ReseachData = await BindResearch();
      //put values into an array
      var valueArray = Object.values(ReseachData);
      //put the keys into an array
      var keyArray = Object.keys(ReseachData);
      //the number of the object elements
      var count = Object.keys(ReseachData).length;
      await setField([]);
      for (var i = 0; i < count; i++) {
        setField((field) => [
          ...field,
          { key: parseInt(keyArray[i]), value: valueArray[i] },
        ]);
      }
      //bind profile data
      const data = await BindInfo();

      if (data) {
        BindingAllInfo(data);
        setLoad(false);
      }
    }
    getData();
  }, []);

  return load ? (
    <Loading />
  ) : (
    <Container className={classes.profileBox}>
      <Box className={classes.leftBox}>
        <div className={classes.profileTitle}>Profile</div>

        <StyledBadge
          color="primary"
          overlap="circle"
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          badgeContent={<ProfileIconButton />}
        >
          <Avatar className={classes.largeAvatar}>
            {values.name.charAt(0).toUpperCase()}
          </Avatar>
        </StyledBadge>
        <div className={classes.FixedInfo}>{values.email}</div>
        <div className={classes.FixedInfo}>{values.organisation}</div>
      </Box>
      <Box className={classes.rightBox}>
        <div>
          {errors.length > 0 &&
            errors.map((error) => {
              return <Alert severity="error">{error}</Alert>;
            })}
        </div>
        <form className={classes.profileForm}>
          <TextField
            className={classes.textBox}
            type="text"
            variant="standard"
            required
            fullWidth
            label="Name"
            autoFocus
            value={values.name}
            onChange={handleChange("name")}
          />

          <FormControl
            variant="standard"
            required
            className={classes.textBox}
            fullWidth
          >
            <InputLabel>Mobile number</InputLabel>
            <Input
              type="tel"
              value={values.phoneNum}
              onChange={handleChange("phoneNum")}
              startAdornment={
                <InputAdornment position="start">+61</InputAdornment>
              }
            />
            <FormHelperText id="outlined-helper-text">
              E.g., 424123456
            </FormHelperText>
          </FormControl>

          <FormControl
            required
            variant="standard"
            className={classes.formControl}
          >
            <InputLabel>Research Field</InputLabel>
            <Select
              id="research-selector"
              multiple
              value={values.researchFields}
              onChange={handleChange("researchFields")}
              renderValue={(selected) => (
                <div className={classes.chips}>
                  {selected.map((value) =>
                    fields.map((field) => {
                      if (value === field.key)
                        return (
                          <Chip
                            variant="outlined"
                            color="secondary"
                            key={value}
                            label={field.value}
                            className={classes.chip}
                          />
                        );
                    })
                  )}
                </div>
              )}
            >
              {fields.map((field) => (
                <MenuItem key={field.key} value={field.key}>
                  <ListItemText primary={field.value} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            fullWidth
            variant="contained"
            className={classes.submit}
            onClick={handleSubmit}
          >
            update
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default Profile;
