//============================ package s==================
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
require('dotenv').config();


//====================== app ===================
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3030;
const LOCATION_API_KEY = process.env.LOCATION_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const PARKS_API_KEY = process.env.PARKS_API_KEY;

//================ Routes =======================

app.get('/location', handleGetLocation);
app.get('/weather', handleGetWeather);
app.get('/parks', handleGetParks);

function handleGetLocation(req, res){
  const city = req.query.city;
  const url = `https://us1.locationiq.com/v1/search.php?key=${LOCATION_API_KEY}&q=${city}&format=json`;
  superagent.get(url).then(stuffThatComesBack => {
    const output = new Location(stuffThatComesBack.body, city);
    res.send(output);
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
  });
}

function Weather(data){
  this.forecast = data.weather.description;
  this.time = data.datetime;
}

function handleGetParks(req, res){
  console.log(req);
}

//=================== Initialization =================
app.listen(PORT, () => console.log(`app is up on port http://localhost:${PORT}`));
