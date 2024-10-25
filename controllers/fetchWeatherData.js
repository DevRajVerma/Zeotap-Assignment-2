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

// Function to convert Kelvin to Celsius with proper rounding
const kelvinToCelsius = (kelvin) => {
  return Number((kelvin - 273.15).toFixed(2));
};

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

    // Validate received data
    if (!data.main || !data.weather || !data.weather[0]) {
      throw new Error("Invalid data structure received from API");
    }

    const weatherData = {
      city: city,
      weatherCondition: data.weather[0].main,
      temperature: kelvinToCelsius(data.main.temp),
      feelsLike: kelvinToCelsius(data.main.feels_like),
      timestamp: new Date(data.dt * 1000),
    };

    // Save to MongoDB with error handling
    try {
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
    } catch (dbError) {
      console.error(`Database error for ${city}:`, dbError);
      throw dbError;
    }
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
  let isFirstRun = true;

  const fetchAllCities = async () => {
    console.log(
      `${
        isFirstRun ? "Initial" : "Periodic"
      } weather data fetch started at ${new Date().toLocaleString()}`
    );

    const fetchPromises = cities.map(async (city) => {
      try {
        const data = await fetchWeatherData(city);
        if (data) {
          console.log(`Successfully fetched data for ${city}`);
        }
      } catch (error) {
        console.error(`Failed to process weather data for ${city}:`, error);
        // Continue with other cities even if one fails
      }
    });

    // Wait for all cities to be processed
    await Promise.all(fetchPromises);

    console.log(
      `Weather data fetch completed at ${new Date().toLocaleString()}`
    );
    isFirstRun = false;
  };

  try {
    // Initial fetch
    await fetchAllCities();

    // Set up interval with error handling
    setInterval(async () => {
      try {
        await fetchAllCities();
      } catch (error) {
        console.error("Error in periodic fetch:", error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  } catch (error) {
    console.error("Error starting weather data fetching:", error);
    throw error; // Rethrow to handle at application level
  }
};

module.exports = {
  startWeatherDataFetching,
};
