import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { auth, provider, db } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./UserLogin.css";

const UserLoginPage = () => {
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

      const roleRef = doc(db, "roles", uid);
      const roleSnap = await getDoc(roleRef);
      let role = "user";
      if (!roleSnap.exists()) {
        await setDoc(roleRef, { role: "user" });
      } else {
        role = roleSnap.data()?.role || "user";
      }

      const idToken = await user.getIdToken();
      const { data } = await API.post("/users/googleLogin", { idToken });

      if (!data?.token) throw new Error("No token from backend");

      const userData = { uid, name, email, role };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("role", role);

      navigate("/user-home", { state: userData, replace: true });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Sign-in failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-login-container">
      <div className="user-login-card">
        <h1>🐾 Welcome Back</h1>
        <p>
          Sign in with your Google account to report rescues, track updates, and
          support our mission to save more animals.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="btn user-btn"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>

        {errorMsg && <p className="error">{errorMsg}</p>}
      </div>
    </div>
  );
};

export default UserLoginPage;
