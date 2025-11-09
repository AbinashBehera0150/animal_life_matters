// Pages/UserHome.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./UserHome.css";

const UserHome = () => {
  const navigate = useNavigate();

  const handleChoice = (option) => {
    if (option === "report") {
      navigate("/report");
    } else {
      navigate("/track");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      navigate("/");
    }
  };

  return (
    <div className="user-home">
      {/* 🧭 Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <h2 className="navbar-title">
            🐾 Animal Rescue Portal <span className="role-text">| User</span>
          </h2>
        </div>

        <div className="navbar-right">
          <button className="logout-btn" onClick={handleLogout}>
            ⎋ Logout
          </button>
        </div>
      </nav>

      <div className="content">
        {/* Action Box */}
        <div className="action-box">
          <div className="action-content">
            <h1>Welcome Back! 👋</h1>
            <p className="action-message">
              Helping animals starts with a single step — choose your action below.
            </p>

            <div className="action-buttons">
              <button className="report-btn" onClick={() => handleChoice("report")}>
                📋 Report an Animal
              </button>
              <button className="track-btn" onClick={() => handleChoice("track")}>
                🔍 Track Animal Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
