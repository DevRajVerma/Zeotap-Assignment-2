const mongoose = require("mongoose");
const AlertThreshold = require("./models/alertThreshold"); // Adjust path as needed

// Real-world thresholds considering each city's climate
const thresholds = [
  // Delhi
  {
    alertType: "HIGH_TEMPERATURE",
    value: 42, // Alert when temperature exceeds 42°C (common in Delhi summers)
    consecutiveChecks: 3,
    city: "Delhi",
  },
  {
    alertType: "LOW_TEMPERATURE",
    value: 5, // Alert when temperature drops below 5°C (Delhi winters)
    consecutiveChecks: 3,
    city: "Delhi",
  },
  {
    alertType: "WEATHER_CONDITION",
    value: 0,
    condition: "Dust",
    consecutiveChecks: 2,
    city: "Delhi",
  },

  // Mumbai
  {
    alertType: "HIGH_TEMPERATURE",
    value: 38, // Mumbai's humidity makes this temperature severe
    consecutiveChecks: 3,
    city: "Mumbai",
  },
  {
    alertType: "WEATHER_CONDITION",
    value: 0,
    condition: "Rain", // Important during monsoon
    consecutiveChecks: 4,
    city: "Mumbai",
  },

  // Chennai
  {
    alertType: "HIGH_TEMPERATURE",
    value: 40, // Chennai's coastal humidity makes this critical
    consecutiveChecks: 3,
    city: "Chennai",
  },
  {
    alertType: "WEATHER_CONDITION",
    value: 0,
    condition: "Rain", // Monsoon monitoring
    consecutiveChecks: 4,
    city: "Chennai",
  },

  // Bangalore
  {
    alertType: "HIGH_TEMPERATURE",
    value: 35, // Unusual for Bangalore's generally moderate climate
    consecutiveChecks: 3,
    city: "Bangalore",
  },
  {
    alertType: "LOW_TEMPERATURE",
    value: 12, // Quite cold for Bangalore
    consecutiveChecks: 3,
    city: "Bangalore",
  },

  // Kolkata
  {
    alertType: "HIGH_TEMPERATURE",
    value: 40, // Critical in Kolkata's humid climate
    consecutiveChecks: 3,
    city: "Kolkata",
  },
  {
    alertType: "WEATHER_CONDITION",
    value: 0,
    condition: "Rain", // Important during monsoon
    consecutiveChecks: 4,
    city: "Kolkata",
  },

  // Hyderabad
  {
    alertType: "HIGH_TEMPERATURE",
    value: 41, // Critical temperature for Hyderabad
    consecutiveChecks: 3,
    city: "Hyderabad",
  },
  {
    alertType: "LOW_TEMPERATURE",
    value: 10, // Unusually cold for Hyderabad
    consecutiveChecks: 3,
    city: "Hyderabad",
  },
];

// Function to seed the thresholds
async function seedAlertThresholds() {
  try {
    // Connect to MongoDB (if not already connected)
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        "mongodb+srv://drverma2704:AavYzM7b818uX6uH@giftwala.x1ywjoh.mongodb.net/ZeoAssignment2"
      ); // Update with your DB URL
    }

    // Clear existing thresholds
    await AlertThreshold.deleteMany({});
    console.log("Cleared existing thresholds");

    // Insert new thresholds
    const result = await AlertThreshold.insertMany(thresholds);
    console.log(`Successfully seeded ${result.length} alert thresholds`);

    // Log the thresholds for verification
    const seededThresholds = await AlertThreshold.find({});
    console.log("\nSeeded Thresholds:");
    seededThresholds.forEach((threshold) => {
      console.log(
        `${threshold.city} - ${threshold.alertType}: ${
          threshold.value || threshold.condition
        }`
      );
    });
  } catch (error) {
    console.error("Error seeding alert thresholds:", error);
  } finally {
    // Disconnect only if we connected in this function
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

// Run the seeding function
seedAlertThresholds();
