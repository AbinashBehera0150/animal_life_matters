// Components/ReportForm.jsx

import React, { useState } from "react";
import API from "../api/axios";

const ReportForm = ({ onReportCreated }) => {
  console.log("✅ ReportForm loaded");
  const [form, setForm] = useState({
    reporterName: "",
    contactNumber: "",
    category: "",
    otherAnimal: "",
    description: "",
    photoUrl: "",
    latitude: "",
    longitude: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalCategory =
      form.category === "Other" ? form.otherAnimal : form.category;

    try {
      const payload = {
        ...form,
        category: finalCategory,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      };

      const res = await API.post("/reports/create", payload);
      alert(res.data.message);
      onReportCreated?.();
    } catch (err) {
      console.error(err);
      alert("Failed to submit report");
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg"
    >
      <h2 className="text-xl font-semibold mb-4 text-green-700">
        Report an Animal
      </h2>

      <input
        type="text"
        name="reporterName"
        placeholder="Your Name"
        value={form.reporterName}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg w-full mb-3 p-2"
        required
      />

      <input
        type="text"
        name="contactNumber"
        placeholder="Contact Number"
        value={form.contactNumber}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg w-full mb-3 p-2"
        required
      />
      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg w-full mb-3 p-2"
        required
      >
        <option value="">Select Category</option>
        <option value="Dog">Dog</option>
        <option value="Cat">Cat</option>
        <option value="Cow">Cow</option>
        <option value="Bird">Bird</option>
        <option value="Other">Other</option>
      </select>
      {form.category === "Other" && (
        <input
          type="text"
          name="otherAnimal"
          placeholder="Please specify the animal"
          value={form.otherAnimal}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg w-full mb-3 p-2"
          required
        />
      )}
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg w-full mb-3 p-2"
        required
      />
      <input
        type="text"
        name="photoUrl"
        placeholder="Photo URL (optional)"
        value={form.photoUrl}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg w-full mb-3 p-2"
      />
      <input
        type="number"
        name="latitude"
        placeholder="Latitude"
        value={form.latitude}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg w-full mb-3 p-2"
        required
      />
      <input
        type="number"
        name="longitude"
        placeholder="Longitude"
        value={form.longitude}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg w-full mb-3 p-2"
        required
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
      >
        Submit Report
      </button>
    </form>
  );
};

export default ReportForm;