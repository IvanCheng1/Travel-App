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
const API_PIXABAY = process.env.PIXABAY_APIKEY


// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '.../dist/index.html')
//     console.log('get root')
// })


// POST route for geonames API
app.post('/geo', async(request, response) => {
    const fullGeo = `http://api.geonames.org/searchJSON?q=${request.body.city}&country=${request.body.country}&username=${API_GEO}&maxRows=1`

    const results = await fetch(fullGeo)
    try {
        const result = await results.json()
            // console.log(result)
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
        // console.log(fullUrl)
    const results = await fetch(fullUrl)

    try {
        const result = await results.json()
            // console.log(result['data'][i])
        response.send(result['data'][i])
    } catch (error) {
        console.log(error)
    }
});

app.post('/pixabay', async(request, response) => {

    let city = request.body.city
    let country = request.body.country

    if (city) { city = city.replace(' ', '+') }
    if (country) { country = country.replace(' ', '+') }

    cityPicture: try {
        const fullUrl = `https://pixabay.com/api/?key=${API_PIXABAY}&q=${city}+${country}&image_type=photo&category=places`
        const results = await fetch(encodeURI(fullUrl))
        const result = await results.json()

        for (picture of result['hits']) {
            // ensure it's landscape
            if (picture['webformatWidth'] > picture['webformatHeight']) {
                response.send(picture)

                // picture found, break 'try'
                break cityPicture
            }
        }

        // no pictures from pixabay of the city
        // fetch generic country photo
        const newUrl = `https://pixabay.com/api/?key=${API_PIXABAY}&q=holiday+${country}&image_type=photo&category=places`
        const newResults = await fetch(encodeURI(newUrl))
        const newResult = await newResults.json()

        for (picture of newResult['hits']) {
            if (picture['webformatWidth'] > picture['webformatHeight']) {
                response.send(picture)
                break cityPicture
            }
        }

        // no response at all
        // return generic holiday picture
        response.send({ "webformatURL": "https://pixabay.com/get/57e7d0424e57a914f1dc84609629307f123bd6ec5b4c704c7c2d72d59748c65f_640.jpg" })

    } catch (error) {
        console.log(error)
    }
});


// Setup Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => { console.log(`running on localhost:${PORT}`) });