const mongoose = require('mongoose');

//사용자 자격중 저장 - 임시로 적어둠
//이후 api나 다른 기능 찾으면 대체
const certificateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  institution: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const userSchema = new mongoose.Schema({
  kakaoId: {
    type: String,
    required: true,
    unique: true,
    maxlength: 255,
  },
  email: {
    type: String,
    required: false,
    maxlength: 255,
  },
  name: {
    type: String,
    required: true,
    maxlength: 255,
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  createdAT: {
    type: Date,
    default: Date.now,
    required: true,
  },
  location_preference: {
    type: String,
    enum: ['outdoor', 'indoor'],
    required: true,
  },
  environment_preference: {
    type: String,
    enum: ['sea', 'mountain'],
    required: true,
  },
  group_preference: {
    type: String,
    enum: ['group', 'individual'],
    required: true,
  },
  season_preference: {
    type: String,
    enum: ['winter', 'summer'],
    required: true,
  },
  preferred_activity_types: {
    type: String,
  },
  certificates: [certificateSchema], // 자격증 필드 추가
});

const User = mongoose.model('User', userSchema);

module.exports = User;
