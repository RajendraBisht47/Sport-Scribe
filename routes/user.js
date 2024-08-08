const { Router } = require("express");
const { Module } = require("module");
const router = Router();
const User = require("../models/user");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

//changes
const mongoURI = process.env.MONGO_URL;

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.post("/signup", async (req, res) => {
  const { username, password, profileurlBase64 } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user) {
      return res.render("signup", {
        message: "Username already exists",
      });
    }

    await User.create({
      username,
      password,
      profileurl: profileurlBase64,
    });

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
