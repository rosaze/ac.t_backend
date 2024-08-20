const Badge = require('../models/badges');
const User = require('../models/user');
const UserBadge = require('../models/userBadge');

exports.awardBadge = async (userId, badgeName) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const badge = await Badge.findByIdId(badgeName);
  if (!badge) throw new Error('Badge not found');

  //이미 배지를 수여받은 경우 중복 수여 방지
  const hasBadge = await UserBadge.findOne({ user: userId, badge: badge._id });
  if (hasBadge) return user;

  const userBadge = new UserBadge({ user: userId, badge: badge._id });
  await userBadge.save();

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
