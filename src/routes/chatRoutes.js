const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatController');

router.post('/create', ChatController.createChatRoom);
router.get('/:roomId/messages', ChatController.getMessages);
router.post('/:roomId/messages', ChatController.sendMessage);

module.exports = router;
