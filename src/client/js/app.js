/* Global Variables */
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
        console.log("postCity function error", e)
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
        return res['webformatURL']
    } catch (e) {
        console.log("postPicture function error", e)
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
            addDataToDb(data)
        })
        .then(() => {
            clearForm()
            updateUI();
        })

}

function addDataToUI() {
    const holder = document.getElementById('entryHolder')
    const local = getLocalStorage()

    // if local Storage is empty, return
    if (!local) {
        return
    }

    // sort 
    local.sort((a, b) => (a.daysToStartDate > b.daysToStartDate) ? 1 : -1)

    holder.innerHTML = ''
    for (let i in local) {
        // just need the number to iterate for delete buttons
        // otherwise could have used (let i of local)
        const entry = local[i]

        if (entry['country'] === undefined) {
            var location = entry['city']
        } else {
            var location = `${entry['city']}, ${entry['country']}`
        }

        // const days = entry['daysToStartDate']

        let weather = ''

        if (entry['daysToEndDate'] >= 0 && entry['daysToEndDate'] <= 16) {
            // show day by day forecast

            weather += `
                <h4 style="margin-bottom: 0px">
                    Weather breakdown
                </h4>
            `

            for (let day in entry['weather']) {
                let weatherDay = entry['weather'][day]
                    // console.log(weatherDay['weather']['description'])

                weather += `
                    <div class="description-day">
                        Day ${parseInt(day)+1}: High: ${weatherDay['max_temp']} Low: ${weatherDay['min_temp']} <br>
                        ${weatherDay['weather']['description']}
                    </div>

                `
            }
        } else {
            // show today forecast
            let weatherDay = entry['weather'][0]

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


// add data to 
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
        // let test = getLocalStorage()
        // console.log(test)
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
            // console.log(e.path[2].id)
            if (e.path[0].tagName === "SPAN") {
                var base = e.path[3]
            } else {
                var base = e.path[2]
            }

            // find the id number of the holiday holder
            let id = base.id

            // find the name of the holiday
            // console.log(e.path[3].children[1].textContent)
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
export function defaultDates(startItem = null) {
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

export function detectDate(item) {
    item.addEventListener("input", () => {
        defaultDates(item)
    })
}


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