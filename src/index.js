'use strict'

const express = require('express'); 
const compression = require('compression');
const { Sequelize, Model, DataTypes, QueryTypes } = require('sequelize');

const config = require('./config.json')
const getCookies = require('./utils/cookie.js');
const PORT = process.env.PORT || 80;


// Get array of hashes from config file
const hashes = config.cards.map(card => card[3]);

// Create Sequelize instance
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage:  '/var/data/database.sqlite',
    logging: false
});

// Setup database configuration
const dbConfig = { name: DataTypes.STRING };
for (const hash of hashes)
    dbConfig[hash] = DataTypes.BOOLEAN;

// Define User model
class Logs extends Model { }
Logs.init(dbConfig, { sequelize, modelName: String(config.version)});

// Sync models with database
sequelize.sync();


// Setup express server
const app = express(); 
app.use(compression());

// Serve files in public directory
app.use(express.static('public'));

// Remove password from config file
const safeConfig = config.cards.map(e => e.slice(1));

app.get('/api/v1/config', (request, response) => {
    response.json(safeConfig);
});

app.get('/data/logs/', async (request, response) => {

    // Get logs with user codes
    const users = await Logs.findAll({
        attributes: ['name', 'updatedAt', ...hashes],
        where: { name: { [Sequelize.Op.not]: null } }
    });

    // Optimize results into [ name, hash1, hash2, ...], [ USER, 0, 1, ...]
    const resp = [ ["User", ...hashes] ];
    for (const user of users) {
        const row = [ user.name, user.updatedAt ];

        for (const hash of hashes)
            row.push(user[hash] ? 1 : 0);

        resp.push(row);
    }

    response.json(resp);
});

app.get('/data/logs/:user', async (request, response) => {
    const user = request.params.user;
    const resp = await Logs.findAll({
        where: { name: user },
        order: [['createdAt', 'DESC']],
        limit: 10
    });

    response.json(resp);
});

// Handle analytic data from cookies
app.get('/data/', async (request, response) => {

    // Get name from request cookie
    const cookies = getCookies(request);
    const codes = [];

    for (const [key] of cookies) {
        if (hashes.includes(key))
            codes.push(key);
    }
    
    const name = cookies.get('name');
    console.log(name, 'has finished', codes.length, 'bingo squares.');

    const data = { name };

    for (const code of codes)
        data[code] = true;

    const log = await Logs.create(data);
    response.json(log);
});

// Listening to server at port 80 
const webServer = app.listen(PORT, () => { 
    console.log(`Web server listening on port:`, PORT); 
});


// Gracefully shutdown servers
process.on('SIGINT', () => {
    console.info('SIGTERM signal received.');

    console.log('Closing HTTP server...');

    webServer.close(() => {
        console.log('HTTP server closed.');

        console.log('Closing the database connection...');
        sequelize.close((err) => {
            if (err)
                return console.error(err.message);

            console.log('Closed the database connection.');
        });
    });
});