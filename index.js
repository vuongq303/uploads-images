const express = require("express");
const multer = require("multer");
const { join } = require("path");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", function (req, res) {
  res.sendFile(join(__dirname, "views", "index.html"));
});

app.use(express.static(join(__dirname, "uploads")));

const items = Array.from({ length: 200 }, (_, i) => `Item ${i + 1}`);
app.get("/items", (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  console.log(req.query);

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);

  const paginatedItems = items.slice(startIndex, endIndex);

  res.json({
    page: parseInt(page),
    limit: parseInt(limit),
    total: items.length,
    items: paginatedItems,
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = join(__dirname, "uploads", req.body.name);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

app.post("/uploads", upload.array("files", 100), (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).send("No files uploaded.");
    }
    res.status(200).send({ message: "Files uploaded successfully.", files });
  } catch (error) {
    res.status(500).send({ error: "Error uploading files." });
  }
});

app.listen(80, () => console.log("Server started"));
module.exports = app;
