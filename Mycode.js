const express = require("express");
const app = express();
const PORT = 3000;
const axios = require("axios");

const apiKey = "9b92c301f1c7d1346f9aeaea15688497";

const cities = [
  "Delhi",
  "Mumbai",
  "Chennai",
  "Bangalore",
  "Kolkata",
  "Hyderabad",
];

// const city = 'Delhi';

// const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

app.use(express.json());

// Function to fetch weather data for a city
const fetchWeatherData = async (city) => {
  try {
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const response = await axios.get(url);
    const data = response.data;

    let weatherCondition = data.weather[0].main;
    let tempInKelvin = data.main.temp;
    let tempInCelsius = (tempInKelvin - 273.15).toFixed(2);
    let feelsLikeInCelsius = (data.main.feels_like - 273.15).toFixed(2);
    let timestamp = new Date(data.dt * 1000);

    // Log data to the console
    console.log(`Weather in ${city}: ${weatherCondition}`);
    console.log(`Temperature: ${tempInCelsius} °C`);
    console.log(`Feels Like: ${feelsLikeInCelsius} °C`);
    console.log(`Timestamp: ${timestamp}`);

    return {
      city: city,
      weatherCondition: weatherCondition,
      temperature: `${tempInCelsius} °C`,
      feelsLike: `${feelsLikeInCelsius} °C`,
      timestamp: timestamp.toLocaleString(), //This time is coming from OpenWeather API
      //Maybe the time at which they fetched the data or updated it, I don't know
    //But this time is not when I fetched data
    };
  } catch (error) {
    console.error(`Error fetching weather data for ${city}:`, error.message);
    return null;
  }
};

// axios.get(url)

app.get("/", async (req, res) => {
  try {
    const city = req.query.city || "Delhi";
    const weatherData = await fetchWeatherData(city);

    if (weatherData) {
      res.json(weatherData);
    } else {
      res.status(500).send("Error retrieving weather Data");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving weather data.");
  }
});

// Periodic API calls to fetch weather data every 5 minutes
const startWeatherDataFetching = () => {
  setInterval(async () => {
    cities.forEach(async (city) => {
      const weatherData = await fetchWeatherData(city);
      // You can process or store this data here for later use, e.g., saving to a database
    });

    console.log(
      "Weather data fetched for all cities at " + new Date().toLocaleString()
    );
  }, 1 * 60 * 1000); // Fetch data every 5 minutes (5 minutes = 300000 ms)
};

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  startWeatherDataFetching(); //Start fetching weather data every five minutes
});
