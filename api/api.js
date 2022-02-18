const express = require('express');
const apiRouter = express.Router();

const artistsRouter = require('./artists');
apiRouter.use('/artists', artistsRouter);

const seriesRouter = require('./series');
apiRouter.use('/series', seriesRouter);

module.exports = apiRouter;