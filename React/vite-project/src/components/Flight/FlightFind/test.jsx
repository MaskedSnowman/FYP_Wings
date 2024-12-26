/*eslint-disable */
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
const test = () => {
  const [departure, setDeparture] = useState([0, 12]);

  const handleChange2 = (event, newDeparture) => {
    setDeparture(newDeparture);
  };
  return (
    <body>
      <label>Departure Time</label>
      <Box className="slider" sx={{ width: 200 }}>
        <Slider
          className="departure-range"
          getAriaValueText={"price range"}
          value={departure}
          onChange={handleChange2}
          min={1}
          max={12}
          valueLabelDisplay="auto"
        />
      </Box>
    </body>
  );
};
export default test;
