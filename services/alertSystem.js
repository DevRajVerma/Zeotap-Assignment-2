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
      // Validate input data
      if (!weatherData || !weatherData.city || !weatherData.temperature) {
        console.error("Invalid weather data received:", weatherData);
        return [];
      }

      const thresholds = await AlertThreshold.find({ city: weatherData.city });
      const alerts = [];
      const now = new Date();

      for (const threshold of thresholds) {
        const thresholdKey = threshold._id.toString();

        // Check if threshold is valid
        if (!threshold.value && threshold.alertType !== "WEATHER_CONDITION") {
          console.warn(`Invalid threshold configuration for ${thresholdKey}`);
          continue;
        }

        const isThresholdBreached = this.checkThresholdBreach(
          threshold,
          weatherData
        );

        // Update consecutive counts
        let currentCount = this.consecutiveCounts.get(thresholdKey) || 0;
        if (isThresholdBreached) {
          currentCount++;
          this.consecutiveCounts.set(thresholdKey, currentCount);
        } else {
          this.consecutiveCounts.set(thresholdKey, 0);
          continue;
        }

        // Check if alert should be triggered
        if (currentCount >= threshold.consecutiveChecks) {
          const lastTrigger = this.lastTriggered.get(thresholdKey);
          const cooldownElapsed =
            !lastTrigger ||
            now.getTime() - lastTrigger.getTime() >= this.ALERT_COOLDOWN;

          if (cooldownElapsed) {
            try {
              const alert = await this.createAlert(threshold, weatherData);
              alerts.push(alert);
              this.lastTriggered.set(thresholdKey, now);
              this.emit("alert", alert);
            } catch (error) {
              console.error(
                `Failed to create alert for threshold ${thresholdKey}:`,
                error
              );
            }
          }
        }
      }

      return alerts;
    } catch (error) {
      console.error("Error processing weather data for alerts:", error);
      return [];
    }
  }

  checkThresholdBreach(threshold, weatherData) {
    switch (threshold.alertType) {
      case "HIGH_TEMPERATURE":
        return weatherData.temperature >= threshold.value;
      case "LOW_TEMPERATURE":
        return weatherData.temperature <= threshold.value;
      case "WEATHER_CONDITION":
        return weatherData.weatherCondition === threshold.condition;
      default:
        console.warn(`Unknown alert type: ${threshold.alertType}`);
        return false;
    }
  }

  async createAlert(threshold, weatherData) {
    try {
      const message = this.generateAlertMessage(threshold, weatherData);
      const alert = new Alert({
        thresholdId: threshold._id,
        message,
        city: weatherData.city,
        timestamp: new Date(),
        alertType: threshold.alertType,
        thresholdValue: threshold.value,
        currentValue: weatherData.temperature,
      });
      return await alert.save();
    } catch (error) {
      console.error("Error creating alert:", error);
      throw error;
    }
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
