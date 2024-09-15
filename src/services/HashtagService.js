const Post = require('../models/Posts');
const BadgeService = require('./badgeService');
const Hashtag = require('../models/Hashtags');
const User = require('../models/user');

class HashtagService {
  constructor() {
    this.pendingHashtags = new Map(); // 대기 중인 해시태그를 저장할 Map
    this.badgeService = new BadgeService();
  }

  async createHashtag(userId, hashtagData) {
    const pendingHashtag = {
      tag: hashtagData.tag,
      createdBy: userId,
      createdAt: new Date(),
      status: 'pending',
    };

    const hashtagId = `${userId}_${Date.now()}`; // 유니크한 ID 생성
    this.pendingHashtags.set(hashtagId, pendingHashtag);

    // 배지 지급
    await this.badgeService.awardBadgeForHashtag(userId);

    return { id: hashtagId, ...pendingHashtag };
  }

  async approveHashtag(hashtagId, developerId) {
    const developer = await User.findById(developerId);
    if (!developer || !developer.isDeveloper) {
      throw new Error('Unauthorized: Only developers can approve hashtags');
    }

    const pendingHashtag = this.pendingHashtags.get(hashtagId);
    if (!pendingHashtag) {
      throw new Error('Pending hashtag not found');
    }

    // 승인된 해시태그를 실제 Hashtag 모델에 저장
    const hashtag = new Hashtag({
      tag: pendingHashtag.tag,
    });
    await hashtag.save();

    // 대기 목록에서 제거
    this.pendingHashtags.delete(hashtagId);

    return hashtag;
  }

  async rejectHashtag(hashtagId, developerId) {
    const developer = await User.findById(developerId);
    if (!developer || !developer.isDeveloper) {
      throw new Error('Unauthorized: Only developers can reject hashtags');
    }

    const pendingHashtag = this.pendingHashtags.get(hashtagId);
    if (!pendingHashtag) {
      throw new Error('Pending hashtag not found');
    }

    // 대기 목록에서 제거
    this.pendingHashtags.delete(hashtagId);

    return { message: 'Hashtag rejected and removed from pending list' };
  }

  async getPendingHashtags() {
    return Array.from(this.pendingHashtags.entries()).map(([id, hashtag]) => ({
      id,
      ...hashtag,
    }));
  }

  async getTopHashtags() {
    // 기존 코드 유지
    const hashtags = await Post.aggregate([
      { $unwind: '$hashtags' },
      {
        $group: {
          _id: {
            location: '$hashtags.location',
            activity: '$hashtags.activity',
            vendor: '$hashtags.vendor',
          },
          count: { $sum: 1 },
          likes: { $sum: '$likes' },
        },
      },
      { $sort: { likes: -1 } },
      { $limit: 10 },
    ]);
    return hashtags;
  }
}

module.exports = new HashtagService();
