// backend/controllers/ReportController.js
import Report from "../models/ReportModel.js";
import mongoose from "mongoose";
import cloudinary from "../utils/cloudinary.js";
import { Readable } from "stream";
import User from "../models/UserModel.js";

/* ================================
   GET /api/reports/:id
   Fetch single report
================================= */
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id)
      .populate("reportedBy", "name email")
      .populate("descriptions.addedBy", "name email")
      .populate("photos.uploadedBy", "name email");

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    res.status(200).json({ success: true, report });
  } catch (error) {
    console.error("Get report by ID error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================================
   GET /api/reports/checkExisting
   Check nearby reports
================================= */
export const checkExistingReports = async (req, res) => {
  try {
    const { category, lat, lng } = req.query;

    if (!category || !lat || !lng) {
      return res.status(400).json({ message: "Category, lat, and lng are required." });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: "Invalid coordinates." });
    }

    const normalizedCategory =
      category.trim().charAt(0).toUpperCase() + category.trim().slice(1).toLowerCase();

    const radiusInMeters = 5000; // 5 km radius

    const existingReports = await Report.find({
      category: normalizedCategory,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: radiusInMeters,
        },
      },
    }).limit(5);

    console.log("🔎 Nearby reports found:", existingReports.length);

    return res.json({
      count: existingReports.length,
      reports: existingReports.map((r) => ({
        id: r._id,
        descriptions: r.descriptions.map((d) => d.text),
        photos: r.photos.map((p) => p.url),
        location: r.location,
        status: r.status,
      })),
    });
  } catch (err) {
    console.error("Check existing reports error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ================================
   POST /api/reports/uploadPhoto
================================= */
export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No photo file provided" });
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "animal_reports",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to upload photo",
            error: error.message,
          });
        }
        res.status(200).json({
          success: true,
          photoUrl: result.secure_url,
        });
      }
    );

    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);
    bufferStream.pipe(stream);
  } catch (error) {
    console.error("❌ Error in uploadPhoto:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/* ================================
   POST /api/reports/create
================================= */
export const createReport = async (req, res) => {
  try {
    const {
      category,
      customCategory,
      description,
      photoUrl,
      latitude,
      longitude,
      name,
      contact,
      color,
      firebaseUid,
    } = req.body;

    const userId = req.user._id;

    if (!category || !latitude || !longitude) {
      return res.status(400).json({
        message: "Category, latitude, and longitude are required.",
      });
    }

    const newReport = new Report({
      category: category === "Other" ? "Other" : category,
      status: "Yet to be picked up",
      firebaseUid: firebaseUid || undefined,
      createdBy: userId,
      reportedBy: [userId],
      descriptions: [{ text: description || "No description provided", addedBy: userId }],
      photos: photoUrl ? [{ url: photoUrl, uploadedBy: userId }] : [],
      reporterInfo: [
        {
          name: name || "",
          contact: contact || "",
          color: color || "",
          addedBy: userId,
          customCategory: category === "Other" ? customCategory || "" : "",
        },
      ],
      location: { type: "Point", coordinates: [longitude, latitude] },
      history: [{ location: { type: "Point", coordinates: [longitude, latitude] } }],
    });

    await newReport.save();
    await User.findByIdAndUpdate(userId, { $push: { reports: newReport._id } });

    res.status(201).json({
      success: true,
      message: "New report created successfully.",
      report: newReport,
    });
  } catch (error) {
    console.error("❌ Error in createReport:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/* ================================
   PUT /api/reports/update/:id
================================= */
export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, photoUrl, latitude, longitude, name, contact, color, customCategory } =
      req.body;
    const userId = req.user._id;

    const report = await Report.findById(id);
    if (!report)
      return res.status(404).json({ success: false, message: "Report not found" });

    // Replace last description
    if (description) {
      if (report.descriptions.length > 0) {
        report.descriptions[report.descriptions.length - 1] = { text: description, addedBy: userId };
      } else {
        report.descriptions.push({ text: description, addedBy: userId });
      }
    }

    // Add new photos if provided
    if (photoUrl) {
      const photosToAdd = Array.isArray(photoUrl) ? photoUrl : [photoUrl];
      photosToAdd.forEach((url) => report.photos.push({ url, uploadedBy: userId }));
    }

    // Reporter info with optional custom category
    report.reporterInfo.push({
      name: name || "",
      contact: contact || "",
      color: color || "",
      addedBy: userId,
      customCategory: report.category === "Other" ? customCategory || "" : "",
    });

    // Update location history
    if (latitude && longitude) {
      report.history.push({ location: { type: "Point", coordinates: [longitude, latitude] } });
    }

    // Add user to reportedBy if not already
    if (!report.reportedBy.some((id) => id.equals(userId))) {
      report.reportedBy.push(userId);
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      report,
    });
  } catch (error) {
    console.error("❌ Error in updateReport:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================================
   GET /api/reports/trackMyStatus
================================= */
export const trackMyStatus = async (req, res) => {
  try {
    const reports = await Report.find({ reportedBy: req.user._id })
      .populate("reportedBy", "name email")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
