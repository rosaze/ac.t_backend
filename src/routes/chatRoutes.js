const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatController');
const authorize = require('../middleware/authorize');

router.post('/chatrooms', authorize, ChatController.createChatRoom); //ok
router.get('/chatrooms', authorize, ChatController.getChatRooms); //ok
router.post('/messages', authorize, ChatController.sendMessage); //ok
router.get('/messages/:chatRoomId', authorize, ChatController.getMessages); //ok

module.exports = router;
