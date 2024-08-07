const profileService = require('../services/profileService');

exports.getProfile = async (req, res) => {
  try {
    const profile = await profileService.getProfile(req.params.userId);
    res.json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const profile = await profileService.updateProfile(
      req.params.userId,
      req.body
    );
    res.json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
