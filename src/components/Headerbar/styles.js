import { makeStyles } from "@material-ui/core/styles";
import { DRAWER_WIDTH } from "components/constants";

const useStyles = makeStyles((theme) => ({
  appBar: {
    width: `calc(100% - ${DRAWER_WIDTH})px`,
    marginLeft: DRAWER_WIDTH,
  },
}));

export default useStyles;
