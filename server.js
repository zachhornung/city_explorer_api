//============================ package s==================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

//====================== app ===================
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3030;

//================ Routes =======================

app.get('/location', handleGetLocation);
function handleGetLocation(req, res){
  const dataFromTheFile = require('./data/location.json');
  const output = new Location(dataFromTheFile, req.query.city);
  res.send(output);
}
function Location(dataFromTheFile, cityName){
  this.search_query = cityName;
  this.formatted_query = dataFromTheFile[0].display_name;
  this.latitude = dataFromTheFile[0].lat;
  this.longitude = dataFromTheFile[0].lon;
}
//=================== Initialization =================
app.listen(PORT, () => console.log(`app is up on port http://localhost:${PORT}`));
