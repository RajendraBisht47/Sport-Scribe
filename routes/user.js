const { Router } = require("express");
const router = Router();
const User = require("../models/user");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const path = require("path");
require("dotenv").config();
const fs = require("fs");
// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads1/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.post("/signup", upload.single("profileurl"), async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (user) {
      return res.render("signup", {
        message: "Username already exists",
      });
    }

    // Upload image to Cloudinary
    const profileImage = req.file.path;
    const result = await cloudinary.uploader.upload(profileImage, {
      folder: "users",
    });

    // Store the Cloudinary URL in the database
    const newUser = await User.create({
      username,
      password,
      profileurl: result.secure_url, // Store the Cloudinary URL here
    });

    // Delete the uploaded file from the local system
    fs.unlinkSync(profileImage);

    return res.render("signin", {
      username: username,
      password: password,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).render("signup", {
      message: "Server error",
    });
  }
});

router.get("/signin", (req, res) => {
  return res.render("signin");
});

router.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(username, password);

    return res.cookie("token", token).redirect("/");
  } catch (error) {
    return res.render("signin", {
      message: "Incorrect Username or Password",
    });
  }
});

router.get("/logout", async (req, res) => {
  res.clearCookie("token");
  return res.redirect("/");
});

module.exports = router;
