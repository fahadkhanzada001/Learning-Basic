// API Configuration
const API_KEY = "fc477b4095b24debbb7132345252608"; // Weather API key
const BASE_URL = "https://api.weatherapi.com/v1/forecast.json";

// Extract time (from "YYYY-MM-DD HH:MM")
function extractTime(localtime) {
  return String(localtime).split(" ")[1] || "--:--";
}

// Show error message
function showError(msg) {
  $("#errorMsg").text(msg).show(); // Show error
  setTimeout(() => $("#errorMsg").fadeOut(300), 9000); // Hide after 9 sec
}

// Loader and button state control
function setLoading(isLoading) {
  $("#loader").toggle(isLoading);
  $("#searchBtn").prop("disabled", isLoading);
}

// Render Functions //

// Current Weather Render
function renderWeather(data) {
  const loc = data.location;
  const cur = data.current;

  $("#cityName").text(`${loc.name}, ${loc.country}`);
  $("#localTime").text(extractTime(loc.localtime));
  $("#temp").text(`${Math.round(cur.temp_c)}°C`);
  $("#conditionText").text(cur.condition.text);
  $("#wind").text(`${Math.round(cur.wind_kph)} km/h`);
  // $("#humidity").text(`${cur.humidity}%`);
  $("#feelsLike").text(`${Math.round(cur.feelslike_c)}°C`);

  // Weather Icon (ensure https)
  const iconUrl = cur.condition.icon.startsWith("//")
    ? "https:" + cur.condition.icon
    : cur.condition.icon;
  $("#icon").attr("src", iconUrl).attr("alt", cur.condition.text);
}

// Forecast Render
function renderForecast(forecast) {
  let forecastHtml = "";
  forecast.forEach((day) => {
    forecastHtml += `
      <div class="col-md-4">
        <div class="forecast-day">
          <strong>${day.date}</strong><br>
          <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
          <div>${day.day.avgtemp_c}°C</div>
          <small>${day.day.condition.text}</small><br>
          <span>Max: ${day.day.maxtemp_c}°C | Min: ${day.day.mintemp_c}°C</span>
        </div>
      </div>
    `;
  });
  $("#forecast").html(forecastHtml);
}

// API Call Function
function fetchWeather(city) {
  if (!city) return showError("Please enter a city name.");
  setLoading(true);

  // Call the API with clean params
  $.getJSON(BASE_URL, { key: API_KEY, q: city, days: 3 })
    .done(function (res) {
      renderWeather(res);
      renderForecast(res.forecast.forecastday);
      console.log("Weather Data:", res);
      console.log(res.forecast.forecastday.length);
    })
    .fail(function (xhr) {
      const msg =
        xhr?.responseJSON?.error?.message ||
        "Unable to fetch weather data. Please check the city name or API key.";
      showError(msg);
    })
    .always(function () {
      setLoading(false);
    });
}

//Event Handlers
$(document).ready(function () {
  // Default load city
  fetchWeather($("#cityInput").val().trim() || "Lahore");

  // On button click
  $("#searchBtn").on("click", function () {
    const city = $("#cityInput").val().trim();
    fetchWeather(city);
  });

  // On Enter key press
  $("#cityInput").on("keypress", function (e) {
    if (e.key === "Enter") {
      fetchWeather($(this).val().trim());
    }
  });
});

