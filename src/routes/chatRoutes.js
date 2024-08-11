const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatController');

router.post('/chatrooms', ChatController.createChatRoom);
router.get('/chatrooms', ChatController.getChatRooms);
router.post('/messages', ChatController.sendMessage);
router.get('/messages/:chatRoomId', ChatController.getMessages);

module.exports = router;
