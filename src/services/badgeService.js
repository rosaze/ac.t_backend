const Badge = require('../models/badges');
const User = require('../models/user');
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

    // 배지 존재 여부 확인
    let badge = await Badge.findOne({ name: badgeName });
    if (!badge) {
      badge = new Badge({ name: badgeName });
      await badge.save();
    }

    // 이미 배지를 수여받은 경우 중복 수여 방지
    const hasBadge = await UserBadge.findOne({
      user: userId,
      badge: badge._id,
    });
    if (hasBadge) {
      console.log('User already has this badge');
      return user;
    }

    const userBadge = new UserBadge({ user: userId, badge: badge._id });
    await userBadge.save();
    console.log(`Badge ${badgeName} awarded to user: ${userId}`); // 테스트 로그

    return user;
  }

  // 사용자 배지 가져오기 메서드
  static async getUserBadges(userId) {
    console.log(`Fetching badges for user: ${userId}`); // 테스트 로그
    return await User.findById(userId).populate('badges.badge');
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
