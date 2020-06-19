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


// function to check if button is clicked?
export function clickBtn(btn) {
    btn.addEventListener('click', function(e) {
        submit();
    })
}

// function to submit when return is pressed
export function returnSubmit(box) {
    box.addEventListener("keydown", function(e) {
        // Enter is pressed
        if (e.keyCode == 13) { submit(); }
    });
}


// function to check if input is empty
function checkInput(city, feelings) {
    if (city === '' && feelings === '') {
        window.alert("Please enter a City and your feelings today");
        return false;
    } else if (city === '') {
        window.alert("Please enter a City");
        return false;
    } else if (feelings === '') {
        window.alert("Please enter your feelings today");
        return false;
    }
    return true;
}


// function to get data from page and submit
function submit() {
    const city = document.getElementById('city').value;
    const feelings = document.getElementById('feelings').value;

    if (!checkInput(city, feelings)) {
        return
    }

    weatherData = getWeather(baseUrl, key, city)
        .then((weatherData) => {
            const temperature = Math.round(convertFtoC(weatherData.main.temp)).toString() + "C";
            postWeather('/post', { temperature, newDate, feelings, city })
        })
        .then(() => {
            updateUI();
        })
}


// update UI function
// fetches previous weather data and update UI with latest journal / weather
export const updateUI = async() => {
    const request = await fetch('/get');

    try {
        const data = await request.json();
        let latest = data.length;

        for (let i = data.length; i >= 0; i--) {
            for (let j = 1; j <= 5; j++) {
                if (i === latest - j) {
                    document.getElementById(`date${j}`).innerText = '\nDate: ' + data[i]['date'];
                    document.getElementById(`temp${j}`).innerText = 'Temperature: ' + data[i]['temperature'];
                    document.getElementById(`content${j}`).innerText = data[i]['content'];
                    document.getElementById(`location${j}`).innerText = 'Location: ' + data[i]['location'];
                }
            }
        }
    } catch (error) {
        console.log("updateUI error", error);
    }
    // clear text boxes
    document.getElementById('city').value = '';
    document.getElementById('feelings').value = '';
}


// main function once DOM is loaded
// document.addEventListener('DOMContentLoaded', () => {
//     const generateBtn = document.getElementById('generate');
//     const feelingsBox = document.getElementById("feelings");

//     updateUI();
//     clickBtn(generateBtn);
//     returnSubmit(feelingsBox);
// })