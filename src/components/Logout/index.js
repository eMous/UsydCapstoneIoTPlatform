import React, { useContext } from "react";
import AuthContext from "contexts/auth";
import Button from "@material-ui/core/Button";
import useStyles from "./styles";
import { useHistory } from "react-router-dom";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import routes from "routes";
import { FirebaseSignout } from "./services";
import { SignOutApi } from "services/api/ProjectOwner";

function Logout() {
  const classes = useStyles();
  const history = useHistory();
  const { userToken } = useContext(AuthContext);
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSignOut = async () => {
    handleClose();
    await SignOutApi(userToken);
    await FirebaseSignout();
    history.push(routes.login);
  };

  return (
    <div>
      <Button className={classes.signOutBtn} onClick={handleClickOpen}>
        Sign out
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Sign Out"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to sign out?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleClose();
            }}
            autoFocus
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleSignOut();
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Logout;
