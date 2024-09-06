const axios = require('axios');
const forecastMiddle = require('./models/forecastMiddle');
require('dotenv').config();

// 환경 변수에서 서비스 키 로드
const serviceKey = process.env.SERVICE_KEY;
const baseUrl = 'http://apis.data.go.kr/1360000/MidFcstInfoService';

// Cities array for the forecast data
const cities = [
  { name: '대관령', code: '11D20201', region: '영동' },
  { name: '태백', code: '11D20301', region: '영동' },
  { name: '속초', code: '11D20401', region: '영동', seaRegion: '12C30000' },
  { name: '고성', code: '11D20402', region: '영동', seaRegion: '12C30000' },
  { name: '양양', code: '11D20403', region: '영동', seaRegion: '12C30000' },
  { name: '강릉', code: '11D20501', region: '영동', seaRegion: '12C20000' },
  { name: '동해', code: '11D20601', region: '영동', seaRegion: '12C20000' },
  { name: '삼척', code: '11D20602', region: '영동', seaRegion: '12C20000' },
  { name: '철원', code: '11D10101', region: '영서' },
  { name: '화천', code: '11D10102', region: '영서' },
  { name: '인제', code: '11D10201', region: '영서' },
  { name: '양구', code: '11D10202', region: '영서' },
  { name: '춘천', code: '11D10301', region: '영서' },
  { name: '홍천', code: '11D10302', region: '영서' },
  { name: '원주', code: '11D10401', region: '영서' },
  { name: '횡성', code: '11D10402', region: '영서' },
  { name: '영월', code: '11D10501', region: '영서' },
  { name: '정선', code: '11D10502', region: '영서' },
  { name: '평창', code: '11D10503', region: '영서' },
];

// 가장 최근의 예보 시간을 가져오는 유틸리티 함수
function getLatestForecastTime() {
  const now = new Date();
  const hours = now.getHours();
  const forecastHour = hours >= 18 ? '1800' : '0600'; // 예보 시간 결정
  const forecastDate = now.toISOString().split('T')[0].replace(/-/g, ''); // 날짜 형식 YYYYMMDD
  return `${forecastDate}${forecastHour}`;
}

// 기온 예보를 기상청 API에서 가져오는 함수
async function fetchTemperatureForecast(city) {
  const url = `${baseUrl}/getMiddleTemperature?serviceKey=${serviceKey}&regId=${
    city.code
  }&tmFc=${getLatestForecastTime()}`;
  try {
    const response = await axios.get(url);
    const temperatureData = response.data.response.body.items.item; // API 응답에서 데이터 추출
    return temperatureData.map((item) => ({
      day: item.fcstDate,
      min: item.taMin3, // 적절한 필드로 수정 필요
      max: item.taMax3, // 적절한 필드로 수정 필요
    }));
  } catch (error) {
    console.error(
      `Error fetching temperature forecast for ${city.name}:`,
      error
    );
    return null;
  }
}

// 육상 예보를 기상청 API에서 가져오는 함수
async function fetchLandForecast(regionCode) {
  const url = `${baseUrl}/getMiddleLandWeather?serviceKey=${serviceKey}&regId=${regionCode}&tmFc=${getLatestForecastTime()}`;
  try {
    const response = await axios.get(url);
    const landData = response.data.response.body.items.item;
    return landData.map((item) => ({
      day: item.fcstDate,
      morning: item.wf3Am, // 적절한 필드로 수정 필요
      evening: item.wf3Pm, // 적절한 필드로 수정 필요
      rainMorning: item.rnSt3Am, // 적절한 필드로 수정 필요
      rainEvening: item.rnSt3Pm, // 적절한 필드로 수정 필요
    }));
  } catch (error) {
    console.error(`Error fetching land forecast for region:`, error);
    return null;
  }
}

// 해상 예보를 기상청 API에서 가져오는 함수
async function fetchSeaForecast(seaRegionCode) {
  const url = `${baseUrl}/getMiddleSeaWeather?serviceKey=${serviceKey}&regId=${seaRegionCode}&tmFc=${getLatestForecastTime()}`;
  try {
    const response = await axios.get(url);
    const seaData = response.data.response.body.items.item;
    return seaData.map((item) => ({
      day: item.fcstDate,
      morning: item.wf3Am, // 적절한 필드로 수정 필요
      evening: item.wf3Pm, // 적절한 필드로 수정 필요
    }));
  } catch (error) {
    console.error(`Error fetching sea forecast for region:`, error);
    return null;
  }
}

// 데이터를 MongoDB에 저장하는 함수
async function fetchAndSaveForecasts() {
  const landForecasts = {
    영동: await fetchLandForecast('11D20000'),
    영서: await fetchLandForecast('11D10000'),
  };

  const savePromises = cities.map(async (city) => {
    try {
      const temperatureData = await fetchTemperatureForecast(city); // 기온 데이터 가져오기
      const landForecast = landForecasts[city.region]; // 지역별 육상 예보 데이터
      let seaForecast = [];

      if (city.seaRegion) {
        seaForecast = await fetchSeaForecast(city.seaRegion); // 해상 예보 데이터 가져오기
      }

      const cityData = {
        city: city.name,
        temperature: temperatureData,
        landForecast: landForecast,
        seaForecast: seaForecast.length > 0 ? seaForecast : null,
      };

      // MongoDB에 저장하거나 업데이트
      return forecastMiddle.findOneAndUpdate({ code: city.code }, cityData, {
        upsert: true,
        new: true,
      });
    } catch (error) {
      console.error(
        `Error fetching or saving data for city ${city.name}:`,
        error
      );
    }
  });

  await Promise.all(savePromises); // 모든 요청이 완료될 때까지 대기
  console.log('Weather data has been saved/updated in MongoDB.');
}

module.exports = fetchAndSaveForecasts;
