// Components/Navbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "../utils/logout";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role")?.replace(/"/g, ""); // remove quotes
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const goHome = () => {
    if (role === "admin") navigate("/admin-page");
    else navigate("/user-home");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left" onClick={goHome}>
        <h2 className="navbar-logo">🐾 Animal Rescue Tracker</h2>
      </div>

      <div className="navbar-right">
        {user?.name && <span className="navbar-user">Hi, {user.name}</span>}
        <button
          onClick={() => handleLogout(navigate)}
          className="navbar-logout-btn"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
