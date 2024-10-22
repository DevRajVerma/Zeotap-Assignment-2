const mongoose = require("mongoose");

// Weather record schema
const weatherSchema = new mongoose.Schema({
    city: String,
    weatherCondition: String,
    temperature: Number,
    feelsLike: Number,
    timestamp: Date
  });
  
  const WeatherRecord = mongoose.model('WeatherRecord', weatherSchema);

  module.exports = WeatherRecord;