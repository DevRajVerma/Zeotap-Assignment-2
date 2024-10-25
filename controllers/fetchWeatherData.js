const axios = require("axios");
const WeatherRecord = require("../models/WeatherRecord");

const alertSystem = require("../services/alertSystem");

const apiKey = "9b92c301f1c7d1346f9aeaea15688497";
const cities = [
  "Delhi",
  "Mumbai",
  "Chennai",
  "Bangalore",
  "Kolkata",
  "Hyderabad",
];

// // Set up alert system event handler
// alertSystem.on("alert", async (alert) => {
//   console.log("Weather Alert:", alert.message);
//   // You can add additional notification methods here
//   // For example:
//   // await sendEmail(alert.message);
//   // await sendSMS(alert.message);
// });

// Function to fetch and store weather data
const fetchWeatherData = async (city) => {
  try {
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const response = await axios.get(url);
    const data = response.data;

    const weatherData = {
      city: city,
      weatherCondition: data.weather[0].main,
      temperature: Number((data.main.temp - 273.15).toFixed(2)), //converting temp to celcius
      feelsLike: Number((data.main.feels_like - 273.15).toFixed(2)),
      timestamp: new Date(data.dt * 1000),
    };

    // Save to MongoDB
    const weatherRecord = new WeatherRecord(weatherData);
    await weatherRecord.save();

    // Check alerts
    // Process weather data for alerts
    const alerts = await alertSystem.processWeatherData({
      city: weatherData.city,
      temperature: weatherData.temperature,
      weatherCondition: weatherData.weatherCondition,
    });

    if (alerts.length > 0) {
      console.log(`Generated ${alerts.length} alerts for ${city}`);
    }

    return weatherData;
  } catch (error) {
    console.error(`Error fetching weather data for ${city}:`, error.message);
    return null;
  }
};

// Start periodic data fetching
// const startWeatherDataFetching = () => {
//   setInterval(async () => {
//     for (const city of cities) {
//       await fetchWeatherData(city);
//     }
//     console.log(
//       "Weather data fetched for all cities at " + new Date().toLocaleString()
//     );
//   }, 5 * 60 * 1000); // 5 minutes
// };

// Start periodic data fetching
const startWeatherDataFetching = async () => {
  // Immediate first fetch
  console.log("Starting initial weather data fetch...");
  for (const city of cities) {
    await fetchWeatherData(city);
  }
  console.log(
    "Initial weather data fetch completed at " + new Date().toLocaleString()
  );

  // Set up interval for subsequent fetches
  setInterval(async () => {
    console.log("Starting periodic weather data fetch...");
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
