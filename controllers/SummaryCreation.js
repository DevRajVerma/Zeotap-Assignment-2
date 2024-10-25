// Required models for weather data and daily summaries
const WeatherRecord = require("../models/WeatherRecord");
const DailySummary = require("../models/DailySummary");

// List of cities for daily summary calculations
const cities = [
  "Delhi",
  "Mumbai",
  "Chennai",
  "Bangalore",
  "Kolkata",
  "Hyderabad",
];

// Function to calculate and store a daily summary for a specified city and date
async function calculateAndStoreDailySummary(city, date) {
  try {
    // Define start and end times of the specified date for record filtering
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Retrieve weather records for the city within the date range
    const records = await WeatherRecord.find({
      city: city,
      timestamp: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    // If no records are found, log and exit the function
    if (records.length === 0) {
      console.log(`No records found for ${city} on ${date.toDateString()}`);
      return;
    }

    // Extract and validate temperatures
    const temperatures = records
      .map((r) => r.temperature)
      .filter((temp) => temp != null && !isNaN(temp));

    if (temperatures.length === 0) {
      throw new Error(
        `No valid temperature readings found for ${city} on ${date.toDateString()}`
      );
    }

    // Calculate temperature statistics (rounded to 1 decimal place)
    const avgTemperature =
      Math.round(
        (temperatures.reduce((a, b) => a + b) / temperatures.length) * 10
      ) / 10;
    const maxTemperature = Math.round(Math.max(...temperatures) * 10) / 10;
    const minTemperature = Math.round(Math.min(...temperatures) * 10) / 10;

    // const weatherConditions = records.map((r) => r.weatherCondition);

    // Determine the dominant weather condition
    const conditionCounts = {};
    let maxDuration = 0;
    let dominantCondition = null;

    // Calculate weighted conditions based on time duration
    for (let i = 0; i < records.length; i++) {
      const condition = records[i].weatherCondition;
      if (!condition) continue;

      // Calculate duration until next record or end of day
      const currentTime = new Date(records[i].timestamp);
      const nextTime = records[i + 1]
        ? new Date(records[i + 1].timestamp)
        : endOfDay;

      const duration = nextTime - currentTime;
      conditionCounts[condition] = (conditionCounts[condition] || 0) + duration;

      if (conditionCounts[condition] > maxDuration) {
        maxDuration = conditionCounts[condition];
        dominantCondition = condition;
      }
    }

    // Create a daily summary object based on calculated data
    // const summary = new DailySummary({
    //   city: city,
    //   date: startOfDay,
    //   avgTemperature,
    //   maxTemperature,
    //   minTemperature,
    //   dominantWeatherCondition: dominantCondition,
    // });

    const summaryData = {
      city: city,
      date: startOfDay,
      avgTemperature,
      maxTemperature,
      minTemperature,
      dominantWeatherCondition: dominantCondition,
    };

    // Check for existing summary to avoid duplicates
    const existingSummary = await DailySummary.findOne({
      city: city,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (existingSummary) {
      // await DailySummary.findByIdAndUpdate(existingSummary._id, summary);
      await DailySummary.findByIdAndUpdate(existingSummary._id, 
        { $set: summaryData },
        { new: true }
      );
      console.log(
        `Updated daily summary for ${city} on ${date.toDateString()}`
      );
    } else {
      const summary = new DailySummary(summaryData);
      await summary.save();
      console.log(
        `Created daily summary for ${city} on ${date.toDateString()}`
      );
    }
  } catch (error) {
    console.error(
      `Error calculating daily summary for ${city} on ${date.toDateString()}:`,
      error
    );
    throw error;
  }
}

// Function to calculate daily summaries for all cities on a specified date
async function calculateAllCitiesSummaries(date) {
  // Iterate over the list of cities and calculate summaries for each
  for (const city of cities) {
    await calculateAndStoreDailySummary(city, date);
  }
}

module.exports = {
  calculateAllCitiesSummaries,
};
