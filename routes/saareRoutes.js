// const DailySummary = require("./models/DailySummary");
const DailySummary = require("../models/DailySummary");
const WeatherRecord = require("../models/WeatherRecord");
const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alertController");

//Get Daily summary
router.post(
  "/summary",
  (req, res, next) => {
    console.log("/summary route called");
    next();
  },
  async (req, res) => {
    try {
      const { city, date } = req.body;

      if (!city || !date) {
        return res.status(400).json({
          message: "Both city and date are required",
        });
      }

      const queryDate = new Date(date);

      if (isNaN(queryDate.getTime())) {
        return res.status(400).json({
          message: "Invalide date format , 2024-10-23 correct format",
        });
      }
      queryDate.setHours(0, 0, 0, 0);

      // First try to find pre-calculated summary
      let summary = await DailySummary.findOne({
        city: city,
        date: queryDate,
      });

      // If no pre-calculated summary exists and the date is today, calculate it on demand
      if (!summary && isToday(queryDate)) {
        summary = await calculateDailySummary(city, queryDate);

        if (summary) {
          const newDailySummary = new DailySummary(summary);
          await newDailySummary.save();
        }
      }

      if (!summary) {
        return res
          .status(404)
          .json({ message: "No summary available for this date" });
      }

      res.json(summary);
    } catch (error) {
      console.error("Error in /summary route:", error);
      res.status(500).json({
        message: "Error retrieving daily Summary",
        error: error.message
      });
    }
  }
);

// Add these routes to your existing router
router.post('/thresholds', alertController.createThreshold);
router.get('/thresholds', alertController.getThresholds);
router.get('/alerts', alertController.getAlerts);

// Function to calculate daily summaries
async function calculateDailySummary(city, date) {
  const startOfDay = new Date(date);
  console.log(startOfDay);

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

  // console.log(records);

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

// Helper function to check if a date is today
function isToday(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// Add an endpoint to manually trigger summary calculation for a specific date
// (useful for testing or calculating historical summaries)
// app.post("/calculate-summary", async (req, res) => {
//   try {
//     const { date } = req.body;
//     await calculateAllCitiesSummaries(new Date(date));
//     res.json({ message: "Daily summaries calculated successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error calculating daily summaries");
//   }
// });

// Get current weather
// app.get("/weather", async (req, res) => {
//   try {
//     const city = req.query.city || "Delhi";
//     const weatherData = await fetchWeatherData(city);
//     if (weatherData) {
//       res.json(weatherData);
//     } else {
//       res.status(500).send("Error retrieving weather data");
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error retrieving weather data");
//   }
// });

// Configure alerts
// app.post("/alerts", async (req, res) => {
//   try {
//     const alertConfig = new AlertConfig(req.body);
//     await alertConfig.save();
//     res.json({ message: "Alert configuration saved" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error saving alert configuration");
//   }
// });

module.exports = router;
