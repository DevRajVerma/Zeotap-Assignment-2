// Alert configuration schema
const alertConfigSchema = new mongoose.Schema({
  city: String,
  maxTemp: Number,
  minTemp: Number,
  email: String
});

const AlertConfig = mongoose.model('AlertConfig', alertConfigSchema);

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});


// Function to check alert thresholds and send notifications
async function checkAlertThresholds(weatherData) {
  const alertConfigs = await AlertConfig.find({ city: weatherData.city });

  for (const config of alertConfigs) {
    if (weatherData.temperature > config.maxTemp || weatherData.temperature < config.minTemp) {
      // Check if this is the second consecutive breach
      const previousRecord = await WeatherRecord.findOne({
        city: weatherData.city,
        timestamp: { $lt: weatherData.timestamp }
      }).sort({ timestamp: -1 });

      if (previousRecord &&
          (previousRecord.temperature > config.maxTemp ||
           previousRecord.temperature < config.minTemp)) {
        // Send alert email
        const mailOptions = {
          from: 'your-email@gmail.com',
          to: config.email,
          subject: `Weather Alert for ${weatherData.city}`,
          text: `Temperature threshold breached in ${weatherData.city}. Current temperature: ${weatherData.temperature}°C`
        };

        await transporter.sendMail(mailOptions);
      }
    }
  }
}