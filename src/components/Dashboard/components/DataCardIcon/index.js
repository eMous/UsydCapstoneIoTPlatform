import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Icon from "@material-ui/core/Icon";

const DataCardIcon = ({ iconName, iconBackgroundColour }) => {
  const useStyles = makeStyles((theme) => ({
    rounded: {
      color: theme.palette.getContrastText(iconBackgroundColour),
      backgroundColor: iconBackgroundColour,
    },
  }));

  const classes = useStyles();

  return (
    <Avatar variant="rounded" className={classes.rounded}>
      <Icon>{iconName}</Icon>
    </Avatar>
  );
};

export default DataCardIcon;
