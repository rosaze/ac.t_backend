const User = require('../models/User');
const ActivityRecommendationService = require('./activityRecommendationService');

class PreferenceService {
  // 사용자 활동 기반 선호도 변경 추천
  static async recommendPreferenceUpdate(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const locationActivities = {
      outdoor: user.activities.filter(
        (activity) => activity.location === 'outdoor'
      ).length,
      indoor: user.activities.filter(
        (activity) => activity.location === 'indoor'
      ).length,
    };

    const environmentActivities = {
      sea: user.activities.filter((activity) => activity.region === 'sea')
        .length,
      mountain: user.activities.filter(
        (activity) => activity.region === 'mountain'
      ).length,
    };

    const groupActivities = {
      group: user.activities.filter(
        (activity) => activity.group_size === 'group'
      ).length,
      individual: user.activities.filter(
        (activity) => activity.group_size === 'individual'
      ).length,
    };

    const seasonActivities = {
      winter: user.activities.filter((activity) => activity.season === 'winter')
        .length,
      summer: user.activities.filter((activity) => activity.season === 'summer')
        .length,
    };

    const recommendations = [];

    // Location preference recommendation
    if (
      locationActivities.outdoor > locationActivities.indoor &&
      user.preference.location !== 'outdoor'
    ) {
      recommendations.push('outdoor');
    } else if (
      locationActivities.indoor > locationActivities.outdoor &&
      user.preference.location !== 'indoor'
    ) {
      recommendations.push('indoor');
    } else if (
      locationActivities.outdoor === locationActivities.indoor &&
      user.preference.location !== 'both'
    ) {
      recommendations.push('both for location');
    }

    // Environment preference recommendation
    if (
      environmentActivities.mountain > environmentActivities.sea &&
      user.preference.environment !== 'mountain'
    ) {
      recommendations.push('mountain');
    } else if (
      environmentActivities.sea > environmentActivities.mountain &&
      user.preference.environment !== 'sea'
    ) {
      recommendations.push('sea');
    } else if (
      environmentActivities.mountain === environmentActivities.sea &&
      user.preference.environment !== 'both'
    ) {
      recommendations.push('both for environment');
    }

    // Group preference recommendation
    if (
      groupActivities.group > groupActivities.individual &&
      user.preference.group !== 'group'
    ) {
      recommendations.push('group');
    } else if (
      groupActivities.individual > groupActivities.group &&
      user.preference.group !== 'individual'
    ) {
      recommendations.push('individual');
    } else if (
      groupActivities.group === groupActivities.individual &&
      user.preference.group !== 'both'
    ) {
      recommendations.push('both for group');
    }

    // Season preference recommendation
    if (
      seasonActivities.winter > seasonActivities.summer &&
      user.preference.season !== 'winter'
    ) {
      recommendations.push('winter');
    } else if (
      seasonActivities.summer > seasonActivities.winter &&
      user.preference.season !== 'summer'
    ) {
      recommendations.push('summer');
    } else if (
      seasonActivities.winter === seasonActivities.summer &&
      user.preference.season !== 'both'
    ) {
      recommendations.push('both for season');
    }

    if (recommendations.length > 0) {
      return {
        message: `We noticed your activities align more with the following preferences: ${recommendations.join(
          ', '
        )}. Would you like to update your preferences accordingly?`,
        recommendations,
      };
    }

    return null;
  }

  // 사용자 선호도 업데이트
  static async updatePreferences(userId, newPreferences) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // user.preference가 없으면 새로 생성
      if (!user.preference) {
        user.preference = {};
      }

      // 새로운 선호도 정보로 업데이트
      if (
        newPreferences.location &&
        ['outdoor', 'indoor', 'both'].includes(newPreferences.location)
      ) {
        user.preference.location = newPreferences.location;
      }
      if (
        newPreferences.environment &&
        ['sea', 'mountain', 'both'].includes(newPreferences.environment)
      ) {
        user.preference.environment = newPreferences.environment;
      }
      if (
        newPreferences.group &&
        ['group', 'individual', 'both'].includes(newPreferences.group)
      ) {
        user.preference.group = newPreferences.group;
      }
      if (
        newPreferences.season &&
        ['winter', 'summer', 'both'].includes(newPreferences.season)
      ) {
        user.preference.season = newPreferences.season;
      }

      // 변경사항을 데이터베이스에 저장
      await user.save();

      // 활동 추천 로직
      let recommendedActivities = [];
      try {
        recommendedActivities =
          await ActivityRecommendationService.recommendActivities(user._id);
      } catch (error) {
        console.error('Error recommending activities:', error.message);
      }

      return {
        message: 'Preferences updated successfully',
        updatedPreference: user.preference,
        recommendations: recommendedActivities,
      };
    } catch (error) {
      console.error('Error updating preferences:', error.message);
      throw new Error('Failed to update preferences: ' + error.message);
    }
  }

  // 상위 메소드로 전체 과정을 관리
  static async manageUserPreferences(userId, preferences) {
    // 선호도 변경 추천을 먼저 제공
    const recommendation = await this.recommendPreferenceUpdate(userId);

    // 사용자가 추천을 받아들였는지 여부를 확인하고 업데이트
    if (preferences.accepted) {
      return await this.updatePreferences(userId, preferences);
    }

    return recommendation;
  }

  // 추천 활동 가져오기
  static async getRecommendedActivities(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return ActivityRecommendationService.recommendActivities(user._id);
  }
}

module.exports = PreferenceService;
