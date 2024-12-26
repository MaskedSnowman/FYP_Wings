import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './FlightDetails.css'

const FlightDetails = () => {
    const { offerId } = useParams();
    const [flightDetails, setFlightDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
    const [bookingResult, setBookingResult] = useState(""); // Accepted or Rejected
    const [name, setName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [email, setEmail] = useState("");
    const token = JSON.parse(localStorage.getItem("authTokens"));
    const accessToken = token?.access;


    useEffect(() => {
        const fetchFlightDetails = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/getid`, {
                    params: {
                        id: offerId
                    },
                });
                setFlightDetails(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFlightDetails();
    }, [offerId]);

    const handleBookFlight = async () => {
        try {
            // Validate inputs
            if (!name || !cardNumber || !email) {
                toast.error("Please fill in all fields.");
                return;
            }
    
            // Simulate booking API call
            const response = await axios.post(`http://127.0.0.1:8000/api/createbooking`, {
                passenger_name: name,
                card: cardNumber,
                email: email,
                flightname: flightDetails.owner.name,
                logo: flightDetails.owner.logo_symbol_url,
                flightnumber: flightDetails.offerslices[0].segment[0].marketing_carrier_flight_number,
                departure_time: flightDetails.offerslices[0].segment[0].departing_at,
                arrival_time: flightDetails.offerslices[0].segment[0].arriving_at,
                origin: flightDetails.offerslices[0].segment[0].origin.iata_code,
                destination: flightDetails.offerslices[0].segment[0].destination.iata_code,
                currency: flightDetails.total_currency,
                base_amount: flightDetails.base_amount,
                tax_amount: flightDetails.tax_amount,
                total_amount: flightDetails.total_amount,
            },{
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Check response status
            if (response.data.status === 'accepted') {
                setBookingResult('accepted');
                setBookingDialogOpen(true);
            } else {
                setBookingResult('rejected');
                setBookingDialogOpen(true);
            }
        } catch (error) {
            console.error("Error booking flight:", error.message);
            // Show error toast using react-toastify
            toast.error("Booking failed. Please try again later.");
        }
    };    

    const handleCloseDialog = () => {
        setBookingDialogOpen(false);
        // Optionally reset form fields here
        setName("");
        setCardNumber("");
        setEmail("");
        setBookingResult("");  // Reset booking result state
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <div className="FlightDetails">
            <ToastContainer /> {/* React Toastify container */}
            {flightDetails && (
                <div className="flight-details-container">
                    <h2 className="section-title">Flight Details</h2>
                    <div className="flight-info">
                        <div className="logo">
                            <img
                                src={flightDetails.owner.logo_symbol_url}
                                alt="Airline Logo"
                            />
                        </div>
                        <div className="details">
                            <p className="airline">Airline: {flightDetails.owner.name}</p>
                            <p>
                                Total Amount: {flightDetails.total_amount}{" "}
                                {flightDetails.total_currency}
                            </p>
                            <p>
                                Base Amount: {flightDetails.base_amount}{" "}
                                {flightDetails.base_currency}
                            </p>
                            <p>
                                Tax Amount: {flightDetails.tax_amount}{" "}
                                {flightDetails.base_currency}
                            </p>
                            <p>
                                Total Emissions: {flightDetails.total_emissions_kg} kg
                            </p>
                        </div>
                    </div>
                    <h3 className="section-title">Flight Slices</h3>
                    {flightDetails.offerslices.map((slice, index) => (
                        <div key={index} className="slice">
                            <p className="segment-number">Segment {index + 1}</p>
                            <p>Duration: {slice.duration}</p>
                            <p>
                                Departure:{" "}
                                {new Date(slice.segment[0].departing_at).toLocaleString()}
                            </p>
                            <p>
                                Arrival:{" "}
                                {new Date(slice.segment[0].arriving_at).toLocaleString()}
                            </p>
                            <p>
                                Origin: {slice.segment[0].origin.iata_code} -{" "}
                                {slice.segment[0].origin.name}
                            </p>
                            <p>
                                Destination: {slice.segment[0].destination.iata_code} -{" "}
                                {slice.segment[0].destination.name}
                            </p>
                        </div>
                    ))}
                    <Button variant="contained" color="primary" onClick={() => setBookingDialogOpen(true)}>
                        Book Flight
                    </Button>

                    {/* Booking Form Dialog */}
                    <Dialog
                        open={bookingDialogOpen}
                        onClose={handleCloseDialog}
                        aria-labelledby="booking-dialog-title"
                    >
                        <DialogTitle id="booking-dialog-title">Book Flight</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="name"
                                label="Name"
                                type="text"
                                fullWidth
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <TextField
                                margin="dense"
                                id="cardNumber"
                                label="Card Number"
                                type="text"
                                fullWidth
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                            />
                            <TextField
                                margin="dense"
                                id="email"
                                label="Email Address"
                                type="email"
                                fullWidth
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDialog} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleBookFlight} color="primary">
                                Book
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Booking Result Dialog */}
                    <Dialog
                        open={bookingResult === 'accepted' || bookingResult === 'rejected'}
                        onClose={handleCloseDialog}
                        aria-labelledby="booking-result-dialog-title"
                    >
                        <DialogTitle id="booking-result-dialog-title">Booking Result</DialogTitle>
                        <DialogContent>
                            {bookingResult === 'accepted' ? (
                                <p>Your booking was accepted!</p>
                            ) : bookingResult === 'rejected' && (
                                <p>Sorry, your booking was rejected.</p>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDialog} color="primary" autoFocus>
                                OK
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            )}
        </div>
    );
};

export default FlightDetails;
