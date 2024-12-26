import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './HotelPage.css';

const HotelPage = () => {
    const { id, checkInDate, checkOutDate } = useParams();
    const [hotel, setHotel] = useState(null);
    const [recommendedHotels, setRecommendedHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
    const [bookingResult, setBookingResult] = useState(""); // Accepted or Rejected
    const [name, setName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [email, setEmail] = useState("");
    const [selectedRoomType, setSelectedRoomType] = useState(null); // Track selected room type for booking
    const [roomCounts, setRoomCounts] = useState({}); // State to track number of rooms selected for each type
    const [bookedHotels, setBookedHotels] = useState([]); // State to track booked hotels
    const token = JSON.parse(localStorage.getItem("authTokens"));
    const accessToken = token?.access;

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/hotel/${id}`);
                const parsedHotel = parseHotelData(response.data);
                console.log(response.data);
                setHotel(parsedHotel);

                const city = parsedHotel.location_city;
                const recommendedResponse = await axios.get(`http://127.0.0.1:8000/api/recommend/${city}?exclude_id=${id}`);
                setRecommendedHotels(recommendedResponse.data);

                // Initialize room counts based on room types
                const initialRoomCounts = {};
                parsedHotel.roomTypes.forEach(room => {
                    initialRoomCounts[room.name] = 1; // Default to 1 room per type
                });
                setRoomCounts(initialRoomCounts);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHotel();
    }, [id]);

    const handleBookingResultDialogClose = () => {
        setBookingResult(null); // Reset booking result state
    };

    const parseHotelData = (data) => {
        const roomTypesName = data.room_types_name.split(',').filter(name => name.trim() !== '');
        const roomTypesDescription = data.room_types_description.split('],[').map(description => {
            return description.replace('[', '').replace(']', '').trim();
        });
        const roomTypesMaxOccupancy = data.room_types_max_occupancy.split('],[').map(occupancy => {
            return occupancy.replace('[', '').replace(']', '').trim();
        });
        const roomTypesAmenities = data.room_types_amenities.split('],[').map(amenities => {
            return amenities.replace('[', '').replace(']', '').split(',')
                .map(item => item.trim().charAt(0).toUpperCase() + item.trim().slice(1))
                .join(', ');
        });
        const roomTypesPrice = data.room_types_price.split('],[').map(price => {
            console.log("1"+price);
            if (price.trim() !== '') {
                console.log("2"+price);
                const parts = price.split('per night],[');
                console.log("3"+parts);
                const amount = parts[0].substring(4).trim(); // Extracting the amount, removing "INR "
                console.log("4"+amount);
                return parseFloat(amount.replace(/,/g, '')); // Remove commas and parse to float
            } else {
                return null;
            }
        }).filter(price => price !== null);
            
        const roomTypesImageLinks = data.room_types_image_link.split('],[').map(link => {
            return link.replace('[', '').replace(']', '').trim();
        });

        const rooms = roomTypesName.map((name, index) => ({
            name: name.trim(),
            description: roomTypesDescription[index],
            maxOccupancy: roomTypesMaxOccupancy[index],
            amenities: roomTypesAmenities[index],
            price: roomTypesPrice[index],
            image: roomTypesImageLinks[index]
        }));

        return {
            ...data,
            roomTypes: rooms
        };
    };

    const handleBookRoom = (roomType) => {
        // Find the selected room type based on the room name
        const selectedRoom = hotel.roomTypes.find(room => room.name === roomType);
        if (selectedRoom) {
            setSelectedRoomType(selectedRoom);
            setBookingDialogOpen(true);
        } else {
            toast.error('Room details not found.');
        }
    };

    const handleCancelBooking = () => {
        setBookingDialogOpen(false);
        setName("");
        setCardNumber("");
        setEmail("");
        setSelectedRoomType(null);
        setRoomCounts(prevCounts => {
            const resetCounts = {};
            Object.keys(prevCounts).forEach(key => resetCounts[key] = 1); // Reset all room counts to 1
            return resetCounts;
        });
    };

    const handleRoomCountChange = (event, roomType) => {
        const count = event.target.value;
        setRoomCounts(prevCounts => ({
            ...prevCounts,
            [roomType]: count,
        }));
    };

    const handleRoomIncrement = (roomType) => {
        setRoomCounts(prevCounts => ({
            ...prevCounts,
            [roomType]: prevCounts[roomType] + 1
        }));
    };

    const handleRoomDecrement = (roomType) => {
        if (roomCounts[roomType] > 1) {
            setRoomCounts(prevCounts => ({
                ...prevCounts,
                [roomType]: prevCounts[roomType] - 1
            }));
        }
    };

    const handleOpenBookingDialog = (roomType) => {
        setSelectedRoomType(roomType);
        setBookingDialogOpen(true);
    };

    const handleBookRoomConfirm = async () => {
        try {
            // Validate inputs
            if (!name || !cardNumber || !email) {
                toast.error('Please fill in all fields.');
                return;
            }

            // Calculate total price based on number of rooms
            const roomPrice = selectedRoomType?.price;
            if (!roomPrice) {
                toast.error('Room price not available.');
                return;
            }
            const totalPrice = parseFloat(roomPrice) * roomCounts[selectedRoomType.name];

            // Simulate booking API call
            const response = await axios.post(`http://127.0.0.1:8000/api/hotelbook`, {
                hotel_id: hotel.id,
                hotel_name: hotel.hotel_name,
                name: name,
                card_number: cardNumber,
                email: email,
                check_in_date: checkInDate,
                check_out_date: checkOutDate,
                room_type: selectedRoomType.name,
                number_of_rooms: roomCounts[selectedRoomType.name],
                total_price: totalPrice
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Check response status
            if (response.data.status === 'accepted') {
                setBookingResult('accepted');
                setBookingDialogOpen(false); // Close dialog after booking
                // Add booked hotel to the list
                setBookedHotels(prevBookedHotels => [
                    ...prevBookedHotels,
                    {
                        hotelName: hotel.hotel_name,
                        roomType: selectedRoomType.name,
                        numberOfRooms: roomCounts[selectedRoomType.name],
                        totalPrice: totalPrice
                    }
                ]);
            } else {
                setBookingResult('rejected');
                setBookingDialogOpen(false); // Close dialog after booking
            }
        } catch (error) {
            console.error('Error booking room:', error.message);
            toast.error('Booking failed. Please try again later.');
        }
    };

    if (!hotel) return <div className="loading">Loading...</div>;

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000
    };

    return (
        <div className="hotel-page">
            <h1>{hotel.hotel_name}</h1>
            <Slider {...settings} className="image-slider">
                {hotel.images.split(', ').map((url, index) => (
                    <div key={index}>
                        <img src={url.trim()} alt={`Hotel Image ${index + 1}`} />
                    </div>
                ))}
            </Slider>
            <div className="hotel-details">
                <p><strong>Address:</strong> {hotel.location_address}, {hotel.location_city}, {hotel.location_country}</p>
                <p><strong>Postal Code:</strong> {hotel.location_postal_code}</p>
                <p><strong>Rating:</strong> {hotel.rating}</p>
                <p><strong>Check-in:</strong> {hotel.check_in_time}, <strong>Check-out:</strong> {hotel.check_out_time}</p>
                <p><strong>Nearest Airport:</strong> {hotel.nearest_airport_name} ({hotel.nearest_airport_code}), {hotel.nearest_airport_distance_km} km</p>
            </div>
            <div className="rooms">
                <h2>Rooms</h2>
                <div className="room-cards">
                    {hotel.roomTypes.map((room, index) => (
                        <div className="room-card" key={index}>
                            <img src={room.image} alt={room.name} />
                            <h3>{room.name}</h3>
                            <p>{room.description}</p>
                            <p><strong>Max Occupancy:</strong> {room.maxOccupancy}</p>
                            <p><strong>Amenities:</strong> {room.amenities}</p>
                            <p><strong>Price:</strong> ${room.price} per night</p>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={6}>
                                    <Button variant="contained" color="primary" onClick={() => handleBookRoom(room.name)}>
                                        Book Room
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button variant="outlined" color="primary" onClick={() => handleRoomDecrement(room.name)}>
                                        -
                                    </Button>
                                    <span style={{ margin: '0 10px' }}>{roomCounts[room.name]}</span>
                                    <Button variant="outlined" color="primary" onClick={() => handleRoomIncrement(room.name)}>
                                        +
                                    </Button>
                                </Grid>
                            </Grid>
                        </div>
                    ))}
                </div>
            </div>
            <div className="recommended-hotels">
                <h2>Recommended Hotels in {hotel.location_city}</h2>
                <div className="hotel-cards">
                    {recommendedHotels.map(recHotel => (
                        <div className="hotel-card" key={recHotel.id}>
                            {/* <img src={room.images} alt={room.name} /> */}
                            <img src={recHotel.images.split(',')[0].trim()} alt={recHotel.name} />
                            <h3>{recHotel.hotel_name}</h3>
                            <p>{recHotel.location_address}, {recHotel.location_city}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Booking Form Dialog */}
            <Dialog
                open={bookingDialogOpen}
                onClose={handleCancelBooking}
                aria-labelledby="booking-dialog-title"
            >
                <DialogTitle id="booking-dialog-title">Book Room</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            {selectedRoomType && (
                                <>
                                    <h3>{selectedRoomType.name}</h3>
                                    <p>{selectedRoomType.description}</p>
                                    <p><strong>Price per Room:</strong> ${selectedRoomType.price} per night</p>
                                    <p><strong>Total Price ({roomCounts[selectedRoomType.name]} rooms):</strong> ${parseFloat(selectedRoomType.price) * roomCounts[selectedRoomType.name]}</p>
                                </>
                            )}
                        </Grid>
                        <Grid item xs={6}>
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
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelBooking} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleBookRoomConfirm} color="primary">
                        Book
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Booking Result Dialog */}
            <Dialog
                open={bookingResult === 'accepted' || bookingResult === 'rejected'}
                onClose={handleBookingResultDialogClose}
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
                    <Button onClick={handleBookingResultDialogClose} color="primary" autoFocus>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Display Booked Hotels */}
            {/* {bookedHotels.length > 0 && (
                <div className="booked-hotels">
                    <h2>Booked Hotels</h2>
                    <ul>
                        {bookedHotels.map((booking, index) => (
                            <li key={index}>
                                <strong>{booking.hotelName}</strong> - {booking.roomType}, {booking.numberOfRooms} rooms, Total: ${booking.totalPrice}
                            </li>
                        ))}
                    </ul>
                </div>
            )} */}
        </div>
    );
};

export default HotelPage;
