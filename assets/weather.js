var appKey = "a484d3fb0652e567788e79a914828975";
var lat = "&lat=";
var lon = "&lon=";
var today = dayjs().format(" (MM/D/YYYY)");
const cityFormEl = document.getElementById("cityFormEl");
const previousCitiesEl = document.getElementById("previousCitiesEl");
var cityArray = JSON.parse(localStorage.getItem("cityArray")) || [];
const dayBlocks = document.getElementById("dayBlocks");
const weatherIconEl = document.getElementById("weatherIcon");

const handleFormSubmit = async (event) => {
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
  const cityName = await getWeatherInfo(userCity);

  if (!cityName) {
    return;
  }

  cityArray.push({ searchValue: userCity, cityName });

  // Resets the input field after you submit city entered in input
  document.getElementById("cityName").value = "";

  const cityBtn = document.createElement("button");
  cityBtn.textContent = cityName;
  cityBtn.classList.add("prevCities");

  cityBtn.addEventListener("click", () => {
    getWeatherInfo(userCity);
    dayBlocks.innerHTML = ""; // clears previous days when click on previous cities
  });
  previousCitiesEl.append(cityBtn);

  localStorage.setItem("cityArray", JSON.stringify(cityArray)); //
};

cityFormEl.addEventListener("submit", handleFormSubmit);

const getPrevCities = () => {
  cityArray.forEach((currentValue) => {
    const cityBtn = document.createElement("button");

    if (typeof currentValue === "string") {
      cityBtn.textContent = currentValue;
    } else {
      cityBtn.textContent = currentValue.cityName;
    }

    cityBtn.classList.add("prevCities");

    previousCitiesEl.append(cityBtn);

    cityBtn.addEventListener("click", () => {
      dayBlocks.innerHTML = "";
      const searchValue =
        typeof currentValue === "string"
          ? currentValue
          : currentValue.searchValue;

      getWeatherInfo(searchValue);
    });
  });
};

getPrevCities();

const getWeatherInfo = async (userCity) => {
  const isZipCode = /^\d{5}$/.test(userCity);


  const locationQuery = isZipCode ? `zip=${userCity},US` : `q=${userCity}`;

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?${locationQuery}&appid=${appKey}&units=imperial`,
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
      `${cityName} ${today}`;

    getFiveDayWeather(data.coord.lat, data.coord.lon);
    return cityName;
  } catch (error) {
    console.log(error, error.message);
  }
};

const getFiveDayWeather = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${appKey}&units=imperial`,
    );

    if (!response.ok) {
      throw new Error("Houston we have a problem! With the Response.");
    }

    const data = await response.json();

    const dates = data.list.map((item) => {
      const localTimestamp = item.dt + data.city.timezone;
      const localDate = new Date(localTimestamp * 1000);
      return localDate.toISOString().split("T")[0];
    });

    const uniqueDates = [...new Set(dates)];

    const selectedForecasts = [];

    uniqueDates.forEach((date) => {
      const dailyForecasts = data.list.filter((item) => {
        const localTimestamp = item.dt + data.city.timezone;
        const localDate = new Date(localTimestamp * 1000);
        const forecastDate = localDate.toISOString().split("T")[0];
        return forecastDate === date;
      });

      const closestForecast = dailyForecasts.reduce((closest, current) => {
        const localTimestamp = current.dt + data.city.timezone;
        const localDate = new Date(localTimestamp * 1000);
        const localHour = localDate.getUTCHours();
        const closestLocalTimestamp = closest.dt + data.city.timezone;
        const closestLocalDate = new Date(closestLocalTimestamp * 1000);
        const closestLocalHour = closestLocalDate.getUTCHours();

        if (Math.abs(localHour - 12) < Math.abs(closestLocalHour - 12)) {
          return current;
        }
        return closest;
      }, dailyForecasts[0]);
      selectedForecasts.push(closestForecast);
    });

    const fiveDayForecasts = selectedForecasts.slice(1);

    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    for (let i = 0; i < fiveDayForecasts.length; i += 1) {
      // Next 5 lines pull the data elements from OpenWeather
      const icon = fiveDayForecasts[i].weather[0].icon; // weather icon
      const temp = fiveDayForecasts[i].main.temp;
      const windSpeed = fiveDayForecasts[i].wind.speed;
      const humidity = fiveDayForecasts[i].main.humidity;
      const localTimestamp = fiveDayForecasts[i].dt + data.city.timezone;
      const localDate = new Date(localTimestamp * 1000);
      const year = localDate.getUTCFullYear();
      const month = localDate.getUTCMonth() + 1;
      const day = localDate.getUTCDate();
      const currentDate = `${month}/${day}/${year}`;
      const dayOfWeek = localDate.getUTCDay();
      const currentDay = weekdays[dayOfWeek];

      // Creates a new empty div to hold weather data
      const weatherTile = document.createElement("div");

      //Appends the weather tiles to the empty dayBlock DIV
      dayBlocks.append(weatherTile);

      const dayEl = document.createElement("h2");
      const currentDateStamp = document.createElement("h2");
      const weatherTileIcon = document.createElement("img"); //weather icon
      const weatherTileTemp = document.createElement("p");
      const weatherTileWind = document.createElement("p");
      const weatherTileHumidity = document.createElement("p");

      dayEl.textContent = currentDay;
      currentDateStamp.textContent = currentDate;
      weatherTileTemp.textContent = `Temp: ${temp}°F`;
      weatherTileWind.textContent = `Wind: ${windSpeed} MPH`;
      weatherTileHumidity.textContent = `Humidity: ${humidity}%`;
      weatherTileIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`; //weather icon

      weatherTile.classList.add("day"); //Styles the weatherTiles
      dayEl.classList.add("wtDay");
      weatherTileTemp.classList.add("tilePara");
      weatherTileWind.classList.add("tilePara");
      weatherTileHumidity.classList.add("tilePara");
      weatherTileIcon.classList.add("wIcon");

      weatherTile.append(dayEl);
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

const locationLookup = async () => {
  const response = await fetch(
    "https://api.ipgeolocation.io/ipgeo?apiKey=5dbe00f354b141a2aae179954060f69d&fields=city, zipcode",
  );
  try {
    const data = await response.json();
    if (!response.ok) {
      throw new Error("There was a problem with the GEO response");
    }
    getWeatherInfo(data.city);
  } catch (error) {
    console.log(error.message, error);
  }
};
locationLookup();
