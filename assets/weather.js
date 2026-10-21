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

    // console.log(data.city.timezone);

    const noonForecasts = data.list.filter((item) => {
      // Add the searched city's UTC offset (in seconds) to the
      // forecast timestamp to calculate the city's local clock time.
      // localtimeStamp is now the same timezone as city and not UTC
      const localTimestamp = item.dt + data.city.timezone;

      // Convert seconds to milliseconds (* 1000), then create a Date object.
      // Unix timestamps represent time since January 1, 1970, UTC.
      const localDate = new Date(localTimestamp * 1000);

      // Extract the hour (0–23) from the adjusted timestamp.
      // Use getUTCHours() to avoid applying the browser's timezone.
      const localHour = localDate.getUTCHours();
      // console.log(`UTC HOURS ${localDate.getUTCHours()}`);
      // console.log(`getHours ${localDate.getHours()}`);

      // Keep only forecasts for 12 PM (noon) in the searched city.
      return localHour === 11;
    });

    console.log(noonForecasts.length);
    // console.log(noonForecasts);

    // console.log(
    //   noonForecasts.map((item) => {
    //     const localDate = new Date((item.dt + data.city.timezone) * 1000);
    //     return localDate.getUTCHours();
    //   }),
    // );

    // console.log(data)
    // console.log(data.list.slice(0, 8).map((item) => item.dt_txt));
    // console.log(data.list.slice(0, 8));
    // console.log(data.list.length);

    for (let i = 0; i < noonForecasts.length; i += 1) {
      // Next 5 lines pull the data elements from OpenWeather
      const icon = noonForecasts[i].weather[0].icon; // weather icon
      const temp = noonForecasts[i].main.temp;
      const windSpeed = noonForecasts[i].wind.speed;
      const humidity = noonForecasts[i].main.humidity;
      const currentDate = dayjs(noonForecasts[i].dt_txt).format("MM/D/YYYY");

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
    }
    // console.log("IP GEO ", data);
    document.getElementById("currentCityName").textContent =
      data.city + dayjs().format("(MM/D/YYYY");
    // call getWeatherInfo using city found with ip address
    getWeatherInfo(data.city);
  } catch (error) {
    console.log(error.message, error);
  }
};
locationLookup();
