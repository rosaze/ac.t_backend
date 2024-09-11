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

// 3일간의 날씨 데이터를 가져오는 함수 (현재, 내일, 모레)
async function fetchThreeDaysWeatherData(locationTag, date) {
  const { nx, ny } = getCoordinates(locationTag); // locationTag로 좌표 변환
  const serviceKey = process.env.SHORT_WEATHER; // 기상청 API 키

  let weatherData = [];

  // 현재 날짜를 기준으로 API 호출
  const baseDate = moment(date).format('YYYYMMDD');
  const baseTime = '0200'; // 발표 시간

  const url = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${serviceKey}&numOfRows=1000&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;

  try {
    console.log(
      `Fetching weather data for ${locationTag} (nx=${nx}, ny=${ny}, base_date=${baseDate})`
    );
    const response = await axios.get(url);

    if (!response.data.response.body || !response.data.response.body.items) {
      console.error(`No weather data found for ${locationTag} on ${baseDate}`);
      return weatherData;
    }

    const items = response.data.response.body.items.item;

    // 현재, 내일, 모레에 대한 날짜 생성
    const targetDates = [
      moment(date).format('YYYYMMDD'),
      moment(date).add(1, 'days').format('YYYYMMDD'),
      moment(date).add(2, 'days').format('YYYYMMDD'),
    ];

    targetDates.forEach((targetDate) => {
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
        if (item.fcstDate === targetDate) {
          switch (item.category) {
            case 'TMP':
              if (dailyWeatherData.temperature === null) {
                dailyWeatherData.temperature = item.fcstValue;
              }
              break;
            case 'PTY':
              if (dailyWeatherData.precipitationType === null) {
                dailyWeatherData.precipitationType = getPrecipitationType(
                  item.fcstValue
                );
              }
              break;
            case 'SKY':
              if (dailyWeatherData.skyStatus === null) {
                dailyWeatherData.skyStatus = getSkyStatus(item.fcstValue);
              }
              break;
            case 'REH':
              if (dailyWeatherData.humidity === null) {
                dailyWeatherData.humidity = item.fcstValue;
              }
              break;
            case 'WSD':
              if (dailyWeatherData.windSpeed === null) {
                dailyWeatherData.windSpeed = item.fcstValue;
              }
              break;
            case 'VEC':
              if (dailyWeatherData.windDirection === null) {
                dailyWeatherData.windDirection = getWindDirection(
                  item.fcstValue
                );
              }
              break;
          }
        }
      });

      weatherData.push(dailyWeatherData);
      console.log(
        `Weather data processed for ${locationTag} on ${targetDate}:`,
        dailyWeatherData
      );
    });
  } catch (error) {
    console.error(
      `Error fetching weather data for ${locationTag}:`,
      error.message
    );
  }

  return weatherData;
}

// 기상 데이터 유형 변환 함수
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

function getSkyStatus(value) {
  const statuses = {
    1: '맑음',
    3: '구름 많음',
    4: '흐림',
  };
  return statuses[value] || '알 수 없음';
}

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

module.exports = { fetchThreeDaysWeatherData, getCoordinates };
