
var searchBtn = $('#searchBtn');
var requestUrl = 'https://api.openweathermap.org/data/3.0/onecall?lat={}&lon={}&exclude={part}&appid={a484d3fb0652e567788e79a914828975}'

fetch(requestUrl)
.then(function(response){
    return response.json();
})
.then(function(data){
    console.log(data);
})
.catch(function(error){
    console.error(error);
});

var cityFormEl = $('#cityForm');//Form Element ID
var previousCitiesEl = $('#previousCities');//UL ID

function handleFormSubmit (event){
    event.preventDefault();
    
    var value = $('input[name=cityName]').val();

    $('input[name=cityName]').val(''); // Resets the input field after you submit   
   
        var cityBtn = $('<button>'); //create the button

        cityBtn.text(value); //add text to the button
        
        cityBtn.attr('class','prevCities'); // add a class to the button
        
        previousCitiesEl.append(cityBtn); //Append the button to the page

    localStorage.setItem('cityArray', value); //

    
    }

cityFormEl.on('submit', handleFormSubmit);

