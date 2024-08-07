require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { prototype } = require("events");
const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");

//modeles
const Poster = require("./models/poster");
const User = require("./models/user");
//end

//routes variable
const userRoute = require("./routes/user");
const posterRoute = require("./routes/poster");
const { name } = require("ejs");
//end

const app = express();

//all middlewares are set here
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.resolve("./public")));
app.use(checkForAuthenticationCookie("token"));

//end.

//view engine set.
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

//mongdb connection code.
mongoose.connect(process.env.MONGO_URL).then((error) => {
  console.log("MongoDB connected");
});

app.get("/", async (req, res) => {
  const posters = await Poster.find({});
  if (posters.length == 0) {
    res.render("home", { user: req.user, message: "No Result" });
  } else {
    res.render("home", {
      user: req.user,
      posters: posters,
    });
  }
});

app.get("/sport/:sport", async (req, res) => {
  const sport = req.params.sport;
  const posters = await Poster.find({ sportname: sport });
  if (posters.length == 0) {
    res.render("home", { user: req.user, message: "No Result" });
  } else {
    res.render("home", {
      user: req.user,
      posters: posters,
    });
  }
});

app.post("/search", async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ username: username });
  if (!user) {
    res.redirect("/");
  } else {
    const posters = await Poster.find({ createdBy: user._id });
    res.render("home", {
      user: req.user,
      posters: posters,
    });
  }
});

app.get("/yourposter", async (req, res) => {
  creatorId = req.user._id;
  const posters = await Poster.find({ createdBy: creatorId });
  if (posters.length == 0) {
    res.render("home", { user: req.user, message: "No Result" });
  } else {
    res.render("home", {
      user: req.user,
      posters: posters,
    });
  }
});
//routes
app.use("/user", userRoute);
app.use("/poster", posterRoute);

//end
app.listen(process.env.PORT || 8000, () => {
  console.log("Server Stated at port : ", process.env.PORT || 8000);
});

// http://localhost:8001/poster/669e1a1b265e95a5c26fe210
