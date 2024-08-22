const SearchHistory = require('../models/SearchHistory');

class SearchHistoryService {
  async logSearch(userId, keyword, searchType) {
    const searchRecord = new SearchHistory({
      user: userId,
      keyword: keyword,
      searchType: searchType,
    });
    await searchRecord.save();
    return searchRecord;
  }

  async getRecentSearches(userId, searchType) {
    return await SearchHistory.find({ user: userId, searchType })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();
  }
}

module.exports = new SearchHistoryService();
