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
    let country = data.sys?.country || '';
    let humidity = data.main.humidity;
    let feelslike = Math.round(data.main.feels_like);
    let temp = Math.round(data.main.temp);
    let wind = data.wind.speed;
    let precip = data.rain ? data.rain["1h"] : (data.snow ? data.snow["1h"] : 0);
    let weatherMain = data.weather[0].main.toLowerCase();
    let weatherIcon = data.weather[0].icon;

    // Format location with country
    let locationText = country ? `${location}, ${country}` : location;
    document.getElementById("location").innerHTML = locationText;

    // Update main values
    document.getElementById("Feelslike").innerHTML = feelslike + "°";
    document.getElementById("Humidity").innerHTML = humidity + "%";
    document.getElementById("temp").innerHTML = temp + "°";
    
    // Convert wind speed from m/s to mph (1 m/s = 2.237 mph)
    let windMph = Math.round(wind * 2.237);
    document.getElementById("Wind").innerHTML = windMph + " mph";
    
    // Convert precipitation from mm to inches (1 mm = 0.0393701 inches)
    let precipInches = (precip * 0.0393701).toFixed(1);
    document.getElementById("Precipitation").innerHTML = precipInches + " in";

    // Update weather icon based on condition
    updateWeatherIcon(weatherMain, weatherIcon);

    // Hourly forecast (using current temp as placeholder)
    document.getElementById("3pm").innerHTML = temp + "°";
    document.getElementById("4pm").innerHTML = temp + "°";
    document.getElementById("5pm").innerHTML = temp + "°";
    document.getElementById("6pm").innerHTML = (temp - 2) + "°";
    document.getElementById("7pm").innerHTML = (temp - 2) + "°";
    document.getElementById("8pm").innerHTML = (temp - 4) + "°";
    document.getElementById("9pm").innerHTML = (temp - 5) + "°";
    document.getElementById("10pm").innerHTML = (temp - 5) + "°";

    // Format date like "Tuesday, Aug 5, 2025"
    let now = new Date();
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let dayName = days[now.getDay()];
    let monthName = months[now.getMonth()];
    let day = now.getDate();
    let year = now.getFullYear();
    let formattedDate = `${dayName}, ${monthName} ${day}, ${year}`;
    document.getElementById("dats").innerHTML = formattedDate;
}

// Function to update weather icon based on condition
function updateWeatherIcon(weatherMain, weatherIcon) {
    const iconMap = {
        'clear': '../Icons/icon-sunny.webp',
        'clouds': '../Icons/icon-overcast.webp',
        'rain': '../Icons/icon-rain.webp',
        'drizzle': '../Icons/icon-drizzle.webp',
        'thunderstorm': '../Icons/icon-storm.webp',
        'snow': '../Icons/icon-snow.webp',
        'mist': '../Icons/icon-fog.webp',
        'fog': '../Icons/icon-fog.webp',
        'haze': '../Icons/icon-fog.webp'
    };

    // Check for partly cloudy
    let iconPath;
    if (weatherIcon.includes('02')) {
        iconPath = '../Icons/icon-partly-cloudy.webp';
    } else {
        iconPath = iconMap[weatherMain] || '../Icons/icon-sunny.webp';
    }

    const iconElement = document.getElementById("weather-icon-main");
    if (iconElement) {
        iconElement.src = iconPath;
    }
}
