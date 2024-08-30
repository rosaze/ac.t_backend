const mongoose = require('mongoose');

const SurveyResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seaOrLand: { type: String, required: true },
  indoorOrOutdoor: { type: String, required: true },
  groupSize: { type: String, required: true },
  season: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SurveyResult', SurveyResultSchema);
