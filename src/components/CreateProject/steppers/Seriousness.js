import React from "react";
import { Select, MenuItem, InputLabel, FormControl } from "@material-ui/core";
import { useStyles, LightTooltip } from "../styles";

export function Seriousness({ currentSeriousness, getValue, disabled }) {
  const classes = useStyles();
  return (
    <LightTooltip
      title="Choose how related this factor affects your matchmaking (from 1 to 5, 5 is the most)."
      arrow
    >
      <FormControl variant="standard" className={classes.seriousness}>
        <InputLabel id="seriousness-select">Level</InputLabel>
        <Select
          disabled={disabled}
          margin="dense"
          label="seriousness"
          defaultValue="5"
          value={currentSeriousness}
          onChange={(e) => {
            getValue(parseInt(e.target.value));
          }}
        >
          <MenuItem value="1">1</MenuItem>
          <MenuItem value="2">2</MenuItem>
          <MenuItem value="3">3</MenuItem>
          <MenuItem value="4">4</MenuItem>
          <MenuItem value="5">5</MenuItem>
        </Select>
      </FormControl>
    </LightTooltip>
  );
}
