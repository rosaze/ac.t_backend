// services/AccommodationService.js
const Accommodation = require('../models/Accommodation');

class AccommodationService {
  async getAccommodationDetailsBySigunguAndCategory(sigungu, category) {
    const accommodations = await Accommodation.find({
      sigungu: sigungu,
      category2: '숙박',
      category3: category,
    })
      .select('title')
      .exec();

    return accommodations;
  }

  async getAllAccommodationDetailsBySigungu(sigungu) {
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

    const result = {};

    for (const category of categories) {
      const accommodations =
        await this.getAccommodationDetailsBySigunguAndCategory(
          sigungu,
          category
        );
      if (accommodations.length > 0) {
        result[category] = accommodations;
      }
    }

    return result;
  }
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
