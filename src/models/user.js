const mongoose = require('mongoose');

// 사용자 자격증 스키마
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

// 사용자 배지 스키마
const userBadgeSchema = new mongoose.Schema({
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true,
  },
  awarded_at: {
    type: Date,
    default: Date.now,
  },
});

// 사용자 활동 기록 스키마
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
});

// 사용자 스키마
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
  certificates: [certificateSchema], // 자격증 필드 추가
  badges: [userBadgeSchema], // 사용자 배지 필드 추가
  activities: [activityMapSchema], // 활동 기록 필드 추가
  isMentor: {
    type: Boolean,
    default: false,
  },
});

// 동적으로 personal_preferences 생성
userSchema.virtual('personal_preferences').get(function () {
  return `${this.location_preference}_${this.environment_preference}_${this.group_preference}_${this.season_preference}`;
});

//멘토 자격 부여 로직
userSchema.methods.checkMentorEligibility = function () {
  if (this.certificates && this.certificates.length > 0) {
    this.isMentor = true;
  } else {
    this.isMentor = false;
  }
};

userSchema.pre('save', function (next) {
  this.checkMentorEligibility();
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
