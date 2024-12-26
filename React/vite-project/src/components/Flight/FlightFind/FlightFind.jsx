import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoIosSearch } from "react-icons/io";
import "./FlightFind.css";
import { FaCoins } from "react-icons/fa";
import { IoStar } from "react-icons/io5";
import { GiCommercialAirplane } from "react-icons/gi";

const FlightFind = () => {
  const [flights, setFlights] = useState({ offers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { originCity2, travelCity2, departDate, arrivalDate } = useParams();
  const [depart, setDepart] = useState(new Date().toISOString().slice(0, 10));
  const navigate = useNavigate();
  const [arrival, setArrival] = useState(
    new Date(new Date().setDate(new Date().getDate() + 7))
      .toISOString()
      .slice(0, 10)
  );
  const [origin, setOrigin] = useState("");
  const [travel, setTravel] = useState("");
  const [minPrice, setMinPrice] = useState(200);
  const [maxPrice, setMaxPrice] = useState(4000);
  const [departure, setDeparture] = useState([1, 12]);

  const formatDuration = (duration) => {
    const regex = /^PT(\d+H)?(\d+M)?$/;
    const hoursMatch = duration.match(/(\d+)H/);
    const minutesMatch = duration.match(/(\d+)M/);
    const hours = hoursMatch ? hoursMatch[1] : "0";
    const minutes = minutesMatch ? minutesMatch[1] : "0";
    const formattedDuration = `${hours}h ${minutes}m`;
    return formattedDuration;
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const convertToRinggit = (amountInDollars) => {
    return (amountInDollars * 4.67).toFixed(2);
  };

  const handleViewDetails = (offerId) => {
    navigate(`/flightdetails/${offerId}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/getflight",
          {
            params: {
              origin: originCity2,
              destination: travelCity2,
              departure_date: departDate,
            },
          }
        );
        const data = response.data;

        const prices = data.offers.map((offer) =>
          parseFloat(offer.total_amount)
        );
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        setMinPrice(min);
        setMaxPrice(max);

        const sortedOffers = data.offers.sort(
          (a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount)
        );

        setFlights({
          ...data,
          offers: sortedOffers,
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [originCity2, travelCity2, departDate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/getflight", {
        params: {
          origin: origin,
          destination: travel,
          departure_date: depart,
        },
      });
      const data = response.data;

      const prices = data.offers.map((offer) =>
        parseFloat(offer.total_amount)
      );
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      setMinPrice(min);
      setMaxPrice(max);

      const sortedOffers = data.offers.sort(
        (a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount)
      );

      setFlights({
        ...data,
        offers: sortedOffers,
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (event, newValue) => {
    setMinPrice(newValue[0]);
    setMaxPrice(newValue[1]);
  };

  const handleDepartureChange = (event, newDeparture) => {
    setDeparture(newDeparture);
  };

  const filteredFlights = flights.offers.filter((offer) => {
    const totalAmount = parseFloat(offer.total_amount);
    return totalAmount >= minPrice && totalAmount <= maxPrice;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="FlightFind">
      <div className="container">
        <div className="Search-Container">
          <form className="form-inline" onSubmit={handleSubmit}>
            <div className="box">
              <label>From</label>
              <div className="input flex">
                <input
                  type="text"
                  placeholder="Enter Origin City"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
              </div>
            </div>
            <div className="box">
              <label>To</label>
              <div className="input flex">
                <input
                  type="text"
                  placeholder="Enter Travel City"
                  value={travel}
                  onChange={(e) => setTravel(e.target.value)}
                />
              </div>
            </div>
            <div className="box">
              <label>Depart</label>
              <div className="input flex">
                <input
                  type="date"
                  value={depart}
                  onChange={(e) => setDepart(e.target.value)}
                />
              </div>
            </div>
            <div className="box">
              <label>Return</label>
              <div className="input flex">
                <input
                  type="date"
                  value={arrival}
                  onChange={(e) => setArrival(e.target.value)}
                />
              </div>
            </div>
            <div className="box">
              <label>Passengers/Class</label>
              <div className="input flex">
                <input type="text" value="1 Passenger Economy" readOnly />
                <IoMdArrowDropdown className="ar-icon" />
              </div>
            </div>
            <div className="Search">
              <button type="submit">
                <IoIosSearch />
              </button>
            </div>
          </form>
        </div>
        <div className="bottom-container">
          <div className="Filter-Container">
            <form>
              <h1>Filter</h1>
              <label>Price</label>
              <div className="dollar">
                <Box className="slider" sx={{ width: 200 }}>
                  <Slider
                    className="price-range"
                    getAriaLabel={() => "Price range"}
                    value={[minPrice, maxPrice]}
                    onChange={handlePriceChange}
                    step={10}
                    min={200}
                    max={500}
                    marks={[
                      { value: 1000, label: "$1000" },
                      { value: 4000, label: "$4000" },
                    ]}
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
                  onChange={handleDepartureChange}
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
            </form>
          </div>
          <div className="Fox">
            <div className="Sort-Container">
              <button>
                <div className="sort">
                  <h2>
                    <FaCoins />
                    <span className="icon-text">Cheapest</span>
                  </h2>
                  <p>{minPrice}</p>
                </div>
              </button>
              <button>
                <div className="sort">
                  <h2>
                    <IoStar />
                    <span className="icon-text">Best</span>
                  </h2>
                  <p>{maxPrice}</p>
                </div>
              </button>
              <button>
                <div className="sort">
                  <h2>
                    <GiCommercialAirplane />
                    <span className="icon-text">Quickest</span>
                  </h2>
                  <p>$99</p>
                </div>
              </button>
            </div>
            {filteredFlights.map((offer, index) => (
              <div key={index} className="List-Container">
                <div className="logo">
                  <img
                    src={offer.owner.logo_symbol_url}
                    alt="Flight Logo"
                  />
                </div>
                <div className="rows-container">
                  <div className="row-1">
                    <p>
                      <span className="num">4.2</span>{" "}
                      {offer.owner.name}
                    </p>
                    <p className="price">
                      starting from
                      <br />
                      <span className="currency">
                        {offer.total_amount}
                        {/* {convertToRinggit(offer.total_amount)} */}
                      </span>
                    </p>
                  </div>
                  <div className="row-2">
                    <div className="slice-info"></div>
                    <div className="box">
                      <p className="flightD">
                        <span className="time">
                          {formatTime(
                            offer.offerslices[0].segment[0].departing_at
                          )}
                        </span>{" "}
                        -{"\t"}
                        <span className="time">
                          {formatTime(
                            offer.offerslices[0].segment[0].arriving_at
                          )}
                        </span>
                      </p>
                      <p className="stop"> Direct</p>
                      <p>
                        {formatDuration(
                          offer.offerslices[0].duration
                        )}
                        <br />
                        <p className="stop">
                          {flights.slices[0].origin.iata_code}-
                          {flights.slices[0].destination.iata_code}
                        </p>
                      </p>
                    </div>
                    <div className="visit">
                      <button
                        onClick={() =>
                          handleViewDetails(offer.id)
                        }
                      >
                        View Deals
                      </button>
                    </div>
                  </div>
                </div>{" "}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightFind;
