const axios = require("axios");
const WeatherRecord = require("../models/WeatherRecord");

const apiKey = "9b92c301f1c7d1346f9aeaea15688497";
const cities = [
  "Delhi",
  "Mumbai",
  "Chennai",
  "Bangalore",
  "Kolkata",
  "Hyderabad",
];

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
  }, 5 * 60 * 1000); // 5 minutes
};

module.exports = {
  startWeatherDataFetching,
};
