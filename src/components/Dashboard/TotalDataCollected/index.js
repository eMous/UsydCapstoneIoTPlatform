import useTheme from "@material-ui/styles/useTheme";
import DataCard from "../components/DataCard";
import DataCardIcon from "../components/DataCardIcon";

const TotalDataCollected = ({ numRecords }) => {
  const theme = useTheme();
  const totalDataIcon = (
    <DataCardIcon
      iconName="insights"
      iconBackgroundColour={theme.palette.secondary.main}
    />
  );

  const formatter = new Intl.NumberFormat("en-AU", {
    style: "decimal",
    maximumFractionDigits: 0,
  });

  return (
    <DataCard
      title="Data Collected (Records)"
      dataValue={`${formatter.format(numRecords)}`}
      displayIcon={totalDataIcon}
    />
  );
};

export default TotalDataCollected;
