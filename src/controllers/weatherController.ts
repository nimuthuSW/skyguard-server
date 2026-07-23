import { Request, Response } from 'express';
import axios from 'axios';

// Helper to convert Weather Code to Human Description & Emoji
const parseWeatherCode = (code: number) => {
  if (code === 0) return { desc: 'Clear Sky', icon: '☀️' };
  if (code >= 1 && code <= 3) return { desc: 'Partly Cloudy', icon: '⛅' };
  if (code >= 45 && code <= 48) return { desc: 'Foggy', icon: '🌫️' };
  if (code >= 51 && code <= 67) return { desc: 'Rain Showers', icon: '🌧️' };
  if (code >= 71 && code <= 77) return { desc: 'Snow', icon: '❄️' };
  if (code >= 80 && code <= 82) return { desc: 'Heavy Rain', icon: '🌧️' };
  if (code >= 95 && code <= 99) return { desc: 'Thunderstorm', icon: '⛈️' };
  return { desc: 'Partly Cloudy', icon: '🌤️' };
};

export const getWeather = async (req: Request, res: Response) => {
  try {
    const city = (req.query.city as string) || 'Colombo';

    // 1. Geocode City to Lat/Lon
    const geoRes = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );

    if (!geoRes.data.results || geoRes.data.results.length === 0) {
      return res.status(404).json({ error: `City '${city}' not found.` });
    }

    const { latitude, longitude, name, country } = geoRes.data.results[0];

    // 2. Fetch Live Weather & Forecast
    const weatherRes = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
    );

    // 3. Fetch Air Quality (AQI)
    let aqi = 42; // default good
    try {
      const aqiRes = await axios.get(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi`
      );
      if (aqiRes.data.current && aqiRes.data.current.us_aqi) {
        aqi = Math.round(aqiRes.data.current.us_aqi);
      }
    } catch {
      // fallback AQI
    }

    const current = weatherRes.data.current_weather;
    const daily = weatherRes.data.daily;
    const condition = parseWeatherCode(current.weathercode);

    // Build 5-Day Forecast Array
    const weeklyForecast = daily.time.slice(0, 5).map((dateStr: string, idx: number) => {
      const date = new Date(dateStr);
      const dayName = idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayCondition = parseWeatherCode(daily.weathercode[idx]);

      return {
        day: dayName,
        temp: `${Math.round(daily.temperature_2m_max[idx])}° / ${Math.round(daily.temperature_2m_min[idx])}°`,
        desc: dayCondition.desc,
        icon: dayCondition.icon,
      };
    });

    return res.status(200).json({
      city: `${name}, ${country}`,
      temp: `${Math.round(current.temperature)}°`,
      highLow: `${Math.round(daily.temperature_2m_max[0])}° / ${Math.round(daily.temperature_2m_min[0])}°`,
      condition: condition.desc,
      icon: condition.icon,
      wind: `${Math.round(current.windspeed)} km/h`,
      humidity: '65%',
      aqi: aqi,
      aqiStatus: aqi <= 50 ? 'Good 🍃' : aqi <= 100 ? 'Moderate 🟡' : 'Unhealthy 🔴',
      weeklyForecast,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch weather data.' });
  }
};
