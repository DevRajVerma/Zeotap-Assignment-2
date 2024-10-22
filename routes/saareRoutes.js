// Get current weather
app.get("/weather", async (req, res) => {
  try {
    const city = req.query.city || "Delhi";
    const weatherData = await fetchWeatherData(city);
    if (weatherData) {
      res.json(weatherData);
    } else {
      res.status(500).send("Error retrieving weather data");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving weather data");
  }
});

// Get daily summary
app.get("/summary", async (req, res) => {
  try {
    const { city, date } = req.query;
    const summary = await calculateDailySummary(city, new Date(date));
    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving daily summary");
  }
});

// Configure alerts
app.post("/alerts", async (req, res) => {
  try {
    const alertConfig = new AlertConfig(req.body);
    await alertConfig.save();
    res.json({ message: "Alert configuration saved" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving alert configuration");
  }
});