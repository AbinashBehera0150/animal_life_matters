// Pages/AdminPage.js
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./AdminPage.css";

const AdminPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [columnWidths, setColumnWidths] = useState({
    0: 100,  // ID
    1: 120,  // Category
    2: 180,  // Status
    3: 250,  // Description
    4: 200,  // Location
    5: 120,  // Photos
    6: 120   // Actions
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizingIndex, setResizingIndex] = useState(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const tableRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Mouse move handler
  const handleMouseMove = useCallback((e) => {
    if (!isResizing || resizingIndex === null) return;

    const table = tableRef.current;
    if (!table) return;

    // Get table boundaries to prevent overflow
    const tableRect = table.getBoundingClientRect();
    const maxWidth = tableRect.width - 50; // Minimum 50px for other columns

    const deltaX = e.clientX - startXRef.current;
    let newWidth = Math.max(50, startWidthRef.current + deltaX);

    // Prevent table from expanding beyond viewport
    newWidth = Math.min(newWidth, maxWidth);

    setColumnWidths(prev => ({
      ...prev,
      [resizingIndex]: newWidth
    }));
  }, [isResizing, resizingIndex]);

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setResizingIndex(null);
    document.body.style.removeProperty('cursor');
    document.body.style.removeProperty('user-select');
  }, []);

  // Add/remove event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Start resizing - improved to be more intuitive
  const startResizing = (index, e) => {
    e.preventDefault();
    e.stopPropagation();

    // Get the exact position where the user clicked on the resizer
    const resizerRect = e.target.getBoundingClientRect();
    startXRef.current = resizerRect.left + resizerRect.width / 2;

    const th = e.target.parentElement;
    const rect = th.getBoundingClientRect();
    startWidthRef.current = rect.width;

    setIsResizing(true);
    setResizingIndex(index);
  };

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

      <div className={`table-wrapper ${isResizing ? 'resizing' : ''}`} ref={tableRef}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: `${columnWidths[0]}px` }}>
                <div className="th-content">
                  ID
                  <div
                    className="resizer"
                    onMouseDown={(e) => startResizing(0, e)}
                  />
                </div>
              </th>
              <th style={{ width: `${columnWidths[1]}px` }}>
                <div className="th-content">
                  Category
                  <div
                    className="resizer"
                    onMouseDown={(e) => startResizing(1, e)}
                  />
                </div>
              </th>
              <th style={{ width: `${columnWidths[2]}px` }}>
                <div className="th-content">
                  Status
                  <div
                    className="resizer"
                    onMouseDown={(e) => startResizing(2, e)}
                  />
                </div>
              </th>
              <th style={{ width: `${columnWidths[3]}px` }}>
                <div className="th-content">
                  Description
                  <div
                    className="resizer"
                    onMouseDown={(e) => startResizing(3, e)}
                  />
                </div>
              </th>
              <th style={{ width: `${columnWidths[4]}px` }}>
                <div className="th-content">
                  Location
                  <div
                    className="resizer"
                    onMouseDown={(e) => startResizing(4, e)}
                  />
                </div>
              </th>
              <th style={{ width: `${columnWidths[5]}px` }}>
                <div className="th-content">
                  Photos
                  <div
                    className="resizer"
                    onMouseDown={(e) => startResizing(5, e)}
                  />
                </div>
              </th>
              <th style={{ width: `${columnWidths[6]}px` }}>
                <div className="th-content">
                  Actions
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r._id}>
                <td style={{ width: `${columnWidths[0]}px` }}>{r._id}</td>
                <td style={{ width: `${columnWidths[1]}px` }}>{r.category}</td>
                <td style={{ width: `${columnWidths[2]}px` }}>
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
                <td style={{ width: `${columnWidths[3]}px` }}>
                  {r.descriptions?.map((d) => d.text).join(", ")}
                </td>
                <td style={{ width: `${columnWidths[4]}px` }}>
                  {r.location?.coordinates ? (
                    <div className="location-cell">
                      <a
                        href={`https://www.google.com/maps?q=${r.location.coordinates[1]},${r.location.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="coordinates-link"
                        title="Open in Google Maps"
                      >
                        📍 Lat: {r.location.coordinates[1].toFixed(6)}, Lng: {r.location.coordinates[0].toFixed(6)}
                      </a>
                    </div>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td style={{ width: `${columnWidths[5]}px` }}>
                  <div className="photo-thumbnails">
                    {r.photos?.map((p, i) => (
                      <a
                        key={i}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="thumbnail-link"
                      >
                        <img
                          src={p.url}
                          alt={`Report photo ${i + 1}`}
                          className="thumbnail"
                        />
                      </a>
                    ))}
                  </div>
                </td>
                <td style={{ width: `${columnWidths[6]}px` }}>
                  <button onClick={() => deleteReport(r._id)}>🗑️ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reports.length === 0 && <p>No reports found.</p>}
    </div>
  );
};

export default AdminPage;