
var searchBtn = $('#searchBtn');
var requestUrl = 'https://api.openweathermap.org/data/3.0/onecall'
var appKey = '?appid=a484d3fb0652e567788e79a914828975'//first parameter
var lat = '&lat='
var lon = '&lon='
var geoUrl = 'http://api.openweathermap.org/geo/1.0/direct'
var cityGeo = '&q='

console.log('Weather.js is connected');

function firstFetch(userCity){
    console.log(geoUrl + appKey + cityGeo + userCity);
    fetch(geoUrl + appKey + cityGeo + userCity)// promise based
    .then(function(response){
      return response.json(); // parse the response data
    })
    .then(function(data) { // data should be an array or an object
      console.log(data);
      var image = data.avatar_url;
      var repoUrl = data.repos_url;
      // create
      var imgEl = $('<img>');
  
      // text/attr
      imgEl.attr({
        alt: "avatar",
        src: image
      })
  
      // append
      mainEl.append(imgEl);
  
      reposFetch(repoUrl);
      
    })
  }
  
  function reposFetch(url){
    fetch(url)// promise based
    .then(function(response){
      return response.json(); // parse the response data
    })
    .then(function(data) { // data should be an array or an object
      console.log(data); // repo data
  
      for(var i = 0; i < data.length; i++){
        console.log(data[i].name);
  
        var name = data[i].name;
  
        // create
        var pEl = $('<p>');
  
        // text/attr
        pEl.text(name);
  
        // append
        mainEl.append(pEl);
  
      }
    })
  }

// fetch(requestUrl)
// .then(function(response){
//     return response.json();
// })
// .then(function(data){
//     console.log(data);
// })
// .catch(function(error){
//     console.error(error);
// });

var cityFormEl = $('#cityForm');//Form Element ID
var previousCitiesEl = $('#previousCities');//UL ID

function handleFormSubmit (event){
    event.preventDefault();
    
    var value = $('input[name=cityName]').val();//variable created to hold the value entered into the input

    firstFetch(value)//value is city

    $('input[name=cityName]').val(''); // Resets the input field after you submit city entered in input   
   
        var cityBtn = $('<button>'); //create the button

        cityBtn.text(value); //add text to the button
        
        cityBtn.attr('class','prevCities'); // add a class to the button
        
        previousCitiesEl.append(cityBtn); //Append the button to the page

    localStorage.setItem('cityArray', value.value); //

    
    }

cityFormEl.on('submit', handleFormSubmit);
