const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    author: {
      type: String,
      required: true,
      trim: true
    },

    isbn: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    category: {
      type: String,
      required: true
    },

    totalStock: {
      type: Number,
      required: true,
      min: 0
    },

    availableStock: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { timestamps: true }
);

bookSchema.pre("validate", function () {
  if (this.availableStock > this.totalStock) {
    this.invalidate(
      "availableStock",
      "Available stock cannot exceed total stock"
    );
  }
});

module.exports = mongoose.model("Book", bookSchema);