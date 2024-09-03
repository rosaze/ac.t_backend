const UserService = require('../services/UserService');
const ActivityAnalysisService = require('../services/ActivityAnalysisService');
const PreferenceService = require('../services/preferenceService');
const BadgeService = require('../services/badgeService');
const activityMapService = require('../services/activityMapService');

class MypageController {
  // 개인 정보 관리
  async getPersonalInfo(req, res) {
    try {
      console.log('getPersonalInfo 호출됨');
      if (!req.user) {
        console.error('Error: req.user가 정의되지 않음');
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const userId = req.user.id;
      console.log(`사용자 ID: ${userId}`);

      const userInfo = await UserService.getUserProfile(userId);
      console.log('사용자 정보:', userInfo);

      res.status(200).json(userInfo);
    } catch (error) {
      console.error('개인 정보 가져오기 실패:', error.message);
      res.status(500).json({
        message: 'Failed to retrieve personal info',
        error: error.message,
      });
    }
  }

  // 전문 자격증 등록 및 확인
  async manageCertificates(req, res) {
    try {
      console.log('manageCertificates 호출됨');
      if (!req.user) {
        console.error('Error: req.user가 정의되지 않음');
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const userId = req.user.id;
      console.log(`사용자 ID: ${userId}`);

      if (req.method === 'POST') {
        const certificate = req.body;
        console.log('추가할 자격증 정보:', certificate);

        const addedCertificate = await UserService.addCertificate(
          userId,
          certificate
        );
        const certificateId = addedCertificate._id; // 새로 추가된 자격증의 ID를 가져옴
        console.log(`등록한 자격증 ID: ${certificateId}`);

        res
          .status(201)
          .json({ message: 'Certificate added successfully', certificateId });
      } else if (req.method === 'DELETE') {
        const certificateId = req.params.certificateId;
        console.log(`삭제할 자격증 ID: ${certificateId}`);

        await UserService.removeCertificate(userId, certificateId);
        console.log('자격증 삭제 성공');

        res.status(200).json({ message: 'Certificate removed successfully' });
      } else {
        console.error('허용되지 않은 메서드 사용');
        res.status(405).json({ message: 'Method not allowed' });
      }
    } catch (error) {
      console.error('자격증 관리 실패:', error.message);
      res.status(500).json({
        message: 'Failed to manage certificates',
        error: error.message,
      });
    }
  }

  // 마이페이지 활동 기록(맵 추가)
  async getActivityMap(req, res) {
    try {
      console.log('getActivityMap 호출됨');
      if (!req.user) {
        console.error('Error: req.user가 정의되지 않음');
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const userId = req.user.id;
      console.log(`사용자 ID: ${userId}`);

      const activitySummary = await ActivityAnalysisService.getActivitySummary(
        userId
      );
      const activityMap = await activityMapService.getActivityMaps(userId);
      console.log('활동 요약 및 맵 정보:', { activitySummary, activityMap });

      res.status(200).json({
        activitySummary,
        activityMap,
      });
    } catch (error) {
      console.error('활동 맵 가져오기 실패:', error.message);
      res.status(500).json({
        message: 'Failed to retrieve activity map',
        error: error.message,
      });
    }
  }

  // 안 가본 곳 추천
  async recommendNewPlaces(req, res) {
    try {
      console.log('recommendNewPlaces 호출됨');
      if (!req.user) {
        console.error('Error: req.user가 정의되지 않음');
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const userId = req.user.id;
      console.log(`사용자 ID: ${userId}`);

      const recommendations = await PreferenceService.getRecommendedActivities(
        userId
      );
      console.log('추천된 장소들:', recommendations);

      res.status(200).json(recommendations);
    } catch (error) {
      console.error('새로운 장소 추천 실패:', error.message);
      res.status(500).json({
        message: 'Failed to recommend new places',
        error: error.message,
      });
    }
  }

  // 사용자 배지 조회
  async getUserBadges(req, res) {
    try {
      console.log('getUserBadges 호출됨');
      if (!req.user) {
        console.error('Error: req.user가 정의되지 않음');
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const userId = req.user.id;
      console.log(`사용자 ID: ${userId}`);

      const badges = await BadgeService.getUserBadges(userId);
      console.log('사용자 배지들:', badges);

      res.status(200).json(badges);
    } catch (error) {
      console.error('배지 조회 실패:', error.message);
      res
        .status(500)
        .json({ message: 'Failed to retrieve badges', error: error.message });
    }
  }

  // 배지 지급 조건 처리
  async processBadgeAward(req, res) {
    try {
      console.log('processBadgeAward 호출됨');
      if (!req.user) {
        console.error('Error: req.user가 정의되지 않음');
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { badgeType } = req.body;
      const userId = req.user.id;
      console.log(`사용자 ID: ${userId}, 배지 유형: ${badgeType}`);

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
          console.error('Invalid badge type:', badgeType);
          return res.status(400).json({ message: 'Invalid badge type' });
      }

      console.log('배지 지급 결과:', result);
      res.status(200).json({ message: 'Badge awarded successfully', result });
    } catch (error) {
      console.error('배지 지급 처리 실패:', error.message);
      res.status(500).json({
        message: 'Failed to process badge award',
        error: error.message,
      });
    }
  }

  // 활동 기록 / 요약
  async getActivitySummary(req, res) {
    try {
      console.log('getActivitySummary 호출됨');
      if (!req.user) {
        console.error('Error: req.user가 정의되지 않음');
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const userId = req.user.id;
      console.log(`사용자 ID: ${userId}`);

      const activitySummary = await ActivityAnalysisService.getActivitySummary(
        userId
      );
      console.log('활동 요약:', activitySummary);

      res.status(200).json(activitySummary);
    } catch (error) {
      console.error('활동 요약 가져오기 실패:', error.message);
      res.status(500).json({
        message: 'Failed to retrieve activity summary',
        error: error.message,
      });
    }
  }

  // 활동 기록 분석 결과 취향 변경 추천
  async getPreferenceRecommendation(req, res) {
    try {
      console.log('getPreferenceRecommendation 호출됨');
      if (!req.user) {
        console.error('Error: req.user가 정의되지 않음');
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const userId = req.user.id;
      console.log(`사용자 ID: ${userId}`);

      const recommendation = await PreferenceService.recommendPreferenceUpdate(
        userId
      );
      console.log('추천된 취향 업데이트:', recommendation);

      res.status(200).json(recommendation);
    } catch (error) {
      console.error('취향 추천 가져오기 실패:', error.message);
      res.status(500).json({
        message: 'Failed to retrieve preference recommendation',
        error: error.message,
      });
    }
  }
}

module.exports = new MypageController();
