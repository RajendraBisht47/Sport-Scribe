const { Router } = require("express");
const { Module } = require("module");
const router = Router();

const Poster = require("../models/poster");
const fs = require("fs");
const path = require("path");
const { rmSync } = require("fs");
const User = require("../models/user");
const Comment = require("../models/comment");

router.get("/create", (req, res) => {
  return res.render("posterform", {
    user: req.user,
  });
});

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

router.post("/create", async (req, res) => {
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
    posterBase64,
  } = req.body;

  if (description == "") {
    description =
      "Please follow the rules and be aware that any inappropriate behavior will incur a fine. Maintain respect for others. Thank you for visiting this poster, and we hope you will come again. Let's work together to create a positive and enjoyable environment for everyone.";
  }

  const newPoster = await Poster.create({
    poster: posterBase64,
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
    description,
  });
  return res.redirect(`/poster/${newPoster._id}`);
});

module.exports = router;
