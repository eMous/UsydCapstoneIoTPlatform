import { Link } from "react-router-dom";
import useTheme from "@material-ui/styles/useTheme";
import DataCard from "../components/DataCard";
import DataCardIcon from "../components/DataCardIcon";
import routes from "routes";

const OverallProjects = ({ numProjs }) => {
  const theme = useTheme();
  const overallProjsIcon = (
    <DataCardIcon
      iconName="work"
      iconBackgroundColour={theme.palette.secondary.main}
    />
  );

  const formatter = new Intl.NumberFormat("en-AU", {
    style: "decimal",
    maximumFractionDigits: 0,
  });

  return (
    <Link
      style={{ textDecoration: "none" }}
      to={`${routes.authenticated.url}${routes.profile.url}`}
    >
      <DataCard
        title="Total Projects Running"
        dataValue={formatter.format(numProjs)}
        displayIcon={overallProjsIcon}
      />
    </Link>
  );
};

export default OverallProjects;
