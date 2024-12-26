/* eslint-disable */
import './HotelBook.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowDropdown } from 'react-icons/io';
import { RiHotelFill } from 'react-icons/ri';
import bkground from '../../assets/hotelbk.jpg';
import IncDec from '../../../functions/IncDec/IncDec';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { styled } from "@mui/system";
import Paper from "@mui/material/Paper";

const HotelBook = () => {
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const [travelCity, setTravelCity] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().slice(0, 10));
  const [checkOutDate, setCheckOutDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().slice(0, 10)
  );

  useEffect(() => {
    const fetchCitySuggestions = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/hotel_list');
        setCitySuggestions(response.data); // Assuming response.data is an array of city names
      } catch (error) {
        console.error('Error fetching city suggestions:', error);
      }
    };

    fetchCitySuggestions();
  }, []);

  useEffect(() => {
    setCheckOutDate(() => {
      const newDate = new Date(checkInDate);
      newDate.setDate(newDate.getDate() + 7);
      return newDate.toISOString().slice(0, 10);
    });
  }, [checkInDate]);

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

  const StyledPaper = styled(Paper)(({ theme }) => ({
    '& .MuiAutocomplete-listbox': {
      display: 'block',
    },
  }));

  const handleTravelCityChange = (event, value) => {
    setTravelCity(value);
  };

  const handleCheckInDateChange = (event) => {
    setCheckInDate(event.target.value);
  };

  const handleCheckoutDateChange = (event) => {
    setCheckOutDate(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      navigate(`/HotelFind/${travelCity}/${checkInDate}/${checkOutDate}`);
    } catch (error) {
      console.error('Error:', error);
    }

    console.log('Travel City:', travelCity);
    console.log('Checkin_Date:', checkInDate);
    console.log('Checkout_Date:', checkOutDate);
  };

  return (
    <div className="HotelBook">
      <div className="BkImage">
        <img src={bkground} alt="background" />
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
        <div className="Search-Hotel">
        <div className="text2">Where are you staying?</div>
        <form onSubmit={handleSubmit}>
            <div className="top-field">
              <div className="box">
                {/* <label>Enter Destination</label> */}
                <br></br>
                <div className="input flex">
                  <Autocomplete
                    disablePortal
                    value={travelCity}
                    onChange={handleTravelCityChange}
                    options={citySuggestions}
                    PaperComponent={StyledPaper}
                    sx={{ ...styles.input, display: "inline-block" }}
                    renderInput={(params) => (
                      <TextField {...params} label="Enter Destination" variant="outlined" sx={ textFieldStyle } />
                    )}
                  />
                </div>
              </div>
              <div className="box">
                <label>Check In</label>
                <div className="input flex">
                  <input type="date" value={checkInDate} onChange={handleCheckInDateChange} />
                </div>
              </div>
              <div className="box">
                <label>Check Out</label>
                <div className="input flex">
                  <input type="date" value={checkOutDate} onChange={handleCheckoutDateChange} />
                </div>
              </div>
              <div className="box">
                <label>Rooms & Guests</label>
                <div className="input flex">
                  <input type="text" value="1 Room 1 Guest" readOnly />
                  <IoMdArrowDropdown className="ar-icon" />
                </div>
                <div className="List">
                  <h1>Guests</h1>
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
                  <h1>Room Type</h1>
                  <div className="row">
                    <div className="label">
                      <p>Standard</p>
                    </div>
                    <input type="radio" name="class" checked />
                  </div>
                  <div className="row">
                    <div className="label">
                      <p>Deluxe</p>
                    </div>
                    <input type="radio" name="class" />
                  </div>
                  <div className="button">
                    <button>Confirm</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="buttons">
              <button type="submit">
                <RiHotelFill />
                Show Hotels
              </button>
            </div>
          </form>
        </div>
        <div className="Suggestions">
          <div className="text">
            <h1>Plan your perfect trip</h1>
            <h3>Search Hotels & places to our most popular destinations</h3>
          </div>
          <div className="suggest">
            {/* Placeholder content for hotel suggestions */}
            {/* Replace with actual hotel suggestion components */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelBook;
