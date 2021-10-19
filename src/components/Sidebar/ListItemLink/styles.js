import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  listItems: {
    marginTop: "2.5rem",
  },
  listIcons: {
    color: theme.palette.primary.dark,
  },
  listItemsText: {
    color: theme.palette.primary.dark,
    fontSize: "1rem",
    fontWeight: "bold",
  },
}));

export default useStyles;
