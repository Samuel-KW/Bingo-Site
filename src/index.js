
'use strict'

const express = require('express'); 
const config = require('./config.json')
const getCookies = require('./utils/cookie.js');

const PORT = 80;

const app = express(); 


// Serve files in public directory
app.use(express.static('public'));

app.get('/api/v1/config', (request, response) => {
    response.json(config);
});

const hashes = config.cards.map(card => card[2]);

// Handle analytic data from cookies
app.get('/data/', (request, response) => {

    // Get name from request cookie
    const cookies = getCookies(request);
    const codes = [];

    for (const [key] of cookies) {
        if (hashes.includes(key))
            codes.push(key);
    }
    
    console.log(`${cookies.get('name')} has ${codes.length} bingo codes!`);
});

// Listening to server at port 80 
const webServer = app.listen(PORT, () => { 
    console.log(`Web server listening on port:`, PORT); 
});


// Gracefully shutdown servers
process.on('SIGINT', () => {
    console.info('SIGTERM signal received.');

    console.log('Closing HTTP server.');

    webServer.close(() => {
        console.log('HTTP server closed.');
    });
});