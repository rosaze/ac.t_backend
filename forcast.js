require("dotenv").config();
const axios = require("axios");
const moment = require("moment");

// 중요 날씨 현상과 그에 대한 설명을 매핑하는 객체
const significantWeatherMap = {
  PTY: "강수 형태",
  LGT: "낙뢰",
  WSD: "강한 바람",
};

// 강수 형태 코드 매핑
const precipitationTypeMap = {
  0: "없음",
  1: "비",
  2: "비/눈",
  3: "눈",
  4: "소나기",
};

// 하늘 상태 코드 매핑
const skyConditionMap = {
  1: "맑음",
  3: "구름 많음",
  4: "흐림",
};

// 날씨 정보를 날짜별로 요약하는 함수
function summarizeWeather(forecastData) {
  const summary = {};

  forecastData.forEach((item) => {
    const date = item.fcstDate;
    const category = item.category;
    let value = item.fcstValue;

    if (category === "PTY") {
      value = precipitationTypeMap[value] || value;
    } else if (category === "SKY") {
      value = skyConditionMap[value] || value;
    }

    if (!summary[date]) {
      summary[date] = [];
    }

    if (significantWeatherMap[category]) {
      summary[date].push({
        type: significantWeatherMap[category],
        time: item.fcstTime,
        value: value,
      });
    } else {
      summary[date].push({
        type: category,
        time: item.fcstTime,
        value: value,
      });
    }
  });

  return summary;
}

// 날씨 정보를 가져오는 함수
async function fetchWeeklyWeather(startDate, nx, ny) {
  const forecastData = [];
  const baseTime = "0500"; // 기준 시간
  const serviceKey = process.env.SERVICE_KEY; // .env 파일에서 API 키 가져오기

  for (let i = 0; i < 7; i++) {
    const targetDate = moment(startDate).add(i, "days").format("YYYYMMDD");

    try {
      const response = await axios.get(
        "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst",
        {
          params: {
            serviceKey: serviceKey,
            numOfRows: 1000, // 데이터를 충분히 받아오기 위해 큰 값 설정
            pageNo: 1,
            dataType: "JSON",
            base_date: targetDate,
            base_time: baseTime,
            nx: nx,
            ny: ny,
          },
        }
      );

      const items = response.data.response.body.items.item;
      if (items) {
        forecastData.push(...items);
      } else {
        console.log(`No data for ${targetDate}`);
      }
    } catch (error) {
      console.error(`Error fetching data for ${targetDate}:`, error.message);
    }
  }

  return summarizeWeather(forecastData);
}

// 예시 실행
(async () => {
  const startDate = moment().format("YYYYMMDD");
  const nx = 55; // 예보 지점 X 좌표
  const ny = 127; // 예보 지점 Y 좌표

  const weeklyWeather = await fetchWeeklyWeather(startDate, nx, ny);
  console.log(JSON.stringify(weeklyWeather, null, 2));
})();
