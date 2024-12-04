require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const sharp = require("sharp");

// Model
const Image = require("./models/image");

const app = express();
const port = 5000;
app.use(cors());

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000, // เพิ่ม timeout เป็น 60 วินาที
});

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/cloudinary", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Route for uploading an image
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    // Resize and compress the image using sharp
    const resizedBuffer = await sharp(file.buffer)
      .resize({ width: 500 }) // ลดขนาดความกว้างเป็น 800px
      .jpeg({ quality: 80 }) // บันทึกเป็น JPEG และลดคุณภาพเป็น 80%
      .toBuffer();

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "demo_input_image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(resizedBuffer);
    });

    // Save to MongoDB
    const newImage = new Image({
      url: result.secure_url,
      public_id: result.public_id,
    });

    await newImage.save();

    res.status(200).json({
      message: "Image uploaded and saved successfully!",
      image: newImage,
    });
  } catch (error) {
    console.error("Error uploading or saving image:", error);
    res.status(500).json({ message: "Upload or save failed!", error });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
