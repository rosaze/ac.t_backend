const User = require('../models/User');
const BadgeService = require('./badgeService');

class UserService {
  // 새로운 사용자를 생성하는 메서드입니다.
  static async createUser(data) {
    const { kakaoId, email, name, gender, age } = data;
    let user = await User.findOne({ kakaoId });

    if (!user) {
      // 사용자가 없으면 새로운 사용자를 생성하고 기본 선호도를 설정합니다.
      user = new User({
        kakaoId,
        email,
        name,
        gender,
        age,
        preferences: {
          // 기본 선호도 설정
          location: 'outdoor',
          environment: 'mountain',
          group: 'individual',
          season: 'summer',
        },
      });
      await user.save(); // 데이터를 저장합니다.
    }

    return user;
  }

  // 사용자 프로필에 자격증을 추가하는 메서드입니다.
  static async addCertificate(userId, certificateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.certificates.push(certificateData);
    await user.save();

    // 자격증 등록에 따른 배지 지급
    await BadgeService.awardBadge(userId, `${certificateData.title} 마스터`);

    return user.certificates;
  }

  // 사용자에서 특정 자격증을 제거하는 메서드입니다.
  static async removeCertificate(userId, certificateId) {
    try {
      const result = await User.findByIdAndUpdate(
        userId,
        { $pull: { certificates: { _id: certificateId } } },
        { new: true }
      ).exec();

      if (!result) {
        throw new Error('User not found');
      }

      // 자격증이 제거되었는지 확인
      const certificateRemoved = result.certificates.every(
        (cert) => cert._id.toString() !== certificateId.toString()
      );
      if (!certificateRemoved) {
        throw new Error('Certificate not found');
      }

      return result.certificates;
    } catch (error) {
      console.error('Error removing certificate:', error);
      throw error;
    }
  }

  // 사용자 정보를 업데이트하는 메서드입니다.
  static async updateUser(userId, updateData) {
    return await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  // 사용자를 삭제하는 메서드입니다.
  static async deleteUser(userId) {
    return await User.findByIdAndDelete(userId);
  }

  // 사용자 ID로 사용자를 조회하는 메서드입니다.
  static async getUserById(userId) {
    return await User.findById(userId);
  }

  // 사용자 프로필 정보를 가져오는 메서드입니다.
  static async getUserProfile(userId) {
    const user = await User.findById(userId).populate('badges').exec();

    if (!user) {
      throw new Error('User not found');
    }

    return {
      profileImage: user.profileImage,
      name: user.name,
      badges: user.badges,
      preferences: user.preference,
      gender: user.gender,
      age: user.age,
    };
  }
}

module.exports = UserService;
