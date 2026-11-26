
const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    },

    // Currently borrowed books count
    activeBorrowCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 3
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
