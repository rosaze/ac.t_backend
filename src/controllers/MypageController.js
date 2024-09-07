const UserService = require('../services/UserService');
const ActivityRecommendationService = require('../services/activityRecommendationService');
const activityMapService = require('../services/activityMapService');

class MypageController {
  constructor(badgeService) {
    this.badgeService = badgeService;
  }

  // 사용자 개인 정보 조회
  async getPersonalInfo(req, res) {
    try {
      const userId = req.user.id;
      const userInfo = await UserService.getUserProfile(userId);
      res.status(200).json(userInfo);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to retrieve personal info',
        error: error.message,
      });
    }
  }

  // 전문 자격증 등록 및 관리
  async manageCertificates(req, res) {
    try {
      const userId = req.user.id;
      console.log('manageCertificates 호출됨');
      console.log(`사용자 ID: ${userId}`);

      if (req.method === 'POST') {
        const certificate = req.body;
        console.log('추가할 자격증 정보:', certificate);
        const addedCertificate = await UserService.addCertificate(
          userId,
          certificate
        );

        // 배지 지급 로직 호출
        console.log('Awarding badge for certificate:', addedCertificate.title);
        await this.badgeService.awardBadgeForCertificate(
          userId,
          addedCertificate.title
        );

        res.status(201).json({
          message: 'Certificate added successfully',
          certificateId: addedCertificate._id,
        });
      } else if (req.method === 'DELETE') {
        const certificateId = req.params.certificateId;
        await UserService.removeCertificate(userId, certificateId);
        res.status(200).json({ message: 'Certificate removed successfully' });
      } else {
        res.status(405).json({ message: 'Method not allowed' });
      }
    } catch (error) {
      console.error('Error managing certificates:', error.message);
      res.status(500).json({
        message: 'Failed to manage certificates',
        error: error.message,
      });
    }
  }

  // 사용자 배지 조회
  async getUserBadges(req, res) {
    try {
      const userId = req.user.id;
      const badges = await this.badgeService.getUserBadges(userId);
      res.status(200).json(badges);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to retrieve badges',
        error: error.message,
      });
    }
  }

  // 활동 기록 조회 및 요약
  async getActivityMap(req, res) {
    try {
      const userId = req.user.id;
      const activityMap = await activityMapService.getActivityMaps(userId);
      res.status(200).json(activityMap);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to retrieve activity map',
        error: error.message,
      });
    }
  }

  // 사용자 선호도 업데이트
  async updatePreferences(req, res) {
    try {
      const userId = req.user.id;
      const preferences = req.body;

      const updatedUser = await UserService.updatePreferences(
        userId,
        preferences
      );
      res
        .status(200)
        .json({ message: 'Preferences updated successfully', updatedUser });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to update preferences',
        error: error.message,
      });
    }
  }

  // 사용자 선호도와 맞는 활동 추천
  async recommendActivities(req, res) {
    try {
      const userId = req.user.id;
      const recommendedActivities =
        await ActivityRecommendationService.recommendActivities(userId);
      res.status(200).json(recommendedActivities);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to recommend activities',
        error: error.message,
      });
    }
  }
}

// BadgeService를 직접 가져오지 않고, 외부에서 주입받도록 합니다.
module.exports = MypageController;
