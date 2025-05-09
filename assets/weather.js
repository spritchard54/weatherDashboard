var searchBtn = $("#searchBtn");
var appKey = "a484d3fb0652e567788e79a914828975";
var lat = "&lat=";
var lon = "&lon=";
var today = dayjs().format(" (MM/D/YYYY)");
var cityFormEl = $("#cityForm"); //Form Element ID
var previousCitiesEl = $("#previousCities"); //UL ID
var cityArray = JSON.parse(localStorage.getItem("cityArray")) || [];


// Begin user inputs via form
function handleFormSubmit(event) {
  event.preventDefault();
  dayBlocks.innerHTML = ""; //clears previous days from dayblocks when submitting a new city
  var value = $("input[name=cityName]").val(); //variable created to hold the value entered into the input
  cityArray.push(value);

  if (value == "") {
    alert("Enter a city name to see the weather.");
    // Prevent empty value from being saved in local storage or appearing in previous cities
    return false;
  }

  $("input[name=cityName]").val(""); // Resets the input field after you submit city entered in input

  var cityBtn = $("<button>");
  cityBtn.text(value);
  cityBtn.addClass("prevCities");

  cityBtn.on("click", function () {
    getWeatherInfo(value);

    dayBlocks.innerHTML = ""; // clears previous days when click on previous cities
  });
  previousCitiesEl.append(cityBtn);

  localStorage.setItem("cityArray", JSON.stringify(cityArray)); //
  console.log(cityArray);

  getWeatherInfo(value);
}

cityFormEl.on("submit", handleFormSubmit);

// Function below retrieves and displays previoys cities

function getPrevCities() {
  cityArray.forEach(function (currentValue) {
    // console.log(currentValue)
    var cityBtn = $("<button>");

    cityBtn.text(currentValue);
    cityBtn.attr("class", "prevCities");

    previousCitiesEl.append(cityBtn);

    cityBtn.on("click", function () {
      dayBlocks.innerHTML = "";
      getWeatherInfo(currentValue);
    });
  });
}

getPrevCities();

//begin fetch data from Open Weather
function getWeatherInfo(userCity) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${userCity}&appid=${appKey}&units=imperial`
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      var temp = data.main.temp;
      var windSpeed = data.wind.speed;
      var humidity = data.main.humidity;
      var cityName = data.name;
      var icon = data.weather[0].icon; // weather icon

      //display current condition results of data fetch

      $("#weatherIcon").attr(
        "src",
        "http://openweathermap.org/img/w/" + icon + ".png"
      ); //weather icon
      $("#weatherIcon").append(icon); //weather icon

      $("#currentTemp").text(temp + " °F");
      $("#currentWind").text(windSpeed + " MPH");
      $("#currentHumidity").text(humidity + " %");
      $("#currentCityName").text(cityName + today);
      // console.log(data.name);
      getFiveDayWeather(data.coord.lat, data.coord.lon);
    });
}

//begin data fetch for five-day forecast

function getFiveDayWeather(lat, lon) {
  fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${appKey}&units=imperial`
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // console.log(data);

      for (var i = 6; i < data.list.length; i = i + 8) {
        // Next 4 lines pull the data elements from OpenWeather
        var icon = data.list[i].weather[0].icon; // weather icon
        var temp = data.list[i].main.temp;
        var windSpeed = data.list[i].wind.speed;
        var humidity = data.list[i].main.humidity;
        var currentDate = data.list[i].dt_txt;
        currentDate = dayjs(currentDate).format("MM/D/YYYY");

        // console.log(currentDate);
        // console.log(data.list[i]);

        // Selects empty div in HTML where weatherTiles are dynamicaly inserted
        var dayBlocks = $("#dayBlocks");
        // Creates a new empty div to hold weather data
        var weatherTile = $("<div>");
        //Appends the weather tiles to the empty dayBlock DIV
        dayBlocks.append(weatherTile);

        var currentDateStamp = $("<h2>");
        var weatherTileIcon = $("<img>"); //weather icon
        var weatherTileTemp = $("<p>");
        var weatherTileWind = $("<p>");
        var weatherTileHumidity = $("<p>");

        currentDateStamp.text(currentDate);
        weatherTileTemp.text("Temp: " + temp + " °F");
        weatherTileWind.text("Wind: " + windSpeed + " MPH");
        weatherTileHumidity.text("Humidity: " + humidity + " %");
        weatherTileIcon.attr(
          "src",
          "http://openweathermap.org/img/w/" + icon + ".png"
        ); //weather icon

        weatherTile.addClass("day"); //Styles the weatherTiles
        weatherTileTemp.addClass("tilePara");
        weatherTileWind.addClass("tilePara");
        weatherTileHumidity.addClass("tilePara");

        weatherTile.append(currentDateStamp);
        weatherTile.append(weatherTileIcon); //weather icon
        weatherTile.append(weatherTileTemp);
        weatherTile.append(weatherTileWind);
        weatherTile.append(weatherTileHumidity);
      }
    });
}

// use ipgeo to get user's city from their ip address
fetch(
  "https://api.ipgeolocation.io/ipgeo?apiKey=5dbe00f354b141a2aae179954060f69d&fields=city, zipcode"
)
  .then(function (response) {
    return response.json();
  })
  // display their city and the current day using dayjs
  .then(function (data) {
    console.log(data);  
    
    $("#currentCityName").text(data.city + dayjs().format(" (MM/D/YYYY)"));

    // add forecast columns to the page with initial content
    // for (i = 1; i < 6; i++) {
    //   var forecastColEl = $("<div>");
    //   var forecastContentEl = $("<div>");
    //   var dateEl = $("<h6>");
    //   var iconEl = $("<img>");
    //   var tempEl = $("<p>");
    //   var windEl = $("<p>");
    //   var humidityEl = $("<p>");

    //   dateEl.text(dayjs().add(i, "day").format("MM/D/YYYY"));

    //   iconEl.attr("id", "day-" + i + "-icon");

    //   tempEl.text("Temp: ");
    //   tempEl.attr("id", "day-" + i + "-temp");

    //   windEl.text("Wind: ");
    //   windEl.attr("id", "day-" + i + "-wind");

    //   humidityEl.text("Humidity: ");
    //   humidityEl.attr("id", "day-" + i + "-humidity");

    //   forecastContentEl.addClass("p-3 weather-card");
    //   forecastColEl.addClass("col");

    //   forecastContentEl.append(dateEl, iconEl, tempEl, windEl, humidityEl);
    //   forecastColEl.append(forecastContentEl);
    //   $("#forecast-row").append(forecastColEl);
    // }

    // call display forecast using city found with ip address
    getWeatherInfo(data.city);
  });
