const axios = require("axios");
const moment = require("moment");

// 서비스 키 및 요청 변수 설정
const serviceKey =
  "C5t0O8kVyOhrnXYsr29n5Bv1MoPskbn7QJAzSbGV4o0VhlpP6azls0YNWjSh2D8YDDKR78wvsCwkWcFRsUxFcw=="; // Replace with your actual service key
const nx = "62"; // 예보 지점 x좌표 (원주시 등으로 설정)
const ny = "123"; // 예보 지점 y좌표 (원주시 등으로 설정)

// 방위 정보, 강수 정보 등을 위한 코드 정의
const degCode = {
  0: "N",
  360: "N",
  180: "S",
  270: "W",
  90: "E",
  22.5: "NNE",
  45: "NE",
  67.5: "ENE",
  112.5: "ESE",
  135: "SE",
  157.5: "SSE",
  202.5: "SSW",
  225: "SW",
  247.5: "WSW",
  292.5: "WNW",
  315: "NW",
  337.5: "NNW",
};

const skyCode = { 1: "맑음", 3: "구름많음", 4: "흐림" };
const ptyCode = {
  0: "강수 없음",
  1: "비",
  2: "비/눈",
  3: "눈",
  5: "빗방울",
  6: "진눈깨비",
  7: "눈날림",
};

// 방위 각도를 방위명으로 변환하는 함수
function degToDir(deg) {
  let closestDir = "";
  let minAbs = 360;
  for (const key in degCode) {
    if (Math.abs(key - deg) < minAbs) {
      minAbs = Math.abs(key - deg);
      closestDir = degCode[key];
    }
  }
  return closestDir;
}

// 주어진 날짜에 대한 날씨 데이터를 가져오는 함수
async function fetchWeatherForDate(baseDate, baseTime, nx, ny) {
  const url = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?serviceKey=${serviceKey}&numOfRows=60&pageNo=1&dataType=json&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;

  try {
    const response = await axios.get(url);

    if (
      !response.data.response ||
      !response.data.response.body ||
      !response.data.response.body.items
    ) {
      throw new Error("No data available or unexpected response structure");
    }

    const items = response.data.response.body.items.item;

    const informations = {};

    items.forEach((item) => {
      const { category, fcstTime, fcstValue } = item;

      if (!informations[fcstTime]) {
        informations[fcstTime] = {};
      }
      informations[fcstTime][category] = fcstValue;
    });

    return informations;
  } catch (error) {
    console.error(
      `Error fetching data for ${baseDate} ${baseTime}:`,
      error.message
    );
    return null;
  }
}

// 발표 시간에 맞는 base_time을 반환하는 함수 (전날 기준)
function getBaseTime() {
  const currentHour = moment().hour();

  if (currentHour >= 23 || currentHour < 2) return "2300";
  if (currentHour >= 20) return "2000";
  if (currentHour >= 17) return "1700";
  if (currentHour >= 14) return "1400";
  if (currentHour >= 11) return "1100";
  if (currentHour >= 8) return "0800";
  if (currentHour >= 5) return "0500";
  return "0200";
}

// 3일간의 날씨 데이터를 가져와서 출력하는 함수 (오늘, 내일, 모레 오전까지)
async function fetchAndPrintWeather() {
  const currentDate = moment();

  for (let i = 0; i < 3; i++) {
    const baseDate = currentDate.clone().add(i, "days").format("YYYYMMDD");
    const previousDate = currentDate
      .clone()
      .add(i - 1, "days")
      .format("YYYYMMDD"); // 전날 기준
    const baseTime = getBaseTime(); // 적절한 발표 시간을 사용

    const informations = await fetchWeatherForDate(
      previousDate,
      baseTime,
      nx,
      ny
    );

    // 오늘과 내일은 전부, 모레는 오전까지만 데이터 출력
    if (informations) {
      if (i === 2) {
        // 모레의 경우 오전 12시까지만 데이터 출력
        printWeatherData(baseDate, informations, "0000", "1200");
      } else {
        printWeatherData(baseDate, informations);
      }
    }
  }
}

// 날씨 데이터를 출력하는 함수
function printWeatherData(
  baseDate,
  informations,
  startTime = "0000",
  endTime = "2400"
) {
  for (const [time, data] of Object.entries(informations)) {
    if (time >= startTime && time <= endTime) {
      let template = `${baseDate.slice(0, 4)}년 ${baseDate.slice(
        4,
        6
      )}월 ${baseDate.slice(6, 8)}일 ${time.slice(0, 2)}시 ${time.slice(
        2
      )}분 (${nx}, ${ny}) 지역의 날씨는 `;

      if (data.SKY) {
        template += `${skyCode[data.SKY]} `;
      }
      if (data.PTY) {
        template += `${ptyCode[data.PTY]} `;
        if (data.RN1 && data.RN1 !== "강수없음") {
          template += `시간당 ${data.RN1}mm `;
        }
      }
      if (data.T1H) {
        template += `기온 ${data.T1H}℃ `;
      }
      if (data.REH) {
        template += `습도 ${data.REH}% `;
      }
      if (data.VEC && data.WSD) {
        const direction = degToDir(parseFloat(data.VEC));
        template += `풍속 ${direction} 방향 ${data.WSD}m/s`;
      }

      console.log(template);
    }
  }
}

// 날씨 데이터 가져오기 실행
fetchAndPrintWeather();
