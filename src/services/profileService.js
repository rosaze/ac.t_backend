// src/services/profileService.js
const Profile = require('../schemas/profileSchema');

const getProfile = async (userId) => {
  const profile = await Profile.findOne({ user: userId }).populate('user');
  if (!profile) {
    throw new Error('Profile not found');
  }
  return profile;
};

const updateProfile = async (userId, profileData) => {
  const profile = await Profile.findOneAndUpdate(
    { user: userId },
    profileData,
    { new: true }
  );
  return profile;
};

module.exports = {
  getProfile,
  updateProfile,
};
