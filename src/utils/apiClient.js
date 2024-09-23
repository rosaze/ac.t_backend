const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'http://actflaskapi:5003', // Flask API의 기본 URL
  timeout: 5000,
});

module.exports = apiClient;
