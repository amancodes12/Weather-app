// 🌍 Auto Detect Location on Page Load
window.addEventListener("load", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherByCoords(lat, lon);
            },
            () => {
                alert("Location permission denied");
            }
        );
    } else {
        alert("Geolocation not supported");
    }
});


// 🔍 Weather by City Search
document.getElementById("Search").addEventListener("click", () => {
    const city = document.getElementById("city").value.trim();
    if (!city) {
        alert("Enter city name");
        return;
    }
    getWeatherByCity(city);
});


// --------------------------------------------
// 🌦 API CALLS (BACKEND ONLY)
// --------------------------------------------

async function getWeatherByCity(city) {
    try {
        const response = await fetch(
            `http://127.0.0.1:5000/weather/city?city=${city}`
        );

        if (!response.ok) {
            alert("City not found");
            return;
        }

        const data = await response.json();
        updateUI(data);

    } catch (error) {
        console.error("Error fetching city weather:", error);
    }
}

async function getWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(
            `http://127.0.0.1:5000/weather/coords?lat=${lat}&lon=${lon}`
        );

        const data = await response.json();
        updateUI(data);

    } catch (error) {
        console.error("Error fetching location weather:", error);
    }
}


// --------------------------------------------
// 🎨 UPDATE UI
// --------------------------------------------

function updateUI(data) {

    const location = data.name;
    const humidity = data.main.humidity;
    const feelslike = Math.round(data.main.feels_like);
    const temp = Math.round(data.main.temp);
    const wind = data.wind.speed;
    const precip = data.rain ? data.rain["1h"] : 0;

    document.getElementById("location").innerHTML = location;
    document.getElementById("Feelslike").innerHTML = feelslike + "°";
    document.getElementById("Humidity").innerHTML = humidity + "%";
    document.getElementById("temp").innerHTML = temp + "°";
    document.getElementById("Wind").innerHTML = wind + " km/h";
    document.getElementById("Precipitation").innerHTML = precip + " mm";

    // Dummy values (replace later with forecast API)
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

    // Hourly placeholders
    document.getElementById("3pm").innerHTML = temp + "°";
    document.getElementById("4pm").innerHTML = temp + "°";
    document.getElementById("5pm").innerHTML = temp + "°";
    document.getElementById("6pm").innerHTML = wind + "°";
    document.getElementById("7pm").innerHTML = feelslike + "°";
    document.getElementById("8pm").innerHTML = wind + "°";
    document.getElementById("9pm").innerHTML = feelslike + "°";
    document.getElementById("10pm").innerHTML = humidity + "°";

    // Date
    const now = new Date();
    document.getElementById("dats").innerHTML = now.toDateString();
}
