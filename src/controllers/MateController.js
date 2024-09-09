const MateService = require('../services/MateService');
const ChatService = require('../services/ChatService');
const PreferenceService = require('../services/preferenceService');

class MateController {
  async joinMateChatRoom(req, res) {
    try {
      const { mateId, userId } = req.body;

      //메이트 게시글 가져오기
      const matePost = await MateService.getMatePostById(mateId);
      const creatorId = matePost.author; // 메이트 게시글 작상자를 채팅방 생성자로 지정

      // 채팅방이 이미 있는지 확인
      let chatRoom = await ChatService.findChatRoomByMateId(mateId);
      if (!chatRoom) {
        // 채팅방이 없으면 새로 생성
        chatRoom = await ChatService.createChatRoom(`Mate 채팅방`, [userId]);
      } else {
        // 이미 존재하는 채팅방에 유저 추가
        await ChatService.addUserToChatRoom(chatRoom._id, userId);
      }

      res.status(200).json({ chatRoomId: chatRoom._id });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }

    // 추가적인 Mate 관련 메서드들...
  }
  async createMatePost(req, res) {
    try {
      const matePost = await MateService.createMatePost({
        ...req.body,
        author: req.user.id, //현재 로그인된 사용자의 ID를 포함
      });
      res.status(201).json(matePost);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  //모집게시글필터링
  async getMatePosts(req, res) {
    try {
      const filters = {
        activityTag: req.query.activityTag,
        locationTag: req.query.locationTag,
        date: req.query.date,
        sortBy: req.query.sortBy,
        personal_preferences: req.query.personal_preferences,
      };
      const matePosts = await MateService.getMatePosts(filters);
      res.status(200).jsonc(matePosts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async filterMatePostsByActivity(req, res) {
    try {
      const activityTag = req.query.activityTag;
      const matePosts = await MateService.filterMatePostsByActivity(
        activityTag
      );
      res.status(200).json(matePosts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async filterMatePostsByLocation(req, res) {
    try {
      const locationTag = req.query.locationTag;
      const matePosts = await MateService.filterMatePostsByLocation(
        locationTag
      );
      res.status(200).json(matePosts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async filterMatePostsByPreferences(req, res) {
    try {
      // Log req.user to check if it exists
      console.log('req.user:', req.user);

      // Check if user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const userId = req.user.id;

      // Log userId
      console.log('userId:', userId);

      // Call MateService to filter based on user preferences
      const matePosts = await MateService.filterMatePostsByUserPreferences(
        userId
      );

      res.status(200).json(matePosts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getMatePostById(req, res) {
    try {
      const matePost = await MateService.getMatePostById(req.params.id);
      res.status(200).json(matePost);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async joinMatePost(req, res) {
    try {
      const matePost = await MateService.joinMatePost(
        req.params.id,
        req.body.userId
      );
      res.status(200).json(matePost);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async leaveMatePost(req, res) {
    try {
      const matePost = await MateService.leaveMatePost(
        req.params.id,
        req.body.userId
      );
      res.status(200).json(matePost);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async deleteMatePost(req, res) {
    try {
      await MateService.deleteMatePost(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new MateController();
