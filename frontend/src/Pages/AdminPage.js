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
  const [selectedReport, setSelectedReport] = useState(null);
  const [editForm, setEditForm] = useState({ status: "" });
  const [feedback, setFeedback] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const navigate = useNavigate();

  const STATUS_CLASS_MAP = {
    "Yet to be done": "yet-to-be-done",
    "Yet to be Done": "yet-to-be-done",
    "Yet to be Picked": "yet-to-be-picked",
    "Yet to be picked": "yet-to-be-picked",
    "Yet to be": "yet-to-be",
    "In treatment": "in-treatment",
    "In Treatment": "in-treatment",
    "Picked up": "picked-up",
    "Treatment done": "treatment-done",
    "Treatment Done": "treatment-done",
  };

  const statusClass = (status) =>
    STATUS_CLASS_MAP[status?.trim()] || "unknown";

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token || role !== "admin") {
      navigate("/admin-login", { replace: true });
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
      setFeedback({
        type: "error",
        text: err?.response?.data?.message || "Failed to fetch reports",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (reportId, newStatus, evt) => {
    evt?.stopPropagation();
    try {
      await API.put(
        `/admin/reports/${reportId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedback({ type: "success", text: "Status updated successfully." });
      fetchReports();
    } catch (err) {
      console.error("Update status error:", err);
      setFeedback({
        type: "error",
        text: err?.response?.data?.message || "Failed to update status",
      });
    }
  };

  const deleteReport = async (reportId, evt) => {
    evt?.stopPropagation();
    try {
      await API.delete(`/admin/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedback({ type: "success", text: "Report deleted successfully." });
      fetchReports();
    } catch (err) {
      console.error("Delete report error:", err);
      setFeedback({
        type: "error",
        text: err?.response?.data?.message || "Failed to delete report",
      });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleReportSelect = (report) => {
    setSelectedReport(report);
    setEditForm({
      status: report.status,
    });
  };

  const closeDetail = () => {
    setSelectedReport(null);
    setEditForm({ status: "" });
  };

  const saveReportChanges = async () => {
    if (!selectedReport) return;
    try {
      await API.put(
        `/admin/reports/${selectedReport._id}/status`,
        { status: editForm.status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedback({ type: "success", text: "Status updated successfully." });
      closeDetail();
      fetchReports();
    } catch (err) {
      console.error("Update status error:", err);
      setFeedback({
        type: "error",
        text: err?.response?.data?.message || "Failed to update status",
      });
    }
  };

  if (loading) return <p>Loading reports...</p>;

  return (
    <div className="admin-container">
      {feedback && (
        <div className={`feedback-banner ${feedback.type}`}>
          {feedback.text}
        </div>
      )}

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
            <tr
              key={r._id}
              className="report-row"
              onClick={() => handleReportSelect(r)}
            >
              <td>{r._id}</td>
              <td>{r.category}</td>
              <td>
                <span className={`status-chip ${statusClass(r.status)}`}>
                  {r.status}
                </span>
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
                    onClick={(e) => e.stopPropagation()}
                  >
                    📸
                  </a>
                )) || <span>—</span>}
              </td>
              <td>
                <button onClick={(e) => deleteReport(r._id, e)}>🗑️ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {reports.length === 0 && <p>No reports found.</p>}

      {selectedReport && (
        <div className="report-detail-overlay" onClick={closeDetail}>
          <div className="report-detail-card" onClick={(e) => e.stopPropagation()}>
            <header>
              <h3>Report Details</h3>
              <button className="close-btn" onClick={closeDetail}>
                ✕
              </button>
            </header>

            <div className="detail-body">
              <div className="detail-info">
                <p><strong>ID:</strong> {selectedReport._id}</p>
                <p><strong>Category:</strong> {selectedReport.category}</p>
                <p>
                  <strong>Description:</strong>{" "}
                  {selectedReport.descriptions?.map((d) => d.text).join(", ") || "N/A"}
                </p>
                <p>
                  <strong>Location:</strong>{" "}
                  {selectedReport.location?.coordinates
                    ? `Lat: ${selectedReport.location.coordinates[1]}, Lng: ${selectedReport.location.coordinates[0]}`
                    : "N/A"}
                </p>
                <div className="detail-photos">
                  <strong>Photos:</strong>
                  {selectedReport.photos?.length ? (
                    <div className="photo-gallery">
                      {selectedReport.photos.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="photo-thumb"
                          onClick={() => {
                            setPhotoPreview(p.url);
                            setPhotoLoading(true);
                          }}
                        >
                          <img src={p.url} alt={`Report photo ${idx + 1}`} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span>No photos</span>
                  )}
                </div>
              </div>

              <div className="detail-form">
                <label>
                  <span>Status</span>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, status: e.target.value }))
                    }
                  >
                    <option value="Yet to be picked">Yet to be picked</option>
                    <option value="Picked up">Picked up</option>
                    <option value="In treatment">In treatment</option>
                    <option value="Treatment done">Treatment done</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="detail-actions">
              <button className="secondary-btn" onClick={closeDetail}>
                Cancel
              </button>
              <button className="primary-btn" onClick={saveReportChanges}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {photoPreview && (
        <div className="photo-preview-backdrop" onClick={() => {
          setPhotoPreview(null);
          setPhotoLoading(false);
        }}>
          <div className="photo-preview-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => {
              setPhotoPreview(null);
              setPhotoLoading(false);
            }}>
              ✕
            </button>
            {photoLoading && <div className="photo-loader" />}
            <img
              src={photoPreview}
              alt="Report full size"
              onLoad={() => setPhotoLoading(false)}
              onError={() => setPhotoLoading(false)}
              className={photoLoading ? "hidden" : ""}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
