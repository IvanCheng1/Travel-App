# Travel App

A Travel App that allows you to log your future holidays, and display weather and image of the location from external APIs. Final project for Udacity's Front End Developer Programme. 

Hosted at [Heroku](https://travel-app-weather.herokuapp.com/)

## Overview
This project involved:
- Setting up Webpack
- Sass styles
- Webpack Loaders and Plugins
- Creating layouts and page design
- Service workers
- Using APIs and creating requests to external urls

## Usage

Enter the city destination, and optionally the country code to clarify the specific city. Enter the start and end date of the trip and click submit. 

It will then display the holiday with a picture of the destination, countdown, and the weather forecast, if the holiday is within a week or so. If the holiday is far in the future, it will display the current weather.


## Instructions
1. Clone the repo or download all the files
2. Assuming you have Node.js installed, navigate to the project folder and install all the dependencies by `npm install`

#### Development mode 
3. Run the server by `npm run build-dev`
4. The local server is hosted on http://localhost:8080/

#### Development mode 
3. Generate the dist files by `npm run build-prod`
3. Run the server by `npm run start`
4. The local server is hosted on http://localhost:5000/

#### APIs 
Please sign up and register for API keys using the links below
- [Geonames API](http://www.geonames.org/export/web-services.html)
- [Weatherbit API](https://www.weatherbit.io/api)
- [Pixabay API](https://pixabay.com/api/docs/)

Then, create a new ```.env``` file in the root of the project
3. Fill the .env file with your API keys like this:
```
GEONAMES_USERNAME=*****************************
WEATHERBIT_APIKEY=*****************************
PIXABAY_APIKEY=*****************************
```
