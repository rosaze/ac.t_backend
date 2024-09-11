const axios = require('axios');
const moment = require('moment');
const dotenv = require('dotenv');
const locationData = require('../utils/locationData'); // 위치 데이터 로드

dotenv.config();

// 좌표 변환 함수 (locationTag를 기반으로 nx, ny 좌표를 찾음)
function getCoordinates(locationTag) {
  const location = locationData.find((loc) => loc.locationTag === locationTag);

  if (!location) {
    console.error(`Invalid location tag: ${locationTag}`);
    throw new Error('Invalid location tag');
  }

  console.log(
    `Found coordinates for ${locationTag}: nx=${location.nx}, ny=${location.ny}`
  );
  return { nx: location.nx, ny: location.ny };
}

// 강수 형태 변환 함수
function getPrecipitationType(value) {
  const types = {
    0: '없음',
    1: '비',
    2: '비/눈',
    3: '눈',
    4: '소나기',
  };
  return types[value] || '알 수 없음';
}

// 하늘 상태 변환 함수
function getSkyStatus(value) {
  const statuses = {
    1: '맑음',
    3: '구름 많음',
    4: '흐림',
  };
  return statuses[value] || '알 수 없음';
}

// 바람 방향 변환 함수
function getWindDirection(value) {
  const directions = [
    '북',
    '북북동',
    '북동',
    '동북동',
    '동',
    '동남동',
    '남동',
    '남남동',
    '남',
    '남남서',
    '남서',
    '서남서',
    '서',
    '서북서',
    '북서',
    '북북서',
  ];
  const index = Math.floor((value + 11.25) / 22.5) % 16;
  return directions[index];
}

// 3일간의 날씨 데이터를 가져오는 함수 (과거 데이터를 포함한 범위 확인)
async function fetchWeatherData(locationTag, date) {
  const { nx, ny } = getCoordinates(locationTag); // locationTag로 좌표 변환
  const serviceKey = process.env.SHORT_WEATHER; // 기상청 API 키

  let weatherData = [];

  // 현재 기준으로 과거와 미래 모두 요청하도록 설정
  for (let i = -1; i <= 2; i++) {
    // 과거 1일 ~ 미래 2일간의 날씨 데이터 요청
    const targetDate = moment(date).add(i, 'days').format('YYYYMMDD');
    const baseTime = '0200'; // 발표 시간

    const url = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${serviceKey}&numOfRows=1000&pageNo=1&dataType=JSON&base_date=${targetDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;

    try {
      console.log(
        `Fetching weather data for ${locationTag} (nx=${nx}, ny=${ny}, date=${targetDate})`
      );
      const response = await axios.get(url);

      if (!response.data.response.body || !response.data.response.body.items) {
        console.error(
          `No weather data found for ${locationTag} on ${targetDate}`
        );
        continue; // 데이터가 없으면 건너뜀
      }

      const items = response.data.response.body.items.item;

      let dailyWeatherData = {
        date: targetDate,
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
            dailyWeatherData.temperature = item.fcstValue;
            break;
          case 'PTY':
            dailyWeatherData.precipitationType = getPrecipitationType(
              item.fcstValue
            );
            break;
          case 'SKY':
            dailyWeatherData.skyStatus = getSkyStatus(item.fcstValue);
            break;
          case 'REH':
            dailyWeatherData.humidity = item.fcstValue;
            break;
          case 'WSD':
            dailyWeatherData.windSpeed = item.fcstValue;
            break;
          case 'VEC':
            dailyWeatherData.windDirection = getWindDirection(item.fcstValue);
            break;
          default:
            break;
        }
      });

      weatherData.push(dailyWeatherData);
      console.log(
        `Weather data fetched successfully for ${locationTag} on ${targetDate}:`,
        dailyWeatherData
      );
    } catch (error) {
      console.error(
        `Error fetching weather data for ${locationTag} on ${targetDate}:`,
        error.message
      );
    }
  }

  return weatherData;
}

module.exports = { fetchWeatherData, getCoordinates };
