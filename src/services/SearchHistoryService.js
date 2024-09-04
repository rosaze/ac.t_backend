const SearchHistory = require('../models/SearchHistory');
const mongoose = require('mongoose');

class SearchHistoryService {
  async logSearch(userId, keyword) {
    console.log('Logging search - userId:', userId, 'keyword:', keyword);
    if (!userId) {
      throw new Error('UserId is missing');
    }
    const searchRecord = new SearchHistory({
      user: new mongoose.Types.ObjectId(userId), // Correct way to convert string to ObjectId
      keyword: keyword,
    });
    await searchRecord.save();
    return searchRecord;
  }

  async getRecentSearches(userId) {
    // Removed searchType from the query
    return await SearchHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();
  }
}

module.exports = new SearchHistoryService();
