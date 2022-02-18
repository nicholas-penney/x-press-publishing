const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const express = require('express');
const issuesRouter = express.Router({mergeParams: true});

// Param

issuesRouter.param('issueId', (req, res, next, issueId) => {
  const SQL = 'SELECT * FROM Issue WHERE Issue.id = $issueId;';
  const values = { $issueId: issueId };
  db.get(SQL, values, (err, row) => {
    if (err) {
      next(err);
    } else if (row) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

// GET

issuesRouter.get('/', (req, res, err) => {
  const SQL = 'SELECT * FROM Issue WHERE series_id = $series_id;';
  const values = { $series_id: req.params.seriesId };
  db.all(SQL, values, (err, rows) => {
    if (err) {
      next(err);
    }
    if (rows) {
      res.status(200).json({ issues: rows });
    }
  });
});

// POST

issuesRouter.post('/', (req, res, next) => {

  const issue = req.body.issue;
  const name = issue.name;
  const issueNumber = issue.issueNumber;
  const publicationDate = issue.publicationDate;
  const artistId = issue.artistId;

  if (!name || !issueNumber || !publicationDate || !artistId) {
    res.sendStatus(400);
  }

  const insertSql = `INSERT INTO
  Issue (name, issue_number, publication_date, artist_id, series_id)
  VALUES ($name, $issue_number, $publication_date, $artist_id, $series_id)`;
  const insertValues = { 
    $name: name, 
    $issue_number: issueNumber, 
    $publication_date: publicationDate, 
    $artist_id: artistId, 
    $series_id: req.params.seriesId };
  db.run(insertSql, insertValues, function(err) {
    if (err) {
      next(err);
    }
    const newID = this.lastID;
    db.get(`SELECT * FROM Issue WHERE id = $id;`, { $id: newID }, (err, row) => {
      if (err) {
        next(err);
      }
      if (row) {
        res.status(201).json({ issue: row });
      }
    });
  });
});

// PUT

issuesRouter.put('/:issueId', (req, res, next) => {
  const issue = req.body.issue;
  const issueId = req.params.issueId;
  const name = issue.name;
  const issueNumber = issue.issueNumber;
  const publicationDate = issue.publicationDate;
  const artistId = issue.artistId;

  // Check Artist row exists
  db.get('SELECT * FROM Artist WHERE Artist.id = $artistId;', { $artistId: artistId }, (error, artist) => {
    if (error) {
      next(error);
    } else {
      if (!name || !issueNumber || !publicationDate || !artist) {
        return res.sendStatus(400);
      }

      // UPDATE Issue
      const updateSql = `UPDATE Issue SET 
      name = $name, 
      issue_number = $issueNumber, 
      publication_date = $publicationDate, 
      artist_id = $artistId 
      WHERE Issue.id = $issueId;`;
      const updateValues = { 
        $name: name, 
        $issueNumber: issueNumber, 
        $publicationDate: publicationDate, 
        $artistId: artistId,
        $issueId: issueId
      };
      db.run(updateSql, updateValues, function(err) {
        if (err) {
          next(err);
        } else {
          // Return Updated object
          db.get(`SELECT * FROM Issue WHERE id = $id;`, { $id: req.params.issueId }, (err, row) => {
            const issueObj = { issue: row };
            res.status(200).json(issueObj);
          });
        } // End of UPDATE if/else
      });
    } // End of GET if/else
  });
});

// DELETE

issuesRouter.delete('/:issueId', (req, res, next) => {
  const deleteSql = `DELETE FROM Issue WHERE id = $issueId;`;
  db.run(deleteSql, { $issueId: req.params.issueId }, (err) => {
    res.sendStatus(204);
  });
});

module.exports = issuesRouter;
