//사용자의 활동 통계를 기반으로 활동을 추천

const activities = require('../utils/activity');
const ActivityMap = require('../models/activityMap');
const User = require('../models/user');

class ActivityRecommendationService {
  // 사용자가 얼마나 자주 특정 activity를 했는지 해시태그를 통해 통계 정보를 계산
  async getUserActivityStats(userId) {
    try {
      const activityMaps = await ActivityMap.find({ user: userId }).select(
        'hashtags'
      );

      const activityCounts = {};
      activities.forEach((activity) => {
        activityCounts[activity.name] = 0;
      });

      activityMaps.forEach((activityMap) => {
        const activityTag = activityMap.hashtags.find((tag) =>
          activities.some((activity) => activity.name === tag)
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

  // 사용자의 선호도와 매칭되는 활동 중 아직 시도하지 않은 활동을 추천
  async recommendActivities(userId) {
    try {
      const activityCounts = await this.getUserActivityStats(userId);
      const user = await User.findById(userId);

      if (!user) throw new Error('User not found');

      // 사용자 선호도 기반 추천
      const preferredActivities = activities.filter((activity) => {
        return (
          activity.location === user.location_preference &&
          activity.environment === user.environment_preference &&
          activity.group === user.group_preference &&
          activity.season === user.season_preference
        );
      });

      // 사용자의 선호도와 일치하는 액티비티 중에서 사용자가 아직 수행하지 않은 활동 추천
      //즉 수행빈도가 0인 액티비티 필터링하여 추천
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
