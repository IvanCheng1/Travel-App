import { ContextReplacementPlugin } from "webpack";

/* Global Variables */
const key = 'bec924968d3229ad57b29bcfa721be83&units=imperial';
const baseUrl = 'api.openweathermap.org/data/2.5/weather?';

// Create a new date instance dynamically with JS
let d = new Date();
let newDate = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes();

function convertFtoC(F) {
    return (F - 32) * 5 / 9
}

// get weather function
// returns json weather data from open weather map
const getWeather = async(baseUrl, key, city) => {

    // let url = `http://api.geonames.org/searchJSON?q=${city}&username=ivancheng`
    // const req = await fetch(url);

    // const d = await req.json();
    // alert('here')
    // console.log(d)

    let fullUrl = `https://${baseUrl}q=${city}&appid=${key}`;
    const request = await fetch(fullUrl);
    if (request.status === 404) {
        window.alert("City not found");
        return
    }

    try {
        const data = await request.json();
        return data;
    } catch (error) {
        console.log("getWeather error:", error);
    }
}

// post weather function
// returns none
const postWeather = async(url, data) => {
    await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            date: data['newDate'],
            temperature: data['temperature'],
            content: data['feelings'],
            location: data['city']
        })
    })
}


export const postCity = async() => {
    const url = `http://localhost:5000/geo`
    const city = document.getElementById('postCity').value;
    const country = document.getElementById('postCountry').value;

    const response = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            city: city,
            country: country
        })
    })
    try {
        const targetCity = await response.json()
        const returnCity = targetCity['postalCodes'][0]['placeName']
        const returnCountry = targetCity['postalCodes'][0]['adminName1']

        console.log('postCity function', returnCity, returnCountry)

        return [returnCity, returnCountry]
    } catch (e) {
        alert('City not found')
        console.log(e)
    }
}


// function to check if button is clicked?
export function clickBtn(btn) {
    btn.addEventListener('click', function(e) {
        // submit();
        postCity()
        updateUI();
    })
}

// function to submit when return is pressed
export function returnSubmit(box) {
    box.addEventListener("keydown", function(e) {
        // Enter is pressed
        if (e.keyCode == 13) { submit(); }
    });
}


// function to get data from page and submit
function submit() {
    const city = document.getElementById('city').value;

    getWeather(baseUrl, key, city)
        .then((weatherData) => {
            const temperature = Math.round(convertFtoC(weatherData.main.temp)).toString() + "C";
            postWeather('/post', { temperature, newDate, feelings, city })
        })
        .then(() => {
            updateUI();
        })
}


export const updateUI = async() => {
    // let [rCity, rCountry] = await postCity()
    // console.log('city:', rCity, rCountry)
    // document.getElementById('city').innerText = rCity
    // document.getElementById(`country`).innerText = rCountry
    document.getElementById(`content`).innerText = ''
        // document.getElementById(`temp`).innerText = ''

}