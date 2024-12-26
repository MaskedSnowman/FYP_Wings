/* eslint-disable */
// duffel_test_1OaZBRT0a0FYvwwuY4ujvvUh21kh9BfeAZ710IoEqE1
// WMViSiFFIXrAillNqjpYP9CnzRtx2aMc
import React, { useContext } from "react";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import FlightBook from "./components/Flight/FlightBook/FlightBook";
import HotelList from "./components/Hotel/HotelList/HotelList";
import FlightList from "./components/Flight/FlightList/FlightList";
import FlightFind from "./components/Flight/FlightFind/FlightFind";
import HotelFind from "./components/Hotel/HotelFind/HotelFind";
import Login from "./components/Sign/Login/Login";
import SignUp from "./components/Sign/SignUp/SignUp";
import Login2 from "./components/Sign/Login2/Login2";
import { Route, Routes, Navigate } from "react-router-dom";
import Error from "./functions/ErrorPage/Error";
import HotelBook from "./components/Hotel/HotelBook/HotelBook";
import Amadeus from "./components/Flight/FlightFind/Amadeus";
import Profile from "./components/Sign/Profile/Profile";
import { AuthProvider } from "./functions/Authprovider/authprovider";
import Sad from "./functions/Payment/components";
import FlightDetails from "./components/Flight/FlightDetails/FlightDetails";
import HotelPage from "./components/Hotel/HotelList/HotelPage";
import AdminDashboard from "./components/Admin/AdminDashboard/AdminDashboard";
import AdminRoute from "./functions/Authprovider/AdminRoute";
import AdminReport from "./components/Admin/AdminReport/AdminReport";

// import { AuthContext } from "./functions/Authprovider/authprovider";
const App = () => {
  // const { isAuthenticated } = useContext(AuthContext); // Get authentication status from context

  return (
    <>
      <AuthProvider>
        <Navbar />

        <Routes>
          <Route path="/" element={<FlightBook />} />
          <Route path="/HotelBook" element={<HotelBook />} />
          <Route path="/FlightList" element={<FlightList />} />
          <Route path="/HotelList" element={<HotelList />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/Login" element={<Login2 />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/Booking" element={<Sad />} />
          <Route path="/*" element={<Error />} />
          <Route path="/killme" element={<Amadeus />} />
          <Route
            path="/FlightFind/:originCity2/:travelCity2/:departDate/:arrivalDate"
            element={<FlightFind />}
          />
          <Route
            path="/FlightDetails/:offerId"
            element={<FlightDetails />}
          />
          <Route path="/hotel/:id/:checkInDate/:checkOutDate" element={<HotelPage />} />
          <Route
            path="/HotelFind/:travelCity/:checkInDate/:checkOutDate"
            element={<HotelFind />}
          />
          <Route
            path="/AdminDashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
          <Route
            path="/AdminReport"
            element={
              <AdminRoute>
                <AdminReport />
              </AdminRoute>
            } />

        </Routes>
      </AuthProvider>
    </>
  );
};

export default App;
