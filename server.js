'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');

// Application Setup
const PORT = process.env.PORT;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
const YELP_API_KEY = process.env.YELP_API_KEY;

const app = express();
app.use(cors());

// routes
app.get('/movies', handleMovieRequest);
app.get('/yelp', handleRestRequest);
app.use('*', notFoundHandler);


// handler functions
function handleRestRequest(req, res) {
    const area = req.query.;
    const url = ``;
    if (!area) {
        res.status(404).send('no search query was provided');
    }
    const areaQuery = {
        "key": YELP_API_KEY,
        "area": area
    };

    superagent.get(url).set({ 'Authorization': 'Bearer ' + YELP_API_KEY }).query(areaQuery).then(resData => {
        const restaurant = new Restaurant(resData.body[0]);
        res.status(200).send(restaurant);
    }).catch((error) => {
        res.status(500).send('Sorry, something went wrong');
    });
}

function handleMovieRequest(req, res) {
    const area = req.query.;
    const url = ``;
    if (!area) {
        res.status(404).send('no search query was provided');
    }
    const areaQuery = {
        "key": MOVIE_API_KEY,
        "area": area
    };

    superagent.get(url).query(areaQuery).then(resData => {
        const movie = new Movie(resData.body[0]);
        res.status(200).send(movie);
    }).catch((error) => {
        res.status(500).send('Sorry, something went wrong');
    });
}

function notFoundHandler(request, response) {
    response.status(404).send('Not found!');
}
// constructors
function Restaurant() {
    this.name = ;
    this.image_url = ;
    this.price = ;
    this.rating = ;
    this.url = ;
}

function Movie() {
    this.title = ;
    this.overview = ;
    this.average_votes = ;
    this.total_votes = ;
    this.image_url = ;
    this.popularity = ;
    this.released_on = ;
}