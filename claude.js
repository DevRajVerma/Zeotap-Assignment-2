// Function to convert Kelvin to Celsius with proper rounding
const kelvinToCelsius = (kelvin) => {
  return Number((kelvin - 273.15).toFixed(2));
};

// Function to fetch and store weather data with retry mechanism
const fetchWeatherData = async (city, retryCount = 3) => {
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
      const response = await axios.get(url, {
        timeout: 5000 // 5 second timeout
      });
      
      const data = response.data;
      
      // Validate received data
      if (!data.main || !data.weather || !data.weather[0]) {
        throw new Error('Invalid data structure received from API');
      }

      const weatherData = {
        city: city,
        weatherCondition: data.weather[0].main,
        temperature: kelvinToCelsius(data.main.temp),
        feelsLike: kelvinToCelsius(data.main.feels_like),
        timestamp: new Date(data.dt * 1000),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        apiResponse: data // Store the complete response for reference
      };

      // Save to MongoDB with error handling
      try {
        const weatherRecord = new WeatherRecord(weatherData);
        await weatherRecord.save();
        
        // Process alerts only after successful save
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
      if (attempt === retryCount) {
        console.error(`Failed to fetch weather data for ${city} after ${retryCount} attempts:`, error.message);
        return null;
      }
      console.log(`Attempt ${attempt} failed for ${city}, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
    }
  }
};
