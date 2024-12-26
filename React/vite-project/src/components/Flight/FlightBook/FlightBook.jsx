/*eslint-disable*/
import React, { useState, useEffect } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaPaperPlane } from "react-icons/fa";
import "./FlightBook.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import hotelData from "../../../functions/HotelData";
import KL from "../../assets/KL.jpg";
import IncDec from "../../../functions/IncDec/IncDec";
import bkground from "../../assets/4.jpg";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { styled } from "@mui/system";
import Paper from "@mui/material/Paper";
import {
  Autocomplete,
  Popover,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";

const FlightBook = () => {
  const theme = useTheme();
  const [personName, setPersonName] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [originCity, setOriginCity] = useState("");
  const [travelCity, setTravelCity] = useState("");
  const [showReturnDate, setShowReturnDate] = useState(true); // Add state to control the visibility of the return date field
  const [departDate, setDepartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [arrivalDate, setArrivalDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 7))
      .toISOString()
      .slice(0, 10)
  );
  const [tripType, setTripType] = useState("Return");
  const navigate = useNavigate();

  useEffect(() => {
    setSuggestions(hotelData);
  }, []);

  useEffect(() => {
    if (tripType === "Return") {
      setArrivalDate(() => {
        const newDate = new Date(departDate);
        newDate.setDate(newDate.getDate() + 7);
        return newDate.toISOString().slice(0, 10);
      });
    }
  }, [departDate, tripType]);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName(typeof value === "string" ? value.split(",") : value);
  };

  const handleOriginCityChange = (event, value) => {
    setOriginCity(value.country + " (" + value.airport + ")");
  };

  const handleTravelCityChange = (event, value) => {
    setTravelCity(value.country + " (" + value.airport + ")");
  };

  const handleDepartDateChange = (event) => {
    setDepartDate(event.target.value);
  };

  const handleArrivalDateChange = (event) => {
    setArrivalDate(event.target.value);
  };

  const handleTripTypeChange = (event) => {
    const { value } = event.target;
    setTripType(value);
    setShowReturnDate(value === "Return");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Origin City:", originCity);
    console.log("Travel City:", travelCity);
    console.log("Departure Date:", departDate);
    console.log("Arrival Date:", arrivalDate);

    const originCity2 = originCity.split(' ')[1].replace('(', '').replace(')', '');
    const travelCity2 = travelCity.split(' ')[1].replace('(', '').replace(')', '');
    
    try {
      navigate(
        `/FlightFind/${originCity2}/${travelCity2}/${departDate}/${arrivalDate}`
      );
      } catch (error) {
      console.error("Error fetching flights:", error);
    }
  };

  const styles = {
    input: {
      borderRadius: "10px",
      backgroundColor: "#f4f4f4",
      width: "250px",
    },
    select: {
      height: "40px",
      fontSize: "16px",
      width: "100%",
      padding: "10px 14px",
      border: "none",
      background: "none",
      outline: "none",
    },
  };

  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      height: "50px",
      fontSize: "14px",
    },
    "& .MuiInputLabel-root": {
      fontSize: "14px",
    },
  };

  const PassengersClassDropdown = () => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;

    return (
      <div>
        <Box sx={styles.input} onClick={handleClick}>
          <TextField
            fullWidth
            value="1 Passenger Economy"
            readOnly
            variant="outlined"
            sx={{ input: styles.select }}
          />
        </Box>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <div className="List" style={{ padding: "20px" }}>
            <h1>Passengers</h1>
            <div className="row">
              <div className="label">
                <p>Adults</p>
                <p>12+ years</p>
              </div>
              <IncDec />
            </div>
            <div className="row">
              <div className="label">
                <p>Child</p>
                <p>2-11 years</p>
              </div>
              <IncDec minValue={0} />
            </div>
            <div className="row">
              <div className="label">
                <p>Infant</p>
                <p>&lt;2 years</p>
              </div>
              <IncDec minValue={0} />
            </div>
            <h1>Class</h1>
            <div className="row">
              <div className="label">
                <p>Economy</p>
              </div>
              <input type="radio" name="class" defaultChecked />
            </div>
            <div className="row">
              <div className="label">
                <p>Premium</p>
              </div>
              <input type="radio" name="class" />
            </div>
            <div className="button">
              <button onClick={handleClose}>Confirm</button>
            </div>
          </div>
        </Popover>
      </div>
    );
  };
  const StyledPaper = styled(Paper)(({ theme }) => ({
    "& .MuiAutocomplete-listbox": {
      display: "block",
    },
  }));

  //airport name, country name
  const countries = [
    { airport: "HND", country: "Japan" },
    { airport: "DXB", country: "United Arab Emirates" },
    { airport: "HKG", country: "Hong Kong" },
    { airport: "BKK", country: "Thailand" },
    { airport: "SIN", country: "Singapore" },
    { airport: "ICN", country: "South Korea" },
    { airport: "KUL", country: "Malaysia" },
    { airport: "DEL", country: "India" },
    { airport: "CGK", country: "Indonesia" },
    { airport: "TPE", country: "Taiwan" },
    { airport: "KIX", country: "Japan" },
    { airport: "PVG", country: "China" },
    { airport: "CAN", country: "China" },
    { airport: "BOM", country: "India" },
    { airport: "IST", country: "Turkey" },
    { airport: "SGN", country: "Vietnam" },
    { airport: "AUH", country: "United Arab Emirates" },
    { airport: "JED", country: "Saudi Arabia" },
    { airport: "DOH", country: "Qatar" },
    { airport: "KMG", country: "China" },
  ];

  return (
    <div className="FlightBook">
      <div className="BkImage">
        <img src={bkground} alt="Background" />
      </div>
      <div className="container">
        <div className="text">
          <h1>
            Make your travel <br />
            wishlist. we'll do <br />
            the rest
          </h1>
          <p>Special offers to suit your plan</p>
        </div>
        <div className="Search-Flight">
          <div className="text2">Where Are you Flying?</div>
          <form onSubmit={handleSubmit}>
            <div className="top-field">
              <div className="box">
                <br></br>
                <Autocomplete
                  disablePortal
                  options={countries}
                  getOptionLabel={(option) => option.label}
                  value={{ label: originCity }}
                  onChange={handleOriginCityChange}
                  sx={{ ...styles.input, display: "inline-block" }}
                  PaperComponent={StyledPaper}
                  renderOption={(props, option) => (
                    <Box
                      component="li"
                      sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                      {...props}
                    >
                      {option.country} ({option.airport})
                      </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="From"
                      variant="outlined"
                      sx={textFieldStyle}
                    />
                  )}
                />
              </div>
              <div className="box">
                <br></br>
                <Autocomplete
                  disablePortal
                  options={countries}
                  getOptionLabel={(option) => option.label}
                  value={{ label: travelCity }}
                  onChange={handleTravelCityChange}
                  sx={{ ...styles.input, display: "inline-block" }}
                  PaperComponent={StyledPaper}
                  renderOption={(props, option) => (
                    <Box
                      component="li"
                      sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                      {...props}
                    >
                      {option.country} ({option.airport})
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="To"
                      variant="outlined"
                      sx={textFieldStyle}
                    />
                  )}
                />
              </div>
              <div className="box">
                <InputLabel>Depart</InputLabel>
                <Box sx={styles.input}>
                  <TextField
                    type="date"
                    fullWidth
                    value={departDate}
                    onChange={handleDepartDateChange}
                    variant="outlined"
                    sx={{ input: styles.select }}
                  />
                </Box>
              </div>
              <div className="box">
                <InputLabel
                  style={{ display: showReturnDate ? "block" : "none" }} // Conditionally render based on state
                >
                  Return
                </InputLabel>
                <Box sx={styles.input}>
                  <TextField
                    type="date"
                    fullWidth
                    value={arrivalDate}
                    onChange={handleArrivalDateChange}
                    variant="outlined"
                    sx={{ input: styles.select }}
                    disabled={tripType === "One Way"}
                    style={{ display: showReturnDate ? "block" : "none" }} // Conditionally render based on state
                  />
                </Box>
              </div>
              <div className="box">
                <InputLabel>Trip Type</InputLabel>
                <FormControl component="fieldset">
                  <RadioGroup
                    row
                    aria-label="tripType"
                    name="tripType"
                    value={tripType}
                    onChange={handleTripTypeChange}
                  >
                    <FormControlLabel
                      value="One Way"
                      control={<Radio />}
                      label="One Way"
                    />
                    <FormControlLabel
                      value="Return"
                      control={<Radio />}
                      label="Return"
                    />
                  </RadioGroup>
                </FormControl>
              </div>
              <div className="box">
                <InputLabel>Passengers/Class</InputLabel>
                <PassengersClassDropdown />
              </div>
            </div>
            <div className="buttons">
              <button type="submit">
                <FaPaperPlane /> Show Flights
              </button>
            </div>
          </form>
        </div>
        <div className="Suggestions">
          <div className="text">
            <h1>Plan your perfect trip</h1>
            <h3>Search Flights & places to our most popular destinations</h3>
          </div>
          <div className="suggest">
            {/* {hotelData.map((country, countryIndex) =>
              country.Cities.map((city, cityIndex) =>
                city.Hotels.map((hotel, hotelIndex) => (
                  <div
                    className="box"
                    key={`${countryIndex}-${cityIndex}-${hotelIndex}`}
                  >
                    <img src={KL} alt="Hotel" />
                    <div className="details">
                      <h3>
                        {city.CityName}, {country.CountryName}
                      </h3>
                      <p>{hotel.fields.name}</p>
                    </div>
                  </div>
                ))
              )
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightBook;
