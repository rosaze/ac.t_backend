const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userid: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  pw: { type: String, required: true },
  name: { type: String, required: true },
  createdAT: { type: Date, default: Date.now },
  location_preference: {
    type: String,
    enum: ["outdoor", "indoor"],
    required: true,
  },
  environment_preference: {
    type: String,
    enum: ["sea", "mountain"],
    required: true,
  },
  group_preference: {
    type: String,
    enum: ["group", "individual"],
    required: true,
  },
  season_preference: {
    type: String,
    enum: ["winter", "summer"],
    required: true,
  },
  preferred_activity_types: { type: [String], default: [] },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
