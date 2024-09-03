const axios = require("axios");

// API Configuration
const API_KEY =
  "C5t0O8kVyOhrnXYsr29n5Bv1MoPskbn7QJAzSbGV4o0VhlpP6azls0YNWjSh2D8YDDKR78wvsCwkWcFRsUxFcw=="; // Replace with your actual service key
const BASE_URL =
  "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";
const DATA_TYPE = "JSON"; // We prefer JSON for easy parsing

// Coordinates for Gangwon-do cities and counties
const regions = [
  { name: "원주시", nx: 76, ny: 122 },
  // Add other regions as needed
];

// Function to determine the time of day category
function getTimeOfDay(hour) {
  if (hour >= 0 && hour < 12) return "오전";
  if (hour >= 12 && hour < 18) return "오후";
  return "저녁";
}

// Function to fetch weather data
async function fetchWeather(region) {
  const currentDate = new Date();
  const baseDate = currentDate.toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD
  const baseTime = "0500"; // Standard time for short-term forecast

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        serviceKey: API_KEY,
        numOfRows: 100,
        pageNo: 1,
        dataType: DATA_TYPE,
        base_date: baseDate,
        base_time: baseTime,
        nx: region.nx,
        ny: region.ny,
      },
    });

    const items = response.data.response.body.items.item;

    const groupedData = {
      오전: [],
      오후: [],
      저녁: [],
    };

    items.forEach((item) => {
      const hour = parseInt(item.fcstTime.substring(0, 2));
      const timeOfDay = getTimeOfDay(hour);
      groupedData[timeOfDay].push(item);
    });

    console.log(`\nWeather forecast for ${region.name}:`);
    Object.keys(groupedData).forEach((timeOfDay) => {
      console.log(`\n${timeOfDay}:`);
      groupedData[timeOfDay].forEach((item) => {
        console.log(
          `Date: ${item.fcstDate}, Time: ${item.fcstTime}, ${item.category}: ${item.fcstValue}`
        );
      });
    });
  } catch (error) {
    console.error(`Error fetching data for ${region.name}:`, error);
  }
}

// Fetch weather data for each region in Gangwon-do
async function fetchAllWeather() {
  for (const region of regions) {
    await fetchWeather(region);
  }
}

fetchAllWeather();
