// WeatherPro - Hackathon Edition
const cityInput = document.getElementById('city');
const searchBtn = document.getElementById('searchBtn');
const placeEl = document.getElementById('place');
const tempEl = document.getElementById('temp');
const feelsEl = document.getElementById('feels');
const descEl = document.getElementById('desc');
const updatedEl = document.getElementById('updated');
const iconEl = document.getElementById('icon');
const windEl = document.getElementById('wind');
const humidityEl = document.getElementById('humidity');
const visibilityEl = document.getElementById('visibility');
const pressureEl = document.getElementById('pressure');
const hourlyForecastEl = document.getElementById('hourlyForecast');
const dailyForecastEl = document.getElementById('dailyForecast');

// Weather code to emoji/text mapping
const weatherMap = {
  0: ['☀️ Clear Sky', 'clear'],
  1: ['🌤️ Mainly Clear', 'clear'],
  2: ['⛅ Partly Cloudy', 'cloudy'],
  3: ['☁️ Overcast', 'cloudy'],
  45: ['🌫️ Foggy', 'fog'],
  48: ['🌫️ Depositing Rime', 'fog'],
  51: ['🌧️ Light Drizzle', 'rain'],
  53: ['🌦️ Moderate Drizzle', 'rain'],
  55: ['🌧️ Heavy Drizzle', 'rain'],
  61: ['🌧️ Slight Rain', 'rain'],
  63: ['🌧️ Moderate Rain', 'rain'],
  65: ['🌧️ Heavy Rain', 'rain'],
  71: ['❄️ Light Snow', 'snow'],
  73: ['❄️ Moderate Snow', 'snow'],
  75: ['❄️ Heavy Snow', 'snow'],
  77: ['❄️ Snow Grains', 'snow'],
  80: ['🌧️ Rain Showers', 'rain'],
  81: ['🌧️ Rainy', 'rain'],
  82: ['⛈️ Violent Rain', 'rain'],
  85: ['❄️ Snow Showers', 'snow'],
  86: ['❄️ Heavy Snow Showers', 'snow'],
  95: ['⛈️ Thunderstorm', 'storm'],
  96: ['⛈️ Thunderstorm + Hail', 'storm'],
  99: ['⛈️ Thunderstorm + Large Hail', 'storm'],
};

function getWeatherInfo(code, isNight = false) {
  // Night versions of weather codes
  const nightWeatherMap = {
    0: ['🌙 Clear Night', 'clear'],
    1: ['🌙 Mainly Clear', 'clear'],
    2: ['🌙 Partly Cloudy', 'cloudy'],
    3: ['☁️ Overcast', 'cloudy'],
    45: ['🌫️ Foggy', 'fog'],
    48: ['🌫️ Foggy', 'fog'],
    51: ['🌧️ Light Drizzle', 'rain'],
    53: ['🌦️ Moderate Drizzle', 'rain'],
    55: ['🌧️ Heavy Drizzle', 'rain'],
    61: ['🌧️ Slight Rain', 'rain'],
    63: ['🌧️ Moderate Rain', 'rain'],
    65: ['🌧️ Heavy Rain', 'rain'],
    71: ['❄️ Light Snow', 'snow'],
    73: ['❄️ Moderate Snow', 'snow'],
    75: ['❄️ Heavy Snow', 'snow'],
    77: ['❄️ Snow Grains', 'snow'],
    80: ['🌧️ Rain Showers', 'rain'],
    81: ['🌧️ Rainy', 'rain'],
    82: ['⛈️ Violent Rain', 'rain'],
    85: ['❄️ Snow Showers', 'snow'],
    86: ['❄️ Heavy Snow Showers', 'snow'],
    95: ['⛈️ Thunderstorm', 'storm'],
    96: ['⛈️ Thunderstorm + Hail', 'storm'],
    99: ['⛈️ Thunderstorm + Large Hail', 'storm'],
  };
  
  const map = isNight ? nightWeatherMap : weatherMap;
  return map[code] || ['🌈 Unknown', 'unknown'];
}

async function searchCity(city) {
  if (!city.trim()) {
    alert('Please enter a city name');
    return;
  }

  try {
    placeEl.textContent = 'Searching...';
    tempEl.textContent = '--°';
    
    // Geocode the city
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      placeEl.textContent = 'City not found. Try another search.';
      return;
    }

    const loc = geoData.results[0];
    const lat = loc.latitude;
    const lon = loc.longitude;
    const name = `${loc.name}${loc.admin1 ? ', ' + loc.admin1 : ''}${loc.country ? ', ' + loc.country : ''}`;

    // Fetch weather data (include sunrise/sunset)
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility,pressure_msl&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset&timezone=auto`
    );
    const weatherData = await weatherRes.json();

    if (!weatherData.current) {
      placeEl.textContent = 'Failed to fetch weather data';
      return;
    }

    // Store for later use
    weatherData.location = { name, lat, lon };
    renderWeather(weatherData);
    
    // Save last city
    try { localStorage.setItem('weatherpro_city', city); } catch (e) {}
  } catch (err) {
    console.error('Error:', err);
    placeEl.textContent = 'Error fetching weather. Check your connection.';
  }
}

function renderWeather(data) {
  const current = data.current;
  const hourly = data.hourly;
  const daily = data.daily;
  const loc = data.location;

  // Current weather
  const temp = Math.round(current.temperature_2m);
  const feels = Math.round(current.apparent_temperature);
  const humidity = current.relative_humidity_2m;
  const windSpeed = Math.round(current.wind_speed_10m);
  const visibility = (current.visibility / 1000).toFixed(1); // Convert to km
  const pressure = current.pressure_msl;
  const code = current.weather_code;

  // Check if it's night time
  const now = new Date();
  let isNight = false;
  
  if (daily && daily.sunrise && daily.sunset && daily.time) {
    const todayIndex = 0;
    const sunrise = new Date(daily.sunrise[todayIndex]);
    const sunset = new Date(daily.sunset[todayIndex]);
    isNight = now < sunrise || now > sunset;
  }

  // Weather description
  const [desc, type] = getWeatherInfo(code, isNight);
  const emoji = desc.split(' ')[0];

  // Update main display
  placeEl.textContent = loc.name;
  tempEl.textContent = `${temp}°C`;
  feelsEl.textContent = `Feels like ${feels}°C`;
  descEl.textContent = desc.substring(2); // Remove emoji
  iconEl.textContent = emoji;
  updatedEl.textContent = `Updated: ${new Date(current.time).toLocaleTimeString()}`;

  // Update metrics
  windEl.textContent = `${windSpeed} km/h`;
  humidityEl.textContent = `${humidity}%`;
  visibilityEl.textContent = `${visibility} km`;
  pressureEl.textContent = `${Math.round(pressure)} hPa`;

  // Render hourly forecast (next 24 hours)
  renderHourlyForecast(hourly);

  // Render daily forecast
  renderDailyForecast(daily);
}

function renderHourlyForecast(hourly) {
  hourlyForecastEl.innerHTML = '';
  if (!hourly || !hourly.time) return;

  const times = hourly.time;
  const temps = hourly.temperature_2m;
  const codes = hourly.weather_code;

  // Get current time and show next 24 hours
  const now = new Date();
  const currentHour = now.getHours();

  for (let i = 0; i < Math.min(24, times.length); i++) {
    const time = new Date(times[i]);
    const hour = time.getHours();
    const temp = Math.round(temps[i]);
    const code = codes[i];
    
    // Check if this hour is during night (approximate: before 6 AM or after 6 PM)
    const isNightHour = hour < 6 || hour >= 18;
    
    const [desc, type] = getWeatherInfo(code, isNightHour);
    const emoji = desc.split(' ')[0];

    const card = document.createElement('div');
    card.className = 'hourly-card';
    card.innerHTML = `
      <div class="hourly-time">${hour.toString().padStart(2, '0')}:00</div>
      <div class="hourly-icon">${emoji}</div>
      <div class="hourly-temp">${temp}°</div>
    `;
    hourlyForecastEl.appendChild(card);
  }
}

function renderDailyForecast(daily) {
  dailyForecastEl.innerHTML = '';
  if (!daily || !daily.time) return;

  const times = daily.time;
  const maxTemps = daily.temperature_2m_max;
  const minTemps = daily.temperature_2m_min;
  const codes = daily.weather_code;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (let i = 0; i < Math.min(7, times.length); i++) {
    const date = new Date(times[i]);
    const dayName = i === 0 ? 'Today' : days[date.getDay()];
    const maxTemp = Math.round(maxTemps[i]);
    const minTemp = Math.round(minTemps[i]);
    const code = codes[i];
    // For daily forecast, show daytime emoji (day icon for forecast)
    const [desc, type] = getWeatherInfo(code, false);
    const emoji = desc.split(' ')[0];

    const card = document.createElement('div');
    card.className = 'day-card';
    card.innerHTML = `
      <div class="day-name">${dayName}</div>
      <div class="day-icon">${emoji}</div>
      <div class="day-temp">${maxTemp}°</div>
      <div class="day-temp-range">Low: ${minTemp}°</div>
    `;
    dailyForecastEl.appendChild(card);
  }
}

// Event listeners
searchBtn.addEventListener('click', () => searchCity(cityInput.value));
cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchCity(cityInput.value);
});

// Load last searched city on page load
window.addEventListener('load', () => {
  try {
    const lastCity = localStorage.getItem('weatherpro_city');
    if (lastCity) {
      cityInput.value = lastCity;
      searchCity(lastCity);
    }
  } catch (e) {
    console.log('No saved city');
  }
});
