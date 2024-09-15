const { activities } = require('../utils/activity.json');
const ActivityMap = require('../models/activityMap');
const User = require('../models/user');

class ActivityRecommendationService {
  // 사용자가 얼마나 자주 특정 activity를 했는지 해시태그를 통해 통계 정보를 계산
  async getUserActivityStats(userId) {
    try {
      const activityMaps = await ActivityMap.find({ user: userId }).select(
        'activityTag'
      );

      // 활동 통계 초기화
      const activityCounts = {};
      activities.forEach((activity) => {
        activityCounts[activity.name] = 0;
      });

      // activityTag를 활용하여 활동 카운트를 증가시킴
      activityMaps.forEach((activityMap) => {
        if (
          activityMap.activityTag &&
          activityCounts.hasOwnProperty(activityMap.activityTag)
        ) {
          activityCounts[activityMap.activityTag]++;
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

      // 사용자 선호도 기반 추천, 'both' 옵션 반영
      const preferredActivities = activities.filter((activity) => {
        return (
          (activity.location === user.preference.location ||
            user.preference.location === 'both') &&
          (activity.environment === user.preference.environment ||
            user.preference.environment === 'both') &&
          (activity.group === user.preference.group ||
            user.preference.group === 'both') &&
          (activity.season === user.preference.season ||
            user.preference.season === 'both')
        );
      });

      // 사용자의 선호도와 일치하는 액티비티 중에서 사용자가 아직 수행하지 않은 활동 추천
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
  // 사용자 활동 기록을 반영하지 않고 선호도만을 고려한 추천
  async recommendActivitiesByPreference(userId) {
    try {
      console.log('사용자 ID로 추천 시작:', userId);
      const user = await User.findById(userId);
      if (!user) {
        console.log('사용자를 찾을 수 없음:', userId);
        throw new Error('User not found');
      }

      console.log('사용자 선호도:', user.preference);

      const preferredActivities = activities.filter((activity) => {
        return (
          (activity.location === user.preference.location ||
            user.preference.location === 'both') &&
          (activity.environment === user.preference.environment ||
            user.preference.environment === 'both') &&
          (activity.group === user.preference.group ||
            user.preference.group === 'both') &&
          (activity.season === user.preference.season ||
            activity.season === 'both' ||
            user.preference.season === 'both')
        );
      });

      const recommendations = preferredActivities.map(
        (activity) => activity.name
      );
      console.log('추천된 활동:', recommendations);

      return recommendations;
    } catch (error) {
      console.error(`활동 추천 중 오류 발생:`, error);
      throw new Error('선호도 기반 활동 추천 생성에 실패했습니다.');
    }
  }
}
module.exports = new ActivityRecommendationService();
