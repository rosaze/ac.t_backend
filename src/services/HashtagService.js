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
            location: '$hashtags.location', // 장소
            activity: '$hashtags.activity', //액티비티
            vendor: '$hashtags.vendor', //추가된 업체명 해시태그
          },
          count: { $sum: 1 }, //해시태그 조합 개수 세기
        },
      },
      { $sort: { count: -1 } }, // 빈도수 count 기준으로 내림차순 정렬.
      { $limit: 5 }, //상위 다섯개 해시태그만 서택
    ]);
    return hashtags;
  }
}

module.exports = new HashtagService();
