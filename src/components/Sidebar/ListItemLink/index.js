import { useMemo, forwardRef } from "react";
import { Link } from "react-router-dom";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Icon from "@material-ui/core/Icon";
import useStyles from "./styles";

const ListItemLink = (props) => {
  const classes = useStyles();
  const { primary, to, iconName } = props;

  const renderLink = useMemo(
    () =>
      forwardRef((itemProps, ref) => <Link to={to} ref={ref} {...itemProps} />),
    [to]
  );

  return (
    <li>
      <ListItem button component={renderLink} className={classes.listItems}>
        {iconName ? (
          <ListItemIcon>
            <Icon className={classes.listIcons}>{iconName}</Icon>
          </ListItemIcon>
        ) : null}
        <ListItemText
          primary={primary}
          classes={{ primary: classes.listItemsText }}
        />
      </ListItem>
    </li>
  );
};

export default ListItemLink;
