const EventEmitter = require("events");
const Alert = require("../models/alert.js");

const AlertThreshold = require("../models/alertThreshold.js");

class WeatherAlertSystem extends EventEmitter {
  constructor() {
    super();
    this.consecutiveCounts = new Map();
    this.lastTriggered = new Map();
    this.ALERT_COOLDOWN = 3600000; // 1 hour in milliseconds
  }

  async processWeatherData(weatherData) {
    try {
      const thresholds = await AlertThreshold.find({ city: weatherData.city });
      // console.log(thresholds);

      //we getting all the thresholds in our db

      const alerts = [];
      const now = new Date();

      for (const threshold of thresholds) {
        const thresholdKey = threshold._id.toString();
        let isThresholdBreached = false;

        console.log("Threshold value", threshold.value);
        console.log("Temperature in Delhi", weatherData.temperature);

        switch (threshold.alertType) {
          case "HIGH_TEMPERATURE":
            isThresholdBreached = weatherData.temperature >= threshold.value;

            break;
          // console.log("ek baar lele babbe wali");
          case "LOW_TEMPERATURE":
            isThresholdBreached = weatherData.temperature <= threshold.value;
            break;
          case "WEATHER_CONDITION":
            isThresholdBreached =
              weatherData.weatherCondition === threshold.condition;
            break;
        }

        let currentCount = this.consecutiveCounts.get(thresholdKey) || 0;
        if (isThresholdBreached) {
          currentCount++;
          this.consecutiveCounts.set(thresholdKey, currentCount);
        } else {
          this.consecutiveCounts.set(thresholdKey, 0);
          continue;
        }

        if (currentCount >= threshold.consecutiveChecks) {
          const lastTrigger = this.lastTriggered.get(thresholdKey);
          const cooldownElapsed =
            !lastTrigger ||
            now.getTime() - lastTrigger.getTime() >= this.ALERT_COOLDOWN;

          if (cooldownElapsed) {
            const alert = await this.createAlert(threshold, weatherData);
            alerts.push(alert);
            this.lastTriggered.set(thresholdKey, now);
            this.emit("alert", alert);
          }
        }
      }

      // console.log("no alerts", alerts);

      return alerts;
    } catch (error) {
      console.error("Error processing weather data for alerts:", error);
      return [];
    }
  }

  async createAlert(threshold, weatherData) {
    const message = this.generateAlertMessage(threshold, weatherData);
    const alert = new Alert({
      thresholdId: threshold._id,
      message,
      city: weatherData.city,
    });
    await alert.save();
    return alert;
  }

  generateAlertMessage(threshold, weatherData) {
    switch (threshold.alertType) {
      case "HIGH_TEMPERATURE":
        return `High temperature alert in ${weatherData.city}: Current temperature ${weatherData.temperature}°C exceeds threshold of ${threshold.value}°C`;
      case "LOW_TEMPERATURE":
        return `Low temperature alert in ${weatherData.city}: Current temperature ${weatherData.temperature}°C is below threshold of ${threshold.value}°C`;
      case "WEATHER_CONDITION":
        return `Weather condition alert in ${weatherData.city}: Current condition "${weatherData.weatherCondition}" matches monitored condition "${threshold.condition}"`;
      default:
        return `Unknown alert type triggered for ${weatherData.city}`;
    }
  }
}

const alertSystem = new WeatherAlertSystem();
module.exports = alertSystem;
