// Pages/ShowReportsPage.js
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ShowReportsPage.css";

const ShowReportsPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState(new Set());

  const { nearbyReports, formData } = state || {};

  const toggleRowExpansion = (reportId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedRows(newExpanded);
  };

  if (!nearbyReports || nearbyReports.length === 0) {
    return (
      <div className="reports-container">
        <div className="reports-header">
          <h1>⚠️ Similar Reports Nearby</h1>
          <p className="subtitle">No nearby reports found. You can create a new report.</p>
        </div>
        <div className="actions-section">
          <button 
            className="btn-primary"
            onClick={() => navigate("/report", { state: { ...formData } })}
          >
            Create New Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>⚠️ Similar Reports Nearby</h1>
        <p className="subtitle">
          Please check these reports and decide whether to update or create a new report.
        </p>
      </div>

      <div className="table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th className="photo-col">Photo</th>
              <th className="description-col">Description</th>
              <th className="reporter-col">Reporter Info</th>
              <th className="status-col">Status</th>
              <th className="actions-col">Actions</th>
              <th className="expand-col"></th>
            </tr>
          </thead>
          <tbody>
            {nearbyReports.map((report) => (
              <React.Fragment key={report.id}>
                <tr className="report-row">
                  <td className="photo-cell">
                    {report.photos.length > 0 ? (
                      <img 
                        src={report.photos[0]} 
                        alt="animal" 
                        className="report-photo"
                      />
                    ) : (
                      <div className="no-photo">No Image</div>
                    )}
                  </td>
                  <td className="description-cell">
                    <div className="description-preview">
                      {report.descriptions[0]?.substring(0, 100)}
                      {report.descriptions[0]?.length > 100 && "..."}
                    </div>
                    {report.descriptions.length > 1 && (
                      <div className="additional-count">
                        +{report.descriptions.length - 1} more description(s)
                      </div>
                    )}
                  </td>
                  <td className="reporter-cell">
                    {report.reporterInfo && report.reporterInfo[0] && (
                      <div className="reporter-preview">
                        <div className="reporter-name">
                          {report.reporterInfo[0].name || "Anonymous"}
                        </div>
                        <div className="reporter-contact">
                          {report.reporterInfo[0].contact || "No contact"}
                        </div>
                        <div className="reporter-color">
                          {report.reporterInfo[0].color || "No color"}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="status-cell">
                    <span className={`status-badge status-${report.status.toLowerCase()}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn-update"
                      onClick={() =>
                        navigate(`/update-report/${report.id}`, {
                          state: { formData },
                        })
                      }
                    >
                      Update
                    </button>
                  </td>
                  <td className="expand-cell">
                    <button
                      className="expand-btn"
                      onClick={() => toggleRowExpansion(report.id)}
                    >
                      {expandedRows.has(report.id) ? "▼" : "►"}
                    </button>
                  </td>
                </tr>
                
                {/* Expanded details row */}
                {expandedRows.has(report.id) && (
                  <tr className="expanded-row">
                    <td colSpan="6">
                      <div className="expanded-content">
                        <div className="expanded-section">
                          <h4>All Descriptions & Reporter Information</h4>
                          {report.descriptions.map((desc, idx) => (
                            <div key={idx} className="description-full">
                              <div className="description-text">
                                <strong>Description {idx + 1}:</strong> {desc}
                              </div>
                              {report.reporterInfo && report.reporterInfo[idx] && (
                                <div className="reporter-full">
                                  <div className="reporter-details">
                                    <span><strong>Name:</strong> {report.reporterInfo[idx].name || "N/A"}</span>
                                    <span><strong>Contact:</strong> {report.reporterInfo[idx].contact || "N/A"}</span>
                                    <span><strong>Color:</strong> {report.reporterInfo[idx].color || "N/A"}</span>
                                  </div>
                                </div>
                              )}
                              {idx < report.descriptions.length - 1 && <hr />}
                            </div>
                          ))}
                        </div>
                        
                        <div className="expanded-section">
                          <h4>Additional Photos</h4>
                          <div className="photos-grid">
                            {report.photos.slice(1).map((photo, idx) => (
                              <img 
                                key={idx} 
                                src={photo} 
                                alt={`animal ${idx + 2}`} 
                                className="additional-photo"
                              />
                            ))}
                            {report.photos.length <= 1 && (
                              <div className="no-additional-photos">No additional photos</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="actions-section">
        <button 
          className="btn-secondary"
          onClick={() => navigate("/report", { state: { ...formData } })}
        >
          Create New Report
        </button>
      </div>
    </div>
  );
};

export default ShowReportsPage;