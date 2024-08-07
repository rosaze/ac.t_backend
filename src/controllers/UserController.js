const User = require('../models/user');

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
      });
      await user.save();
    }

    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
};

// 사용자 ID로 사용자 조회
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
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
      return res.status(404).send();
    }
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
};

// 사용자 ID로 사용자 삭제
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
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
    res.status(400).json({ error: error.message });
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
    res.status(400).json({ error: error.message });
  }
};

// 사용자 ID로 사용자 삭제
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
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
    res.status(400).json({ error: error.message });
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
    res.status(400).json({ error: error.message });
  }
};

// 사용자 선호도 업데이트
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

    res.status(200).json({ message: 'Preferences updated successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
