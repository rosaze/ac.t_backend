const Profile = require('../models/Profile');

exports.getProfile = async (userId) => {
  return await user.findById(userId).select('-kakoId'); // 비공개 필드를 제외하고 조회
};

exports.updateProfile = async (userId, profileData) => {
  return await User.findByIdAndUpdate(userId, profileData, {
    new: true,
    runValidators: true,
  });
};
