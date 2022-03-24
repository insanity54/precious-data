'use strict';

const fs = require('fs');
const bodyParser = require("body-parser");
const yaml = require('js-yaml');
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = yaml.load(fs.readFileSync('./api/swagger/swagger.yaml', 'utf8'));
const path = require('path');
const express = require('express');
const app = express();
const imageController = require('./api/controllers/image');

app.get('/image', imageController.image);

app.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDoc, { explorer: false })
);


const port = process.env.PORT || 10010;
app.listen(port);

module.exports = app; // for testing

