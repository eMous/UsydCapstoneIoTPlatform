import { Typography, Card } from "@material-ui/core";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import useStyles from "./styles";

const DataCard = ({ title, dataValue, displayIcon }) => {
  const classes = useStyles();
  return (
    <Card className={classes.cards}>
      <CardHeader
        classes={{ title: classes.title }}
        avatar={displayIcon}
        title={title}
      />
      <CardContent>
        <Typography variant="h3" color="textSecondary">
          {dataValue}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DataCard;
