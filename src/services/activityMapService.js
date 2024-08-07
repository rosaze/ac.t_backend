const ActivityMap = require('../models/activityMap');
const User = require('../models/user');

exports.addActivityMap = async (activityMapData) => {
  const user = await User.findById(activityMapData.user);
  if (!user) throw new Error('User not found');

  user.activities.push(activityMapData);
  await user.save();

  //배지 조건 체크 및 지급
  await badgeService.checkAndAwardBadges(activityMapData.user, activityMapData);

  return user;
};

exports.getActivityMaps = async (userId) => {
  return await User.findById({ userId }).populate('activities.post_id');
};
