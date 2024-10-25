const AlertThreshold = require("../models/alertThreshold");
const Alert = require("../models/alert");

exports.createThreshold = async (req, res) => {
    try {
        const threshold = new AlertThreshold(req.body);
        await threshold.save();
        res.status(201).json(threshold);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getThresholds = async (req, res) => {
    try {
        const thresholds = await AlertThreshold.find();
        res.json(thresholds);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find()
            .populate('thresholdId')
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};