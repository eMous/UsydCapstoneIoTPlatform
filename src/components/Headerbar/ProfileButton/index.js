import { useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import useStyles from "./styles";
import Logout from "components/Logout";

const ProfileButton = () => {
  const classes = useStyles();
  const [anchorEle, setAnchorEle] = useState(null);
  const open = Boolean(anchorEle);

  const handleMenu = (event) => {
    setAnchorEle(event.currentTarget);
  };

  const closeMenu = (event) => {
    setAnchorEle(null);
  };

  return (
    <div className={classes.profileBtn}>
      <IconButton
        aria-label="dropdown button for options"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        color="primary"
        onClick={handleMenu}
      >
        <Icon>arrow_drop_down</Icon>
      </IconButton>
      <Menu
        getContentAnchorEl={null}
        id="menu-appbar"
        anchorEl={anchorEle}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        keepMounted
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        open={open}
        onClose={closeMenu}
      >
        <Logout />
      </Menu>
    </div>
  );
};

export default ProfileButton;
