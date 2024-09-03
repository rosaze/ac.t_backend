const SearchHistory = require('../models/SearchHistory');
const mongoose = require('mongoose');

class SearchHistoryService {
  async logSearch(userId, keyword) {
    console.log('Logging search - userId:', userId, 'keyword:', keyword);
    if (!userId) {
      throw new Error('UserId is missing');
    }
    const searchRecord = new SearchHistory({
      user: new mongoose.ObjectId(userId), // 문자열을 ObjectId로 변환
      keyword: keyword,
      searchType: searchType,
    });
    await searchRecord.save();
    return searchRecord;
  }

  async getRecentSearches(userId) {
    return await SearchHistory.find({ user: userId, searchType })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();
  }
}

module.exports = new SearchHistoryService();
