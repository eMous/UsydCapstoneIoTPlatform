import { makeStyles } from "@material-ui/core/styles";
import { DRAWER_WIDTH } from "components/constants";

const useStyles = makeStyles((theme) => ({
  drawer: {
    minWidth: DRAWER_WIDTH,
    display: "flex",
    flexShrink: 0,
  },

  drawerPaper: {
    width: DRAWER_WIDTH,
  },

  toolbar: theme.mixins.toolbar,
}));

export default useStyles;
