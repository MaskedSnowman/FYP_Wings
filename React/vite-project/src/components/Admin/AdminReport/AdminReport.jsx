import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminReport.css'; // Import CSS file for styling
import '@fortawesome/fontawesome-free/css/all.css';

const AdminReport = () => {
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/admin_report');
        const data = response.data;
        setAdminData(data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div className="admin-report-container">
      <h1>Admin Report</h1>
      {adminData ? (
        <div className="admin-data-container">
          <div className="admin-data-item">
            <div className="data-icon"><i className="fas fa-calendar-alt"></i></div>
            <div className="data-info">
              <p className="data-label">Total Bookings</p>
              <p className="data-value">{adminData.total_bookings}</p>
            </div>
          </div>
          <div className="admin-data-item">
            <div className="data-icon"><i className="fas fa-plane"></i></div>
            <div className="data-info">
              <p className="data-label">Total Revenue from Flight Bookings</p>
              <p className="data-value">${adminData.total_revenue_flight}</p>
            </div>
          </div>
          <div className="admin-data-item">
            <div className="data-icon"><i className="fas fa-hotel"></i></div>
            <div className="data-info">
              <p className="data-label">Total Hotel Bookings</p>
              <p className="data-value">{adminData.total_hotel_bookings}</p>
            </div>
          </div>
          <div className="admin-data-item">
            <div className="data-icon"><i className="fas fa-dollar-sign"></i></div>
            <div className="data-info">
              <p className="data-label">Total Revenue from Hotel Bookings</p>
              <p className="data-value">${adminData.total_revenue_hotel}</p>
            </div>
          </div>
          <div className="admin-data-item">
            <div className="data-icon"><i className="fas fa-users"></i></div>
            <div className="data-info">
              <p className="data-label">Total Users</p>
              <p className="data-value">{adminData.total_users}</p>
            </div>
          </div>
          <div className="admin-data-item">
            <div className="data-icon"><i className="fas fa-user-shield"></i></div>
            <div className="data-info">
              <p className="data-label">Total Admin Users</p>
              <p className="data-value">{adminData.total_admins}</p>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default AdminReport;
