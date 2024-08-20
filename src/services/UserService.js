// UserService 클래스는 사용자의 데이터 처리와 관련된 비즈니스 로직을 담당합니다.
const User = require('../models/user');
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
        location_preference: 'outdoor',
        environment_preference: 'mountain',
        group_preference: 'individual',
        season_preference: 'summer',
      });
      await user.save(); // 데이터를 저장합니다.
    }

    return user;
  }

  // 사용자 ID로 사용자를 조회하는 메서드입니다.
  static async getUserById(userId) {
    return await User.findById(userId);
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

  // 사용자 프로필에 자격증을 추가하는 메서드입니다.
  static async addCertificate(userId, certificateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.certificates.push(certificateData);
    await user.save();

    //자격증 등록에 따른 배지 지급
    await BadgeService.awardBadge(userId, `${certificateData.title} 마스터`);

    return user.certificates;
  }

  // 사용자 프로필에서 자격증을 삭제하는 메서드입니다.
  static async removeCertificate(userId, certificateId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.certificates.id(certificateId).remove();
    await user.save();
    return user.certificates;
  }
}

module.exports = UserService;
