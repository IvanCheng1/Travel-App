/* Global Variables */
var db = []
const PORT = process.env.PORT || 8080;

if (PORT === '5000') {
    // local
    var baseUrl = 'http://localhost:5000'
} else {
    // heroku
    var baseUrl = 'https://travel-app-weather.herokuapp.com'
}

export const postCity = async() => {
    const url = `${baseUrl}/geo`
    const city = document.getElementById('postCity').value;
    const country = document.getElementById('postCountry').value;

    console.log(url)

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
        console.log("postCity function error", e)
    }
}


export const postWeather = async(city, country, lat, lon, dates) => {
    const url = `${baseUrl}/weather`

    if (dates['daysToEndDate'] > 16 || dates['daysToEndDate'] < 0) {
        // too far away to get forecast, or in the past
        var future = true
    } else {
        var future = false
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
            future: future,
            daysToStartDate: dates['daysToStartDate'],
            startDate: dates['startDate'],
            endDate: dates['endDate'],
            length: dates['length']
        })
    })
    try {
        const res = await response.json()
        return res
    } catch (e) {
        console.log("postWeather function error", e)
    }
}


export const postPicture = async(city, country) => {
    const url = `${baseUrl}/pixabay`

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
        return res['webformatURL']
    } catch (e) {
        console.log("postPicture function error", e)
    }
}


// function to check if button is clicked?
export function clickBtn(btn) {
    btn.addEventListener('click', function(e) {

        if (checkCity()) {
            submit();
        }
    })
}


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
            addDataToDb(data)
        })
        .then(() => {
            clearForm()
            updateUI();
        })
}


// add Data to the page
function addDataToUI() {
    const holder = document.getElementById('entryHolder')
    const local = getLocalStorage()

    // if local Storage is empty, return
    if (!local) {
        return
    }

    // sort by date
    local.sort((a, b) => (a.daysToStartDate > b.daysToStartDate) ? 1 : -1)

    // clear previous HTML
    holder.innerHTML = ''
    for (let i in local) {
        // just need the number to iterate for delete buttons
        // otherwise could have used (let i of local)
        const entry = local[i]

        // if country is empty, just provide city name
        if (entry['country'] === undefined) {
            var location = entry['city']
        } else {
            var location = `${entry['city']}, ${entry['country']}`
        }

        // init weather section
        let weather = ''

        // if trip end date is less than 16 days away, show the weather forecast
        if (entry['daysToEndDate'] >= 0 && entry['daysToEndDate'] <= 16) {
            // show day by day forecast

            // HTML for 'weather breakdown' title
            weather += `
                <h4 style="margin-bottom: 0px">
                    Weather breakdown
                </h4>
            `

            // loop through each day of the holiday weather forecast
            for (let day in entry['weather']) {
                let weatherDay = entry['weather'][day]

                // and append to 'weather' variable
                weather += `
                    <div class="description-day">
                        Day ${parseInt(day)+1}: High: ${weatherDay['max_temp']} Low: ${weatherDay['min_temp']} <br>
                        ${weatherDay['weather']['description']}
                    </div>

                `
            }
        } else {
            // else trip is too far in advance, or in the past - show the current weather forecast
            let weatherDay = entry['weather'][0]

            // current weather HTML title, and weather description 
            weather = `
                <h4 style="margin-bottom: 0px">
                    Current weather
                </h4>
                <div class="description-day">
                    High: ${weatherDay['max_temp']} Low: ${weatherDay['min_temp']} <br>
                    ${weatherDay['weather']['description']}
                </div>

                `
        }

        // append everything to holder HTML
        // unique id - to be used for deletion
        // picture, destination, countdown, length of trip
        // weather information from above
        // delete button
        holder.innerHTML += `
            <div class='holiday' id='${i}'>
                <div class='holiday-picture'><img src=${entry['picture']}></div>
                <div class='description'>
                
                    <h4 class='holiday-destination' style="margin-bottom: 0px">${location}</h4>
                    <div>
                        Departure in ${entry['daysToStartDate']} days on ${entry['startDate']}<br>
                        Length of trip: ${entry['length']} days
                    </div>
                    
                    ${weather}

                </div>
                <div class="delete">
                    <button type="submit"> <span>Remove trip</span></button>
                </div>
            </div>
        `
    }
}


// add data to local variable, then push to local Storage
function addDataToDb(data) {
    let newData = {
        city: data[1],
        country: data[2],
        startDate: data[3]['startDate'],
        daysToStartDate: data[3]['daysToStartDate'],
        daysToEndDate: data[3]['daysToEndDate'],
        weather: data[0],
        picture: data[4],
        length: data[3]['length']
    }

    // push data to db variable
    db.push(newData)

    // push db to localStorage
    postLocalStorage(db)
}


function postLocalStorage(db) {
    localStorage.setItem('db', JSON.stringify(db))
}


function getLocalStorage() {
    return JSON.parse(localStorage.getItem('db'))
}


export const updateUI = async() => {
    // if local storage is null, set db to empty list
    if (getLocalStorage() === null) {
        db = []
    } else {
        // otherwise, get local storage from previous visits
        db = getLocalStorage()
    }
    // set dates on form
    defaultDates()

    // add data to UI
    addDataToUI()

    // add delete btn to each holiday
    deleteBtn()

    // if db is empty, remove "Holidays coming up" for a cleaner look
    emptyDb()
}


function deleteBtn() {
    // get all delete buttons
    const btns = document.getElementsByClassName('delete')

    // loop through all buttons
    for (let btn of btns) {
        // add click listener
        btn.addEventListener('click', e => {
            // since the button has "SPAN", need to find whether "SPAN" was shown or not
            if (e.path[0].tagName === "SPAN") {
                var base = e.path[3]
            } else {
                var base = e.path[2]
            }

            // find the id number of the holiday holder
            let id = base.id

            // find the name of the holiday
            let name = base.children[1].textContent.trim().split('\n')[0]

            if (confirm(`Are you sure you want to delete your holiday to ${name}?`)) {
                // get db from local storage, sort in date order and splice
                db = getLocalStorage()
                db.sort((a, b) => (a.daysToStartDate > b.daysToStartDate) ? 1 : -1)
                db.splice(id, 1)

                // update local storage and UI
                postLocalStorage(db)
                updateUI()
            }
        })
    }
}


// helper func to return date in the form of YYYY-mm-DD
function format(date) {
    return date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2)
}


// set default dates on input form, and update end date when start date is filled
// return none
function defaultDates(startItem = null) {
    // if nothing is passed into function
    // set default values to today and tomorrow's date
    if (!startItem) {
        var start = new Date();
        var end = new Date();

        // update start date to today
        document.getElementById('postStartDate').value = format(start)
    } else {
        // the start item is passed in => update end date value to start date + 1
        // init end var
        var end = new Date(startItem.value);
    }

    // update end date to be 1 day ahead and update form
    end.setDate(end.getDate() + 1)
    document.getElementById('postEndDate').value = format(end)
}


// get date information from input form
// return an object with start/end dates etc
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
        length: length + 1
    }
}


// check if input form for city is empty or not
// return true if exist, false if not
function checkCity() {
    if (document.getElementById('postCity').value === '') {
        alert("Please enter a city")
        return false
    }
    return true
}


function clearForm() {
    document.getElementById('postCity').value = ''
    document.getElementById('postCountry').value = ''
    document.getElementById('postStartDate').value = ''
    document.getElementById('postEndDate').value = ''
}


// function to detect when start date has been inputted
export function detectDate(item) {
    item.addEventListener("input", () => {
        defaultDates(item)
    })
}


// check if db is empty, then hide title
function emptyDb() {
    // grab title
    let title = document.getElementById('HolidaysTitle')

    // if db is empty, remove title
    if (db.length === 0) {
        title.innerText = ''
    } else {
        if (!title.innerText) {
            title.innerText = 'Holidays coming up'
        }
    }
}