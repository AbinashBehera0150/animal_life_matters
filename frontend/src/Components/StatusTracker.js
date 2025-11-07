// Components/StatusTracker
import React, { useEffect, useState } from "react";
import API from "../api/axios";

const StatusTracker = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p className="text-gray-600">Loading reports...</p>;

  if (reports.length === 0)
    return (
      <p className="text-gray-600 text-lg">
        No reports found. Try reporting an animal first!
      </p>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {reports.map((report) => {
        const latestDesc =
          report.descriptions?.[report.descriptions.length - 1]?.text || "";

        // Extract structured info from description
        const nameMatch = latestDesc.match(/Reporter:\s*([^\.]+)/i);
        const contactMatch = latestDesc.match(/Contact:\s*([^\.]+)/i);
        const colorMatch = latestDesc.match(/Color:\s*([^\.]+)/i);

        const cleanedDesc = latestDesc
          .replace(/Reporter:[^\.]*\./i, "")
          .replace(/Contact:[^\.]*\./i, "")
          .replace(/Color:[^\.]*\./i, "")
          .trim();

        return (
          <div
            key={report._id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200"
          >
            {/* Image */}
            <div className="relative w-full h-56 bg-gray-100 flex items-center justify-center">
              {report.photos && report.photos.length > 0 ? (
                <img
                  src={report.photos[0].url}
                  alt={report.category}
                  className="w-full h-full object-cover object-center rounded-t-2xl"
                />
              ) : (
                <p className="text-gray-500 italic">No Photo Available</p>
              )}
            </div>

            {/* Details */}
            <div className="p-5">
              <h2 className="text-2xl font-bold text-green-700 mb-2">
                {report.category}
              </h2>

              <div className="space-y-1 text-gray-700 text-sm">
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="text-green-600 font-medium">
                    {report.status}
                  </span>
                </p>

                {nameMatch && (
                  <p>
                    <strong>Reporter:</strong> {nameMatch[1].trim()}
                  </p>
                )}
                {contactMatch && (
                  <p>
                    <strong>Contact:</strong> {contactMatch[1].trim()}
                  </p>
                )}
                {colorMatch && (
                  <p>
                    <strong>Color:</strong> {colorMatch[1].trim()}
                  </p>
                )}

                {cleanedDesc && (
                  <p>
                    <strong>Description:</strong> {cleanedDesc}
                  </p>
                )}

                {report.location?.coordinates && (
                  <p>
                    <strong>Location:</strong>{" "}
                    {`${report.location.coordinates[1].toFixed(
                      4
                    )}, ${report.location.coordinates[0].toFixed(4)}`}
                  </p>
                )}

                <p className="text-xs text-gray-500">
                  <strong>Last Updated:</strong>{" "}
                  {new Date(report.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusTracker;
