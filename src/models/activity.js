const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    enum: ['outdoor', 'indoor'],
    required: true,
  },
  environment: {
    type: String,
    enum: ['sea', 'mountain'],
    required: true,
  },
  group: {
    type: String,
    enum: ['group', 'individual'],
    required: true,
  },
  season: {
    type: String,
    enum: ['winter', 'summer'],
    required: true,
  },
});

module.exports = mongoose.model('Activity', ActivitySchema);
