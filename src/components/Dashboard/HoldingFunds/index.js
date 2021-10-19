import useTheme from "@material-ui/styles/useTheme";
import DataCard from "../components/DataCard";
import DataCardIcon from "../components/DataCardIcon";

const HoldingFunds = ({ fundsAmt }) => {
  const theme = useTheme();
  const holdingFundsIcon = (
    <DataCardIcon
      iconName="account_balance"
      iconBackgroundColour={theme.palette.secondary.main}
    />
  );

  const formatter = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  });

  return (
    <DataCard
      title="Funds in Holding (To be paid)"
      dataValue={formatter.format(fundsAmt)}
      displayIcon={holdingFundsIcon}
    />
  );
};

export default HoldingFunds;
