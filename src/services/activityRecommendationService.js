// 사용자의 활동 내역을 분석 -> 추천
const ActivityMap = require('../models/activityMap');
const activityList = require('../utils/activity');

class ActivityRecommendationService {
  // 사용자가 얼마나 자주 특정 activity를 했는지 해시태그를 통해 통계 정보를 계산
  async getUserActivityStats(userId) {
    try {
      const activities = await ActivityMap.find({ user: userId }).select(
        'hashtags'
      );

      const activityCounts = {};
      activityList.forEach((activity) => {
        activityCounts[activity.name] = 0;
      });

      activities.forEach((activityMap) => {
        const activityTag = activityMap.hashtags.find((tag) =>
          activityList.some((activity) => activity.name === tag)
        );
        if (activityTag) {
          activityCounts[activityTag]++;
        }
      });

      return activityCounts;
    } catch (error) {
      console.error(`Error getting user activity stats: ${error.message}`);
      throw new Error('Failed to retrieve user activity statistics.');
    }
  }

  //사용자의 선호도와 매칭되는 활동 중 아직 시도하지 않은 활동을 추천
  async recommendActivities(userId) {
    try {
      const activityCounts = await this.getUserActivityStats(userId);
      const user = await User.findById(userId);

      if (!user) throw new Error('User not found');

      // 사용자 선호도 기반 추천
      const preferredActivities = activityList.filter((activity) => {
        return (
          activity.location_preference === user.location_preference &&
          activity.environment_preference === user.environment_preference &&
          activity.group_preference === user.group_preference &&
          activity.season_preference === user.season_preference
        );
      });

      // 자주 하지 않은 활동 추천
      const rarelyDoneActivities = preferredActivities.filter(
        (activity) => activityCounts[activity.name] === 0
      );

      const recommendations = rarelyDoneActivities.map(
        (activity) => activity.name
      );

      if (recommendations.length === 0) {
        throw new Error('No recommendations available based on user activity.');
      }

      return recommendations;
    } catch (error) {
      console.error(`Error recommending activities: ${error.message}`);
      throw new Error('Failed to generate activity recommendations.');
    }
  }
}

module.exports = new ActivityRecommendationService();
