const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderModel",
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["Employee", "HR", "Manager", "Admin"],
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "receiverModel",
    },
    receiverModel: {
      type: String,
      required: true,
      enum: ["Employee", "HR", "Manager", "Admin"],
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// speeds up "get conversation between two people" queries - the most common query pattern here
chatSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
chatSchema.index({ receiverId: 1, senderId: 1, createdAt: -1 });

module.exports = mongoose.model("Chat", chatSchema);