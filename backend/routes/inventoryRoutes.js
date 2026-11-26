
const express = require("express");
const router = express.Router();

const Book = require("../models/Book");
const Inventory = require("../models/Inventory");

// ADD OR REDUCE STOCK
router.post("/", async (req, res) => {
  let stockUpdated = false;
  let updatedBook = null;

  try {
    const { bookId, type, quantity, remarks } = req.body;

    if (!bookId || !type || quantity === undefined) {
      return res.status(400).json({
        message: "Book ID, type and quantity are required"
      });
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({
        message: "Quantity must be a positive integer"
      });
    }

    if (!["ADD", "REDUCE"].includes(type)) {
      return res.status(400).json({
        message: "Type must be ADD or REDUCE"
      });
    }

    const update = type === "ADD"
      ? {
          $inc: {
            totalStock: qty,
            availableStock: qty
          }
        }
      : {
          $inc: {
            totalStock: -qty,
            availableStock: -qty
          }
        };

    const condition = {
      _id: bookId
    };

    if (type === "REDUCE") {
      condition.availableStock = { $gte: qty };
      condition.totalStock = { $gte: qty };
    }

    const previousBook = await Book.findById(bookId);

    if (!previousBook) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    updatedBook = await Book.findOneAndUpdate(
      condition,
      update,
      { new: true }
    );

    if (!updatedBook) {
      return res.status(400).json({
        message: "Insufficient available stock for reduction"
      });
    }

    stockUpdated = true;

    await Inventory.create({
      book: bookId,
      type,
      quantity: qty,
      previousStock: previousBook.availableStock,
      newStock: updatedBook.availableStock,
      remarks: remarks || `Stock ${type.toLowerCase()}ed`
    });

    res.json({
      message: `Stock ${type.toLowerCase()} successful`,
      book: updatedBook
    });

  } catch (error) {
    if (stockUpdated && updatedBook) {
      const qty = Number(req.body.quantity);

      await Book.updateOne(
        { _id: updatedBook._id },
        req.body.type === "ADD"
          ? {
              $inc: {
                totalStock: -qty,
                availableStock: -qty
              }
            }
          : {
              $inc: {
                totalStock: qty,
                availableStock: qty
              }
            }
      ).catch(() => {});
    }

    res.status(500).json({
      message: error.message
    });
  }
});


// GET INVENTORY HISTORY
router.get("/", async (req, res) => {
  try {
    const { bookId, type } = req.query;

    const filter = {};

    if (bookId) filter.book = bookId;
    if (type) filter.type = type.toUpperCase();

    const history = await Inventory.find(filter)
      .populate("book", "title isbn")
      .sort({ createdAt: -1 });

    res.json({
      count: history.length,
      history
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;
