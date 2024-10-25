const cron = require("node-cron");

const { calculateAllCitiesSummaries } = require('../controllers/SummaryCreation.js')

function cronSchedular() {
  cron.schedule("5 0 * * *", async () => {
  // cron.schedule("5 0 * * *", async () => {

    try{
      console.log("Running daily summary calculations...");
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      // console.log(yesterday);
      
      await calculateAllCitiesSummaries(yesterday);
      // console.log("land jayega mera");

    }
    catch(error){
      console.error("Error during cron job execution:",error);
    }
      
      
    });
}

module.exports = {
  cronSchedular
}