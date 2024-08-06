// src/controllers/profileController.js
const express = require('express');
const router = express.Router();
const profileService = require('../services/profileService');

router.get('/:userId', async (req, res) => {
  try {
    const profile = await profileService.getProfile(req.params.userId);
    res.json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:userId', async (req, res) => {
  try {
    const profile = await profileService.updateProfile(
      req.params.userId,
      req.body
    );
    res.json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
