const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 4000;
const cors = require("cors");

const { startWeatherDataFetching } = require("./controllers/fetchWeatherData");
const { cronSchedular } = require("./schedular");
const alertSystem = require("./services/alertSystem");
const appRoutes = require("./routes/saareRoutes");

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://drverma2704:AavYzM7b818uX6uH@giftwala.x1ywjoh.mongodb.net/ZeoAssignment2"
  )
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

// Set up alert event listener
alertSystem.on("alert", async (alert) => {
  console.log("Weather Alert:", alert.message);
  // Additional notification methods, e.g., email or SMS, can be added here
});

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Register routes
app.use("/api", appRoutes);

// Schedule daily summary calculation
cronSchedular();

// Start the server and data fetching
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  startWeatherDataFetching();
});
