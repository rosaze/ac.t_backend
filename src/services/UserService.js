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

    // 새로 추가된 자격증 객체를 반환
    return user.certificates[user.certificates.length - 1];
  }

  // 자격증 삭제와 배지 삭제를 함께 진행하는 메서드입니다.
  static async removeCertificate(userId, certificateId) {
    try {
      // 사용자 조회
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // 자격증을 찾아서 삭제
      const certificate = user.certificates.find((cert) =>
        cert._id.equals(certificateId)
      );
      if (!certificate) {
        throw new Error('Certificate not found');
      }

      // 자격증 삭제
      user.certificates = user.certificates.filter(
        (cert) => !cert._id.equals(certificateId)
      );

      // 관련 배지 이름 가져오기
      const badgeName = certificate.badgeName;

      // 배지 삭제
      if (badgeName) {
        await BadgeService.removeBadge(userId, badgeName);
      }

      // 변경 사항 저장
      await user.save();

      return user.certificates; // 업데이트된 자격증 목록 반환
    } catch (error) {
      console.error('Error removing certificate and badge:', error);
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
