const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const seriesRouter = express.Router();

module.exports = seriesRouter;

// param

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    db.get('SELECT * FROM Series WHERE id = $id;', { $id: seriesId }, (err, row) => {
        if (err) {
            next(err);
        }
        if (row) {
            req.series = row;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

const issuesRouter = require('./issues');
seriesRouter.use('/:seriesId/issues', issuesRouter);

// GET

seriesRouter.get('/:seriesId', (req, res, next) => {
    const seriesObj = { series: req.series };
    res.status(200).json(seriesObj);
});

seriesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Series;', (err, rows) => {
        if (err) {
            next(err);
        }
        const series = { series: rows };
        res.status(200).json(series);
    });
});

// POST

seriesRouter.post('/', (req, res, err) => {
    const postedSeries = req.body.series;
    const name = postedSeries.name;
    const description = postedSeries.description;

    if (!name || !description) {
        res.status(400).send();
    }

    db.run(`INSERT INTO Series (name, description) 
    VALUES ($name, $description);`, 
    { $name: name, $description: description }, function(err) {
        if (err) {
            next(err);
        }
        const newId = this.lastID;
        db.get(`SELECT * FROM Series WHERE id = ${newId};`, (err, row) => {
            if (err) {
                next(err);
            }
            const newSeries = { series: row };
            res.status(201).json(newSeries);
        });
    });
});

// PUT

seriesRouter.put('/:seriesId', (req, res, next) => {
    
    // Request values
    const id = req.params.seriesId;
    const series = req.body.series;
    const name = series.name;
    const description = series.description;
 
    // Missing info
    if (!name || !description) {
        res.sendStatus(400);
    }

    // Update database
    db.run(`UPDATE Series SET 
    name = $name,
    description = $description 
    WHERE id = $id;`, {
        $name: name,
        $description: description,
        $id: id
    }, (err) => {
        if (err) {
            next(err);
        }
        // Return updated row from database
        db.get('SELECT * FROM Series WHERE id = $id;', { 
            $id: id 
        }, (err, row) => {
            if (err) {
                next(err);
            }
            const seriesObj = { series: row };
            res.status(200).json(seriesObj);
        });
    });
});

// DELETE

seriesRouter.delete('/:seriesId', (req, res, next) => {
    //console.log('CURRENTLY IN Series Delete');
    
    const seriesId = req.params.seriesId;
    //console.log ('Series DELETE id:');
    //console.log(seriesId);

    db.get('SELECT * FROM Issue WHERE series_id = $seriesId;', { $seriesId: seriesId }, (err, row) => {
        if (err) {
            //console.log(err);
            next(err);
        } else if (row) {
            //console.log(row);
            res.sendStatus(400);
        } else {
            db.run('DELETE FROM Series WHERE id = $seriesId;', { $seriesId: seriesId }, (err) => {
                if (err) {
                    //console.log(err);
                    next(err);
                } else {
                    //console.log('Done');
                    res.sendStatus(204);
                }
            });
        }
    });
});


// Temp solution code for Delete:
/*
seriesRouter.delete('/:seriesId', (req, res, next) => {
    const issueSql = 'SELECT * FROM Issue WHERE Issue.series_id = $seriesId';
    const issueValues = {$seriesId: req.params.seriesId};
    db.get(issueSql, issueValues, (error, issue) => {
      if (error) {
        next(error);
      } else if (issue) {
        res.sendStatus(400);
      } else {
        const deleteSql = 'DELETE FROM Series WHERE Series.id = $seriesId';
        const deleteValues = {$seriesId: req.params.seriesId};
  
        db.run(deleteSql, deleteValues, (error) => {
          if (error) {
            next(error);
          } else {
            res.sendStatus(204);
          }
        });
      }
    });
  });
 */
