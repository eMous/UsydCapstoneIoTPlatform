import { makeStyles, withStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import Tooltip from "@material-ui/core/Tooltip";

export const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "41rem",
    minWidth: "52rem",
    maxWidth: "85%",
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "column",
    paddingTop: "1.5rem",
    scrollBehavior: "auto",
  },
  stepper: {
    marginBottom: "1rem",
  },
  steps: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "3rem",
    position: "static",
  },
  instructions: {
    minWidth: "70%",
    margin: "auto 2rem",
    height: "auto",
    minHeight: "25rem",
  },
  textBox: {
    marginTop: "1rem",
  },
  margin: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    width: "45%",
    marginTop: "1.5rem",
  },
  right: {
    width: "25%",
    marginTop: "1.5rem",
  },
  funding: {
    marginTop: "1.5rem",
    width: "65%",
  },
  formControl: {
    marginTop: "1.5rem",
    width: "100%",
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
  researchPaper: {
    display: "flex",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    listStyle: "none",
    padding: theme.spacing(0.5),
    margin: 0,
  },
  btnGroup: {
    display: "flex",
    flexDirection: "column",
  },
  sensorSetting: {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(4),
  },
  sensorDrop: {
    width: "60%",
  },
  fslider: {
    width: "35%",
  },
  sensorAmount: {
    width: "15%",
  },
  optionalSetting: {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "1rem auto",
    width: "100%",
  },
  optionalPaper: {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "column",
    justifyContent: "space-around",
    padding: theme.spacing(2),
    marginTop: "1rem",
    height: "5rem",
    width: "42%",
    backgroundColor: "rgba(153, 221, 255, 0.4)",
    alignItems: "flex-end",
  },
  optionalSelect: {
    width: "78%",
    height: "3rem",
  },
  seriousness: {
    width: "12%",
  },
  reviewStep: {
    marginTop: "2rem",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  reviewlines: {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    minHeight: "2.5rem",
    height: "auto",
    maxWidth: "90%",
  },
}));

export const IOSSwitch = withStyles((theme) => ({
  root: {
    width: 35,
    height: 20,
    padding: 0,
    margin: theme.spacing(1),
  },
  switchBase: {
    padding: 1,
    "&$checked": {
      transform: "translateX(16px)",
      color: theme.palette.common.white,
      "& + $track": {
        backgroundColor: theme.palette.primary.dark,
        opacity: 1,
        border: "none",
      },
    },
    "&$focusVisible $thumb": {
      color: theme.palette.primary.light,
      border: "6px solid #fff",
    },
  },
  thumb: {
    width: 18,
    height: 18,
  },
  track: {
    borderRadius: 26 / 2,
    border: `1px solid ${theme.palette.grey[400]}`,
    backgroundColor: theme.palette.grey[50],
    opacity: 1,
    transition: theme.transitions.create(["background-color", "border"]),
  },
  checked: {},
  focusVisible: {},
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});

export const LightTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1],
    fontSize: 12,
    maxWidth: 400,
  },
}))(Tooltip);
