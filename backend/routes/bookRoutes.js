
const express = require("express");
const router = express.Router();

const Book = require("../models/Book");
const Inventory = require("../models/Inventory");

// ADD BOOK
router.post("/", async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      totalStock
    } = req.body;

    if (!title || !author || !isbn || !category ||
        totalStock === undefined) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (!Number.isInteger(Number(totalStock)) || Number(totalStock) < 0) {
      return res.status(400).json({
        message: "Stock must be a non-negative integer"
      });
    }

    const existingBook = await Book.findOne({ isbn });

    if (existingBook) {
      return res.status(409).json({
        message: "ISBN already exists"
      });
    }

    const book = await Book.create({
      title,
      author,
      isbn,
      category,
      totalStock: Number(totalStock),
      availableStock: Number(totalStock)
    });

    if (Number(totalStock) > 0) {
      await Inventory.create({
        book: book._id,
        type: "ADD",
        quantity: Number(totalStock),
        previousStock: 0,
        newStock: Number(totalStock),
        remarks: "Initial stock"
      });
    }

    res.status(201).json({
      message: "Book added successfully",
      book
    });

  } catch (error) {
    res.status(500).json({
      message: error.code === 11000
        ? "ISBN already exists"
        : error.message
    });
  }
});


// GET ALL BOOKS + SEARCH + FILTER + SORT
router.get("/", async (req, res) => {
  try {
    const {
      search,
      category,
      sort
    } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { isbn: { $regex: search, $options: "i" } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    let sortOption = {};

    if (sort === "name") sortOption.title = 1;
    if (sort === "name_desc") sortOption.title = -1;
    if (sort === "stock") sortOption.availableStock = -1;

    const books = await Book.find(filter).sort(sortOption);

    res.status(200).json({
      count: books.length,
      books
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// GET SINGLE BOOK
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    res.json(book);

  } catch (error) {
    res.status(400).json({ message: "Invalid book ID" });
  }
});


// UPDATE BOOK
router.put("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    const { title, author, isbn, category } = req.body;

    if (isbn && isbn !== book.isbn) {
      const existing = await Book.findOne({ isbn });

      if (existing) {
        return res.status(409).json({
          message: "ISBN already exists"
        });
      }
    }

    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (isbn !== undefined) book.isbn = isbn;
    if (category !== undefined) book.category = category;

    await book.save();

    res.json({
      message: "Book updated successfully",
      book
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// DELETE BOOK
router.delete("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    const activeIssue = await require("../models/Issue").exists({
      book: book._id,
      status: "Issued"
    });

    if (activeIssue) {
      return res.status(400).json({
        message: "Cannot delete a book with active issues"
      });
    }

    await Inventory.deleteMany({ book: book._id });
    await book.deleteOne();

    res.json({
      message: "Book deleted successfully"
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
