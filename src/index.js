
'use strict'

const express = require('express'); 
const PORT = 80;

const app = express(); 


// Serve files in public directory
app.use(express.static('public'));

app.get('/api/v1/config', (request, response) => {
    response.sendFile(__dirname + '/config.json');
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