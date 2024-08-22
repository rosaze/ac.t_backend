const mongoose = require('mongoose');

const MentorSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  locationTag: { type: String, required: true },
  activityTag: { type: String, required: true },
  date: { type: Date, required: true },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Mentor', MentorSchema);
