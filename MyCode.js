const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 4000;
const cors = require("cors");

const { startWeatherDataFetching } = require("./controllers/fetchWeatherData");
const { cronSchedular } = require("./schedular");

const appRoutes = require("./routes/saareRoutes");

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://drverma2704:AavYzM7b818uX6uH@giftwala.x1ywjoh.mongodb.net/ZeoAssignment2"
  )
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

// API endpoints
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use("/api", appRoutes);

// Schedule daily summary calculation at 00:05 AM (5 minutes after midnight)
// This allows time for any final weather records from the previous day to be stored
cronSchedular();

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  startWeatherDataFetching();
});
