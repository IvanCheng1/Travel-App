// Setup empty JS object to act as endpoint for all routes
let projectData = [];

// Require Express to run server and routes
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Start up an instance of app
const app = express();

/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
app.use(cors());

// Initialize the main project folder
app.use(express.static('website'));

// GET route
app.get('/get', (request, response) => {
    response.send(projectData);
    // console.log('get route');
    // console.log(projectData);
});

// POST route
app.post('/post', (request, response) => {
    let newPost = {}
    newPost['temperature'] = request.body.temperature;
    newPost['date'] = request.body.date;
    newPost['content'] = request.body.content;
    newPost['location'] = request.body.location;
    projectData.push(newPost);
    response.send('post received');

    // console.log(newPost);
    // response.send(newPost);
});

// Setup Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => { console.log(`running on localhost:${PORT}`) });
