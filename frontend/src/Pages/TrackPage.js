// Pages/TrackPage.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatusTracker from "../Components/StatusTracker";
import "./TrackPage.css";

const TrackPage = () => {
  const navigate = useNavigate();

  // Redirect if no token (not logged in)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to track reports.");
      navigate("/user-login");
    }
  }, [navigate]);

  const handleBackClick = () => {
    navigate("/user-home");
  };

  return (
    <div className="track-container">
      {/* Back Button */}
      <button 
        onClick={handleBackClick}
        className="back-button"
      >
        <svg 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18" 
          />
        </svg>
        Back to Home
      </button>

      <h1>Track Animal Rescue Status 🐾</h1>
      <StatusTracker />
    </div>
  );
};

export default TrackPage;