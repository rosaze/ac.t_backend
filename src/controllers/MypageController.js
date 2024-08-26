const UserService = require('../services/UserService');
const ActivityAnalysisService = require('../services/ActivityAnalysisService');
const PreferenceService = require('../services/preferenceService');
const BadgeService = require('../services/badgeService');

class MypageController {
  // 개인 정보 관리
  async getPersonalInfo(req, res) {
    try {
      const userId = req.user._id;
      const userInfo = await UserService.getUserProfile(userId);
      res.status(200).json(userInfo);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to retrieve personal info',
        error: error.message,
      });
    }
  }

  // 전문 자격증 등록 및 확인
  async manageCertificates(req, res) {
    try {
      const userId = req.user._id;
      if (req.method === 'POST') {
        const certificate = req.body;
        await UserService.addCertificate(userId, certificate);
        res.status(201).json({ message: 'Certificate added successfully' });
      } else if (req.method === 'DELETE') {
        const certificateId = req.params.certificateId;
        await UserService.removeCertificate(userId, certificateId);
        res.status(200).json({ message: 'Certificate removed successfully' });
      } else {
        res.status(405).json({ message: 'Method not allowed' });
      }
    } catch (error) {
      res.status(500).json({
        message: 'Failed to manage certificates',
        error: error.message,
      });
    }
  }

  // 마이페이지 활동 기록(맵 추가)
  async getActivityMap(req, res) {
    try {
      const userId = req.user._id;
      const activitySummary = await ActivityAnalysisService.getActivitySummary(
        userId
      );
      const activityMap = await activityMapService.getActivityMaps(userId);

      res.status(200).json({
        activitySummary,
        activityMap,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to retrieve activity map',
        error: error.message,
      });
    }
  }

  // 안 가본 곳 추천
  async recommendNewPlaces(req, res) {
    try {
      const userId = req.user._id;
      const recommendations = await PreferenceService.getRecommendedActivities(
        userId
      );
      res.status(200).json(recommendations);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to recommend new places',
        error: error.message,
      });
    }
  }

  // 사용자 배지 조회
  async getUserBadges(req, res) {
    try {
      const userId = req.user._id;
      const badges = await BadgeService.getUserBadges(userId);
      res.status(200).json(badges);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Failed to retrieve badges', error: error.message });
    }
  }

  // 배지 지급 조건 처리
  async processBadgeAward(req, res) {
    try {
      const { badgeType } = req.body;
      const userId = req.user._id;

      let result;
      switch (badgeType) {
        case 'visit':
          result = await BadgeService.awardBadge(userId, '장소 방문 배지');
          break;
        case 'activity':
          result = await BadgeService.awardBadge(userId, '활동 배지');
          break;
        case 'post':
          result = await BadgeService.awardBadge(userId, '게시글 작성 배지');
          break;
        case 'hashtag':
          result = await BadgeService.awardBadge(userId, '해시태그 배지');
          break;
        case 'event':
          result = await BadgeService.awardBadge(userId, '이벤트 배지');
          break;
        case 'chatroom':
          result = await BadgeService.awardBadge(userId, '메이트 채팅방 배지');
          break;
        case 'image':
          result = await BadgeService.awardBadge(userId, '이미지 생성 배지');
          break;
        case 'certificate':
          result = await BadgeService.awardBadge(userId, '자격증 등록 배지');
          break;
        default:
          return res.status(400).json({ message: 'Invalid badge type' });
      }

      res.status(200).json({ message: 'Badge awarded successfully', result });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to process badge award',
        error: error.message,
      });
    }
  }

  // 활동 기록 / 요약
  async getActivitySummary(req, res) {
    try {
      const userId = req.user._id;
      const activitySummary = await ActivityAnalysisService.getActivitySummary(
        userId
      );

      res.status(200).json(activitySummary);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to retrieve activity summary',
        error: error.message,
      });
    }
  }

  // 활동 기록 분석 결과 취향 변경 추천
  async getPreferenceRecommendation(req, res) {
    try {
      const userId = req.user._id;
      const recommendation = await PreferenceService.recommendPreferenceUpdate(
        userId
      );

      res.status(200).json(recommendation);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to retrieve preference recommendation',
        error: error.message,
      });
    }
  }
}

module.exports = new MypageController();
