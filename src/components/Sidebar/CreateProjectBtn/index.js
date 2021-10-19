import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import routes from "routes";
import useStyles from "./styles";
import { useHistory } from "react-router-dom";

const CreateProjectButton = () => {
  const classes = useStyles();
  let history = useHistory();

  return (
    <Button
      variant="contained"
      startIcon={<Icon>add</Icon>}
      className={classes.btn}
      onClick={() => {
        history.push(`${routes.authenticated.url}${routes.createProject.url}`);
      }}
    >
      New Project
    </Button>
  );
};

export default CreateProjectButton;
