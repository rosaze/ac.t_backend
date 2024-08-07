const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bio: { type: String, maxlength: 500 },
  profilePicture: { type: String },
});

module.exports = mongoose.model('Profile', profileSchema);
