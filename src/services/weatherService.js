const axios = require('axios');
const moment = require('moment');
const dotenv = require('dotenv');
const locationData = require('../utils/location'); // 위치 데이터 로드

dotenv.config();

// 좌표 변환 함수 (locationTag를 기반으로 nx, ny 좌표를 찾음)
function getCoordinates(locationTag) {
  const location = locationData.find((loc) => loc.locationTag === locationTag);

  if (!location) {
    throw new Error('Invalid location tag');
  }

  return { nx: location.nx, ny: location.ny };
}

async function fetchWeatherData(locationTag, date) {
  const { nx, ny } = getCoordinates(locationTag); // locationTag로 좌표 변환

  const baseDate = date
    ? moment(date).format('YYYYMMDD')
    : moment().format('YYYYMMDD'); // 사용자가 입력한 날짜를 사용
  const baseTime = '0200'; // 발표 시간
  const serviceKey = process.env.SHORT_WEATHER; // 기상청 API 키

  const url = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${serviceKey}&numOfRows=1000&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;

  try {
    const response = await axios.get(url);
    const items = response.data.response.body.items.item;

    // 필요한 데이터만 반환
    let weatherData = {
      temperature: null,
      precipitationType: null,
      skyStatus: null,
      humidity: null,
      windSpeed: null,
      windDirection: null,
    };

    items.forEach((item) => {
      switch (item.category) {
        case 'TMP':
          weatherData.temperature = item.fcstValue;
          break;
        case 'PTY':
          weatherData.precipitationType = item.fcstValue;
          break;
        case 'SKY':
          weatherData.skyStatus = item.fcstValue;
          break;
        case 'REH':
          weatherData.humidity = item.fcstValue;
          break;
        case 'WSD':
          weatherData.windSpeed = item.fcstValue;
          break;
        case 'VEC':
          weatherData.windDirection = item.fcstValue;
          break;
        default:
          break;
      }
    });

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    throw new Error('Failed to fetch weather data');
  }
}
module.exports = { fetchWeatherData, getCoordinates };
