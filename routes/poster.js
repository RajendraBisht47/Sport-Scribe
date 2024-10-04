const { Router } = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2; // Import cloudinary
const Poster = require("../models/poster");
const fs = require("fs");
const path = require("path");
const User = require("../models/user");
const Comment = require("../models/comment");

const router = Router();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage configuration
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
// Route to render the create poster form
router.get("/create", (req, res) => {
  return res.render("posterform", {
    user: req.user,
  });
});

// Route to handle comments on posters
router.post("/comment/:id", async (req, res) => {
  const poster = await Poster.findById(req.params.id);
  poster.comment += 1;
  await poster.save();

  const userid = req.user._id;
  const posterid = req.params.id;
  const { comment } = req.body;

  await Comment.create({
    comment,
    createdBy: userid,
    posterId: posterid,
  });

  return res.redirect(`/poster/${req.params.id}`);
});

// Route to view a specific poster
router.get("/:id", async (req, res) => {
  const comments = await Comment.find({ posterId: req.params.id }).populate(
    "createdBy"
  );
  const poster = await Poster.findById(req.params.id).populate("createdBy");

  poster.view += 1;
  await poster.save();
  const creator = await User.findById(poster.createdBy);

  return res.render("poster", {
    user: req.user,
    poster: poster,
    creator: creator,
    comments: comments,
  });
});

// Route to create a new poster
router.post("/create", upload.single("posterurl"), async (req, res) => {
  const {
    phonenumber,
    sportname,
    date,
    time,
    email,
    username,
    state,
    city,
    zip,
    location,
    description,
  } = req.body;

  // Set default description if empty
  let des;
  if (description === "") {
    des =
      "Please follow the rules and be aware that any inappropriate behavior will incur a fine. Maintain respect for others. Thank you for visiting this poster, and we hope you will come again. Let's work together to create a positive and enjoyable environment for everyone.";
  } else {
    des = description;
  }

  // Check if file exists
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  // Upload the image to Cloudinary
  const profileImage = req.file.path;
  const result = await cloudinary.uploader.upload(profileImage, {
    folder: "posters",
  });

  let url = result.secure_url;

  const newPoster = await Poster.create({
    posterurl: url,
    createdBy: req.user._id,
    sportname,
    date,
    time,
    email,
    phonenumber,
    username,
    state,
    city,
    zip,
    location,
    description: des,
  });

  fs.unlinkSync(profileImage);
  return res.redirect(`/poster/${newPoster._id}`);
});

module.exports = router;
