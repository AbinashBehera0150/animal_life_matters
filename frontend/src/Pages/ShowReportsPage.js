// Pages/ShowReportsPage.js
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./UserPage.css";

const ShowReportsPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { nearbyReports, formData } = state || {};

  if (!nearbyReports || nearbyReports.length === 0) {
    return <p>No nearby reports found.</p>;
  }

  return (
    <div className="user-container">
      <h1>⚠️ Similar Reports Nearby</h1>
      <p>Please check these reports and decide whether to update or create a new report.</p>

      <div className="reports-list">
        {nearbyReports.map((report) => (
          <div key={report.id} className="report-card">
            {/* Show first photo if exists */}
            {report.photos.length > 0 && <img src={report.photos[0]} alt="animal" />}

            {/* Show all descriptions and reporter info */}
            <div className="report-details">
              {report.descriptions.map((desc, idx) => (
                <div key={idx} className="report-description">
                  <p><strong>Description:</strong> {desc}</p>
                  {report.reporterInfo && report.reporterInfo[idx] && (
                    <p>
                      <strong>Name:</strong> {report.reporterInfo[idx].name || "N/A"} |{" "}
                      <strong>Contact:</strong> {report.reporterInfo[idx].contact || "N/A"} |{" "}
                      <strong>Color:</strong> {report.reporterInfo[idx].color || "N/A"}
                    </p>
                  )}
                  <hr />
                </div>
              ))}
              <p><strong>Status:</strong> {report.status}</p>
            </div>

            {/* Update button */}
            <button
              onClick={() =>
                navigate(`/update-report/${report.id}`, {
                  state: { formData }, // pass original form data
                })
              }
            >
              Update This Report
            </button>
          </div>
        ))}
      </div>

      {/* Create new report button */}
      <button onClick={() => navigate("/report", { state: { ...formData } })}>
        Create New Report
      </button>
    </div>
  );
};

export default ShowReportsPage;
