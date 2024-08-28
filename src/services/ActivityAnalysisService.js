//사용자의 활동 데이터를 분석하여 요약 데이터를 제공하는 서비스

const User = require('../models/User');

class ActivityAnalysisService {
  static async getActivitySummary(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const activityCounts = {
      location: { outdoor: 0, indoor: 0 },
      environment: { sea: 0, mountain: 0 },
      group: { group: 0, individual: 0 },
      season: { winter: 0, summer: 0 },
    };

    // 사용자의 활동 데이터를 반복하면서 각 카운트를 증가시킵니다.
    user.activities.forEach((activity) => {
      activityCounts.location[activity.location]++;
      activityCounts.environment[activity.region]++;
      activityCounts.group[activity.group_size]++;
      activityCounts.season[activity.season]++;
    });

    // 각 카테고리 내에서 비율을 계산합니다.
    const activitySummary = {
      location: {
        outdoor:
          (activityCounts.location.outdoor /
            (activityCounts.location.outdoor +
              activityCounts.location.indoor)) *
          100,
        indoor:
          (activityCounts.location.indoor /
            (activityCounts.location.outdoor +
              activityCounts.location.indoor)) *
          100,
      },
      environment: {
        sea:
          (activityCounts.environment.sea /
            (activityCounts.environment.sea +
              activityCounts.environment.mountain)) *
          100,
        mountain:
          (activityCounts.environment.mountain /
            (activityCounts.environment.sea +
              activityCounts.environment.mountain)) *
          100,
      },
      group: {
        group:
          (activityCounts.group.group /
            (activityCounts.group.group + activityCounts.group.individual)) *
          100,
        individual:
          (activityCounts.group.individual /
            (activityCounts.group.group + activityCounts.group.individual)) *
          100,
      },
      season: {
        winter:
          (activityCounts.season.winter /
            (activityCounts.season.winter + activityCounts.season.summer)) *
          100,
        summer:
          (activityCounts.season.summer /
            (activityCounts.season.winter + activityCounts.season.summer)) *
          100,
      },
    };

    return activitySummary;
  }
}

module.exports = ActivityAnalysisService;

//사용자의 활동 데이터를 수집, 각 선호도에 따라 활동 비율을 계산하는 로직
