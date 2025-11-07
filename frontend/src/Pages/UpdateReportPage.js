// Pages/UpdateReportPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios"; 
import "./UserPage.css";

const UpdateReportPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { formData: prefillData } = state || {};

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    description: "",
    location: "",
    photo: null,
  });

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found");

        const res = await API.get(`/reports/${reportId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const reportData = res.data.report;

        // Only prefill location, reset description and photo
        setFormData({
          description: "",
          location: `https://www.google.com/maps?q=${reportData.location.coordinates[1]},${reportData.location.coordinates[0]}`,
          photo: null,
          ...prefillData, // optional data passed from ShowReportsPage
        });
      } catch (err) {
        console.error("Failed to fetch report details:", err);
        alert(err?.response?.data?.message || err.message);
        navigate("/user-home"); // redirect to home if fetch fails
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId, navigate, prefillData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const uploadPhoto = async (photoFile) => {
    if (!photoFile) return null;

    try {
      const formData = new FormData();
      formData.append("photo", photoFile);

      const { data } = await API.post("/reports/uploadPhoto", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return data?.photoUrl || null;
    } catch (err) {
      console.error("Photo upload error:", err);
      alert("Photo upload failed. You can continue without a photo.");
      return null;
    }
  };

  const parseCoordinates = (locationStr) => {
    const match = locationStr.match(/@?([0-9.-]+),([0-9.-]+)/);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let photoUrl = null;
      if (formData.photo) photoUrl = await uploadPhoto(formData.photo);

      const coords = parseCoordinates(formData.location);
      if (!coords) {
        alert("Invalid location format.");
        return;
      }

      const token = localStorage.getItem("token");
      const { data } = await API.put(
        `/reports/update/${reportId}`,
        {
          description: formData.description,
          photoUrl,
          latitude: coords.lat,
          longitude: coords.lng,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(data.message || "Report updated successfully!");
      navigate("/user-home"); // 🔹 go back to home page
    } catch (err) {
      console.error("Update failed:", err);
      alert(err?.response?.data?.message || "Update failed.");
    }
  };

  if (loading) return <p>Loading report details...</p>;

  return (
    <div className="user-container">
      <h1>📝 Update Report</h1>
      <form className="report-form" onSubmit={handleSubmit}>
        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add new description..."
          required
        />

        <label>Location:</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
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
                setFormData((prev) => ({
                  ...prev,
                  location: `https://www.google.com/maps?q=${latitude},${longitude}`,
                }));
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

        <label>Upload Photo (optional):</label>
        <input type="file" name="photo" accept="image/*" onChange={handleChange} />

        <button type="submit">Update Report</button>
      </form>
    </div>
  );
};

export default UpdateReportPage;
