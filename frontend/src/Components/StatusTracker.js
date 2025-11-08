// Components/StatusTracker.js
import React, { useEffect, useState } from "react";
import API from "../api/axios";
import PhotoModal from "./PhotoModal";
import "./StatusTracker.css";

const StatusTracker = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await API.get("/reports/trackMyStatus", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setReports(data.reports || []);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Extract structured info from description
  const parseDescription = (description) => {
    const nameMatch = description?.match(/Reporter:\s*([^\.]+)/i);
    const contactMatch = description?.match(/Contact:\s*([^\.]+)/i);
    const colorMatch = description?.match(/Color:\s*([^\.]+)/i);

    const cleanedDesc = description
      ?.replace(/Reporter:[^\.]*\.?/i, "")
      ?.replace(/Contact:[^\.]*\.?/i, "")
      ?.replace(/Color:[^\.]*\.?/i, "")
      ?.trim() || "";

    return {
      reporter: nameMatch?.[1]?.trim() || "N/A",
      contact: contactMatch?.[1]?.trim() || "N/A",
      color: colorMatch?.[1]?.trim() || "N/A",
      description: cleanedDesc
    };
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'in progress': return 'status-in-progress';
      case 'resolved': return 'status-resolved';
      case 'completed': return 'status-resolved';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const formatAnimalType = (category) => {
    if (!category) return "Other";
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  };

  const handleMapClick = (coordinates) => {
    if (coordinates) {
      const [lng, lat] = coordinates;
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePhotoClick = (photos) => {
    if (photos && photos.length > 0) {
      setSelectedPhotos(photos);
      setIsPhotoModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading your rescue reports...</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>No Reports Found</h3>
        <p>Start by reporting an animal in need of rescue!</p>
      </div>
    );
  }

  return (
    <>
      <div className="status-tracker-container">
        <table className="status-tracker-table">
          <thead className="table-header">
            <tr>
              <th>Animal Type</th>
              <th>Description</th>
              <th>Location</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Photo</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => {
              const latestDesc = report.descriptions?.[report.descriptions.length - 1]?.text || "";
              const parsedInfo = parseDescription(latestDesc);
              
              return (
                <tr key={report._id} className="table-row">
                  {/* Animal Type Column */}
                  <td className="table-cell" data-label="Animal Type">
                    <div className="animal-type-info">
                      <span className={`animal-category ${report.category?.toLowerCase()}`}>
                        {formatAnimalType(report.category)}
                      </span>
                      {parsedInfo.color !== "N/A" && (
                        <span className="animal-color">{parsedInfo.color}</span>
                      )}
                    </div>
                  </td>

                  {/* Description Column */}
                  <td className="table-cell" data-label="Description">
                    <div className="description-text">
                      {parsedInfo.description || "No description provided"}
                    </div>
                  </td>

                  {/* Location Column */}
                  <td className="table-cell" data-label="Location">
                    <div className="location-info">
                      {report.location?.coordinates ? (
                        <button 
                          className="location-button"
                          onClick={() => handleMapClick(report.location.coordinates)}
                          title="Open in Google Maps"
                        >
                          <span className="coordinates">
                            {report.location.coordinates[1].toFixed(4)}, 
                            {report.location.coordinates[0].toFixed(4)}
                          </span>
                          <span className="map-icon">📍</span>
                        </button>
                      ) : (
                        <span className="no-location">Location not available</span>
                      )}
                    </div>
                  </td>

                  {/* Status Column */}
                  <td className="table-cell" data-label="Status">
                    <span className={`status-badge ${getStatusClass(report.status)}`}>
                      {report.status}
                    </span>
                  </td>

                  {/* Last Updated Column */}
                  <td className="table-cell" data-label="Last Updated">
                    <div className="date-info">
                      {new Date(report.updatedAt).toLocaleDateString()}
                      <span className="time-text">
                        {new Date(report.updatedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>

                  {/* Photo Column */}
                  <td className="table-cell" data-label="Photo">
                    <div className="photo-container">
                      {report.photos && report.photos.length > 0 ? (
                        <button 
                          className="photo-thumbnail-button"
                          onClick={() => handlePhotoClick(report.photos)}
                        >
                          <img
                            src={report.photos[0].url}
                            alt={report.category}
                            className="thumbnail-image"
                          />
                          {report.photos.length > 1 && (
                            <div className="photo-count">
                              +{report.photos.length - 1}
                            </div>
                          )}
                        </button>
                      ) : (
                        <div className="no-photo">
                          <span className="no-photo-icon">📷</span>
                          <span className="no-photo-text">No Photo</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Photo Modal */}
      <PhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        photos={selectedPhotos}
      />
    </>
  );
};

export default StatusTracker;