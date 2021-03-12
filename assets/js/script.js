const WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather?q=";
const FORECAST_URL = "http://api.openweathermap.org/data/2.5/forecast?q=";
const UV_INDEX_URL = "http://api.openweathermap.org/data/2.5/uvi?lat=";
const API_KEY = "0564c081313fe54741f1983cf3dea38c";
const ICON_URL = "http://openweathermap.org/img/wn/";

var recoverCityList = () => {
  let myList = localStorage.getItem("citiesList");
  if (myList !== null) {
    var favCities = JSON.parse(myList);
    return favCities;
  } else {
    return [];
  }
};

let state = {
  currentCity: {
    name: null,
    uvIndex: null,
    forecast: null,
    weather: null,
    icon: null,
  },
  cityList: recoverCityList(),
};

var genWeatherApiUrl = function (city) {
  let url = `${WEATHER_URL}${city}&appid=${API_KEY}&units=imperial`;
  return url;
};

var genForecastUrl = function (city) {
  let url = `${FORECAST_URL}${city}&appid=${API_KEY}&units=imperial`;
  return url;
};

var genUvIndexUrl = function (lat, lon) {
  let url = `${UV_INDEX_URL}${lat}&lon=${lon}&appid=${API_KEY}`;
  return url;
};

var genIconUrl = function (icon) {
  let url = `${ICON_URL}${icon}@2x.png`;
  return url;
};
var renderPage = () => {
  renderForm(state.cityList, state.currentCity);
  renderCitiesList(state.cityList);
};

String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

var renderForm = (cityList, currentCity) => {
  var form = document.getElementById("search");
  var cityToSearch = document.getElementById("cityname");

  form.addEventListener("click", (btn) => {
    if (cityToSearch.value === "") {
      alert("Enter a city");
      return;
    }
    let cityName = cityToSearch.value;
    currentCity.name = cityName;
    goFetch(currentCity, cityList);
  });
};

var getUVClass = function () {
  let uvClass;
  if (uvIndex.value < 2.6) {
    uvClass = "green";
  } else if (uvIndex.value < 5.6) {
    uvClass = "yellow";
  } else if (uvIndex.value < 7.6) {
    uvClass = "orange";
  } else if (uvIndex.value < 10.6) {
    uvClass = "red";
  } else if (uvIndex.value >= 10.6) {
    uvClass = "purple";
  }
  return uvClass;
};

var repetitionAvoider = function (city, cityList) {
  if (!cityList.includes(city)) {
    cityList.push(city);
  }
};

var goFetch = function (currentCity, cityList) {
  let city = currentCity.name;
  if (cityList.length > 0) {
    repetitionAvoider(city.toLowerCase(), cityList);
  } else {
    cityList.push(city.toLowerCase());
  }
  let cities = JSON.stringify(cityList);
  localStorage.setItem("citiesList", cities);
  var apiRequest1 = genWeatherApiUrl(city);
  console.log(apiRequest1);
  renderCitiesList(cityList);
  fetch(apiRequest1)
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      var myCityWeather = response;
      console.log(myCityWeather);
      debugger;
      currentCity.weather = myCityWeather;
      let lat = myCityWeather.coord.lat;
      let lon = myCityWeather.coord.lon;
      let url = genUvIndexUrl(lat, lon);
      fetch(url)
        .then(function (response) {
          return response.json();
        })
        .then(function (response) {
          var uvInd = response;
          currentCity.uvIndex = uvInd;
          renderWeatherNow();
        });
    });
  var apiRequest2 = genForecastUrl(city);
  fetch(apiRequest2)
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      var fiveDaysForecast = response;
      currentCity.forecast = fiveDaysForecast;
      renderFiveDays();
    });
};

var addCity = function (city) {
  var newCity = document.createElement("div");
  newCity.setAttribute("class", "fav-city");
  var $name = document.createElement("button");
  $name.textContent = city.toProperCase();
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
  FAV_CITIES.innerHTML = "";
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
  debugger;
  let weatherNow = state.currentCity.weather;
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
  let icon = city.weather[0].icon;
  let $img = document.createElement("img");
  let imgUrl = genIconUrl(icon);
  $img.setAttribute("src", imgUrl);
  $img.setAttribute("style", "display: In-line;");
  var title = city.name + "  " + dateString + "   ";
  $title.textContent = title;
  let $temp = document.createElement("p");
  var temp = "Temperature: " + city.main.temp;
  $temp.textContent = temp;
  let $humid = document.createElement("p");
  var humid = "Humidity: " + city.main.humidity;
  $humid.textContent = humid;
  var wind = "Wind Speed: " + city.wind.speed + " MPH";
  var $wind = document.createElement("p");
  $wind.textContent = wind;
  var uvInd = "UV Index: ";
  let $uvInd = document.createElement("p");
  $uvInd.textContent = uvInd;
  let $span = document.createElement("span");
  $span.textContent = state.currentCity.uvIndex.value;
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
  title.textContent = "5-Day Forecast ";
  wrapper.appendChild(title);
  let forecastCity = state.currentCity.forecast;
  for (let i = 4; i < forecastCity.list.length; i = i + 8) {
    let dayForcast = forecastCity.list[i];
    generateFiveDays(dayForcast);
    wrapper.appendChild(dayForcast);
  }
};

var generateFiveDays = function (forecast) {
  let $divPerDay = document.createElement("div");
  $divPerDay.setAttribute("class", "bubble");
  let date = moment(forecast.dt).calendar();
  let $date = document.createElement("h5");
  $date.textContent = date;
  //var dateString = moment().calendar();
  let icon = forecast.weather[0].icon;
  let iconUrl = genIconUrl(icon);
  let $icon = document.createElement("img");
  $icon.setAttribute("src", iconUrl);
  let temp = forecast.main.temp;
  let $temp = document.createElement("p");
  $temp.textContent = "Temp: " + temp + "F";
  let humid = forecast.main.humidity;
};

renderPage();
