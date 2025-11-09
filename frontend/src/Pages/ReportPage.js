import React, { useState, useRef, useEffect } from "react";
import API from "../api/axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./UserPage.css";

const ReportPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // 🧠 Get initial data from route state or localStorage
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const { uid, name, email, role, formData: prefillData } = state || storedUser || {};

  const [formData, setFormData] = useState({
    name: name || "",
    contact: "",
    category: "",
    customCategory: "",
    description: "",
    photo: null,
    location: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const customCategoryRef = useRef(null);

  // 🧠 Prefill form if coming from ShowReportsPage
  useEffect(() => {
    if (prefillData) {
      setFormData((prev) => ({
        ...prev,
        ...prefillData,
        photo: null, // always reset photo
      }));
    }
  }, [prefillData]);

  // ✅ Check token only (not uid)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must log in first.");
      navigate("/user-login");
    }
  }, [navigate]);

  // 🧩 Autofocus for “Other” category
  useEffect(() => {
    if (formData.category === "Other" && customCategoryRef.current) {
      customCategoryRef.current.focus();
    }
  }, [formData.category]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    let nextValue = files ? files[0] : value;

    if (name === "contact") {
      nextValue = value.replace(/\D/g, "").slice(0, 10); // only digits, max 10
    }

    setFormData({ ...formData, [name]: nextValue });
  };

  const uploadPhoto = async (photoFile) => {
    if (!photoFile) return null;

    try {
      const uploadForm = new FormData();
      uploadForm.append("photo", photoFile);

      const { data } = await API.post("/reports/uploadPhoto", uploadForm, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return data?.photoUrl || null;
    } catch (err) {
      console.error("Photo upload error:", err.response?.data || err.message);
      throw new Error("Failed to upload photo. Please try again.");
    }
  };

  const parseCoordinates = (locationStr) => {
    const patterns = [
      /maps\?q=([0-9.-]+),([0-9.-]+)/,
      /@([0-9.-]+),([0-9.-]+)/,
      /place\/[^\/]+\/@([0-9.-]+),([0-9.-]+)/,
      /maps\?q=([0-9.-]+)$/,
      /([0-9.-]+),([0-9.-]+)/,
    ];

    for (const pattern of patterns) {
      const match = locationStr.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2] || match[1]);
        if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication required. Please log in again.");
      navigate("/user-login");
      return;
    }

    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton?.textContent || "Submit Report";
    const restoreButton = () => {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    };

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }

    try {
      const finalCategory =
        formData.category === "Other" ? formData.customCategory : formData.category;

      if (!finalCategory) {
        alert("Please select a category.");
        restoreButton();
        return;
      }

      if (!formData.location) {
        alert("Please provide a location.");
        restoreButton();
        return;
      }

      const coords = parseCoordinates(formData.location);
      if (!coords) {
        alert("Invalid location. Use 'Use My Location' or provide a valid link.");
        restoreButton();
        return;
      }

      // 🔍 Check for existing reports nearby
      try {
        const { data: check } = await API.get("/reports/checkExisting", {
          params: {
            category: finalCategory,
            lat: coords.lat,
            lng: coords.lng,
          },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (check?.count > 0 && check?.reports?.length > 0) {
          navigate("/show-reports", {
            state: { nearbyReports: check.reports, formData },
          });
          return;
        }
      } catch (checkErr) {
        console.warn("Check existing reports failed:", checkErr);
      }

      // 📸 Upload photo if provided
      let photoUrl = null;
      if (formData.photo) {
        try {
          photoUrl = await uploadPhoto(formData.photo);
        } catch (photoErr) {
          const proceed = window.confirm("Photo upload failed. Continue without photo?");
          if (!proceed) {
            restoreButton();
            return;
          }
        }
      }

      // 📨 Submit report
      const { data } = await API.post(
        "/reports/create",
        {
          category: finalCategory,
          description: formData.description,
          photoUrl,
          latitude: coords.lat,
          longitude: coords.lng,
          firebaseUid: uid || storedUser?.uid,
          name: formData.name,
          contact: formData.contact,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubmitted(true);
      alert(data?.message || "Report submitted successfully!");

      // Reset form
      setFormData({
        name: name || "",
        contact: "",
        category: "",
        customCategory: "",
        description: "",
        photo: null,
        location: "",
      });

      const fileInput = e.target.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

      restoreButton();

      navigate("/user-home");
    } catch (err) {
      console.error("Submit error:", err);
      alert(err?.response?.data?.message || err.message || "Submission failed.");
      restoreButton();
    }
  };

  return (
    <div className="user-container">
      <h1>🐾 Report an Injured / Stray Animal</h1>

      <form className="report-form" onSubmit={handleSubmit}>
        <label>Reporter's Name*:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label>Contact Number*</label>
        <input
          type="tel"
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          required
          inputMode="numeric"
          maxLength={10}
          pattern="[0-9]{10}"
          title="Enter a valid 10-digit number"
        />

        <label>Category:</label>
        <select
          name="category"
          onChange={handleChange}
          value={formData.category}
          required
        >
          <option value="">Select Category</option>
          <option value="Dog">Dog</option>
          <option value="Cat">Cat</option>
          <option value="Other">Other</option>
        </select>

        {formData.category === "Other" && (
          <>
            <label>Specify Animal Type:</label>
            <input
              type="text"
              name="customCategory"
              placeholder="e.g., Cow, Monkey..."
              onChange={handleChange}
              ref={customCategoryRef}
              value={formData.customCategory}
              required
            />
          </>
        )}

        <label>Description:</label>
        <textarea
          name="description"
          placeholder="Describe the animal or injury..."
          value={formData.description}
          onChange={handleChange}
          required
        />

        <label>Location:</label>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            name="location"
            placeholder="Enter or paste location link"
            value={formData.location}
            onChange={handleChange}
            required
            pattern="https?://.+"
            title="Enter a valid URL starting with http:// or https://"
          />
          <button
            type="button"
            onClick={() => {
              if (!navigator.geolocation) {
                alert("Geolocation not supported.");
                return;
              }
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const { latitude, longitude } = pos.coords;
                  const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
                  setFormData((prev) => ({ ...prev, location: mapsLink }));
                },
                (err) => {
                  console.error(err);
                  alert("Unable to fetch location.");
                }
              );
            }}
          >
            📍 Use My Location
          </button>
        </div>

        <label>Upload Photo:</label>
        <input type="file" name="photo" accept="image/*" onChange={handleChange} />

        <button type="submit">Submit Report</button>
      </form>
    </div>
  );
};

export default ReportPage;
