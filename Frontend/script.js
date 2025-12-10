 // 🌍 Auto Detect Location on Page Load
window.addEventListener("load", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;

            console.log("Your location:", lat, lon);

            // Fetch weather using lat & lon
            getWeatherByCoords(lat, lon);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});


// 🔍 Weather by City Search
document.getElementById("Search").addEventListener("click", async () => {
    let city = document.getElementById("city").value.trim();

    if (!city) {
        alert("Enter city name");
        return;
    }

    getWeatherByCity(city);
});



// --------------------------------------------
// 🌦 FUNCTIONS
// --------------------------------------------

// ✔ Get Weather by City Name
async function getWeatherByCity(city) {
    try {
        let response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=4cd901f667dbd1d3fc3792b0f764a584&units=metric`
        );

        if (!response.ok) {
            alert("City not found");
            return;
        }

        let data = await response.json();
        updateUI(data);

    } catch (error) {
        console.error("Error fetching weather:", error);
    }
}



// ✔ Get Weather using Latitude + Longitude
async function getWeatherByCoords(lat, lon) {
    try {
        let response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=4cd901f667dbd1d3fc3792b0f764a584&units=metric`
        );

        let data = await response.json();
        updateUI(data);

    } catch (error) {
        console.error("Error fetching weather:", error);
    }
}



// --------------------------------------------
// 🎨 Update UI (Common Function)
// --------------------------------------------

function updateUI(data) {

    let location = data.name;
    let humidity = data.main.humidity;
    let feelslike = Math.round(data.main.feels_like);
    let temp = Math.round(data.main.temp);
    let wind = data.wind.speed;
    let precip = data.rain ? data.rain["1h"] : 0;

    // ✔ Update Values
    document.getElementById("location").innerHTML = location;
    document.getElementById("Feelslike").innerHTML = feelslike + "°";
    document.getElementById("Humidity").innerHTML = humidity + "%";
    document.getElementById("temp").innerHTML = temp + "°";
    document.getElementById("Wind").innerHTML = wind + " km/h";
    document.getElementById("Precipitation").innerHTML = precip + " mm";

    // Daily & hourly dummy values (you can replace later)
    document.getElementById("windchill").innerHTML = feelslike + "°";
    document.getElementById("windchill_c").innerHTML = feelslike + "°";
    document.getElementById("tempf").innerHTML = temp + "°";
    document.getElementById("temp-l").innerHTML = temp + "°";
    document.getElementById("mon").innerHTML = wind + "°";
    document.getElementById("Monday").innerHTML = wind + "°";
    document.getElementById("tue").innerHTML = humidity + "°";
    document.getElementById("te").innerHTML = temp + "°";
    document.getElementById("Wednes").innerHTML = feelslike + "°";
    document.getElementById("Wed").innerHTML = wind + "°";
    document.getElementById("fr").innerHTML = temp + "°";
    document.getElementById("fri").innerHTML = temp + "°";
    document.getElementById("sa").innerHTML = feelslike + "°";
    document.getElementById("sat").innerHTML = wind + "°";

    // Hourly
    document.getElementById("3pm").innerHTML = temp + "°";
    document.getElementById("4pm").innerHTML = temp + "°";
    document.getElementById("5pm").innerHTML = temp + "°";
    document.getElementById("6pm").innerHTML = wind + "°";
    document.getElementById("7pm").innerHTML = feelslike + "°";
    document.getElementById("8pm").innerHTML = wind + "°";
    document.getElementById("9pm").innerHTML = feelslike + "°";
    document.getElementById("10pm").innerHTML = humidity + "°";

    // ✔ Correct Date
    let now = new Date();
    let fullDate = now.toDateString();  // Example: "Mon Nov 28 2025"
    document.getElementById("dats").innerHTML = fullDate;
}
