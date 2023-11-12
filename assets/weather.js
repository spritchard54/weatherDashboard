console.log('Weather.js is connected');

var searchBtn = $('#searchBtn');
var requestUrl = 'https://api.openweathermap.org/data/2.5/forecast?'
var appKey = 'a484d3fb0652e567788e79a914828975'//first parameter
var lat = '&lat='
var lon = '&lon='
var geoUrl = 'http://api.openweathermap.org/geo/1.0/direct?'
var cityGeo = '&q='
var limit = '&limit=1'


var cityFormEl = $('#cityForm');//Form Element ID
var previousCitiesEl = $('#previousCities');//UL ID
var cityArray = JSON.parse(localStorage.getItem('cityArray')) || []



function handleFormSubmit(event) {
  event.preventDefault();
  var value = $('input[name=cityName]').val();//variable created to hold the value entered into the input
  cityArray.push(value);

  if (value == "") {
    alert("Enter a city name to see the weather.");
    return false;
  }


  // firstFetch(value)//value is city
  $('input[name=cityName]').val(''); // Resets the input field after you submit city entered in input   
  var cityBtn = $('<button>');

  cityBtn.text(value);
  cityBtn.attr('class', 'prevCities');
  cityBtn.on('click', function () {
    getWeatherInfo(value);
  })
  previousCitiesEl.append(cityBtn);

  localStorage.setItem('cityArray', JSON.stringify(cityArray)); //
  console.log(cityArray);

  getWeatherInfo(value);
}

cityFormEl.on('submit', handleFormSubmit);

function getPrevCities() {
  cityArray.forEach(function (currentValue) {
    // console.log(currentValue)
    var cityBtn = $('<button>');
    cityBtn.text(currentValue);
    cityBtn.attr('class', 'prevCities');
    previousCitiesEl.append(cityBtn);
    cityBtn.on('click', function () {
      getWeatherInfo(currentValue);
    })
  });
}

getPrevCities()


function getWeatherInfo(userCity) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${userCity}&appid=${appKey}&units=imperial`)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      var temp = data.main.temp;
      var windSpeed = data.wind.speed;
      var humidity = data.main.humidity;
      var cityName = data.name;
      
      $('#currentTemp').text(temp +' °F');
      $('#currentWind').text(windSpeed +' MPH');
      $('#currentHumidity').text(humidity +' %');
      $('#cityName').text(cityName);
      
      console.log(data.name);
      
      getFiveDayWeather(data.coord.lat, data.coord.lon)

    })

}

function getFiveDayWeather(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${appKey}&units=imperial`)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // console.log(data);
      for (var i = 0; i < data.list.length; i = i + 8) {
        var temp = data.list[i].main.temp;
        var windSpeed = data.list[i].wind.speed;
        var humidity = data.list[i].main.humidity;

        console.log(data.list[i])

          var dayBlocks = $('#dayBlocks');
          var weatherTile = $('<div>');
              weatherTile.addClass('day');
              weatherTile.text("Temp: " + temp +"°F");
              dayBlocks.append(weatherTile);

          // var tempLi = $('tempLi');
          // tempLi.text('some text');
          // tempLi.append(temp);
      }
    })
}