const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    thresholdId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AlertThreshold',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    city: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Alert', alertSchema);