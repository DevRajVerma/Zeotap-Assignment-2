// const WeatherRecord = require("../models/WeatherRecord");
const WeatherRecord = require("../models/WeatherRecord");
const DailySummary = require("../models/DailySummary");

const cities = [
  "Delhi",
  "Mumbai",
  "Chennai",
  "Bangalore",
  "Kolkata",
  "Hyderabad",
];

// Function to calculate and store daily summary for a city
async function calculateAndStoreDailySummary(city, date) {
  try {
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

    // console.log("land lega ankush");
    

    if (records.length === 0) {
      console.log(`No records found for ${city} on ${date.toDateString()}`);
      return;
    }

    const temperatures = records.map((r) => r.temperature);
    const weatherConditions = records.map((r) => r.weatherCondition);

    // Calculate dominant weather condition
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

    // Create summary object
    const summary = new DailySummary({
      city: city,
      date: startOfDay,
      avgTemperature:
        temperatures.reduce((a, b) => a + b) / temperatures.length,
      maxTemperature: Math.max(...temperatures),
      minTemperature: Math.min(...temperatures),
      dominantWeatherCondition: dominantCondition,
      recordCount: records.length,
    });

    // Save summary to database
    await summary.save();
    console.log(`Daily summary saved for ${city} on ${date.toDateString()}`);
  } catch (error) {
    console.error(`Error calculating daily summary for ${city}:`, error);
  }
}

// Function to calculate summaries for all cities
async function calculateAllCitiesSummaries(date) {
  // console.log("chut dedo");
  
  for (const city of cities) {
    await calculateAndStoreDailySummary(city, date);
  }
}

module.exports = {
  calculateAllCitiesSummaries,
};
