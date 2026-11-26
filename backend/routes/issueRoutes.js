
const express = require("express");
const router = express.Router();

const Book = require("../models/Book");
const Member = require("../models/Member");
const Issue = require("../models/Issue");
const Inventory = require("../models/Inventory");

// ISSUE BOOK
router.post("/", async (req, res) => {
  let memberReserved = false;
  let bookReserved = false;
  let createdIssue = null;

  try {
    const { bookId, memberId } = req.body;

    if (!bookId || !memberId) {
      return res.status(400).json({
        message: "Book ID and Member ID are required"
      });
    }

    const member = await Member.findOneAndUpdate(
      {
        _id: memberId,
        status: "Active",
        activeBorrowCount: { $lt: 3 }
      },
      {
        $inc: { activeBorrowCount: 1 }
      },
      { new: true }
    );

    if (!member) {
      return res.status(400).json({
        message: "Member not found, inactive or maximum 3 books limit reached"
      });
    }

    memberReserved = true;

    const book = await Book.findOneAndUpdate(
      {
        _id: bookId,
        availableStock: { $gt: 0 }
      },
      {
        $inc: { availableStock: -1 }
      },
      { new: true }
    );

    if (!book) {
      await Member.updateOne(
        { _id: memberId },
        { $inc: { activeBorrowCount: -1 } }
      );
      memberReserved = false;

      return res.status(400).json({
        message: "Book not found or stock unavailable"
      });
    }

    bookReserved = true;

    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 14);

    createdIssue = await Issue.create({
      book: bookId,
      member: memberId,
      issueDate,
      dueDate,
      status: "Issued"
    });

    await Inventory.create({
      book: bookId,
      type: "ISSUE",
      quantity: 1,
      previousStock: book.availableStock + 1,
      newStock: book.availableStock,
      remarks: "Book issued to member"
    });

    res.status(201).json({
      message: "Book issued successfully",
      issue: createdIssue
    });

  } catch (error) {
    // Rollback if an operation fails
    if (createdIssue) {
      await Issue.deleteOne({ _id: createdIssue._id }).catch(() => {});
    }

    if (bookReserved) {
      await Book.updateOne(
        { _id: req.body.bookId },
        { $inc: { availableStock: 1 } }
      ).catch(() => {});
    }

    if (memberReserved) {
      await Member.updateOne(
        { _id: req.body.memberId },
        { $inc: { activeBorrowCount: -1 } }
      ).catch(() => {});
    }

    res.status(500).json({
      message: error.message
    });
  }
});


// GET ALL ISSUE RECORDS
router.get("/", async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("book", "title isbn")
      .populate("member", "name email")
      .sort({ createdAt: -1 });

    res.json({
      count: issues.length,
      issues
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// RETURN BOOK
router.put("/return/:id", async (req, res) => {
  try {
    const issue = await Issue.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "Issued"
      },
      {
        $set: {
          status: "Returned",
          returnDate: new Date()
        }
      },
      { new: true }
    );

    if (!issue) {
      return res.status(404).json({
        message: "Issue record not found or book already returned"
      });
    }

    const book = await Book.findOneAndUpdate(
      {
        _id: issue.book,
        $expr: {
          $lt: ["$availableStock", "$totalStock"]
        }
      },
      {
        $inc: { availableStock: 1 }
      },
      { new: true }
    );

    if (!book) {
      await Issue.updateOne(
        { _id: issue._id, status: "Returned" },
        {
          $set: {
            status: "Issued",
            returnDate: null
          }
        }
      );

      return res.status(400).json({
        message: "Cannot return: stock limit reached or book missing"
      });
    }

    const member = await Member.findOneAndUpdate(
      {
        _id: issue.member,
        activeBorrowCount: { $gt: 0 }
      },
      {
        $inc: { activeBorrowCount: -1 }
      },
      { new: true }
    );

    if (!member) {
      await Book.updateOne(
        { _id: book._id },
        { $inc: { availableStock: -1 } }
      );

      await Issue.updateOne(
        { _id: issue._id },
        { $set: { status: "Issued", returnDate: null } }
      );

      return res.status(400).json({
        message: "Member borrowing count could not be updated"
      });
    }

    try {
      await Inventory.create({
        book: book._id,
        type: "RETURN",
        quantity: 1,
        previousStock: book.availableStock - 1,
        newStock: book.availableStock,
        remarks: "Book returned by member"
      });
    } catch (historyError) {
      await Book.updateOne(
        { _id: book._id },
        { $inc: { availableStock: -1 } }
      );

      await Member.updateOne(
        { _id: member._id },
        { $inc: { activeBorrowCount: 1 } }
      );

      await Issue.updateOne(
        { _id: issue._id },
        { $set: { status: "Issued", returnDate: null } }
      );

      throw historyError;
    }

    res.json({
      message: "Book returned successfully",
      issue
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;
