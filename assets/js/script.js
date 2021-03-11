const WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather?q=";
const FORECAST_URL = "http://api.openweathermap.org/data/2.5/forecast?q=";
const UV_INDEX_URL = "http://api.openweathermap.org/data/2.5/uvi/forecast?lat=";
const API_KEY = "0564c081313fe54741f1983cf3dea38c";
var form = document.getElementById("search-word");
var cityToSearch = document.getElementById("cityname");
var favCities = [];
var currentCity;
var currentForecast;
var uvIndex;

var getCurrentCity = function (weatherData) {
  currentCity = weatherData;
};

var getCurrentForecast = function (weatherData) {
  currentForecast = weatherData;
};

var getUVIndex = function (weatherData) {
  uvIndex = weatherData;
};

var getUVClass = function () {
  let uvClass;
  if (uvIndex[0].value < 2.6) {
    uvClass = "green";
  } else if (uvIndex[0].value < 5.6) {
    uvClass = "yellow";
  } else if (uvIndex[0].value < 7.6) {
    uvClass = "orange";
  } else if (uvIndex[0].value < 10.6) {
    uvClass = "red";
  } else if (uvIndex[0].value >= 10.6) {
    uvClass = "purple";
  }
  return uvClass;
};

form.addEventListener("submit", (btn) => {
  let cityName = cityToSearch.value;
  goFetch(cityName);
});

var goFetch = function (city) {
  favCities.push(city);
  let cities = JSON.stringify(favCities);
  localStorage.setItem("citiesList", cities);
  var apiRequest1 =
    WEATHER_URL + city + "&appid=" + API_KEY + "&units=imperial";
  console.log(apiRequest1);
  renderCitiesList();
  fetch(apiRequest1)
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      var myCityWeather = response.data;
      console.log(myCityWeather);
      debugger;
      getCurrentCity(myCityWeather);
      let lat = myCityWeather.coord.lat;
      let lon = myCityWeather.coord.lon;
      let url = UV_INDEX_URL + lat + "&lon" + lon + "&appid=" + API_KEY;
      fetch(url)
        .then(function (response) {
          return response.json();
        })
        .then(function (response) {
          var uvInd = response.data;
          console.log(uvInd);
          debugger;
          getUVIndex(uvInd);
          renderWeatherNow();
        });
    });
  var apiRequest2 =
    FORECAST_URL + city + "&appid=" + API_KEY + "&units=imperial";
  fetch(apiRequest2)
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      var fiveDaysForecast = response.data;
      console.log(fiveDaysForecast);
      debugger;
      getCurrentForecast(fiveDaysForecast);
      renderFiveDays();
    });
};

var addCity = function (city) {
  var newCity = document.createElement("div");
  newCity.setAttribute("class", "fav-city");
  var $name = document.createElement("button");
  $name.textContent = city;
  $name.setAttribute("class", "city-button");
  $name.addEventListener("click", (btn) => {
    var favCity = city;
    goFetch(favCity);
  });
  newCity.appendChild($name);
  return newCity;
};

var renderCitiesList = function () {
  const FAV_CITIES = document.getElementById("cities");
  //FAV_CITIES.innerHTML = "";
  let myList = localStorage.getItem("citiesList");
  if (myList !== null) {
    var favCities = JSON.parse(myList);
    let favorites = generateCitiesList(favCities);
    favorites.forEach((city) => FAV_CITIES.appendChild(city));
  }
};

var generateCitiesList = function (myList) {
  let divList = [];
  myList.forEach((city) => {
    var cityEl = addCity(city);
    divList.push(cityEl);
  });
  return divList;
};

var renderWeatherNow = function () {
  var $container = document.getElementById("weather-now");
  let weatherNow = currentCity;
  let data = generateWeatherNow(weatherNow);
  for (i = 0; i < data.length; i++) {
    let newDiv = document.createElement("div");
    newDiv.appendChild(data[i]);
    $container.appendChild(newDiv);
  }
};

var generateWeatherNow = function (city) {
  let $title = document.createElement("h2");
  var dateString = moment(city.dt).calendar();
  let icon = city.weather[1].icon;
  let $img = document.createElement("img");
  let imgUrl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
  $img.setAttribute("src", imgUrl);
  $img.setAttribute("style", "display: In-line;");
  var title = city.name + "  " + dateString + "   ";
  $title.textContent(title);
  let $temp = document.createElement("p");
  var temp = "Temperature: " + city.main.temp;
  $temp.textContent(temp);
  let $humid = document.createElement("p");
  var humid = "Humidity: " + city.main.humidity;
  $humid.textContent(humid);
  var wind = "Wind Speed: " + city.wind.speed + " MPH";
  var $wind = document.createElement("p");
  $wind.textContent(wind);
  var uvInd = "UV Index: ";
  let $uvInd = document.createElement("p");
  $uvInd.textContent(uvInd);
  let $span = document.createElement("span");
  $span.textContent(uvIndex[1].value);
  let spanClass = getUVClass();
  $span.setAttribute("class", "with-bg");
  $span.setAttribute("class", spanClass);
  uvInd.appendChild($span);
  let currentData = [$title, $temp, $humid, $wind, $uvInd];
  return currentData;
};

var renderFiveDays = function () {
  let forecast = document.getElementById("weather-five");
  let wrapper = document.createElement("div");
  let title = document.createElement("h3");
  title.textContent("5-Day Forecast ");
  wrapper.appendChild(title);
  let forecastCity = currentForecast;
  for (let i = 4; i < forecastCity.list.length; i = i + 8) {
    let dayForcast = forecastCity.list[i];
    generateFiveDays(dayForcast);
    wrapper.appendChild(dayForcast);
  }
};

var generateFiveDays = function (forecast) {
  let $divPerDay = document.createElement("div");
  $divPerDay.setAttribute("class", "bubble");
  let date = forecast.dt_txt;
  let $date = document.createElement("h4");
  $date.textContent(date);
  //var dateString = moment().calendar();
  let icon = forecast.weather.icon;
  let iconUrl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
  let $icon = document.createElement("img");
  $icon.setAttribute("src", iconUrl);
  let temp = forecast.main.temp;
  let humid = forecast.main.humidity;
};

var renderPage = function () {
  renderCitiesList();
};

renderPage();
