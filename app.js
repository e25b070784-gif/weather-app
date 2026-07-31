const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WX_URL  = 'https://api.open-meteo.com/v1/forecast';

const WMO = {
  0: { label: 'Clear Sky', emoji: '☀️' },
  1: { label: 'Mainly Clear', emoji: '🌤️' },
  2: { label: 'Partly Cloudy', emoji: '⛅' },
  3: { label: 'Overcast', emoji: '☁️' },
  45: { label: 'Foggy', emoji: '🌫️' },
  48: { label: 'Icy Fog', emoji: '🌫️' },
  51: { label: 'Light Drizzle', emoji: '🌦️' },
  53: { label: 'Drizzle', emoji: '🌦️' },
  55: { label: 'Heavy Drizzle', emoji: '🌦️' },
  61: { label: 'Light Rain', emoji: '🌧️' },
  63: { label: 'Rain', emoji: '🌧️' },
  65: { label: 'Heavy Rain', emoji: '🌧️' },
  71: { label: 'Light Snow', emoji: '🌨️' },
  73: { label: 'Snow', emoji: '❄️' },
  75: { label: 'Heavy Snow', emoji: '❄️' },
  80: { label: 'Rain Showers', emoji: '🌦️' },
  81: { label: 'Rain Showers', emoji: '🌧️' },
  82: { label: 'Heavy Showers', emoji: '⛈️' },
  95: { label: 'Thunderstorm', emoji: '⛈️' },
  99: { label: 'Thunderstorm', emoji: '🌩️' },
};

function getWMO(code) {
  return WMO[code] || { label: 'Unknown', emoji: '🌡️' };
}

const cityInput  = document.getElementById('city-input');
const searchBtn  = document.getElementById('search-btn');
const errorEl    = document.getElementById('error');
const weatherEl  = document.getElementById('weather');

async function search() {
  const city = cityInput.value.trim();
  if (!city) return;

  errorEl.textContent = '';
  weatherEl.classList.add('hidden');

  // Geocode
  try {
    const geoRes = await fetch(`${GEO_URL}?name=${encodeURIComponent(city)}&count=1`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      errorEl.textContent = 'City not found.';
      return;
    }

    const loc = geoData.results[0];

    // Fetch weather
    const params = new URLSearchParams({
      latitude: loc.latitude,
      longitude: loc.longitude,
      current_weather: true,
      hourly: 'relativehumidity_2m,apparent_temperature',
      wind_speed_unit: 'kmh',
      timezone: 'auto',
      forecast_days: 1,
    });

    const wxRes  = await fetch(`${WX_URL}?${params}`);
    const wxData = await wxRes.json();

    const cw      = wxData.current_weather;
    const nowISO  = cw.time;
    const idx     = wxData.hourly.time.findIndex(t => t === nowISO);
    const humidity   = wxData.hourly.relativehumidity_2m[idx >= 0 ? idx : 0];
    const feelsLike  = wxData.hourly.apparent_temperature[idx >= 0 ? idx : 0];
    const info       = getWMO(cw.weathercode);

    document.getElementById('city-name').textContent  = loc.name;
    document.getElementById('country').textContent    = loc.country || '';
    document.getElementById('temp').textContent       = `${Math.round(cw.temperature)}°C`;
    document.getElementById('weather-icon').textContent = info.emoji;
    document.getElementById('desc').textContent       = info.label;
    document.getElementById('humidity').textContent   = `${humidity}%`;
    document.getElementById('wind').textContent       = `${cw.windspeed} km/h`;
    document.getElementById('feels-like').textContent = `${Math.round(feelsLike)}°C`;

    weatherEl.classList.remove('hidden');

  } catch (err) {
    errorEl.textContent = 'Something went wrong. Try again.';
  }
}

searchBtn.addEventListener('click', search);
cityInput.addEventListener('keydown', e => { if (e.key === 'Enter') search(); });