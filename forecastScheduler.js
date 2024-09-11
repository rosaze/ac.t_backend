const axios = require("axios");
const mongoose = require("mongoose");
const schedule = require("node-schedule"); // Import node-schedule for scheduling the job
//중기 날씨 밤 12시마다 fetch 하는 코드
require("dotenv").config(); // Load environment variables from .env file

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const serviceKey = process.env.SERVICE_KEY;
const baseUrl = "http://apis.data.go.kr/1360000/MidFcstInfoService";

// Define region codes for 시군구 in 강원도
const cities = [
  { name: "대관령", code: "11D20201", region: "영동" },
  { name: "태백", code: "11D20301", region: "영동" },
  { name: "속초", code: "11D20401", region: "영동", seaRegion: "12C30000" }, // 동해북부
  { name: "고성", code: "11D20402", region: "영동", seaRegion: "12C30000" }, // 동해북부
  { name: "양양", code: "11D20403", region: "영동", seaRegion: "12C30000" }, // 동해북부
  { name: "강릉", code: "11D20501", region: "영동", seaRegion: "12C20000" }, // 동해중부
  { name: "동해", code: "11D20601", region: "영동", seaRegion: "12C20000" }, // 동해중부
  { name: "삼척", code: "11D20602", region: "영동", seaRegion: "12C20000" }, // 동해중부
  { name: "철원", code: "11D10101", region: "영서" },
  { name: "화천", code: "11D10102", region: "영서" },
  { name: "인제", code: "11D10201", region: "영서" },
  { name: "양구", code: "11D10202", region: "영서" },
  { name: "춘천", code: "11D10301", region: "영서" },
  { name: "홍천", code: "11D10302", region: "영서" },
  { name: "원주", code: "11D10401", region: "영서" },
  { name: "횡성", code: "11D10402", region: "영서" },
  { name: "영월", code: "11D10501", region: "영서" },
  { name: "정선", code: "11D10502", region: "영서" },
  { name: "평창", code: "11D10503", region: "영서" },
];

// Mongoose Schema for weather forecast
const forecastSchema = new mongoose.Schema({
  city: String,
  temperature: Array,
  landForecast: Array,
  seaForecast: Array,
  updatedAt: { type: Date, default: Date.now },
});

const Forecast = mongoose.model("Forecast", forecastSchema);

// Get the latest available forecast time (either 06:00 or 18:00)
function getLatestForecastTime() {
  const now = new Date();
  const hours = now.getHours();
  const forecastHour = hours >= 18 ? "1800" : "0600"; // Use 18:00 or 06:00
  const forecastDate = now.toISOString().split("T")[0].replace(/-/g, "");
  return `${forecastDate}${forecastHour}`;
}

const tmFc = getLatestForecastTime(); // Get the forecast timestamp

// Fetch 중기 육상 예보 조회 (Mid-term Land Forecast) for 영동 and 영서
async function fetchLandForecast(regionCode) {
  const landParams = {
    serviceKey: serviceKey,
    numOfRows: 10,
    pageNo: 1,
    regId: regionCode,
    tmFc: tmFc,
    dataType: "JSON",
  };

  try {
    const response = await axios.get(`${baseUrl}/getMidLandFcst`, {
      params: landParams,
    });
    if (response.data.response.header.resultCode === "00") {
      const items = response.data.response.body.items.item[0];
      return [
        {
          day: 3,
          morning: items.wf3Am,
          evening: items.wf3Pm,
          rainMorning: items.rnSt3Am,
          rainEvening: items.rnSt3Pm,
        },
        {
          day: 4,
          morning: items.wf4Am,
          evening: items.wf4Pm,
          rainMorning: items.rnSt4Am,
          rainEvening: items.rnSt4Pm,
        },
        {
          day: 5,
          morning: items.wf5Am,
          evening: items.wf5Pm,
          rainMorning: items.rnSt5Am,
          rainEvening: items.rnSt5Pm,
        },
        {
          day: 6,
          morning: items.wf6Am,
          evening: items.wf6Pm,
          rainMorning: items.rnSt6Am,
          rainEvening: items.rnSt6Pm,
        },
        {
          day: 7,
          morning: items.wf7Am,
          evening: items.wf7Pm,
          rainMorning: items.rnSt7Am,
          rainEvening: items.rnSt7Pm,
        },
        {
          day: 8,
          morning: items.wf8,
          evening: items.wf8,
          rainMorning: items.rnSt8,
          rainEvening: items.rnSt8,
        },
        {
          day: 9,
          morning: items.wf9,
          evening: items.wf9,
          rainMorning: items.rnSt9,
          rainEvening: items.rnSt9,
        },
        {
          day: 10,
          morning: items.wf10,
          evening: items.wf10,
          rainMorning: items.rnSt10,
          rainEvening: items.rnSt10,
        },
      ];
    } else {
      console.error(
        `Error fetching land forecast for region:`,
        response.data.response.header.resultMsg
      );
      return [];
    }
  } catch (error) {
    console.error(`Error fetching land forecast for region:`, error.message);
    return [];
  }
}

// Fetch 중기 기온 조회 (Mid-term Temperature Forecast) for each city
async function fetchTemperatureForecast(city) {
  const tempParams = {
    serviceKey: serviceKey,
    numOfRows: 10,
    pageNo: 1,
    regId: city.code,
    tmFc: tmFc,
    dataType: "JSON",
  };

  try {
    const response = await axios.get(`${baseUrl}/getMidTa`, {
      params: tempParams,
    });
    if (response.data.response.header.resultCode === "00") {
      const items = response.data.response.body.items.item[0];
      return [
        { day: 3, min: items.taMin3, max: items.taMax3 },
        { day: 4, min: items.taMin4, max: items.taMax4 },
        { day: 5, min: items.taMin5, max: items.taMax5 },
        { day: 6, min: items.taMin6, max: items.taMax6 },
        { day: 7, min: items.taMin7, max: items.taMax7 },
        { day: 8, min: items.taMin8, max: items.taMax8 },
        { day: 9, min: items.taMin9, max: items.taMax9 },
        { day: 10, min: items.taMin10, max: items.taMax10 },
      ];
    } else {
      console.error(
        `Error fetching temperature forecast for city ${city.name}:`,
        response.data.response.header.resultMsg
      );
      return [];
    }
  } catch (error) {
    console.error(
      `Error fetching temperature forecast for city ${city.name}:`,
      error.message
    );
    return [];
  }
}

// Fetch 중기 해상 예보 조회 (Mid-term Sea Forecast) for the sea region
async function fetchSeaForecast(seaRegionCode) {
  const seaParams = {
    serviceKey: serviceKey,
    numOfRows: 10,
    pageNo: 1,
    regId: seaRegionCode,
    tmFc: tmFc,
    dataType: "JSON",
  };

  try {
    const response = await axios.get(`${baseUrl}/getMidSeaFcst`, {
      params: seaParams,
    });
    if (response.data.response.header.resultCode === "00") {
      const items = response.data.response.body.items.item[0];
      return [
        { day: 3, morning: items.wf3Am, evening: items.wf3Pm },
        { day: 4, morning: items.wf4Am, evening: items.wf4Pm },
        { day: 5, morning: items.wf5Am, evening: items.wf5Pm },
        { day: 6, morning: items.wf6Am, evening: items.wf6Pm },
        { day: 7, morning: items.wf7Am, evening: items.wf7Pm },
        { day: 8, morning: items.wf8, evening: items.wf8 },
        { day: 9, morning: items.wf9, evening: items.wf9 },
        { day: 10, morning: items.wf10, evening: items.wf10 },
      ];
    } else {
      console.error(
        `Error fetching sea forecast for region ${seaRegionCode}:`,
        response.data.response.header.resultMsg
      );
      return [];
    }
  } catch (error) {
    console.error(
      `Error fetching sea forecast for region ${seaRegionCode}:`,
      error.message
    );
    return [];
  }
}

// Fetch and save the forecasts into a JSON file
async function fetchAndSaveForecasts() {
  let resultData = [];

  // Fetch land forecast for 영동 and 영서 regions once
  const landForecasts = {
    영동: await fetchLandForecast("11D20000"),
    영서: await fetchLandForecast("11D10000"),
  };

  // For each city, fetch temperature and sea forecast (if applicable), and combine with land forecast
  for (const city of cities) {
    console.log(`Fetching data for ${city.name} (${city.code})...`);

    // Fetch temperature forecast for the city
    const temperatureData = await fetchTemperatureForecast(city);

    // Get the corresponding land forecast based on the region (영동 or 영서)
    const landForecast = landForecasts[city.region];

    // Fetch sea forecast if the city belongs to a sea region
    let seaForecast = [];
    if (city.seaRegion) {
      seaForecast = await fetchSeaForecast(city.seaRegion);
    }

    // Combine all data for this city
    let cityData = {
      city: city.name,
      temperature: temperatureData,
      landForecast: landForecast,
      seaForecast: seaForecast.length > 0 ? seaForecast : null,
    };
    // Save or update the forecast in MongoDB
    await Forecast.findOneAndUpdate(
      { city: city.name }, // Search by city name
      cityData, // Data to insert/update
      { upsert: true, new: true } // Insert if it doesn't exist, update if it does
    );

    resultData.push(cityData);
  }
  console.log("Weather data has been saved to MongoDB.");
}
// Set up a scheduler to run the job every day at 12:00 AM (midnight)
schedule.scheduleJob("0 0 * * *", async () => {
  console.log("Scheduled job running: Fetching and saving weather data...");
  try {
    await fetchAndSaveForecasts();
    console.log("Weather data updated successfully.");
  } catch (error) {
    console.error("Error during scheduled weather update:", error);
  }
});
