// Pages/AdminLoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import "./AdminLogin.css";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const uid = user.uid;
      const name = user.displayName || "";
      const email = user.email || "";

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Send token to backend for login & role check
      const { data } = await API.post("/users/googleLogin", { idToken });

      if (!data.token) {
        throw new Error("No token received from backend");
      }

      /// 🧹 Clear any previous user login
      localStorage.clear();

      // ✅ Save fresh admin data
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", "admin");
      localStorage.setItem(
        "user",
        JSON.stringify({ uid, name, email, role: "admin" })
      );

      // Check if the user is admin
      if (data.role !== "admin") {
        setErrorMsg("Access denied: You are not an admin.");
      } else {
        navigate("/admin-page", {
          state: { uid, name, email },
        });
      }
    } catch (err) {
      console.error("Admin login failed:", err);
      setErrorMsg(
        err?.response?.data?.message || err.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h1>🐾 Admin Access</h1>
        <p>
          Sign in with your authorized Google account to manage rescue
          operations and support teams in the field.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="btn google-btn"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>

        {errorMsg && (
          <div className="error-block">
            <p>{errorMsg}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLoginPage;
