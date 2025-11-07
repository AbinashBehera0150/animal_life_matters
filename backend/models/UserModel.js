// backend/models/UserModel.js
import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },

  reports: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",  // <-- connects back to Report model
    },
  ],
}, { timestamps: true });

export default mongoose.model("User", userSchema);
