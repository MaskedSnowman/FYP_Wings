/*eslint-disable*/
import React, { useEffect, useState } from "react";
import "./Profile.css";
import { FaEdit } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

const Profile = () => {
  const token = JSON.parse(localStorage.getItem("authTokens"));
  const accessToken = token?.access;
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [bookingIds, setBookingIds] = useState([]);
  const [hotelbookingIds, setHotelbookingIds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [hbookings, setHbookings] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/profile", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setUser(response.data);
        setBookingIds(response.data.bookingID.split(',').map(booking => String(booking.trim())));
        setHotelbookingIds(response.data.hotelbookingID.split(',').map(booking => String(booking.trim())));
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    if (accessToken) {
      fetchUser();
    }
  }, [accessToken]);



  const handleSave = async () => {
    try {
      const response = await axios.put(
        "http://127.0.0.1:8000/api/profile2",
        {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setUser(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user:", error.response.data);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const fetchBookingDetails = async (bookingID) => {
    try {
      console.log("Fetching booking with ID:", bookingID); // Debugging log
      const response = await axios.get(`http://127.0.0.1:8000/api/getbooking?id=${bookingID}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching booking ${bookingID}:`, error);
    }
  };

  const bookingTable = async () => {
    const updatedBooking = [];
    for (const bookingId of bookingIds) {
      const bookingDetails = await fetchBookingDetails(bookingId);
      if (bookingDetails) {
        updatedBooking.push(bookingDetails);
      }
    };
    setBookings(updatedBooking);
  };

  useEffect(() => {
    if (bookingIds.length > 0) {
      bookingTable(); // Fetch details for each recipe ID
    }
  }, [bookingIds]);

  const fetchHotelBookingDetails = async (bookingID) => {
    try {
      console.log("Fetching booking with ID:", bookingID); // Debugging log
      const response = await axios.get(`http://127.0.0.1:8000/api/gethotelbooking?id=${bookingID}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching booking ${bookingID}:`, error);
    }
  };

  const hotelBookingTable = async () => {
    const updatedBooking = [];
    for (const hotelbookingId of hotelbookingIds) {
      const bookingDetails = await fetchHotelBookingDetails(hotelbookingId);
      if (bookingDetails) {
        updatedBooking.push(bookingDetails);
      }
    };
    setHbookings(updatedBooking);
  };

  useEffect(() => {
    if (hotelbookingIds.length > 0) {
      hotelBookingTable(); // Fetch details for each recipe ID
    }
  }, [hotelbookingIds]);

  const handleCancelBooking = async (bookingID) => {
    try {
      const confirmed = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, cancel it!",
      });

      if (confirmed.isConfirmed) {
        const response = await axios.post(
          `http://127.0.0.1:8000/api/cancelbooking`,{
            id: bookingID
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status === 200) {
          // Remove the canceled booking from state
          setHbookings((prevHBookings) =>
            prevHBookings.filter((booking) => booking.id !== bookingID)
          );
          Swal.fire("Canceled!", "Your booking has been canceled.", "success");
        } else {
          Swal.fire("Error!", "Failed to cancel booking.", "error");
        }
      }
    } catch (error) {
      console.error("Error canceling booking:", error);
      Swal.fire("Error!", "Failed to cancel booking.", "error");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <span className="profile-title">Account</span>
        <div className="profile-details">
          {isEditing ? (
            <>
              <div className="profile-item">
                <div className="profile-info">
                  <span className="profile-label">First Name:</span>
                  <input
                    type="text"
                    name="firstName"
                    value={user.firstName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="profile-item">
                <div className="profile-info">
                  <span className="profile-label">Last Name:</span>
                  <input
                    type="text"
                    name="lastName"
                    value={user.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="profile-item">
                <div className="profile-info">
                  <span className="profile-label">Email:</span>
                  <input
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="profile-item">
                <div className="profile-info">
                  <span className="profile-label">Phone:</span>
                  <input
                    type="text"
                    name="phone"
                    value={user.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="profile-item">
                <div className="profile-info">
                  <span className="profile-label">Password:</span>
                  <input
                    type="text"
                    name="password"
                    value={user.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <button className="profile-button" onClick={handleSave}>
                Save
              </button>
              <button
                className="profile-button"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <div className="profile-item">
                <div className="profile-info">
                  <span className="profile-label">First Name:</span>
                  <span className="profile-value">{user.firstName}</span>
                </div>
                <button
                  className="profile-button"
                  onClick={() => setIsEditing(true)}
                >
                  <div className="profile-button-content">
                    <FaEdit />
                    <span className="profile-button-text">Change</span>
                  </div>
                </button>
              </div>
              <div className="profile-item">
                <div className="profile-info">
                  <span className="profile-label">Last Name:</span>
                  <span className="profile-value">{user.lastName}</span>
                </div>
                <button
                  className="profile-button"
                  onClick={() => setIsEditing(true)}
                >
                  <div className="profile-button-content">
                    <FaEdit />
                    <span className="profile-button-text">Change</span>
                  </div>
                </button>
              </div>
              <div className="profile-item">
                <div className="profile-info">
                  <span className="profile-label">Email:</span>
                  <span className="profile-value">{user.email}</span>
                </div>
                <button
                  className="profile-button"
                  onClick={() => setIsEditing(true)}
                >
                  <div className="profile-button-content">
                    <FaEdit />
                    <span className="profile-button-text">Change</span>
                  </div>
                </button>
              </div>
              <div className="profile-item">
                <div className="profile-info">
                  <span className="profile-label">Phone:</span>
                  <span className="profile-value">{user.phone}</span>
                </div>
                <button
                  className="profile-button"
                  onClick={() => setIsEditing(true)}
                >
                  <div className="profile-button-content">
                    <FaEdit />
                    <span className="profile-button-text">Change</span>
                  </div>
                </button>
              </div>
              <div className="profile-item">
                <div className="profile-info">
                  <span className="profile-label">Password:</span>
                  <span className="profile-value">********</span>{" "}
                </div>
                <button
                  className="profile-button"
                  onClick={() => setIsEditing(true)}
                >
                  <div className="profile-button-content">
                    <FaEdit />
                    <span className="profile-button-text">Change</span>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Booking Details Section */}
      <div className="booking-details">
        <h2>Flight Bookings</h2>
        {bookings.length > 0 ? (
          <table className="booking-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Passenger Name</th>
                <th>Flight</th>
                <th>Departure Time</th>
                <th>Arrival Time</th>
                <th>Origin</th>
                <th>Destination</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.passenger_name}</td>
                  <td>{booking.flightname}</td>
                  <td>{new Date(booking.departure_time).toLocaleString()}</td>
                  <td>{new Date(booking.arrival_time).toLocaleString()}</td>
                  <td>{booking.origin}</td>
                  <td>{booking.destination}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No bookings found.</p>
        )}
      </div>
      {/* Booking Details Section */}
      <div className="booking-details">
        <h2>Hotel Bookings</h2>
        {bookings.length > 0 ? (
          <table className="booking-table">
            <thead>
              <tr>
                <th>Hotel Name</th>
                <th>Check In Date</th>
                <th>Check Out Date</th>
                <th>Booking Date</th>
                <th>Price</th>
                <th>Status</th>
                <th>Cancel Booking</th>
              </tr>
            </thead>
            <tbody>
              {hbookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.hotel_name}</td>
                  <td>{booking.check_in_date}</td>
                  <td>{booking.check_out_date}</td>
                  <td>{new Date(booking.booking_date).toLocaleString()}</td>
                  <td>{booking.total_price}</td>
                  <td>{booking.status}</td>
                  <td>
                    <button
                      className="cancel-booking-button"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No bookings found.</p>
        )}
      </div>

    </div>

  );
};

export default Profile;
