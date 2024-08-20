const ActivityMap = require('../models/activityMap');
const User = require('../models/user');
const HashtagService = require('./HashtagService');
const BadgeService = require('./badgeService'); // 배지 서비스 추가
const locations = require('../utils/location'); // 시군 리스트

// 활동 기록 추가, 사용자 활동 저장, 배지 지급
exports.addActivityMap = async (activityMapData) => {
  const user = await User.findById(activityMapData.user);
  if (!user) throw new Error('User not found');

  // 시군 방문 횟수 추적
  const visitCount = await ActivityMap.countDocuments({
    user: activityMapData.user,
    region: activityMapData.region,
  });

  // 특정 활동에 따른 활동 횟수 추적
  const activityCount = await ActivityMap.countDocuments({
    user: activityMapData.user,
    activityTag: activityMapData.activityTag,
  });

  // 시군 방문에 따른 배지 지급
  if (visitCount + 1 >= 5) {
    await BadgeService.awardBadge(
      activityMapData.user,
      `${activityMapData.region} 매니아`
    );
  }

  // 활동 횟수에 따른 배지 지급
  if (activityCount + 1 >= 5) {
    await BadgeService.awardBadge(
      activityMapData.user,
      `${activityMapData.activityTag} 매니아`
    );
  }

  // 활동 기록 추가
  const activityMap = new ActivityMap({
    user: activityMapData.user,
    post: activityMapData.post,
    region: activityMapData.region,
    activity_date: activityMapData.activity_date,
    color: determineColor(visitCount + 1), // 방문 횟수에 따라 색상 결정
    activityTag: activityMapData.activityTag, // 활동 태그 추가
  });

  await activityMap.save();
  return activityMap;
};

function determineColor(visitCount) {
  if (visitCount >= 5) return 'darkColor';
  if (visitCount === 4) return 'slightlyLighterColor';
  if (visitCount === 3) return 'mediumColor';
  if (visitCount === 2) return 'lightColor';
  return 'veryLightColor';
}

//특정 사용자의 활동 이력 조회
exports.getActivityHistory = async (userId) => {
  const activityHistory = await ActivityMap.find({ user: userId }).populate(
    'post'
  );
  return activityHistory;
};

// 사용자 활동 기록 조회 및 시군 색상 맵 생성
exports.getActivityMaps = async (userId) => {
  const user = await User.findById(userId).populate('activities.post_id');

  if (!user) throw new Error('User not found');

  const visitedLocations = user.activities.map((activity) => activity.location); // 방문한 시군 목록

  const activityMap = generateActivityMap(visitedLocations); // 특정 시군에 다른 색깔로 표시
  return activityMap;
};

// 시군별 색상 맵 생성 함수
function generateActivityMap(visitedLocations) {
  const activityMap = {}; // 시군별 색깔을 담을 객체

  // 모든 시군을 기본 색상으로 초기화
  locations.forEach((location) => {
    activityMap[location] = 'defaultColor'; // 기본 색상
  });

  // 방문한 시군에 대해 색상을 변경
  visitedLocations.forEach((location) => {
    if (activityMap[location]) {
      activityMap[location] = 'visitedColor'; // 방문한 시군 색상
    }
  });

  return activityMap;
}

//location hashtag를 통해 특정 시군의 방문 홧수를 추적하고, 방문 횟수에 따라 색상 및 배지를 관리
