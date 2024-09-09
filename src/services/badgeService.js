const User = require('../models/user'); // 유저 모델
const Badge = require('../models/badge'); // 유저 모델

class BadgeService {
  // 배지 지급 (특정 기준 충족 시)
  async awardBadge(userId, badgeName) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      let badge = await Badge.findOne({ name: badgeName });
      if (!badge) {
        badge = new Badge({
          name: badgeName,
          description: `Badge for ${badgeName}`,
          icon_url: 'default_icon_url',
        });
        await badge.save();
      }

      const hasBadge = user.badges.some(
        (userBadge) => userBadge.badge.toString() === badge._id.toString()
      );

      if (!hasBadge) {
        user.badges.push({
          badge: badge._id,
          awarded_at: new Date(),
        });
        await user.save();
        console.log(`Awarded badge: ${badgeName} to user: ${userId}`);
        return `Badge ${badgeName} awarded to user ${userId}`;
      } else {
        console.log(`User already has this badge: ${badgeName}`);
        return 'User already has this badge';
      }
    } catch (error) {
      console.error('Error awarding badge:', error.message);
      throw new Error('Failed to award badge');
    }
  }

  // 시군 방문에 따른 배지 지급 (장소 이름 + 매니아)
  async awardBadgeForVisit(userId, region) {
    const user = await User.findById(userId);
    const visitCount = user.visits.filter(
      (visit) => visit.region === region
    ).length;

    if (visitCount >= 5) {
      const badgeName = `${region} 매니아`; // 동적으로 장소 이름 포함
      await this.awardBadge(userId, badgeName);
    }
  }

  // 액티비티 수행에 따른 배지 지급 (활동명 + 매니아)
  async awardBadgeForActivity(userId, activityName) {
    const user = await User.findById(userId);
    const activityCount = user.activities.filter(
      (activity) => activity.name === activityName
    ).length;

    if (activityCount >= 5) {
      const badgeName = `${activityName} 매니아`; // 동적으로 활동명 포함
      await this.awardBadge(userId, badgeName);
    }
  }

  // 이벤트 우승에 따른 배지 지급 (이벤트 이름 + 위너)
  async awardBadgeForEventWinner(userId, eventName) {
    const badgeName = `${eventName} 위너`; // 동적으로 이벤트 이름 포함
    await this.awardBadge(userId, badgeName);
  }

  // 채팅방 개설에 따른 배지 지급 (방 이름 + 리더)
  async awardBadgeForChatLeader(userId, roomName) {
    const badgeName = `${roomName} 리더`; // 동적으로 방 이름 포함
    await this.awardBadge(userId, badgeName);
  }

  // 자격증 등록에 따른 배지 지급 (종류 + 마스터)
  async awardBadgeForCertificate(userId, certificateTitle) {
    try {
      console.log(
        `Attempting to award badge for certificate: ${certificateTitle}`
      );
      const badgeName = `${certificateTitle} 마스터`; // 자격증 제목 기반으로 배지 이름 생성
      console.log(`Generated badge name: ${badgeName}`);

      // badge 지급 로직 실행
      await this.awardBadge(userId, badgeName);

      console.log(`Successfully awarded badge: ${badgeName}`);
    } catch (error) {
      console.error('Error awarding badge for certificate:', error.message);
      throw new Error('Failed to award badge for certificate');
    }
  }

  // 게시글 작성에 따른 배지 지급 (기본 로직)
  async awardBadgeForPost(userId) {
    const user = await User.findById(userId);
    const postCount = user.posts.length;

    if (postCount >= 5) {
      await this.awardBadge(userId, '아낌없이 주는 나무'); // 5번 이상 게시글 작성 시 배지 지급
    }
  }

  // 해시태그 새로 등록에 따른 배지 지급 (기본 로직)
  async awardBadgeForHashtag(userId) {
    const user = await User.findById(userId);
    const hashtagCount = user.hashtags.length;

    if (hashtagCount >= 1) {
      await this.awardBadge(userId, '해시태그 개척자'); // 해시태그 새로 등록 시 배지 지급
    }
  }

  async getUserBadges(userId) {
    try {
      const user = await User.findById(userId).populate('badges.badge');
      return user.badges;
    } catch (error) {
      console.error('Error getting user badges:', error.message);
      throw new Error('Failed to get user badges');
    }
  }
}

module.exports = BadgeService;
