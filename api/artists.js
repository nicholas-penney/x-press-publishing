const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const artistsRouter = express.Router();

module.exports = artistsRouter;

// param

artistsRouter.param('id', (req, res, next, id) => {
    db.get('SELECT * FROM Artist WHERE Artist.id = $id;', { $id: id }, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            req.artist = row;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

// GET

artistsRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE is_currently_employed = 1;', (err, rows) => {
        if (err) {
            next(err); 
        } else {
            const data = { artists: rows };
            res.status(200).json(data);
        }
    });
});

artistsRouter.get('/:id', (req, res, next) => {
    const artistObj = { artist: req.artist };
    res.status(200).json(artistObj);
});

// POST

artistsRouter.post('/', (req, res, err) => {
    const artist = req.body.artist;
    const name = artist.name;
    const dateOfBirth = artist.dateOfBirth;
    const biography = artist.biography;

    if (!name || !dateOfBirth || !biography) {
        res.status(400).send();
    }
    if (!artist.is_currently_employed) {
        artist.is_currently_employed = 1;
    }

    const insertSql = `INSERT INTO Artist (
    name, 
    date_of_birth, 
    biography, 
    is_currently_employed) VALUES (
    $name, 
    $dateOfBirth, 
    $biography, 
    $is_currently_employed);`;
    const insertValues = {
        $name: name, 
        $dateOfBirth: dateOfBirth, 
        $biography: biography, 
        $is_currently_employed: artist.is_currently_employed
    };
    db.run(insertSql, insertValues, function(err) {
        if (err) {
            next(err);
        } else {
            const newId = this.lastID;
            db.get(`SELECT * FROM Artist WHERE id = ${newId};`, (err, row) => {
                const newArtist = { artist: row };
                res.status(201).json(newArtist);
            });
        }  
    });
});

// PUT

artistsRouter.put('/:id', (req, res, next) => {
    
    // Request values
    const id = req.params.id;
    const artist = req.body.artist;
    const name = artist.name;
    const date_of_birth = artist.dateOfBirth;
    const biography = artist.biography;
    var is_currently_employed = artist.is_currently_employed;
    
    // Missing info
    if (!name || !date_of_birth || !biography) {
        return res.sendStatus(400);
    }

    // Default set
    if (!is_currently_employed) {
        is_currently_employed = 1;
    }

    // Update database
    const updateSql = `UPDATE Artist SET 
    name = $name,
    date_of_birth = $date_of_birth,
    biography = $biography,
    is_currently_employed = $is_currently_employed 
    WHERE Artist.id = $id;`;
    const updateValues = {
        $name: name,
        $date_of_birth: date_of_birth,
        $biography: biography,
        $is_currently_employed: is_currently_employed,
        $id: id
    };
    db.run(updateSql, updateValues, (err) => {
        if (err) {
            next(err);
        } else {
            // Return updated row from database
            db.get('SELECT * FROM Artist WHERE Artist.id = $id;', { $id: id }, (err, row) => {
                const artistObj = { artist: row };
                res.status(200).json(artistObj);
            });
        }
    });
});

// DELETE

artistsRouter.delete('/:id', (req, res, next) => {
    const id = req.params.id;

    const updateSql = `UPDATE Artist SET 
    is_currently_employed = 0 
    WHERE Artist.id = $id;`;

    db.run(updateSql, { $id: id }, (err) => {
        if (err) {
            next(err);
        } else {
            db.get('SELECT * FROM Artist WHERE Artist.id = $id;', { $id: id }, (err, row) => {
                const artistObj = { artist: row };
                res.status(200).json(artistObj);
            });
        } // End of if/else
    });
});