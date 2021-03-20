const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather?q=";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast?q=";
const UV_INDEX_URL = "https://api.openweathermap.org/data/2.5/uvi?lat=";
const API_KEY = "0564c081313fe54741f1983cf3dea38c";
const ICON_URL = "https://openweathermap.org/img/wn/";

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
  var form = document.getElementById("search-word");
  var cityToSearch = document.getElementById("cityname");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (cityToSearch.value === "") {
      alert("Enter a city");
      return;
    }
    let cityName = cityToSearch.value;
    currentCity.name = cityName;
    goFetch(currentCity, cityList, true);
    return false;
  });
};

var getUVClass = function (uv) {
  let uvClass;
  if (uv < 2.6) {
    uvClass = "green";
  } else if (uv < 5.6) {
    uvClass = "yellow";
  } else if (uv < 7.6) {
    uvClass = "orange";
  } else if (uv < 10.6) {
    uvClass = "red";
  } else if (uv >= 10.6) {
    uvClass = "purple";
  }
  return uvClass;
};

var repetitionAvoider = function (city, cityList) {
  if (!cityList.includes(city)) {
    cityList.push(city);
  }
};

var goFetch = function (currentCity, cityList, rerenderList) {
  let city = currentCity.name;
  if (cityList.length > 0) {
    repetitionAvoider(city.toLowerCase(), cityList);
  } else {
    cityList.push(city.toLowerCase());
  }
  let cities = JSON.stringify(cityList);
  localStorage.setItem("citiesList", cities);
  var apiRequest1 = genWeatherApiUrl(city);
  if (rerenderList) {
    renderCitiesList(cityList);
  }
  fetch(apiRequest1)
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      var myCityWeather = response;
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
  var $name = document.createElement("button");
  $name.textContent = city.toProperCase();
  $name.setAttribute(
    "class",
    "list-group-item list-group-item-action secondary"
  );
  $name.setAttribute("type", "button");
  $name.setAttribute("data-bs-toggle", "list");

  $name.addEventListener("click", (btn) => {
    state.currentCity.name = city;
    goFetch(state.currentCity, state.cityList);
  });
  if (city === state.currentCity?.name?.toLowerCase()) {
    $name.setAttribute(
      "class",
      "list-group-item list-group-item-action secondary active"
    );
  }
  return $name;
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
  $container.innerHTML = "";
  let weatherNow = state.currentCity.weather;
  let data = generateWeatherNow(weatherNow);
  for (i = 0; i < data.length; i++) {
    let newDiv = document.createElement("div");
    newDiv.appendChild(data[i]);
    $container.appendChild(newDiv);
  }
};

var generateWeatherNow = function (city) {
  let $bar = document.createElement("div");
  let $title = document.createElement("h2");
  var dateString = moment.unix(city.dt).calendar();
  var imgWrap = document.createElement("div");
  imgWrap.setAttribute("class", "shadow p-0 rounded float-end bg-info");
  let icon = city.weather[0].icon;
  let $img = document.createElement("img");
  let imgUrl = genIconUrl(icon);
  $img.setAttribute("src", imgUrl);
  $img.setAttribute("class", "little");
  imgWrap.appendChild($img);
  var title = city.name + "  " + dateString + "   ";
  $title.textContent = title;
  $bar.appendChild($title);
  $bar.appendChild(imgWrap);
  let $temp = document.createElement("p");
  var temp = "Temperature : " + city.main.temp + " ºF";
  $temp.textContent = temp;
  let $humid = document.createElement("p");
  var humid = "Humidity : " + city.main.humidity;
  $humid.textContent = humid;
  var wind = "Wind Speed : " + city.wind.speed + " MPH";
  var $wind = document.createElement("p");
  $wind.textContent = wind;
  var uvInd = "UV Index : ";
  let $uvInd = document.createElement("p");
  $uvInd.textContent = uvInd;
  let $span = document.createElement("span");
  let uv = state.currentCity.uvIndex.value;
  $span.textContent = uv;
  let spanClass = getUVClass(uv);
  $span.setAttribute("class", `badge rounded-pill ${spanClass}`);
  $uvInd.appendChild($span);
  let currentData = [$bar, $temp, $humid, $wind, $uvInd];
  return currentData;
};

var renderFiveDays = function () {
  let forecast = document.getElementById("weather-five");
  forecast.innerHTML = "";
  let title = document.createElement("h3");
  let wrapper = document.createElement("div");
  wrapper.setAttribute("class", "card-group d-flex align-items-start mb-5");
  title.textContent = "5-Day Forecast ";
  forecast.appendChild(title);
  let forecastCity = state.currentCity.forecast;
  for (let i = 4; i < forecastCity.list.length; i = i + 8) {
    let dayForcast = forecastCity.list[i];
    let forecastEls = generateFiveDays(dayForcast);
    wrapper.appendChild(forecastEls);
  }
  forecast.appendChild(wrapper);
};

var generateFiveDays = function (forecast) {
  let $divPerDay = document.createElement("div");
  $divPerDay.setAttribute(
    "class",
    "card text-white bg-primary m-3 rounded p-3"
  );
  let date = moment.unix(forecast.dt).format("MMM Do YY");
  let $date = document.createElement("h6");
  $date.setAttribute("class", "text-end fw-bolder");
  $date.textContent = date;
  //var dateString = moment().calendar();
  let icon = forecast.weather[0].icon;
  let iconUrl = genIconUrl(icon);
  let $icon = document.createElement("img");
  $icon.setAttribute("src", iconUrl);
  $icon.setAttribute("class", "little");
  let temp = forecast.main.temp;
  let $temp = document.createElement("p");
  $temp.textContent = "Temp :    " + temp + "ºF";
  let humid = forecast.main.humidity;
  let $humid = document.createElement("p");
  $humid.textContent = "Humidity : " + humid + "%";
  let elements = [$date, $icon, $temp, $humid];
  elements.forEach((element) => $divPerDay.appendChild(element));
  return $divPerDay;
};

renderPage();
