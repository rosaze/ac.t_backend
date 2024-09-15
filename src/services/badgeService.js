const User = require('../models/user'); // 유저 모델
const Badge = require('../models/badge'); // 유저 모델
const Post = require('../models/Posts');
const ActivityMap = require('../models/activityMap'); // ActivityMap 모델 불러오기

class BadgeService {
  // 실제 배지를 지급하는 함수
  async awardBadge(userId, badgeName) {
    console.log(`Awarding badge: ${badgeName} to user ${userId}`);
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
      console.log(`Badge ${badgeName} successfully awarded to user ${userId}`);
    } else {
      console.log(`User already has this badge: ${badgeName}`);
    }
  }

  // 시군 방문에 따른 배지 지급 //확인 완료
  async awardBadgeForVisit(userId, region) {
    console.log(`사용자 ${userId}에게 ${region} 방문 배지 지급 호출됨`);

    const visitCount = await ActivityMap.countDocuments({
      user: userId,
      region: region,
    });

    if (visitCount >= 5) {
      const badgeName = `${region} 매니아`;
      await this.awardBadge(userId, badgeName);
      console.log(`사용자 ${userId}에게 ${region} 방문 배지가 지급되었습니다.`);
    } else {
      console.log(
        `사용자 ${userId}는 ${region}을(를) 충분히 방문하지 않았습니다.`
      );
    }
  }

  //확인 완료
  async awardBadgeForActivity(userId, activityName) {
    console.log(`사용자 ${userId}에게 ${activityName} 활동 배지 지급 호출됨`);

    try {
      const user = await User.findById(userId);
      if (!user) throw new Error(`사용자 ${userId}를 찾을 수 없습니다.`);

      const activityCount = await ActivityMap.countDocuments({
        user: userId,
        activityTag: activityName,
      });

      console.log(
        `사용자 ${userId}의 ${activityName} 활동 횟수: ${activityCount}`
      );

      if (activityCount >= 5) {
        const badgeName = `${activityName} 매니아`;
        await this.awardBadge(userId, badgeName);
        console.log(`사용자 ${userId}에게 ${badgeName} 배지가 지급되었습니다.`);
      } else {
        console.log(
          `사용자 ${userId}는 ${activityName} 활동을 ${activityCount}번 수행했습니다. 배지 지급 기준(5회)에 도달하지 않았습니다.`
        );
      }
    } catch (error) {
      console.error(`배지 지급 중 오류 발생: ${error.message}`);
      throw error;
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

  // 자격증 등록에 따른 배지 지급 (종류 + 마스터) // 확인 완료
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

  // 게시글 등록에 따른 배지 지급 //확인 완료
  async awardBadgeForPost(userId) {
    try {
      const userPosts = await Post.countDocuments({ author: userId });

      // 게시글이 6개 이상이면 '아낌없이 주는 나무' 배지를 지급
      if (userPosts >= 5) {
        const hasBadge = await User.findOne({
          _id: userId,
          'badges.badge': (
            await Badge.findOne({ name: '아낌없이 주는 나무' })
          )._id,
        });

        if (!hasBadge) {
          const badge = await Badge.findOne({ name: '아낌없이 주는 나무' });
          if (!badge) {
            throw new Error("Badge '아낌없이 주는 나무' not found");
          }

          await User.updateOne(
            { _id: userId },
            { $push: { badges: { badge: badge._id, awarded_at: new Date() } } }
          );
          console.log(`'아낌없이 주는 나무' 배지 지급 완료: ${userId}`);
        } else {
          console.log(
            `사용자 ${userId}는 이미 '아낌없이 주는 나무' 배지를 가지고 있습니다.`
          );
        }
      } else {
        console.log(
          `게시글이 ${userPosts}개로 아직 배지 지급 조건에 도달하지 않았습니다.`
        );
      }
    } catch (error) {
      console.error('배지 지급 중 오류:', error.message);
      throw new Error('배지 지급 실패');
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
