import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  FormControl,
  FormHelperText,
  OutlinedInput,
  InputAdornment,
} from "@material-ui/core";
import Loading from "components/Loading";
import Alert from "@material-ui/lab/Alert";
import { useStyles } from "./styles";
import React, { useEffect, useState } from "react";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import PaymentIcon from "@material-ui/icons/Payment";
import { BindBalance } from "./services";
import { LoginApi, UpdateBalance } from "services/api/ProjectOwner";
import { ErrorTypes } from "utils/Error";
import Swal from "sweetalert2";

function Balance() {
  const classes = useStyles();
  const [currentBalance, setCurrentBalance] = useState();
  const [addAmount, setAddAmount] = useState({ addValue: 0 });
  const [errors, setErrors] = useState([]);
  const [load, setLoad] = useState(true);

  const handleChanges = async (event) => {
    setAddAmount({ addValue: parseFloat(event.target.value) });
  };

  const handleErrors = (error) => {
    setErrors([error]);
  };

  const handleSubmit = async () => {
    try {
      if (addAmount.addValue < 1) {
        handleErrors("The balance must be more than 1 AUD.");
        return;
      } else if (addAmount.addValue >= 9999) {
        handleErrors("The balance must be lower than 9,999 AUD.");
      } else {
        setErrors([]);
        const retrievedToken = await firebase.auth().currentUser.getIdToken();
        // Make API call to backend for creating a session
        await LoginApi(retrievedToken);
        let result = await UpdateBalance(addAmount, retrievedToken);
        setAddAmount({ addValue: 0 });
        Swal.fire({
          title: "Paid!",
          text: "You successfully top up!",
          // icon: "success",
        });
        let balance = await BindBalance();
        balance = balance.toFixed(2);
        setCurrentBalance(balance);
      }
    } catch (error) {
      if (error.type === ErrorTypes.BACKEND_PROFILE) {
        console.log(error.toString());
      } else {
        console.log(error.toString());
      }
    }
  };

  useEffect(() => {
    async function getData() {
      let balance = await BindBalance();
      balance = balance.toFixed(2);
      setCurrentBalance(balance);
      setLoad(false);
    }
    getData();
  }, []);

  return load ? (
    <Loading />
  ) : (
    <Container className={classes.root}>
      <Paper elevation={10} className={classes.paper}>
        <Box className={classes.box}>
          <div className={classes.text}>
            <Typography align="left" variant="subtitle2">
              Current Balance:
            </Typography>
          </div>
          <div className={classes.balance}>
            <AttachMoneyIcon className={classes.moneyIcon} fontSize="large" />
            <Typography variant="h2">{currentBalance}</Typography>
            <Typography variant="h6">AUD</Typography>
          </div>
        </Box>
      </Paper>
      <div className={classes.topUp}>
        {errors.length > 0 &&
          errors.map((error) => {
            return <Alert severity="error">{error}</Alert>;
          })}
        <TextField
          type="number"
          value={addAmount.addValue}
          onChange={handleChanges}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            endAdornment: <InputAdornment position="end">AUD</InputAdornment>,
          }}
        />
        <Button
          variant="contained"
          size="large"
          disableElevation
          className={classes.button}
          startIcon={<PaymentIcon />}
          onClick={handleSubmit}
        >
          Top Up
        </Button>
      </div>
    </Container>
  );
}

export default Balance;
