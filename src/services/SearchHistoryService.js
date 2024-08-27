const SearchHistory = require('../models/SearchHistory');

class SearchHistoryService {
  async logSearch(userId, keyword, searchType) {
    console.log(
      'Logging search - userId:',
      userId,
      'keyword:',
      keyword,
      'searchType:',
      searchType
    );
    if (!userId) {
      throw new Error('UserId is missing');
    }
    const searchRecord = new SearchHistory({
      user: mongoose.Types.ObjectId(userId), // 문자열을 ObjectId로 변환
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
