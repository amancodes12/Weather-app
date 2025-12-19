// Basic weather dashboard logic using OpenWeatherMap current + forecast APIs

const API_KEY = "4cd901f667dbd1d3fc3792b0f764a584"; // consider moving to env/server in a real app

let currentUnits = "metric"; // "metric" or "imperial"
let lastCoords = null; // { lat, lon }

const elements = {
  location: document.getElementById("location"),
  date: document.getElementById("date"),
  temperature: document.getElementById("temperature"),
  weatherIcon: document.getElementById("weather-icon"),
  feelsLike: document.getElementById("feels-like"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind"),
  precipitation: document.getElementById("precipitation"),
  dailyForecast: document.getElementById("daily-forecast"),
  hourlyList: document.getElementById("hourly-list"),
  daySelect: document.getElementById("day-select"),
  unitsToggle: document.getElementById("units-toggle"),
  unitsLabel: document.getElementById("units-label"),
  cityInput: document.getElementById("city-input"),
  searchBtn: document.getElementById("search-btn"),
};

// Helpers
function formatTemp(value) {
  const unit = currentUnits === "metric" ? "°C" : "°F";
  return `${Math.round(value)}${unit}`;
}

function formatWind(value) {
  // API returns m/s for metric, miles/hour for imperial
  if (currentUnits === "metric") {
    const kmh = value * 3.6;
    return `${Math.round(kmh)} km/h`;
  }
  return `${Math.round(value)} mph`;
}

function getIconPathFromWeather(main) {
  const mapping = {
    Thunderstorm: "icon-storm.webp",
    Drizzle: "icon-drizzle.webp",
    Rain: "icon-rain.webp",
    Snow: "icon-snow.webp",
    Mist: "icon-fog.webp",
    Smoke: "icon-fog.webp",
    Haze: "icon-fog.webp",
    Dust: "icon-fog.webp",
    Fog: "icon-fog.webp",
    Sand: "icon-fog.webp",
    Ash: "icon-fog.webp",
    Squall: "icon-storm.webp",
    Tornado: "icon-storm.webp",
    Clear: "icon-sunny.webp",
    Clouds: "icon-overcast.webp",
  };
  const file = mapping[main] || "icon-partly-cloudy.webp";
  return `../Icons/${file}`;
}

function formatDate(ts, timezoneOffsetSeconds) {
  const local = new Date((ts + timezoneOffsetSeconds) * 1000);
  const options = { weekday: "long", month: "long", day: "numeric", year: "numeric" };
  return local.toLocaleDateString(undefined, options);
}

function getDayName(ts, timezoneOffsetSeconds) {
  const local = new Date((ts + timezoneOffsetSeconds) * 1000);
  return local.toLocaleDateString(undefined, { weekday: "short" });
}

function getHourLabel(ts, timezoneOffsetSeconds) {
  const local = new Date((ts + timezoneOffsetSeconds) * 1000);
  return local.toLocaleTimeString(undefined, { hour: "numeric" });
}

// Fetch functions
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

async function getWeatherByCity(city) {
  try {
    setLoadingState();
    const unitsParam = currentUnits;

    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${API_KEY}&units=${unitsParam}`;

    const currentData = await fetchJson(currentUrl);

    const { lat, lon } = currentData.coord;
    lastCoords = { lat, lon };

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unitsParam}`;
    const forecastData = await fetchJson(forecastUrl);

    updateUI(currentData, forecastData);
  } catch (err) {
    console.error(err);
    setErrorState("City not found or network error.");
  }
}

async function getWeatherByCoords(lat, lon) {
  try {
    setLoadingState();
    const unitsParam = currentUnits;

    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unitsParam}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unitsParam}`;

    const [currentData, forecastData] = await Promise.all([
      fetchJson(currentUrl),
      fetchJson(forecastUrl),
    ]);

    lastCoords = { lat, lon };
    updateUI(currentData, forecastData);
  } catch (err) {
    console.error(err);
    setErrorState("Unable to load weather for your location.");
  }
}

// UI state helpers
function setLoadingState() {
  elements.location.textContent = "Searching...";
  elements.temperature.textContent = "--";
  elements.dailyForecast.innerHTML = "";
  elements.hourlyList.innerHTML = "";
}

function setErrorState(message) {
  elements.location.textContent = message;
  elements.date.textContent = "";
  elements.temperature.textContent = "--";
  elements.feelsLike.textContent = "--";
  elements.humidity.textContent = "--";
  elements.wind.textContent = "--";
  elements.precipitation.textContent = "--";
  elements.dailyForecast.innerHTML = "";
  elements.hourlyList.innerHTML = "";
}

// Main UI update
function updateUI(currentData, forecastData) {
  const tzOffset = currentData.timezone ?? 0;

  const locationName = `${currentData.name}, ${currentData.sys.country}`;
  const mainWeather = currentData.weather[0];
  const iconPath = getIconPathFromWeather(mainWeather.main);

  elements.location.textContent = locationName;
  elements.date.textContent = formatDate(currentData.dt, tzOffset);
  elements.temperature.textContent = formatTemp(currentData.main.temp);
  elements.weatherIcon.src = iconPath;
  elements.weatherIcon.alt = mainWeather.description;

  elements.feelsLike.textContent = formatTemp(currentData.main.feels_like);
  elements.humidity.textContent = `${currentData.main.humidity}%`;
  elements.wind.textContent = formatWind(currentData.wind.speed);

  const precipMm =
    (currentData.rain && currentData.rain["1h"]) ||
    (currentData.snow && currentData.snow["1h"]) ||
    0;
  elements.precipitation.textContent = `${Math.round(precipMm)} mm`;

  renderDailyForecast(forecastData, tzOffset);
  renderHourlyForecast(forecastData, tzOffset);
}

function groupForecastByDay(forecastData, tzOffset) {
  const days = {};

  forecastData.list.forEach((entry) => {
    const localDate = new Date((entry.dt + tzOffset) * 1000);
    const key = localDate.toISOString().slice(0, 10); // YYYY-MM-DD

    if (!days[key]) {
      days[key] = {
        entries: [],
        min: entry.main.temp_min,
        max: entry.main.temp_max,
        icon: entry.weather[0],
        dt: entry.dt,
      };
    } else {
      days[key].min = Math.min(days[key].min, entry.main.temp_min);
      days[key].max = Math.max(days[key].max, entry.main.temp_max);

      const currentHour =
        Math.abs(localDate.getHours() - 12) < Math.abs(new Date((days[key].dt + tzOffset) * 1000).getHours() - 12)
          ? entry.dt
          : days[key].dt;
      if (currentHour === entry.dt) {
        days[key].icon = entry.weather[0];
        days[key].dt = entry.dt;
      }
    }

    days[key].entries.push(entry);
  });

  return Object.entries(days)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(0, 7);
}

function renderDailyForecast(forecastData, tzOffset) {
  const grouped = groupForecastByDay(forecastData, tzOffset);
  elements.dailyForecast.innerHTML = "";

  grouped.forEach(([dateKey, info]) => {
    const dayLabel = getDayName(info.dt, tzOffset);
    const iconPath = getIconPathFromWeather(info.icon.main);

    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <div class="forecast-day">${dayLabel}</div>
      <img src="${iconPath}" alt="${info.icon.description}" class="forecast-icon" />
      <div class="forecast-temp">
        <span class="high">${formatTemp(info.max)}</span>
        <span class="low">${formatTemp(info.min)}</span>
      </div>
    `;

    elements.dailyForecast.appendChild(card);
  });

  // Update day select (Today, Tomorrow, etc.)
  elements.daySelect.innerHTML = "";
  grouped.forEach(([dateKey, info], index) => {
    const option = document.createElement("option");
    const dayLabel =
      index === 0 ? "Today" : index === 1 ? "Tomorrow" : getDayName(info.dt, tzOffset);
    option.value = dateKey;
    option.textContent = dayLabel;
    elements.daySelect.appendChild(option);
  });
}

function renderHourlyForecast(forecastData, tzOffset) {
  const grouped = groupForecastByDay(forecastData, tzOffset);
  const dayMap = {};
  grouped.forEach(([dateKey, info]) => {
    dayMap[dateKey] = info.entries;
  });

  function renderForDay(dateKey) {
    const entries = dayMap[dateKey] || [];
    elements.hourlyList.innerHTML = "";

    entries
      .slice(0, 8) // up to ~24 hours
      .forEach((entry) => {
        const hourLabel = getHourLabel(entry.dt, tzOffset);
        const iconPath = getIconPathFromWeather(entry.weather[0].main);

        const row = document.createElement("div");
        row.className = "hourly-item";
        row.innerHTML = `
          <div class="hourly-time">${hourLabel}</div>
          <img src="${iconPath}" alt="${entry.weather[0].description}" class="hourly-icon" />
          <div class="hourly-temp">${formatTemp(entry.main.temp)}</div>
        `;

        elements.hourlyList.appendChild(row);
      });
  }

  if (grouped.length > 0) {
    const firstKey = grouped[0][0];
    renderForDay(firstKey);
    elements.daySelect.value = firstKey;

    elements.daySelect.onchange = () => {
      renderForDay(elements.daySelect.value);
    };
  }
}

// Units toggle
function updateUnitsLabel() {
  elements.unitsLabel.textContent =
    currentUnits === "metric" ? "Units: Metric (°C)" : "Units: Imperial (°F)";
}

async function refreshWithNewUnits() {
  updateUnitsLabel();
  if (lastCoords) {
    await getWeatherByCoords(lastCoords.lat, lastCoords.lon);
  } else if (elements.cityInput.value.trim()) {
    await getWeatherByCity(elements.cityInput.value.trim());
  }
}

// Event listeners
window.addEventListener("load", () => {
  // Try geolocation first
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        getWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        // Fallback default city
        getWeatherByCity("Berlin");
      }
    );
  } else {
    getWeatherByCity("Berlin");
  }

  updateUnitsLabel();
});

elements.searchBtn.addEventListener("click", () => {
  const city = elements.cityInput.value.trim();
  if (!city) return;
  getWeatherByCity(city);
});

elements.cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const city = elements.cityInput.value.trim();
    if (!city) return;
    getWeatherByCity(city);
  }
});

elements.unitsToggle.addEventListener("click", () => {
  currentUnits = currentUnits === "metric" ? "imperial" : "metric";
  refreshWithNewUnits();
});
