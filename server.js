//============================ package s==================
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();


//====================== app ===================
const app = express();
app.use(cors());
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);
client.on('error', error => console.log(error));

const PORT = process.env.PORT || 3030;
const LOCATION_API_KEY = process.env.LOCATION_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const PARKS_API_KEY = process.env.PARKS_API_KEY;
const MOVIES_API_KEY = process.env.MOVIES_API_KEY;
const YELP_API_KEY = process.env.YELP_API_KEY;

//================ Routes =======================

app.get('/location', handleGetLocation);
app.get('/weather', handleGetWeather);
app.get('/parks', handleGetParks);
app.get('/movies', handleGetMovies);
app.get('/yelp', handleGetYelp);

function handleGetLocation(req, res){
  const sqlCheckingString = 'SELECT * FROM cities WHERE search_query=$1';
  const sqlCheckingArray = [req.query.city];
  client.query(sqlCheckingString, sqlCheckingArray)
    .then(result => {
      if (result.rows.length > 0){
        res.send(result.rows[0]);
      }else {
        const city = req.query.city;
        const url = `https://us1.locationiq.com/v1/search.php?key=${LOCATION_API_KEY}&q=${city}&format=json`;
        superagent.get(url).then(stuffThatComesBack => {
          const output = new Location(stuffThatComesBack.body, city);
          res.send(output);
          const sqlString = 'INSERT INTO cities (search_query, formatted_query, latitude, longitude) VALUES($1, $2, $3, $4)';
          const sqlArray = [city, stuffThatComesBack.body[0].display_name, stuffThatComesBack.body[0].lat, stuffThatComesBack.body[0].lon];
          client.query(sqlString, sqlArray);
        }).catch(errorThatComesBack => {
          console.log(errorThatComesBack);
          res.status(500).send('something went wrong');
        });
      }
    });
}
function Location(dataFromTheFile, cityName){
  this.search_query = cityName;
  this.formatted_query = dataFromTheFile[0].display_name;
  this.latitude = dataFromTheFile[0].lat;
  this.longitude = dataFromTheFile[0].lon;
}

function handleGetWeather(req, res){
  const cityName = req.query.search_query;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityName}&key=${WEATHER_API_KEY}`;
  superagent.get(url).then(stuffThatComesBack => {
    const output = stuffThatComesBack.body.data.map(day => new Weather(day));
    res.send(output);
  }).catch(errorThatComesBack => {
    res.status(500).send(errorThatComesBack);
  });
}
function Weather(data){
  this.forecast = data.weather.description;
  this.time = data.datetime;
}

function handleGetParks(req, res){
  const parkCode = req.query.formatted_query;
  const url = `https://developer.nps.gov/api/v1/parks?limit=2&start=0&q=${parkCode}&sort=&api_key=${PARKS_API_KEY}`;
  superagent.get(url).then(stuffThatComesBack => {
    const output = stuffThatComesBack.body.data.map(park => new Parks(park));
    res.send(output);
  }).catch(errorThatComesBack => {
    res.status(500).send(errorThatComesBack);
  });
}
function Parks(data){
  this.name = data.fullName;
  this.address = data.addresses[0].line1;
  this.fee = data.fees.cost;
  this.description = data.description;
  this.url = data.url;
}

function handleGetMovies(req, res){
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${MOVIES_API_KEY}`;
  superagent.get(url).then(result => {
    const output = result.body.results.map(movie => new Movies(movie));
    res.send(output);
  }).catch(errorThatComesBack => res.status(500).send(errorThatComesBack));
}
function Movies(data){
  this.title = data.original_title;
  this.overview = data.overview;
  this.average_votes = data.vote_average;
  this.total_votes = data.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500/${data.poster_path}`;
  this.popularity = data.popularity;
  this.released_on = data.release_date;
}

function handleGetYelp(req, res){
  const offset = (req.query.page -1) * 5;
  const url = `https://api.yelp.com/v3/businesses/search?term=restaurant&limit=5&latitude=${req.query.latitude}&longitude=${req.query.longitude}&offset=${offset}`;
  superagent.get(url).set('authorization', `bearer ${YELP_API_KEY}`).then(result => {
    const output = result.body.businesses.map(business => new Businesses(business));
    res.send(output);
  }).catch(errorThatComesBack => res.status(500).send(errorThatComesBack));
}
function Businesses(data){
  this.name = data.name;
  this.image_url = data.image_url;
  this.price = data.price;
  this.rating = data.rating;
  this.url = data.url;
}
//=================== Initialization =================
client.connect().then(() => {
  app.listen(PORT, () => console.log(`app is up on port http://localhost:${PORT}`));
});
