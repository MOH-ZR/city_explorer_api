'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');

// Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());

// routes
app.get('/location', handelLocationRequest);
app.get('/weather', handelWeatherRequest);


const errorMessage = {
    status: 500,
    responseText: "Sorry, something went wrong"
};

function handelLocationRequest(req, res) {
    const searchQuery = req.query.city;
    if (searchQuery !== 'Lynnwood') {
        res.send(errorMessage);
    } else {
        const locationsRawData = require('./data/location.json');
        const location = new Location(locationsRawData[0], searchQuery);
        res.send(location);
    }
}

function handelWeatherRequest(req, res) {
    const weatherRawData = require('./data/weather.json');
    const weather = new Weather(weatherRawData);
    res.send(weather);
}

// constructors
function Location(data, query) {
    this.search_query = query;
    this.formatted_query = data.display_name;
    this.latitude = data.lat;
    this.longitude = data.lon;
}

function Weather(weatherData) {
    this.forecast = weatherData.data[0].weather.description;
    this.time = weatherData.data[0].datetime;
}

app.listen(PORT, () => {
    console.log("hello");
});