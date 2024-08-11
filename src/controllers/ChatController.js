const ChatService = require('../services/ChatService');
//방 생성, 메세지 전송/조회
class ChatController {
  async createChatRoom(req, res) {
    try {
      const { name, participants } = req.body;
      const chatRoom = await ChatService.createChatRoom(name, participants);
      res.status(201).json(chatRoom);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getChatRooms(req, res) {
    try {
      const chatRooms = await ChatService.getChatRooms(req.user.id);
      res.status(200).json(chatRooms);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async sendMessage(req, res) {
    try {
      const { chatRoomId, message } = req.body;
      const sentMessage = await ChatService.sendMessage(
        chatRoomId,
        req.user.id,
        message
      );
      res.status(201).json(sentMessage);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getMessages(req, res) {
    try {
      const messages = await ChatService.getMessages(req.params.chatRoomId);
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new ChatController();
