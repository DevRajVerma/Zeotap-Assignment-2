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
2. Install dependencies:
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


//summary route se summary mil rahi hai, city aur date dene pe

Daily summary calculating accurately, just something about the date, its calculating for yesterday which is technically correct as we have all the weather records for last day and not the weather records for today's date, well, will see about it later 

Then do the visualization and frontend part and all clear

Added some real thresholds and considering alert System is working fine 