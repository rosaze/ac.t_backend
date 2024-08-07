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

// 배지 스키마
const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  icon_url: {
    type: String,
  },
});

//사용자의 배지 스키마
const userBadgeSchema = new mongoose.Schema({
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true,
  },
  awarede_at: {
    type: Date,
    default: Date.now,
  },
});

// 사용자의 활동 기록
const activityMapSchema = new mongoose.Schema({
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Posts',
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  activity_date: {
    type: Date,
    required: true,
  },
  hashtags: [{ type: String }],
  // 해시태그 필드 추가
  // 해시 태그 -> 활동 기록 이 방식을 구현하려 했는데 확실하지 않음 아직.
});

//프로필 사진에 대해서는 추가해야함
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
  bio: {
    type: String,
    maxlength: 500,
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
  surveyResult: {
    seaOrLand: { type: String, enum: ['sea', 'land'], required: true },
    indoorOrOutdoor: {
      type: String,
      enum: ['indoor', 'outdoor'],
      required: true,
    },
    groupSize: { type: String, enum: ['small', 'large'], required: true },
    season: { type: String, enum: ['winter', 'summer'], required: true },
    preferred_activity_types: { type: String }, // 결과를 저장하는 필드
  },
  certificates: [certificateSchema], // 자격증 필드 추가
  badges: [userBadgeSchema], // 사용자 배지 필드 추가
  activities: [activityMapSchema], // 활동 기록 필드 추가
});

const User = mongoose.model('User', userSchema);

module.exports = User;
