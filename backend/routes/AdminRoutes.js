// backend/routes/AdminRoutes.js
import express from "express";
import {
  getAllReports,
  deleteReport,
  updateReportStatus,
} from "../controllers/AdminController.js";
import { verifyUser, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🧾 Fetch all reports
router.get("/reports", verifyUser, verifyAdmin, getAllReports);

// 🗑️ Delete report
router.delete("/reports/:id", verifyUser, verifyAdmin, deleteReport);

// ✅ Update report status
router.put("/reports/:id/status", verifyUser, verifyAdmin, updateReportStatus);

export default router;
