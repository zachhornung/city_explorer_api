//============================ package s==================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

//====================== app ===================
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3030;

//
