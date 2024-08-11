const express = require('express');
const router = express.Router();
const MateController = require('../controllers/MateController');

router.post('/mates', MateController.createMatePost);
router.get('/mates', MateController.getMatePosts);
router.get('/mates/:id', MateController.getMatePostById);
router.put('/mates/:id/join', MateController.joinMatePost);
router.put('/mates/:id/leave', MateController.leaveMatePost);
router.delete('/mates/:id', MateController.deleteMatePost);

module.exports = router;
