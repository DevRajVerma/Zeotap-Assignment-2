const mongoose = require("mongoose");


const alertThresholdSchema = new mongoose.Schema({
    alertType: {
        type: String,
        enum: ['HIGH_TEMPERATURE', 'LOW_TEMPERATURE', 'WEATHER_CONDITION'],
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    consecutiveChecks: {
        type: Number,
        default: 1
    },
    condition: String,
    city: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('AlertThreshold', alertThresholdSchema);