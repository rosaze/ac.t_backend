const Post = require('../models/Posts'); //post 몽구스 모델
const BadgeService = require('./badgeService');
const Hashtag = require('../models/Hashtags');

class HashtagService {
  async createHashtag(userId, hashtagData) {
    // 해시태그 생성 로직
    const hashtag = new Hashtag(hashtagData);
    await hashtag.save();

    // 해시태그 관련 배지 지급
    await BadgeService.awardBadgeForHashtag(userId);
  }

  async getTopHashtags() {
    const hashtags = await Post.aggregate([
      //집계
      { $unwind: '$hashtags' }, //해시태그 배열 분리
      {
        $group: {
          _id: {
            location: '$hashtags.location', // 장소
            activity: '$hashtags.activity', //액티비티
            vendor: '$hashtags.vendor', //추가된 업체명 해시태그
          },
          count: { $sum: 1 }, //해시태그 조합 개수 세기
          likes: { $sum: '$likes' }, //해당 해시태그 조합의 Like 총합
        },
      },
      { $sort: { likes: -1 } }, //좋아요 수 기준 내림차순
      { $limit: 10 }, //상위 10개 조합 선택
    ]);
    return hashtags;
  }
}

module.exports = new HashtagService();
