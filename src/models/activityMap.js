const mongoose = require('mongoose');

const activityMapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Posts', required: true },
  region: { type: String, required: true },
  activity_date: { type: Date, required: true },
});

module.exports = mongoose.model('ActivityMap', activityMapSchema);

//후기로 부터 확인되고 체크되는 것은 추후 보완할 예정
