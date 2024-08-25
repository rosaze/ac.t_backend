const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatController');
const authorize = require('../middleware/authorize');

router.post('/chatrooms', authorize, ChatController.createChatRoom);
router.get('/chatrooms', authorize, ChatController.getChatRooms);
router.post('/messages', authorize, ChatController.sendMessage);
router.get('/messages/:chatRoomId', authorize, ChatController.getMessages);

module.exports = router;
