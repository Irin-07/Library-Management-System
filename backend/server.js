<<<<<<< HEAD
require("dotenv").config();
=======
require("dotenv").config({ path: require("path").join(__dirname, ".env") });
>>>>>>> 2f3d365 (Initial commit - Library Management System)

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("Library Management API Running");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is working"
  });
});

app.use("/api/books", require("./routes/bookRoutes"));
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/issues", require("./routes/issueRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});