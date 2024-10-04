const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

const posterSchema = new Schema({
  createdBy: {
    type: String,
    required: true,
    ref: "User",
  },
  posterurl: {
    type: String,
    required: true,
  },
  sportname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phonenumber: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  view: {
    type: Number,
    default: 0,
  },
  comment: {
    type: Number,
    default: 0,
  },
});

const Poster = new mongoose.model("Poster", posterSchema, "posters");

module.exports = Poster;
