const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 3000;
const axios = require("axios");
// const nodemailer = require("nodemailer");
const WeatherRecord = require("./models/WeatherRecord");

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://drverma2704:AavYzM7b818uX6uH@giftwala.x1ywjoh.mongodb.net/ZeoAssignment2"
  )
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));


const apiKey = "9b92c301f1c7d1346f9aeaea15688497";
const cities = [
  "Delhi",
  "Mumbai",
  "Chennai",
  "Bangalore",
  "Kolkata",
  "Hyderabad",
];

// Function to calculate daily summaries
async function calculateDailySummary(city, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const records = await WeatherRecord.find({
    city: city,
    timestamp: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  if (records.length === 0) return null;

  // Calculate aggregates
  const temperatures = records.map((r) => r.temperature);
  const weatherConditions = records.map((r) => r.weatherCondition);

  // Find dominant weather condition (mode)
  const conditionCounts = {};
  let maxCount = 0;
  let dominantCondition = weatherConditions[0];

  weatherConditions.forEach((condition) => {
    conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
    if (conditionCounts[condition] > maxCount) {
      maxCount = conditionCounts[condition];
      dominantCondition = condition;
    }
  });

  return {
    city: city,
    date: startOfDay,
    avgTemperature: temperatures.reduce((a, b) => a + b) / temperatures.length,
    maxTemperature: Math.max(...temperatures),
    minTemperature: Math.min(...temperatures),
    dominantWeatherCondition: dominantCondition,
    recordCount: records.length,
  };
}

// API endpoints
app.use(express.json());

// Function to fetch and store weather data
const fetchWeatherData = async (city) => {
    try {
      const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
      const response = await axios.get(url);
      const data = response.data;
  
      const weatherData = {
        city: city,
        weatherCondition: data.weather[0].main,
        temperature: Number((data.main.temp - 273.15).toFixed(2)),
        feelsLike: Number((data.main.feels_like - 273.15).toFixed(2)),
        timestamp: new Date(data.dt * 1000),
      };
  
      // Save to MongoDB
      const weatherRecord = new WeatherRecord(weatherData);
      await weatherRecord.save();
  
      // Check alerts
      // await checkAlertThresholds(weatherData);
  
      return weatherData;
    } catch (error) {
      console.error(`Error fetching weather data for ${city}:`, error.message);
      return null;
    }
  };

// Start periodic data fetching
const startWeatherDataFetching = () => {
  setInterval(async () => {
    for (const city of cities) {
      await fetchWeatherData(city);
    }
    console.log(
      "Weather data fetched for all cities at " + new Date().toLocaleString()
    );
  }, 1 * 60 * 1000); // 5 minutes
};

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  startWeatherDataFetching();
});
