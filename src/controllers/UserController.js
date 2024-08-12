const UserService = require('../services/UserService');
const PreferenceService = require('../services/preferenceService');
const ActivityAnalysisService = require('../services/ActivityAnalysisService');

//사용자 생성
exports.createUser = async (req, res) => {
  try {
    const user = await UserService.createUser(req.body);
    res.status(201).send(user);
  } catch (error) {
    console.error(`Error creating user: ${error.message}`);
    res
      .status(400)
      .json({ message: 'Failed to create user', error: error.message });
  }
};

//사용자 조회 및 프로필 조회
exports.getUserById = async (req, res) => {
  try {
    const user = await UserService.getUserById(req.params.id);
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
};

//사용자 업데이트 및 프로필 수정
exports.updateUser = async (req, res) => {
  try {
    const user = await UserService.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.send(user);
  } catch (error) {
    console.error(`Error updating user: ${error.message}`);
    res
      .status(400)
      .json({ message: 'Failed to update user', error: error.message });
  }
};

//사용자 삭제
exports.deleteUser = async (req, res) => {
  try {
    const user = await UserService.deleteUser(req.params.id);
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
};

//사용자 자격증 추가
exports.addCertificate = async (req, res) => {
  try {
    const certificates = await UserService.addCertificate(
      req.params.id,
      req.body
    );
    res.status(200).json({
      message: 'Certificate added successfully',
      certificates,
    });
  } catch (error) {
    console.error(`Error adding certificate: ${error.message}`);
    res
      .status(400)
      .json({ message: 'Failed to add certificate', error: error.message });
  }
};

//사용자 자격증 삭제
exports.removeCertificate = async (req, res) => {
  try {
    const certificates = await UserService.removeCertificate(
      req.params.id,
      req.params.certificateId
    );
    res.status(200).json({
      message: 'Certificate removed successfully',
      certificates,
    });
  } catch (error) {
    console.error(`Error removing certificate: ${error.message}`);
    res
      .status(400)
      .json({ message: 'Failed to remove certificate', error: error.message });
  }
};

// 사용자 선호도 업데이트 및 추천 제공
exports.updatePreferences = async (req, res) => {
  try {
    const recommendations = await PreferenceService.updatePreferences(
      req.params.id,
      req.body
    );
    res.status(200).json({
      message: 'Preferences updated successfully',
      recommendations,
    });
  } catch (error) {
    console.error(`Error updating preferences: ${error.message}`);
    res
      .status(400)
      .json({ message: 'Failed to update preferences', error: error.message });
  }
};

// 밸런스 게임 결과 저장 및 선호도 설정
exports.saveBalanceGameResult = async (req, res) => {
  try {
    const recommendations = await PreferenceService.saveBalanceGameResult(
      req.params.id,
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
};

// 사용자에게 활동 추천 제공// 사용자 찾고, 추천활동 반환
exports.getRecommendedActivities = async (req, res) => {
  try {
    const recommendations = await PreferenceService.getRecommendedActivities(
      req.params.id
    );
    res.status(200).json(recommendations);
  } catch (error) {
    console.error(`Error fetching recommendations: ${error.message}`);
    res.status(500).json({
      message: 'Failed to fetch activity recommendations',
      error: error.message,
    });
  }
};

// 사용자 활동 요약 및 선호도 변경 추천, 선호도 업데이트 제공
exports.getActivitySummaryAndPreferenceRecommendation = async (req, res) => {
  try {
    // 활동 요약 데이터 가져오기
    const activitySummary = await ActivityAnalysisService.getActivitySummary(
      req.params.id
    );

    // 선호도 변경 추천 데이터 가져오기
    const recommendation = await PreferenceService.recommendPreferenceUpdate(
      req.params.id
    );

    // 사용자의 선호도를 업데이트하고, 새로운 추천 활동 목록 가져오기
    const recommendations = await PreferenceService.updatePreferences(
      req.params.id,
      req.body
    );

    res.status(200).json({
      activitySummary, // 활동 요약 데이터
      recommendation, // 선호도 변경 추천 데이터
      message: 'Preferences updated successfully',
      recommendations, // 업데이트된 선호도에 따른 추천 활동 목록
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
};
