const axios = require('axios');
require('dotenv').config();

// 위치 정보를 좌표로 변환하는 함수
async function getCoordinatesFromLocation(location) {
  try {
    const apiKey = process.env.GEOLOCATION_API_KEY; // Geolocation API 키 설정
    const url = `https://geolocation-api-url?query=${location}&key=${apiKey}`; // Geolocation API의 실제 URL을 사용

    const response = await axios.get(url);

    // 응답에서 좌표 정보 추출
    if (response.data && response.data.result) {
      const { nx, ny } = response.data.result; // 좌표 변환 결과에서 nx, ny 추출
      return { nx, ny };
    } else {
      throw new Error('좌표를 변환하는 중 오류 발생');
    }
  } catch (error) {
    console.error('Error fetching coordinates:', error.message);
    throw error;
  }
}

module.exports = getCoordinatesFromLocation;
