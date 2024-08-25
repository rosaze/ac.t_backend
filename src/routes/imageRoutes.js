const express = require('express');
const router = express.Router();
const imageService = require('../services/imageService');
const authorize = require('../middleware/authorize');

// 이미지 합성 엔드포인트
router.post('/merge', authorize, async (req, res) => {
  const { userImage, providerImage } = req.body;

  try {
    const outputImagePath = 'output/merged-image.jpg'; // 결과 이미지 경로
    await imageService.mergeImages(userImage, providerImage, outputImagePath);

    const imageUrl = `https://storage.googleapis.com/your-bucket-name/${outputImagePath}`;
    res.status(200).json({ message: 'Image merged successfully', imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Failed to merge images', error });
  }
});

module.exports = router;
