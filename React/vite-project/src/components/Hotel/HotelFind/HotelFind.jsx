/* eslint-disable */
import axios from "axios";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import Slider from "@mui/material/Slider";
import { useParams } from "react-router-dom";
import { IoMdArrowDropdown, IoIosSearch } from "react-icons/io";
// import { FaLocationDot } from "react-icons/fa";
import { FaCoins, FaPlaneDeparture } from "react-icons/fa";
import { IoStar } from "react-icons/io5";
import { GiCommercialAirplane } from "react-icons/gi";
import "./HotelFind.css";
import Logo from "../../assets/L1.jpg";
import Fly1 from "../../assets/BUDGETAIR.png";
import { useNavigate } from 'react-router-dom';

const HotelFind = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [destinationCity, setDestinationCity] = useState("");
  const [checkIn, setCheckIn] = useState(new Date().toISOString().slice(0, 10));
  const [checkOut, setCheckOut] = useState(
    new Date(new Date().setDate(new Date().getDate() + 7))
      .toISOString()
      .slice(0, 10)
  );
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [departure, setDeparture] = useState([1, 12]);
  const { travelCity, checkInDate, checkOutDate } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/recommend/${travelCity}`);
        const fetchedHotels = response.data;
        // Calculate min and max prices from fetched hotels
        if (fetchedHotels.length > 0) {
          const prices = fetchedHotels.map(hotel => {
            const priceStr = hotel.room_types_price.split('per night],[')[0].substring(5).replace(',', ''); // Remove commas
            return parseInt(priceStr);
          });
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setMinPrice(min);
          setMaxPrice(max);
          console.log("1"+min+max);
          // Sort hotels by price ascending
          fetchedHotels.sort((a, b) => {
            const priceA = parseInt(a.room_types_price.split('per night],[')[0].substring(5).replace(',', ''));
            const priceB = parseInt(b.room_types_price.split('per night],[')[0].substring(5).replace(',', ''));
            return priceA - priceB;
          });
        }
        setHotels(fetchedHotels);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [travelCity, checkInDate, checkOutDate]);

  const handleDestinationCityChange = (event) => {
    setDestinationCity(event.target.value);
  };

  const handleCheckInDateChange = (event) => {
    setCheckIn(event.target.value);
  };

  const handleCheckoutDateChange = (event) => {
    setCheckOut(event.target.value);
  };

  const handleChange = (event, newValue) => {
    setMinPrice(newValue[0]);
    setMaxPrice(newValue[1]);
  };

  const handleChange2 = (event, newDeparture) => {
    setDeparture(newDeparture);
  };

  const convertReviewScoreToStars = (score) => {
    return score;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/gethotel", {
        params: {
          city: destinationCity,
          arrival_date: checkIn,
          departure_date: checkOut,
        },
      });
      setHotels(response.data.hotels);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleViewDeals = (hotelId) => {
    navigate(`/hotel/${hotelId}/${checkInDate}/${checkOutDate}`);
  };

  const filteredHotels = hotels.filter(hotel => {
    if (minPrice === null || maxPrice === null) {
      return true; // Return all hotels if minPrice or maxPrice is not yet set
    }
    const price = parseInt(hotel.room_types_price.split('per night],[')[0].substring(5).replace(',', ''));
    return price >= minPrice && price <= maxPrice;
  });
  
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="HotelFind">
      <div className="container">
        <div className="bottom-container">
          <div className="Filter-Container">
            <form onSubmit={handleSubmit}>
              <h1>Filter</h1>
              <label>Price</label>
              <div className="dollar">
                <Box className="slider" sx={{ width: 200 }}>
                  <Slider
                    className="price-range"
                    getAriaLabel={() => "Price range"}
                    value={[minPrice, maxPrice]}
                    onChange={handleChange}
                    step={20}
                    min={0}
                    max={50000}
                    valueLabelDisplay="auto"
                  />
                </Box>
              </div>
              <label>Departure Time</label>
              <Box className="slider" sx={{ width: 200 }}>
                <Slider
                  className="departure-range"
                  getAriaLabel={() => "Departure range"}
                  value={departure}
                  onChange={handleChange2}
                  min={0}
                  max={12}
                  marks={[
                    { value: 1, label: "1 AM" },
                    { value: 6, label: "6 AM" },
                    { value: 12, label: "12 PM" },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
              <button type="submit">Search</button>
            </form>
          </div>
          <div className="Fox">
            <div className="Sort-Container">
              <button>
                <div className="sort">
                  <h2>
                    <span className="icon-text">Hotels</span>
                  </h2>
                  <p>{filteredHotels.length} places</p>
                </div>
              </button>
              <button>
                <div className="sort">
                  <h2>
                    <span className="icon-text">Motels</span>
                  </h2>
                  <p>0 places</p>
                </div>
              </button>
              <button>
                <div className="sort">
                  <h2>
                    <span className="icon-text">Resorts</span>
                  </h2>
                  <p>0 places</p>
                </div>
              </button>
            </div>
            {filteredHotels.length > 0 ? (
              filteredHotels.map((hotel, index) => (
                <div key={index} className="List-Container">
                  <div className="logo">
                    <img src={hotel.images.split(',')[0]} alt="Hotel Logo" />
                  </div>
                  <div className="rows-container">
                    <div className="row-1">
                      <h1>{hotel.hotel_name}</h1>
                      <p className="price">
                        starting from
                        <br />
                        <span className="currency">
                          ${hotel.room_types_price.split('per night],[')[0].substring(5)}
                        </span>
                      </p>
                    </div>
                    <div className="row-2">
                      <div className="box">
                        <p className="flightD">
                          <span className="HLoc">
                            {/* <FaLocationDot /> */}
                            {hotel.location_city}
                          </span>
                          <Box
                            sx={{
                              width: 200,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Rating
                              name="text-feedback"
                              value={convertReviewScoreToStars(
                                hotel.rating
                              )}
                              readOnly
                              precision={0.5}
                              emptyIcon={
                                <StarIcon
                                  style={{ opacity: 0.55 }}
                                  fontSize="inherit"
                                />
                              }
                            />
                          </Box>
                        </p>
                      </div>
                      <div className="box">
                        <p>
                          {/* <span className="num">{hotel.rating}</span>{" "}
                          {hotel.rating}{" "}
                          <span className="stop">
                            ({hotel.rating} reviews)
                          </span> */}
                        </p>
                      </div>
                    </div>
                    <div className="visit">
                      <button onClick={() => handleViewDeals(hotel.id)}>View Deals</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div>No hotels found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelFind;
