const axios = require('axios');
const moment = require('moment');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb'); // MongoClient 사용
dotenv.config();

// 방위 정보 및 강수 정보 정의
const degCode = {
  0: 'N',
  360: 'N',
  180: 'S',
  270: 'W',
  90: 'E',
  22.5: 'NNE',
  45: 'NE',
  67.5: 'ENE',
  112.5: 'ESE',
  135: 'SE',
  157.5: 'SSE',
  202.5: 'SSW',
  225: 'SW',
  247.5: 'WSW',
  292.5: 'WNW',
  315: 'NW',
  337.5: 'NNW',
};
const skyCode = { 1: '맑음', 3: '구름많음', 4: '흐림' };
const ptyCode = {
  0: '강수 없음',
  1: '비',
  2: '비/눈',
  3: '눈',
  5: '빗방울',
  6: '진눈깨비',
  7: '눈날림',
};

// 방위 각도를 방위명으로 변환하는 함수
function degToDir(deg) {
  let closestDir = '';
  let minAbs = 360;
  for (const key in degCode) {
    if (Math.abs(key - deg) < minAbs) {
      minAbs = Math.abs(key - deg);
      closestDir = degCode[key];
    }
  }
  return closestDir;
}

async function fetchAndSaveForecastsShort() {
  const nx = 62;
  const ny = 123;
  const baseDate = moment().format('YYYYMMDD');
  const baseTime = '0200';
  const serviceKey = process.env.SHORT_WEATHER;
  const uri = process.env.MONGO_URI; // MongoDB URI

  // 서비스 키 및 MongoDB URI가 설정되지 않았을 경우 오류 처리
  if (!serviceKey || !uri) {
    console.error(
      'SHORT_WEATHER 또는 MONGO_URI 환경 변수가 설정되지 않았습니다.'
    );
    return;
  }

  const url = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${serviceKey}&numOfRows=1000&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;

  try {
    const response = await axios.get(url);

    // API 응답 구조 확인
    if (
      !response.data.response ||
      !response.data.response.body ||
      !response.data.response.body.items
    ) {
      console.error('API 응답 구조가 예상과 다릅니다:', response.data);
      return;
    }

    const items = response.data.response.body.items.item;

    let weatherData = {
      date: baseDate,
      nx: nx,
      ny: ny,
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
          weatherData.precipitationType = ptyCode[item.fcstValue];
          break;
        case 'SKY':
          weatherData.skyStatus = skyCode[item.fcstValue];
          break;
        case 'REH':
          weatherData.humidity = item.fcstValue;
          break;
        case 'WSD':
          weatherData.windSpeed = item.fcstValue;
          break;
        case 'VEC':
          weatherData.windDirection = degToDir(item.fcstValue);
          break;
        default:
          break;
      }
    });

    // MongoClient를 사용하여 MongoDB에 연결하고 데이터 저장
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();

    const db = client.db('actapp');
    const collection = db.collection('forecastShorts');

    // MongoDB에 데이터 저장
    await collection.insertOne(weatherData);
    console.log('날씨 데이터 저장 완료:', weatherData);

    await client.close(); // MongoDB 연결 종료
  } catch (error) {
    console.error('날씨 데이터를 가져오는 중 오류 발생:', error.message);
  }
}

fetchAndSaveForecastsShort();
