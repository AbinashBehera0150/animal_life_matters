// backend/controllers/AdminController.js
import Report from "../models/ReportModel.js";
import User from "../models/UserModel.js";

/**
 * 🧾 Get all reported animals (Admin dashboard)
 * Supports optional filters: status & category
 */
export const getAllReports = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category && category !== "ALL") filter.category = category;

    const reports = await Report.find(filter)
      .populate("createdBy", "name email")
      .populate("reportedBy", "name email")
      .populate("photos.uploadedBy", "name email")
      .populate("descriptions.addedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: reports.length,
      reports,
    });
  } catch (err) {
    console.error("Get all reports error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * 🗑️ Delete a report by ID
 * Optionally, remove report reference from users
 */
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    // Remove report references from users
    await User.updateMany(
      { reports: report._id },
      { $pull: { reports: report._id } }
    );

    res.status(200).json({ success: true, message: "Report deleted successfully" });
  } catch (err) {
    console.error("Delete report error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * ✅ Update report status (Admin only)
 */
export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Yet to be picked up",
      "Picked up",
      "In treatment",
      "Treatment done",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const updated = await Report.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("createdBy", "name email");

    if (!updated) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      report: updated,
    });
  } catch (err) {
    console.error("Update report status error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
