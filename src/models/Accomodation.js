// models/Accommodation.js
const mongoose = require('mongoose');

const accommodationSchema = new mongoose.Schema({
  sigungu: String,
  title: String,
  category2: String,
  category3: String,
  // 기타 필요한 필드들...
});

const Accommodation = mongoose.model('Accommodation', accommodationSchema);

module.exports = Accommodation;

// services/AccommodationService.js
const Accommodation = require('../models/Accommodation');

class AccommodationService {
  async getAccommodationInfoBySigungu(sigungu) {
    const categories = [
      '게스트하우스',
      '관광단지',
      '관광호텔',
      '모텔',
      '민박',
      '유스호스텔',
      '콘도미니엄',
      '펜션',
      '한옥',
      '홈스테이',
    ];

    const pipeline = [
      {
        $match: {
          sigungu: sigungu,
          category2: '숙박',
          category3: { $in: categories },
        },
      },
      {
        $group: {
          _id: '$category3',
          count: { $sum: 1 },
        },
      },
    ];

    const results = await Accommodation.aggregate(pipeline);

    const categoryCounts = {};
    results.forEach((result) => {
      if (result.count > 0) {
        categoryCounts[result._id] = result.count;
      }
    });

    return categoryCounts;
  }
}

module.exports = new AccommodationService();
