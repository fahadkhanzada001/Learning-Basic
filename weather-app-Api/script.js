$(document).ready(function () {
  const url =
    "https://api.weatherapi.com/v1/forecast.json?key=abb0369475c54aeb8be120754230907&q=lahore&days=14";

  $.getJSON(url, function (data) {
    const loc = data.location;
    const curr = data.current;
    const forecast = data.forecast.forecastday;

    // Current Weather
    $("#cityName").text(loc.name + ", " + loc.country);
    $("#localTime").text(loc.localtime.split(" ")[1]);
    $("#temp").text(curr.temp_c + "°C");
    $("#conditionText").text(curr.condition.text);
    $("#wind").text(curr.wind_kph + " km/h");
    $("#humidity").text(curr.humidity + "%");
    $("#feelsLike").text(curr.feelslike_c + "°C");
    $("#icon").attr("data-conditions", curr.condition.text);
    $("#icon").attr("src", "https:" + curr.condition.icon);

    // Forecast days
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
    console.log("All data", data);
    console.log("Current Weather Data:", curr);
    console.log("Forecast Data:", forecast);
  });
});
