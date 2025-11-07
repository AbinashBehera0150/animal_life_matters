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

  return (
    <div className="track-container p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-6">
        Track Animal Rescue Status 🐾
      </h1>
      <StatusTracker />
    </div>
  );
};

export default TrackPage;
