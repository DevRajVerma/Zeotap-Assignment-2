async function calculateAndStoreDailySummary(city, date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const records = await WeatherRecord.find({
        city: city,
        timestamp: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }).sort({ timestamp: 1 });
      
      if (records.length === 0) {
        console.log(`No records found for ${city} on ${date.toDateString()}`);
        return;
      }
  
      const temperatures = records
        .map(r => r.temperature)
        .filter(temp => temp != null && !isNaN(temp));
  
      if (temperatures.length === 0) {
        throw new Error(`No valid temperature readings found for ${city} on ${date.toDateString()}`);
      }
  
      const avgTemperature = Math.round((temperatures.reduce((a, b) => a + b) / temperatures.length) * 10) / 10;
      const maxTemperature = Math.round(Math.max(...temperatures) * 10) / 10;
      const minTemperature = Math.round(Math.min(...temperatures) * 10) / 10;
  
      const conditionCounts = {};
      let maxDuration = 0;
      let dominantCondition = null;
  
      for (let i = 0; i < records.length; i++) {
        const condition = records[i].weatherCondition;
        if (!condition) continue;
  
        const currentTime = new Date(records[i].timestamp);
        const nextTime = records[i + 1] 
          ? new Date(records[i + 1].timestamp)
          : endOfDay;
        
        const duration = nextTime - currentTime;
        conditionCounts[condition] = (conditionCounts[condition] || 0) + duration;
        
        if (conditionCounts[condition] > maxDuration) {
          maxDuration = conditionCounts[condition];
          dominantCondition = condition;
        }
      }
  
      const summaryData = {
        city: city,
        date: startOfDay,
        avgTemperature,
        maxTemperature,
        minTemperature,
        dominantWeatherCondition: dominantCondition,
      };
  
      const existingSummary = await DailySummary.findOne({
        city: city,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });
  
      if (existingSummary) {
        // Update without including _id field
        await DailySummary.findByIdAndUpdate(existingSummary._id, 
          { $set: summaryData },
          { new: true }
        );
        console.log(`Updated daily summary for ${city} on ${date.toDateString()}`);
      } else {
        const summary = new DailySummary(summaryData);
        await summary.save();
        console.log(`Created daily summary for ${city} on ${date.toDateString()}`);
      }
  
    } catch (error) {
      console.error(`Error calculating daily summary for ${city} on ${date.toDateString()}:`, error);
      throw error;
    }
  }