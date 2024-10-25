const cron = require("node-cron");
const {
  calculateAllCitiesSummaries,
} = require("../controllers/SummaryCreation.js");

// Initializes the cron scheduler for daily summary calculations
function cronSchedular() {
  // Schedules the job to run every day at 00:05 AM
  cron.schedule("5 0 * * *", async () => {
  // cron.schedule("* * * * *", async () => {
    try {
      // console.log("Running daily summary calculations...");
      console.log(`Running daily summary calculations at ${new Date().toLocaleString()}...`);


      // Set date to yesterday to calculate previous day's summaries
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Calls the function to compute summaries for all cities
      await calculateAllCitiesSummaries(yesterday);
    } catch (error) {
      console.error("Error during cron job execution:", error);
    }
  });
}

module.exports = {
  cronSchedular,
};
