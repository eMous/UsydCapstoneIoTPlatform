import { useEffect } from "react";
import useTheme from "@material-ui/styles/useTheme";
import DataCard from "../components/DataCard";
import DataCardIcon from "../components/DataCardIcon";

const PaidFunds = ({ fundsAmt }) => {
  const theme = useTheme();
  const paidFundsIcon = (
    <DataCardIcon
      iconName="paid"
      iconBackgroundColour={theme.palette.secondary.main}
    />
  );

  // Formats the value into the desired readable value
  const formatter = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  });

  return (
    <DataCard
      title="Funds Paid Out"
      dataValue={formatter.format(fundsAmt)}
      displayIcon={paidFundsIcon}
    />
  );
};

export default PaidFunds;
