import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/UserRoutes.js";
import reportRoutes from "./routes/ReportRoutes.js";
import adminRoutes from "./routes/AdminRoutes.js";
import admin from "firebase-admin";
import fs from "fs";

dotenv.config();
connectDB();

// Initialize Firebase Admin if credentials are provided
try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    const serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
} catch (e) {
  console.warn("Firebase Admin not initialized:", e.message);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("🐾 Animal Rescue API Running..."));
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
