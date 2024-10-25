const mongoose = require("mongoose");

const dailySummarySchema = new  mongoose.Schema({
    city: String,
    date: Date,
    avgTemperature : Number,
    maxTemperature: Number,
    minTemperature: Number,
    dominantWeatherCondition: String
    // recordCount: Number
});

const DailySummary = mongoose.model('DailySummary', dailySummarySchema);

module.exports = DailySummary;