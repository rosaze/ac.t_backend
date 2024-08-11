const ChatRoom = require('../models/ChatRooms');
const ChatService = require('../services/ChatService');

// 채팅방 생성
exports.createChatRoom = async (req, res) => {
  try {
    const { participants } = req.body;
    const chatRoom = await ChatService.createChatRoom(participants);
    res.status(201).json(chatRoom);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to create chat room', error: error.message });
  }
};

// 특정 채팅방의 메시지 가져오기
exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await ChatService.getMessages(roomId);
    res.status(200).json(messages);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to get messages', error: error.message });
  }
};

// 메시지 전송
exports.sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { sender, content } = req.body;
    const message = await ChatService.sendMessage(roomId, sender, content);
    res.status(201).json(message);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to send message', error: error.message });
  }
};
