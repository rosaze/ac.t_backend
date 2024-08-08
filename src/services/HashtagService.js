const Post = require('../models/Posts'); //post 몽구스 모델

class HashtagService {
  async getTopHashtags() {
    const hashtags = await Post.aggregate([
      //집계
      { $unwind: '$hashtags' }, //하나의 문서가 여러 개의 해시태그를 갖고 있으면
      //unwind-> 여러 개의 문서로 분해, 각 문서에는 하나의 해시태그만 포함~
      {
        $group: {
          _id: {
            location: '$hashtags.location', // 두 개 필드로 나눔
            activity: '$hashtags.activity',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } }, // 빈도수 count 기준으로 내림차순 정렬.
      { $limit: 5 }, //상위 다섯개 해시태그만 서택
    ]);
    return hashtags;
  }
}

module.exports = new HashtagService();
