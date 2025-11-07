// Pages/AdminPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./AdminPage.css";

const AdminPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token || role !== "admin") {
      alert("Access denied. Please log in as admin.");
      navigate("/admin-login");
    } else {
      fetchReports();
    }
  }, [statusFilter, categoryFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/reports", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          category: categoryFilter !== "ALL" ? categoryFilter : undefined,
        },
      });
      setReports(res.data.reports || []);
    } catch (err) {
      console.error("Fetch reports error:", err);
      alert(err?.response?.data?.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (reportId, newStatus) => {
    try {
      await API.put(
        `/admin/reports/${reportId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Status updated successfully!");
      fetchReports();
    } catch (err) {
      console.error("Update status error:", err);
      alert(err?.response?.data?.message || "Failed to update status");
    }
  };

  const deleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;

    try {
      await API.delete(`/admin/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Report deleted successfully!");
      fetchReports();
    } catch (err) {
      console.error("Delete report error:", err);
      alert(err?.response?.data?.message || "Failed to delete report");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      navigate("/");
    }
  };

  if (loading) return <p>Loading reports...</p>;

  return (
    <div className="admin-container">
      {/* 🧭 Navbar */}
      <nav className="navbar">
        <h2 className="navbar-title">🛠️ Admin Dashboard</h2>
        <div className="navbar-right">
          <span className="user-info">Admin</span>
          <button className="logout-btn" onClick={handleLogout}>
            ⎋ Logout
          </button>
        </div>
      </nav>

      <div className="filters">
        <label>
          Status:
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="Yet to be picked">Yet to be picked</option>
            <option value="Picked up">Picked up</option>
            <option value="In treatment">In treatment</option>
            <option value="Treatment done">Treatment done</option>
          </select>
        </label>

        <label>
          Category:
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Cow">Cow</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Category</th>
            <th>Status</th>
            <th>Description</th>
            <th>Location</th>
            <th>Photos</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r._id}>
              <td>{r._id}</td>
              <td>{r.category}</td>
              <td>
                <select
                  value={r.status}
                  onChange={(e) => updateStatus(r._id, e.target.value)}
                >
                  <option value="Yet to be picked">Yet to be picked</option>
                  <option value="Picked up">Picked up</option>
                  <option value="In treatment">In treatment</option>
                  <option value="Treatment done">Treatment done</option>
                </select>
              </td>
              <td>{r.descriptions?.map((d) => d.text).join(", ")}</td>
              <td>
                {r.location?.coordinates
                  ? `Lat: ${r.location.coordinates[1]}, Lng: ${r.location.coordinates[0]}`
                  : "N/A"}
              </td>
              <td>
                {r.photos?.map((p, i) => (
                  <a
                    key={i}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📸
                  </a>
                ))}
              </td>
              <td>
                <button onClick={() => deleteReport(r._id)}>🗑️ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {reports.length === 0 && <p>No reports found.</p>}
    </div>
  );
};

export default AdminPage;
