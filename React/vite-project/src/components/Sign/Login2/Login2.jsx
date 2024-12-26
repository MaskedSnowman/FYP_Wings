import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Alert } from "@mui/material";
import "./Login2.css";
import Image from "../../assets/1.jpg";
import AuthContext from "../../../functions/Authprovider/authprovider";

// axios.defaults.xsrfCookieName = "csrftoken";
// axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.withCredentials = true;

function Login2() {
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigateTo = useNavigate();
  const { loginUser } = useContext(AuthContext);

  // useEffect(() => {
  //   const checkAuthStatus = async () => {
  //     try {
  //       const response = await axios.get("http://127.0.0.1:8000/api/user");
  //       if (response.status === 200) {
  //         setIsAuthenticated(true);
  //       }
  //     } catch (err) {
  //       setIsAuthenticated(false);
  //     }
  //   };
  //   checkAuthStatus();
  // }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // const email = e.target.email.value
    // const password = e.target.password.value

    loginUser(email, password);
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     console.log("Attempting login with:", email, password); // Debugging log
  //     const response = await axios.post("http://127.0.0.1:8000/api/login", {
  //       email,
  //       password,
  //     });
  //     console.log("Login response:", response); // Debugging log
  //     if (response.status === 200) {
  //       setIsAuthenticated(true);
  //       navigateTo("/Profile");
  //     }
  //   } catch (err) {
  //     console.error("Login failed:", err);
  //     setError("Email or password is incorrect.");
  //   }
  // };

  // if (isAuthenticated) {
  //   return navigateTo("/Profile");
  // }

  return (
    <div className="MainLogin">
      <div className="container">
        <div className="Log">
          <div className="text">
            <h1>Login</h1>
            <p>Login to access your account.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="Part-2">
              <div className="input-field">
                <label>Email</label>
                <input
                  type="text"
                  name="email"
                  placeholder="john.doe@gmail.com"
                  value={email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-field">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="*******"
                  value={password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="Login-button">
              <button type="submit">Login</button>
            </div>
          </form>
          {error && <Alert severity="error">{error}</Alert>}
          <div className="SignUp-forward">
            Don't have an account?{" "}
            <Link to="/SignUp" className="btn">
              Sign Up
            </Link>
          </div>
        </div>
        <div className="image">
          <img src={Image} alt="login" />
        </div>
      </div>
    </div>
  );
}

export default Login2;
