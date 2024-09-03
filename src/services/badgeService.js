const Badge = require('../models/badges');
const User = require('../models/User');
const UserBadge = require('../models/userBadge');

class BadgeService {
  // 배지 수여 메서드
  static async awardBadge(userId, badgeName) {
    console.log(`Awarding badge: ${badgeName} to user: ${userId}`); // 테스트 로그

    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found');
      throw new Error('User not found');
    }

    // 배지 존재 여부 확인 (name 필드를 기준으로 중복 확인)
    let badge = await Badge.findOne({ name: badgeName });
    if (!badge) {
      // 새로운 배지를 생성
      badge = new Badge({ name: badgeName });
      await badge.save();
    }

    // 사용자가 이미 해당 배지를 가지고 있는지 확인
    const hasBadge = user.badges.some((b) => b.badge.equals(badge._id));
    if (hasBadge) {
      console.log('User already has this badge');
      return user;
    }

    // 사용자에게 배지 추가
    user.badges.push({ badge: badge._id });
    await user.save(); // 사용자 객체에 배지를 추가한 후 저장

    console.log(`Badge ${badgeName} awarded to user: ${userId}`); // 테스트 로그
    return user;
  }

  // 사용자 배지 가져오기 메서드
  static async getUserBadges(userId) {
    console.log(`Fetching badges for user: ${userId}`); // 테스트 로그
    const user = await User.findById(userId).populate('badges.badge').exec();
    return user.badges; // 사용자의 badges 필드만 반환
  }

  // 조건을 확인하여 배지 수여 메서드
  static async checkAndAwardBadges(userId, activity) {
    console.log(`Checking and awarding badges for user: ${userId}`); // 테스트 로그

    const badges = await Badge.find({});
    const user = await User.findById(userId);

    badges.forEach((badge) => {
      if (activity.hashtags.includes(badge.condition)) {
        // 조건 확인 로직
        user.badges.push({ badge: badge._id });
        console.log(`Badge ${badge._id} condition met for user: ${userId}`); // 테스트 로그
      }
    });

    await user.save();
    console.log(`User badges updated for user: ${userId}`); // 테스트 로그
    return user.badges;
  }
}

module.exports = BadgeService;
