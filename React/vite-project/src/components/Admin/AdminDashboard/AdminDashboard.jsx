import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function AdminDashboard() {
  const [hotelBookings, setHotelBookings] = useState([]);
  const [cancelRequests, setCancelRequests] = useState([]);

  useEffect(() => {
    fetchHotelBookings();
    fetchCancelRequests();
  }, []);

  const fetchHotelBookings = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/hotel_bookings');
      setHotelBookings(response.data);
    } catch (error) {
      console.error('Error fetching hotel bookings:', error);
    }
  };

  const fetchCancelRequests = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/cancel_requests');
      setCancelRequests(response.data);
    } catch (error) {
      console.error('Error fetching cancel requests:', error);
    }
  };

  const handleApproveRequest = async (requestId, decision) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${decision === 'accept' ? 'approve' : 'reject'} this cancellation request?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    });

    if (isConfirmed) {
      try {
        const response = await axios.post(
          `http://127.0.0.1:8000/api/admin_cancel_booking`,
          {
            id: requestId,
            decision: decision,
          }
        );

        if (response.status === 200) {
          // Remove the approved/rejected request from state
          setCancelRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId));

          // Show success alert
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: `Cancellation request has been ${decision === 'accept' ? 'approved' : 'rejected'}.`,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to approve/reject cancellation request.',
          });
        }
      } catch (error) {
        console.error('Error approving/rejecting cancellation request:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to approve/reject cancellation request.',
        });
      }
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <h2>Hotel Bookings</h2>
      {hotelBookings.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Hotel Name</th>
              <th>Check In Date</th>
              <th>Check Out Date</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {hotelBookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.hotel_name}</td>
                <td>{booking.check_in_date}</td>
                <td>{booking.check_out_date}</td>
                <td>{booking.total_price}</td>
                <td>{booking.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hotel bookings found.</p>
      )}

      <h2>Requests to Cancel Bookings</h2>
      {cancelRequests.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Hotel Name</th>
              <th>Check In Date</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cancelRequests.map((request) => (
              <tr key={request.id}>
                <td>{request.id}</td>
                <td>{request.hotel_name}</td>
                <td>{request.check_in_date}</td>
                <td>{request.total_price}</td>
                <td>{request.status}</td>
                <td>
                  {request.status === 'Request to cancel' && (
                    <>
                      <button onClick={() => handleApproveRequest(request.id, 'accept')}>Approve</button>
                      <button onClick={() => handleApproveRequest(request.id, 'reject')}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No cancellation requests found.</p>
      )}
    </div>
  );
}

export default AdminDashboard;
