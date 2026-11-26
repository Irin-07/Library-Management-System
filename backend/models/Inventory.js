const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true
    },

    type: {
      type: String,
      enum: ["ADD", "REDUCE", "ISSUE", "RETURN"],
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    previousStock: {
      type: Number,
      required: true
    },

    newStock: {
      type: Number,
      required: true
    },

    remarks: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);