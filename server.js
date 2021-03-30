'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');

// Application Setup
const PORT = process.env.PORT;
const GEO_CODE_API_KEY = process.env.GEO_CODE_API_KEY;
const WEATHER_CODE_API_KEY = process.env.WEATHER_CODE_API_KEY;
const PARKS_CODE_API_KEY = process.env.PARKS_CODE_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

const app = express();
app.use(cors());

// Database Connection Setup
const client = new pg.Client(DATABASE_URL);

// routes
app.get('/location', handleLocationRequest);
app.get('/weather', handleWeatherRequest);
app.get('/parks', handleParksRequest);
app.get('/', (request, response) => { response.status(200).send('ok'); });
app.use('*', notFoundHandler);


function handleLocationRequest(req, res) {
    const cityName = req.query.city;
    const url = `https://us1.locationiq.com/v1/search.php?key=${GEO_CODE_API_KEY}&city=${cityName}&format=json`;
    if (!cityName) {
        res.status(404).send('no search query was provided');
    }

    // check if the city is exist in the city database
    const safeValues = [cityName];
    const sqlQuery = `SELECT * FROM location WHERE name=$1`;

    // query the database
    client.query(sqlQuery, safeValues).then(result => {
        if (result.rows.length === 0) {
            throw error;
        }
        res.status(200).json(result.rows[0]);
    }).catch((error) => {
        const cityQueryParam = {
            key: GEO_CODE_API_KEY,
            city: cityName,
            format: 'json'
        };

        superagent.get(url).query(cityQueryParam).then(resData => {
            const location = new Location(resData.body[0], cityName);
            const safeValues = [cityName, location.formatted_query, location.latitude, location.longitude];
            const sqlQuery = `INSERT INTO location(name, fullname, latitude, longitude) VALUES ($1, $2, $3, $4)`;
            client.query(sqlQuery, safeValues);

            res.status(200).send(location);
        }).catch((error) => {
            res.status(500).send('Sorry, something went wrong');
        });
    });

}

function handleWeatherRequest(req, res) {
    const searchQueryLat = req.query.lat;
    const searchQueryLon = req.query.lon;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${searchQueryLat}&lon=${searchQueryLon}&key=${WEATHER_CODE_API_KEY}&include=minutely`;

    superagent.get(url).then(resData => {
        const weatherMap = resData.body.data.map((day) => {
            return new Weather(day);
        });
        res.status(200).send(weatherMap);
    }).catch((error) => {
        res.status(500).send('Sorry, something went wrong');
    });
}


function handleParksRequest(req, res) {
    const cityName = req.query.location;
    const url = `https://developer.nps.gov/api/v1/parks?location=${cityName}&api_key=${PARKS_CODE_API_KEY}`;
    superagent.get(url).then(resData => {
        const tenParks = resData.body.data.map((park) => {
            return new Park(park);
        });
        res.status(200).send(tenParks.slice(0, 10));
    }).catch((error) => {
        res.status(500).send('Sorry, something went wrong');
    });

}


// constructors
function Location(data, query) {
    this.search_query = query;
    this.formatted_query = data.display_name;
    this.latitude = data.lat;
    this.longitude = data.lon;
}

function Weather(day) {
    this.forecast = day.weather.description;
    this.time = day.datetime;
}

function Park(parkData) {
    this.name = parkData.fullName;
    this.address = parkData.addresses[0].postalCode + " " + parkData.addresses[0].line1 + ", " + parkData.addresses[0].city + ", " + parkData.addresses[0].stateCode;
    this.fee = "0.00"; // Note: I used parkData.fees to get back the fees but since it's value is an emty arry I used "0.00" instead.
    this.description = parkData.description;
    this.url = parkData.url;
}

function notFoundHandler(request, response) {
    response.status(404).send('Not found!');
}


// Connect to DB and Start the Web Server
client.connect().then(() => {
    app.listen(PORT, () => {
        console.log("Connected to database:", client.connectionParameters.database) //show what database we connected to
        console.log('Server up on', PORT);
    });
})