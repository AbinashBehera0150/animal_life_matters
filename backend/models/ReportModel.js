// backend/models/ReportModel.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["Dog", "Cat", "Cow"],
    },

    customCategory: {
      type: String, // For user-defined categories
      required: false,
    },
    firebaseUid: {
      type: String,
      required: false,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Yet to be picked up",
        "Picked up",
        "In treatment",
        "Treatment done",
      ],
      default: "Yet to be picked up",
    },

    reportedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Multiple descriptions from different users
    descriptions: [
      {
        text: { type: String, required: true },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // Photos uploaded by users
    photos: [
      {
        url: { type: String, required: true },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // Reporter info history
    reporterInfo: [
      {
        name: { type: String },
        contact: { type: String },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    // Update history (location changes)
    history: [
      {
        location: {
          type: {
            type: String,
            enum: ["Point"],
            default: "Point",
          },
          coordinates: {
            type: [Number],
            required: true,
          },
        },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

reportSchema.index({ location: "2dsphere" });

export default mongoose.model("Report", reportSchema);
