const UserService = require('../services/UserService');
const PreferenceService = require('../services/preferenceService');
const ActivityAnalysisService = require('../services/ActivityAnalysisService');
const mongoose = require('mongoose');

class UserController {
  // 사용자 생성
  async createUser(req, res) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).send(user);
    } catch (error) {
      console.error(`Error creating user: ${error.message}`);
      res
        .status(400)
        .json({ message: 'Failed to create user', error: error.message });
    }
  }

  // 사용자 조회 및 프로필 조회
  async getUserById(req, res) {
    try {
      const userId = new mongoose.Types.ObjectId(req.params.id);
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.send(user);
    } catch (error) {
      console.error(`Error getting user by ID: ${error.message}`);
      res
        .status(500)
        .json({ message: 'Failed to get user', error: error.message });
    }
  }

  // 사용자 업데이트 및 프로필 수정
  async updateUser(req, res) {
    try {
      if (!req.params.id) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const userId = new mongoose.Types.ObjectId(req.params.id);

      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Update data is required' });
      }

      const user = await UserService.updateUser(userId, req.body);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error(`Error updating user: ${error.message}`);
      res
        .status(500)
        .json({ message: 'Failed to update user', error: error.message });
    }
  }

  // 사용자 삭제
  async deleteUser(req, res) {
    try {
      const userId = new mongoose.Types.ObjectId(req.params.id);
      const user = await UserService.deleteUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.send(user);
    } catch (error) {
      console.error(`Error deleting user: ${error.message}`);
      res
        .status(500)
        .json({ message: 'Failed to delete user', error: error.message });
    }
  }

  // 사용자 자격증 추가
  // 인증서 추가 함수
  async addCertificate(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const user = await UserService.getUserById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const newCertificate = {
        date: req.body.date,
        institution: req.body.institution,
        title: req.body.title,
      };

      const certificates = await UserService.addCertificate(id, newCertificate);
      res.status(201).json(certificates);
    } catch (error) {
      console.error(`Error adding certificate: ${error.message}`);
      res
        .status(500)
        .json({ message: 'Failed to add certificate', error: error.message });
    }
  }

  //사용자 자격증 삭제
  async removeCertificate(req, res) {
    try {
      const { id, certificateId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id) ||
        !mongoose.Types.ObjectId.isValid(certificateId)
      ) {
        return res.status(400).json({
          message: 'Invalid user ID or certificate ID',
        });
      }

      const userId = new mongoose.Types.ObjectId(id);
      const certificateIdObj = new mongoose.Types.ObjectId(certificateId);

      const certificates = await UserService.removeCertificate(
        userId,
        certificateIdObj
      );
      res.status(200).json({
        message: 'Certificate removed successfully',
        certificates,
      });
    } catch (error) {
      console.error(`Error removing certificate: ${error.message}`);
      res.status(400).json({
        message: 'Failed to remove certificate',
        error: error.message,
      });
    }
  }

  // 사용자 선호도 업데이트 및 추천 제공
  async updatePreferences(req, res) {
    try {
      const userId = mongoose.Types.ObjectId(req.params.id);
      const recommendations = await PreferenceService.updatePreferences(
        userId,
        req.body
      );
      res.status(200).json({
        message: 'Preferences updated successfully',
        recommendations,
      });
    } catch (error) {
      console.error(`Error updating preferences: ${error.message}`);
      res.status(400).json({
        message: 'Failed to update preferences',
        error: error.message,
      });
    }
  }

  // 밸런스 게임 결과 저장 및 선호도 설정
  async saveBalanceGameResult(req, res) {
    try {
      const userId = new mongoose.Types.ObjectId(req.params.id);
      const recommendations = await PreferenceService.saveBalanceGameResult(
        userId,
        req.body
      );
      res.status(200).json({
        message: 'Preferences set successfully',
        recommendations,
      });
    } catch (error) {
      console.error(`Error saving balance game result: ${error.message}`);
      res.status(400).json({
        message: 'Failed to save balance game result',
        error: error.message,
      });
    }
  }

  // 사용자에게 활동 추천 제공
  async getRecommendedActivities(req, res) {
    try {
      const userId = mongoose.Types.ObjectId(req.params.id);
      const recommendations = await PreferenceService.getRecommendedActivities(
        userId
      );
      res.status(200).json(recommendations);
    } catch (error) {
      console.error(`Error fetching recommendations: ${error.message}`);
      res.status(500).json({
        message: 'Failed to fetch activity recommendations',
        error: error.message,
      });
    }
  }

  // 사용자 활동 요약 및 선호도 변경 추천, 선호도 업데이트 제공
  async getActivitySummaryAndPreferenceRecommendation(req, res) {
    try {
      const userId = mongoose.Types.ObjectId(req.params.id);
      const activitySummary = await ActivityAnalysisService.getActivitySummary(
        userId
      );
      const recommendation = await PreferenceService.recommendPreferenceUpdate(
        userId
      );
      const recommendations = await PreferenceService.updatePreferences(
        userId,
        req.body
      );

      res.status(200).json({
        activitySummary,
        recommendation,
        message: 'Preferences updated successfully',
        recommendations,
      });
    } catch (error) {
      console.error(
        `Error fetching activity summary, preference recommendation, and updating preferences: ${error.message}`
      );
      res.status(500).json({
        message: 'Failed to process request',
        error: error.message,
      });
    }
  }

  // 사용자 프로필 조회
  async getUserProfile(req, res) {
    try {
      const userId = new mongoose.Types.ObjectId(req.params.id);
      const profile = await UserService.getUserProfile(userId);
      res.status(200).json(profile);
    } catch (error) {
      console.error(`Error fetching user profile: ${error.message}`);
      res.status(500).json({
        message: 'Failed to fetch user profile',
        error: error.message,
      });
    }
  }

  // 마커 카테고리 설정
  async setMarkerCategory(req, res) {
    try {
      const userId = mongoose.Types.ObjectId(req.params.id);
      const { color, categoryName } = req.body;

      if (!color || !categoryName) {
        return res.status(400).json({
          message: 'Color and categoryName are required fields.',
        });
      }

      const markerCategories = await UserService.setMarkerCategory(
        userId,
        color,
        categoryName
      );

      res.status(200).json({
        message: 'Marker category set successfully',
        markerCategories,
      });
    } catch (error) {
      console.error(`Error setting marker category: ${error.message}`);
      res.status(500).json({
        message: 'Failed to set marker category',
        error: error.message,
      });
    }
  }

  // 마커 카테고리 조회
  async getMarkerCategories(req, res) {
    try {
      const userId = new mongoose.Types.ObjectId(req.params.id);
      const markerCategories = await UserService.getMarkerCategories(userId);

      res.status(200).json({
        markerCategories,
      });
    } catch (error) {
      console.error(`Error fetching marker categories: ${error.message}`);
      res.status(500).json({
        message: 'Failed to fetch marker categories',
        error: error.message,
      });
    }
  }
}

module.exports = new UserController();
