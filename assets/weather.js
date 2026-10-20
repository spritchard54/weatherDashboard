var searchBtn = $("#searchBtn");
var appKey = "a484d3fb0652e567788e79a914828975";
var lat = "&lat=";
var lon = "&lon=";
var today = dayjs().format(" (MM/D/YYYY)");
const cityFormEl = document.getElementById("cityFormEl");
const previousCitiesEl = document.getElementById("previousCitiesEl");
var cityArray = JSON.parse(localStorage.getItem("cityArray")) || [];
const dayBlocks = document.getElementById("dayBlocks");
const weatherIconEl = document.getElementById("weatherIcon");

// Begin user inputs via form
const handleFormSubmit = (event) => {
  event.preventDefault();
  //clears previous days from dayblocks when submitting a new city
  dayBlocks.innerHTML = "";

  //variable created to hold the value entered into the input
  const userCity = document.getElementById("cityName").value.trim();
  if (userCity === "") {
    alert("Enter a city name to see the weather.");
    // Prevent empty value from being saved in local storage or appearing in previous cities
    return;
  }

  cityArray.push(userCity);

  // Resets the input field after you submit city entered in input
  document.getElementById("cityName").value = "";

  const cityBtn = document.createElement("button");
  cityBtn.textContent = userCity;
  cityBtn.classList.add("prevCities");

  cityBtn.addEventListener("click", () => {
    getWeatherInfo(userCity);
    dayBlocks.innerHTML = ""; // clears previous days when click on previous cities
  });
  previousCitiesEl.append(cityBtn);

  localStorage.setItem("cityArray", JSON.stringify(cityArray)); //
  console.log(cityArray);

  getWeatherInfo(userCity);
};

cityFormEl.addEventListener("submit", handleFormSubmit);

// Function below retrieves and displays previous cities

const getPrevCities = () => {
  cityArray.forEach((currentValue) => {
    // console.log(currentValue)
    const cityBtn = document.createElement("button");
    cityBtn.textContent = currentValue;
    cityBtn.classList.add("prevCities");

    previousCitiesEl.append(cityBtn);

    cityBtn.addEventListener("click", () => {
      dayBlocks.innerHTML = "";
      getWeatherInfo(currentValue);
    });
  });
};

getPrevCities();

const getWeatherInfo = async (userCity) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${userCity}&appid=${appKey}&units=imperial`,
    );
    if (!response.ok) {
      throw new Error("There was a problem with the response.");
    }
    const data = await response.json();
    const temp = data.main.temp;
    const windSpeed = data.wind.speed;
    const humidity = data.main.humidity;
    const cityName = data.name;
    const icon = data.weather[0].icon; // weather icon
    weatherIconEl.src = `https://openweathermap.org/img/w/${icon}.png`;
    document.getElementById("currentTemp").textContent = `${temp}°F`;
    document.getElementById("currentWind").textContent = `${windSpeed} MPH`;
    document.getElementById("currentHumidity").textContent = `${humidity}%`;
    document.getElementById("currentCityName").textContent =
      `${cityName} today`;

    getFiveDayWeather(data.coord.lat, data.coord.lon);
  } catch (error) {
    console.log(error, error.message);
  }
};

//begin data fetch for five-day forecast

const getFiveDayWeather = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${appKey}&units=imperial`,
    );

    if (!response.ok) {
      throw new Error("Houston we have a problem! With the Response.");
    }

    const data = await response.json();

    console.log(data.list.slice(0, 8).map((item) => item.dt_txt));
    for (var i = 6; i < data.list.length; i = i + 8) {
      // Next 4 lines pull the data elements from OpenWeather
      const icon = data.list[i].weather[0].icon; // weather icon
      const temp = data.list[i].main.temp;
      const windSpeed = data.list[i].wind.speed;
      const humidity = data.list[i].main.humidity;
      const currentDate = dayjs(data.list[i].dt_txt).format("MM/D/YYYY");

      // Creates a new empty div to hold weather data
      const weatherTile = document.createElement("div");

      //Appends the weather tiles to the empty dayBlock DIV
      dayBlocks.append(weatherTile);

      const currentDateStamp = document.createElement("h2");
      const weatherTileIcon = document.createElement("img"); //weather icon
      const weatherTileTemp = document.createElement("p");
      const weatherTileWind = document.createElement("p");
      const weatherTileHumidity = document.createElement("p");

      currentDateStamp.textContent = currentDate;
      weatherTileTemp.textContent = `Temp: ${temp}°F`;
      weatherTileWind.textContent = `Wind: ${windSpeed} MPH`;
      weatherTileHumidity.textContent = `Humidity: ${humidity}%`;
      weatherTileIcon.src = `https://openweathermap.org/img/w/${icon}.png`; //weather icon

      weatherTile.classList.add("day"); //Styles the weatherTiles
      weatherTileTemp.classList.add("tilePara");
      weatherTileWind.classList.add("tilePara");
      weatherTileHumidity.classList.add("tilePara");

      weatherTile.append(currentDateStamp);
      weatherTile.append(weatherTileIcon); //weather icon
      weatherTile.append(weatherTileTemp);
      weatherTile.append(weatherTileWind);
      weatherTile.append(weatherTileHumidity);
    }
  } catch (error) {
    console.log(error.message);
  }
};

// use ipgeo to get user's city from their ip address
const locationLookup = async () => {
  const response = await fetch(
    "https://api.ipgeolocation.io/ipgeo?apiKey=5dbe00f354b141a2aae179954060f69d&fields=city, zipcode",
  );
  try {
    const data = await response.json();
    if (!response.ok) {
      throw new Error("There was a problem with the GEO response");
      return;
    }
    console.log("IP GEO ", data);
    $("#currentCityName").text(data.city + dayjs().format(" (MM/D/YYYY)"));
    // call getWeatherInfo using city found with ip address
    getWeatherInfo(data.city);
  } catch (error) {
    console.log(error.message, error);
  }
};
locationLookup();
