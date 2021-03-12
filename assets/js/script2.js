const WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather?q=";
const FORECAST_URL = "http://api.openweathermap.org/data/2.5/forecast?q=";
const UV_INDEX_URL = "http://api.openweathermap.org/data/2.5/uvi/forecast?lat=";
const API_KEY = "0564c081313fe54741f1983cf3dea38c";

var recoverCityList = () => {
  return [];
};

let state = {
  currentCity: { name: null, uvIndex: null, forecast: null, weather: null },
  cityList: recoverCityList(),
};

var renderPage = () => {
  renderSideBar(state.cityList, state.currentCity);
  renderMainContent(state.currentCity);
};

/**
 * SIDEBAR
 */

var renderSideBar = (cityList, currentCity) => {
  renderForm(cityList, currentCity);
  renderCitiesList(cityList);
};

var renderForm = (favCities, currentCity) => {
  var form = document.getElementById("search");
  var cityToSearch = document.getElementById("cityname");

  form.addEventListener("click", (btn) => {
    let cityName = cityToSearch.value;
    currentCity.name = cityName;
    goFetch(currentCity, favCities);
  });
};

var goFetch = function (city, favCities) {
  favCities.push(city.name);
  let cities = JSON.stringify(favCities);
  localStorage.setItem("citiesList", cities);
  var apiRequest1 =
    WEATHER_URL + city.name + "&appid=" + API_KEY + "&units=imperial";
  console.log(apiRequest1);
  renderCitiesList();
  fetch(apiRequest1)
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      var myCityWeather = response;
      console.log(myCityWeather);
      //getCurrentCity(myCityWeather);
      city.weather = myCityWeather;

      let lat = myCityWeather.coord.lat;
      let lon = myCityWeather.coord.lon;
      let url = UV_INDEX_URL + lat + "&lon=" + lon + "&appid=" + API_KEY;
      fetch(url)
        .then(function (response) {
          return response.json();
        })
        .then(function (response) {
          var uvInd = response;
          console.log(uvInd);
          //getUVIndex(uvInd);
          city.uvIndex = uvInd;
          renderWeatherNow();
        });
    });
  var apiRequest2 =
    FORECAST_URL + city.name + "&appid=" + API_KEY + "&units=imperial";
  fetch(apiRequest2)
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      var fiveDaysForecast = response;
      console.log(fiveDaysForecast);
      // getCurrentForecast(fiveDaysForecast);
      city.forecast = fiveDaysForecast;
      renderFiveDays();
    });
};

var renderCitiesList = (cityList) => {};

/**
 * MAIN CONTENT
 */

var renderMainContent = (currentCity) => {
  renderWeatherNow(currentCity);
  renderFiveDays(currentCity);
};

var renderWeatherNow = (currentCity) => {};

var renderFiveDays = (currentCity) => {};

renderPage();
