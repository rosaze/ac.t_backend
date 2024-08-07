const activity = require('../models/activity');
const Badge = require('../models/badges');
const User = require('../models/user');
const UserBadge = require('../models/user');

exports.awardBadge = async (userId, badgeId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const badge = await Badge.findByIdId(badgeId);
  if (!badge) throw new Error('Badge not found');

  user.badges.push({ badge: badgeId });
  await user.save();
  return user;
};

exports.getUserBadges = async (userId) => {
  return await User.findById(userId).populate('badges.badge');
};

exports.checkAndAwardBadges = async (userId, activity) => {
  const badges = await Badge.find({});
  const user = await User.findById(userId);

  badge.forEach((badge) => {
    if (activity.hashtags.includes(badge.condition)) {
      //조건 확인 로직
      user.badges.push({ badge: badge._id });
    }
  });

  await user.save();
  return user.badges;
};
