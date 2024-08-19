const express = require("express");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const serviceKey = process.env.TOURISM_API_KEY;
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Define a search route for activities
app.get("/api/search-activities", async (req, res) => {
  const keyword = req.query.keyword || ""; // Optional keyword search
  const areaCode = 32; // Area code for Gangwon-do
  const url = "http://apis.data.go.kr/B551011/KorService1/searchKeyword1";
  try {
    const response = await axios.get(url, {
      params: {
        serviceKey: serviceKey,
        areaCode: areaCode, // Gangwon-do
        keyword: keyword,
        numOfRows: 20,
        pageNo: 1,
        MobileOS: "ETC",
        MobileApp: "ActivityApp",
        _type: "json",
      },
    });
    res.json(response.data.response.body.items.item);
  } catch (error) {
    console.error("Error searching activities:", error.message);
    res.status(500).json({ error: "Failed to search activities" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
