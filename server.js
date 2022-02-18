const express = require('express');
const app = express();

module.exports = app;

const PORT = process.env.PORT || 4000;

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const errorhandler = require('errorhandler');
app.use(errorhandler());

const cors = require('cors');
app.use(cors());

const morgan = require('morgan');
//app.use(morgan('tiny'));

const apiRouter = require('./api/api');
app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`)
});