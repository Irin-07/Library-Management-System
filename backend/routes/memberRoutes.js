
const express = require("express");
const router = express.Router();

const Member = require("../models/Member");
const Issue = require("../models/Issue");

// ADD MEMBER
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone || !address) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existing = await Member.findOne({
      email: email.toLowerCase()
    });

    if (existing) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    const member = await Member.create({
      name,
      email,
      phone,
      address
    });

    res.status(201).json({
      message: "Member registered successfully",
      member
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// GET ALL MEMBERS
router.get("/", async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });

    res.json({
      count: members.length,
      members
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// GET SINGLE MEMBER
router.get("/:id", async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        message: "Member not found"
      });
    }

    res.json(member);

  } catch (error) {
    res.status(400).json({ message: "Invalid member ID" });
  }
});


// UPDATE MEMBER
router.put("/:id", async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        message: "Member not found"
      });
    }

    const { name, email, phone, address, status } = req.body;

    if (email && email.toLowerCase() !== member.email) {
      const existing = await Member.findOne({
        email: email.toLowerCase()
      });

      if (existing) {
        return res.status(409).json({
          message: "Email already exists"
        });
      }

      member.email = email.toLowerCase();
    }

    if (name !== undefined) member.name = name;
    if (phone !== undefined) member.phone = phone;
    if (address !== undefined) member.address = address;
    if (status !== undefined) member.status = status;

    await member.save();

    res.json({
      message: "Member updated successfully",
      member
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// DELETE MEMBER
router.delete("/:id", async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        message: "Member not found"
      });
    }

    const activeIssue = await Issue.exists({
      member: member._id,
      status: "Issued"
    });

    if (activeIssue) {
      return res.status(400).json({
        message: "Member has active borrowed books"
      });
    }

    await member.deleteOne();

    res.json({
      message: "Member deleted successfully"
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
