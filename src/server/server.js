// const dotenv = require('dotenv')
// dotenv.config()

// Require Express to run server and routes
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require("node-fetch");

// Start up an instance of app
const app = express();

/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
app.use(cors());

// Initialize the main project folder
app.use(express.static('dist'))

console.log(__dirname)


// keys
const API_GEO = process.env.GEONAMES_USERNAME


app.get('/', function(req, res) {
    res.sendFile(__dirname + '.../dist/index.html')
    console.log('get root')
})

// GET route
app.get('/get', (request, response) => {
    // response.send(projectData);
    // response.sendFile('dist/index.html')
    console.log("here")
});

// POST route
app.post('/geo', async(request, response) => {

    // console.log(request.body)
    const fullGeo = `http://api.geonames.org/postalCodeSearchJSON?placename=${request.body.city}&country=${request.body.country}&username=${API_GEO}&maxRows=1`

    // console.log(fullGeo)
    const results = await fetch(fullGeo)

    try {
        const result = await results.json()

        // console.log(result) 
        response.send(result)
    } catch (error) {
        console.log(error)
    }

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
});

// Setup Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => { console.log(`running on localhost:${PORT}`) });