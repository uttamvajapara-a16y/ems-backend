const mongoose = require("mongoose");

const roleRequestSchema = new mongoose.Schema(
  {
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    requestedRole: {
      type: String,
      enum: ["hr", "manager"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("RoleRequest", roleRequestSchema);