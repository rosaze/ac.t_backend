const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  icon_url: {
    type: String,
  },
});

module.exports = mongoose.model('Badge', badgeSchema);
