//유틸리티 함수
const fs = require('fs');
const path = require('path');

function loadActivityCategories() {
  const filePath = path.join(__dirname, 'activity.json');
  const data = fs.readFileSync(filePath, 'utf-8');
  const activities = JSON.parse(data).activities;

  const activityNames = activities.map((activity) => activity.name);

  return {
    productCategories: activityNames, // 모든 활동 이름을 Product 카테고리로 사용
    rentalCategories: activityNames, // 모든 활동 이름을 Rental 카테고리로 사용
  };
}

module.exports = loadActivityCategories;
