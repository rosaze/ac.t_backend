const User = require('../models/user');
const ActivityRecommendationService = require('../services/activityRecommendationService');

// 카카오 로그인 후 새로운 사용자 생성
exports.createUser = async (req, res) => {
  try {
    const { kakaoId, email, name, gender, age } = req.body;
    let user = await User.findOne({ kakaoId });

    if (!user) {
      user = new User({
        kakaoId,
        email,
        name,
        gender,
        age,
        // 선호도를 기본값으로 초기화할 수 있습니다.
        location_preference: 'outdoor',
        environment_preference: 'mountain',
        group_preference: 'individual',
        season_preference: 'summer',
      });
      await user.save();
    }

    res.status(201).send(user);
  } catch (error) {
    console.error(`Error creating user: ${error.message}`);
    res
      .status(400)
      .json({ message: 'Failed to create user', error: error.message });
  }
};

// 사용자 ID로 사용자 조회.데이터베이스에서 조회하여 반환
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
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

// 사용자 ID로 사용자 업데이트
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
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

// 사용자 ID로 사용자 삭제
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
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

// 사용자 프로필에 자격증 추가
exports.addCertificate = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { title, institution, date } = req.body;
    user.certificates.push({ title, institution, date });
    await user.save();

    res.status(200).json({
      message: 'Certificate added successfully',
      certificates: user.certificates,
    });
  } catch (error) {
    console.error(`Error adding certificate: ${error.message}`);
    res
      .status(400)
      .json({ message: 'Failed to add certificate', error: error.message });
  }
};

// 사용자 프로필에서 자격증 삭제
exports.removeCertificate = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.certificates.id(req.params.certificateId).remove();
    await user.save();

    res.status(200).json({
      message: 'Certificate removed successfully',
      certificates: user.certificates,
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
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { seaOrLand, indoorOrOutdoor, groupSize, season } = req.body;
    user.surveyResult = { seaOrLand, indoorOrOutdoor, groupSize, season };

    // preferred_activity_types 필드 업데이트
    user.surveyResult.preferred_activity_types = `${seaOrLand}_${indoorOrOutdoor}_${groupSize}_${season}`;

    await user.save();

    // 사용자 선호도 업데이트 및 추천 제공 (확인!)
    const recommendations =
      await ActivityRecommendationService.recommendActivities(user._id);

    res.status(200).json({
      message: 'Preferences updated successfully',
      user,
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
    const userId = req.params.userId;
    const { location, environment, group, season } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 사용자 선호도 설정
    user.location_preference = location; // 예: 'outdoor' 또는 'indoor'
    user.environment_preference = environment; // 예: 'sea' 또는 'mountain'
    user.group_preference = group; // 예: 'group' 또는 'individual'
    user.season_preference = season; // 예: 'winter' 또는 'summer'

    await user.save();

    // 선호도 기반 추천 활동 제공
    const recommendations =
      await ActivityRecommendationService.recommendActivities(user._id);

    res
      .status(200)
      .json({ message: 'Preferences set successfully', user, recommendations });
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
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    const recommendations =
      await ActivityRecommendationService.recommendActivities(userId);

    if (!recommendations || recommendations.length === 0) {
      return res
        .status(200)
        .json({ message: 'No new recommendations available at this time.' });
    }

    res.status(200).json({ recommendations });
  } catch (error) {
    console.error(`Error fetching recommendations: ${error.message}`);
    res.status(500).json({
      message: 'Failed to fetch activity recommendations.',
      error: error.message,
    });
  }
};
