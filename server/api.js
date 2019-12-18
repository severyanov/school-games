const express = require('express');
const cookieParser = require('cookie-parser');

const api = express();
api.use(express.json());

module.exports.api = api;
/*
post /auth

get /messages
post /messages

post /games id,user -> gameid : start game
patch /games id,scores
get /games username,game
*/