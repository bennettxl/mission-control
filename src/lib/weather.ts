const LATITUDE = 37.3861; // Mountain View, CA
const LONGITUDE = -122.0839;

const WEATHER_CODES: Record<number, string> = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Freezing rain",
  71: "Light snow fall",
  73: "Snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Rain showers",
  81: "Heavy rain showers",
  82: "Violent rain showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Heavy thunderstorm with hail",
};

export type WeatherSnapshot = {
  temperatureC: number;
  temperatureF: number;
  windSpeed: number;
  weatherCode: number;
  description: string;
  observedAt: string;
};

export async function loadWeather(): Promise<WeatherSnapshot | null> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", LATITUDE.toString());
  url.searchParams.set("longitude", LONGITUDE.toString());
  url.searchParams.set("current_weather", "true");
  url.searchParams.set("timezone", "America/Los_Angeles");

  try {
    const response = await fetch(url.toString(), { next: { revalidate: 600 } });
    if (!response.ok) {
      console.warn("loadWeather failed", response.statusText);
      return null;
    }
    const data = await response.json();
    if (!data?.current_weather) return null;
    const { temperature, weathercode, windspeed, time } = data.current_weather;
    const temperatureC = Number(temperature);
    const temperatureF = Math.round((temperatureC * 9) / 5 + 32);
    return {
      temperatureC,
      temperatureF,
      windSpeed: Number(windspeed),
      weatherCode: Number(weathercode),
      description: WEATHER_CODES[weathercode] ?? "Conditions",
      observedAt: time,
    };
  } catch (error) {
    console.warn("loadWeather failed", error);
    return null;
  }
}
