/* Global Variables */
const key = 'bec924968d3229ad57b29bcfa721be83&units=imperial';
const baseUrl = 'api.openweathermap.org/data/2.5/weather?';
var fakeDb = [{
    city: "York",
    country: "England",
    daysToStartDate: 0,
    max_temp: 24.3,
    min_temp: 13.3,
    startDate: "2020-06-23",
    picture: "https://pixabay.com/get/57e8d6454e53a914f1dc84609629307f123bd6ec5b4c704c7c2d72d4944ac15b_640.jpg"
}]

var db = []

// Create a new date instance dynamically with JS
let d = new Date();
let newDate = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes();

function convertFtoC(F) {
    return (F - 32) * 5 / 9
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
        const res = await response.json()
        const targetCity = res['geonames'][0]
        if (targetCity) {
            return targetCity
        }
        throw new Error("City not found")
    } catch (e) {
        alert('City not found')
        console.log(e)
    }
}


// function to check if button is clicked?
export function clickBtn(btn) {
    btn.addEventListener('click', function(e) {

        if (checkCity()) {
            submit();
        }

        // updateUI();
    })
}


export const postWeather = async(city, country, lat, lon, dates) => {
    const url = `http://localhost:5000/weather`

    if (dates['daysToEndDate'] > 16) {
        // use historic weather forecast
        var historic = true
        console.log('using historic weather forecast')
    } else {
        var historic = false
        console.log('using weather forecast')
    }

    const response = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            city: city,
            country: country,
            lat: lat,
            lon: lon,
            historic: historic,
            daysToStartDate: dates['daysToStartDate'],
            startDate: dates['startDate'],
            endDate: dates['endDate']
        })
    })
    try {
        const res = await response.json()
            // console.log(res)
        return res
    } catch (e) {
        // alert('City not found')
        console.log(e)
    }
}


export const postPicture = async(city, country) => {
    const url = `http://localhost:5000/pixabay`

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
        const res = await response.json()
        console.log("pic", res['webformatURL'])
            // const targetCity = res['postalCodes'][0]
        return res['webformatURL']
    } catch (e) {
        // alert('City not found')
        console.log(e)
    }
}



// function to submit when return is pressed
// export function returnSubmit(box) {
//     box.addEventListener("keydown", function(e) {
//         Enter is pressed
//         if (e.keyCode == 13) { submit(); }
//     });
// }


// function to get data from page and submit
async function submit() {



    await postCity()
        .then((targetCity) => {
            const city = targetCity['name']
            const country = targetCity['countryName']
            const lat = targetCity['lat']
            const lon = targetCity['lng']
            const dates = getDates()

            const weather = postWeather(city, country, lat, lon, dates)
            const picture = postPicture(city, country)

            const all = Promise.all([weather, city, country, dates, picture]).then((values) => {
                return values
            })
            return all
        })
        .then((data) => {
            // console.log('weather', weatherData)
            addDataToDb(data)
                // console.log(db)
                // addDataToUI(weatherData)
            addDataToUI()
        })
        .then(() => {
            updateUI();
        })

}

function addDataToUI() {
    const holder = document.getElementById('entryHolder')

    db.sort((a, b) => (a.daysToStartDate > b.daysToStartDate) ? 1 : -1)
    console.log(db)

    holder.innerHTML = ''
    for (let i of db) {
        holder.innerHTML += `
            <div class='holiday'>
            <div class='holiday-picture'><img src=${i['picture']}></div>
                <h4>${i['city']}, ${i['country']}</h4>
                <h4>max temp: ${i['max_temp']}
                </h4>
                <h4>start date: ${i['startDate']}
                </h4>
            </div>
        `
    }
}

function addDataToDb(data) {
    console.log("addDataToDb", data)

    let newData = {
        city: data[1],
        country: data[2],
        startDate: data[3]['startDate'],
        daysToStartDate: data[3]['daysToStartDate'],
        max_temp: data[0]['max_temp'],
        min_temp: data[0]['min_temp'],
        picture: data[4]
    }

    db.push(newData)
}


export const updateUI = async() => {
    defaultDates()

    // temp
    addDataToUI()

    // let targetCity = await postCity()
    // const city = targetCity['placeName']
    // const country = targetCity['adminName1']
    // const lat = targetCity['lat']
    // const lng = targetCity['lng']

    // console.log(city, country, lat, lng)
    // document.getElementById('city').innerText = rCity
    // document.getElementById(`country`).innerText = rCountry
    // document.getElementById(`content`).innerText = ''
    // document.getElementById(`temp`).innerText = ''

}

function defaultDates() {
    let today = new Date();
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1)

    function format(date) {
        return date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2)
    }

    document.getElementById('postStartDate').value = format(today)
    document.getElementById('postEndDate').value = format(tomorrow)
}

function getDates() {
    const startDate = document.getElementById('postStartDate').value;
    const endDate = document.getElementById('postEndDate').value;

    const timeToStartDate = (new Date(startDate)).getTime() - (new Date()).getTime()
    const timeDif = (new Date(endDate)).getTime() - (new Date(startDate)).getTime()

    const daysToStartDate = (timeToStartDate / (1000 * 3600 * 24)) + 1
    const length = timeDif / (1000 * 3600 * 24)

    return {
        startDate: startDate,
        endDate: endDate,
        daysToStartDate: Math.trunc(daysToStartDate),
        daysToEndDate: Math.trunc(daysToStartDate) + length,
        length: length
    }
}


function checkCity() {
    if (document.getElementById('postCity').value === '') {
        alert("Please enter a city")
        return false
    }
    return true
}