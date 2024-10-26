# Zeotap Assignment 2 - Backend

## Overview

This project automates weather data collection using APIs and stores it for further analysis. It includes features such as generating daily summaries and alerting users when certain thresholds are met. The backend is structured with controllers, models, services, routes, and schedulers for easy maintenance and scalability.

## Features

- **Weather Data Fetching**: Periodic API calls to fetch real-time weather data.
- **Daily Summary**: Generates concise weather summaries every 24 hours.
- **Alerts System**: Triggers alerts if certain weather conditions are met.

## Project Structure

```
/controllers   # Handles API logic
/models        # Defines database schemas
/services      # Business logic for processing data
/routes        # API endpoints
/scheduler     # Schedules recurring tasks
```

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/DevRajVerma/Zeotap-Assignment-2.git
   ```

2. Go to Zeotap-Assignment-2 repository
    ```bash
   cd Zeotap-Assignment-2
    ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

- **Run the server**:
  ```bash
  npm start
  ```

## Dependencies

- express
- mongoose
- node-cron
- axios
- nodemon
- cors

## What is happening after starting the server
- Once the server starts, it continuously fetches weather data from the OpenWeatherMap API every 5 minutes and stores it in MongoDB. 

- A cron job triggers daily at 00:05 to calculate the daily summary for the previous day for six metro cities: Delhi, Mumbai, Hyderabad, Chennai, Bangalore, and Kolkata, and these daily summaries are also stored in the database.

- Using the /summary route, users can input a city and date to view that day's summary for the selected city. 

- An alert system running in background checks against defined thresholds with each data fetch. If the temperature falls below the threshold in three consecutive checks, an alert is triggered.

- There is a one-hour cooldown period after which the same alert can be triggered again.

- Checking against some real thresholds according to city temperature and condition

- Daily summary calculating accurately, just something about the date, its calculating for yesterday which is technically correct as we have all the weather records for last day and not all weather records for today's date 


