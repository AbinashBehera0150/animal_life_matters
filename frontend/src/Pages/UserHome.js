// Pages/UserHome.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./UserHome.css";

const UserHome = () => {
  const [showPopup, setShowPopup] = useState(true);
  const navigate = useNavigate();
  const { state } = useLocation();

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const { uid, name, email, role } = state || storedUser || {};

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !uid) {
      alert("You must log in first.");
      navigate("/user-login");
    }
  }, [navigate, uid]);

  const handleChoice = (option) => {
    setShowPopup(false);
    if (option === "report") {
      navigate("/report", { state: { uid, name, email, role } });
    } else {
      navigate("/track", { state: { uid, name, email, role } });
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      navigate("/");
    }
  };

  return (
    <div className="user-home">
      {/* 🧭 Navbar */}
      <nav className="navbar">
        <h2 className="navbar-title">🐾 Animal Rescue Portal</h2>
        <div className="navbar-right">
          <span className="user-info">
            {name} ({role})
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            ⎋ Logout
          </button>
        </div>
      </nav>

      <div className="content">
        <h1>Welcome Back, {name?.split(" ")[0]}!</h1>
        <p>Email: {email}</p>
        <p>UID: {uid}</p>
        <p>
          Helping animals starts with a single step — choose your action below.
        </p>

        {showPopup && (
          <div className="popup-overlay">
            <div className="popup-box animate-popup">
              <h2>What would you like to do?</h2>
              <div className="popup-buttons">
                <button
                  className="report-btn"
                  onClick={() => handleChoice("report")}
                >
                  📋 Report an Animal
                </button>
                <button
                  className="track-btn"
                  onClick={() => handleChoice("track")}
                >
                  🔍 Track Animal Status
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHome;
