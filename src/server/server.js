const dotenv = require('dotenv')
dotenv.config()

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
const API_WEATHERBIT = process.env.WEATHERBIT_APIKEY


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

// POST route for geonames API
app.post('/geo', async(request, response) => {
    const fullGeo = `http://api.geonames.org/postalCodeSearchJSON?placename=${request.body.city}&country=${request.body.country}&username=${API_GEO}&maxRows=1`
    const results = await fetch(fullGeo)
    try {
        const result = await results.json()
        response.send(result)
    } catch (error) {
        console.log(error)
    }
});


// POST route for weatherbit API
app.post('/weather', async(request, response) => {
    if (request.body.historic) {
        // use historic weather forecast
        console.log('using historic weather forecast')
        var baseUrl = 'https://api.weatherbit.io/v2.0/history/daily?'
        var startDate = `&start_date=${request.body.startDate}`
        var endDate = `&end_date=${request.body.endDate}`

    } else {
        var i = request.body.daysToStartDate
        var baseUrl = 'https://api.weatherbit.io/v2.0/forecast/daily?'
        var startDate = ''
        var endDate = ''
    }

    const lat = request.body.lat
    const lon = request.body.lon
    const fullUrl = `${baseUrl}lat=${lat}&lon=${lon}&key=${API_WEATHERBIT}${startDate}${endDate}`
    console.log(fullUrl)
    const results = await fetch(fullUrl)

    try {
        const result = await results.json()
        console.log(result['data'][i])
        response.send(result['data'][i])
    } catch (error) {
        console.log(error)
    }
});


// Setup Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => { console.log(`running on localhost:${PORT}`) });