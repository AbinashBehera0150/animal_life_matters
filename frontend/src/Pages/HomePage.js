// Pages/HomePage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* --- Header --- */}
      <header className="home-header">
        <h1 className="site-title">🐾 UniVet Track</h1>
      </header>

      {/* --- Main Home Section --- */}
      <div className="home-container">
        <div className="home-content">
          <h1>Save Lives, One Paw at a Time</h1>
          <p>
            Injured or stray animals deserve timely care and compassion. Report
            a sighting to ensure they receive treatment at the right time.
          </p>

          <div className="button-group">
            <button
              className="btn user-btn"
              onClick={() => navigate("/user-login")}
            >
              User Login
            </button>
            <button
              className="btn admin-btn"
              onClick={() => navigate("/admin-login")}
            >
              Admin Login
            </button>
          </div>
        </div>

        <div className="emergency-footer">
          🚑 Emergency Animal Ambulance: <span>+91 65789 90537</span>
        </div>
      </div>
    </>
  );
};

export default HomePage;
