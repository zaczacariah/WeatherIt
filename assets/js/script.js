// Ignoring that this wouldnt be best practice and would usually be fetched from backend where we would use process.env.
var KEY = 'af22f589c706c6e9db1fac3c65d9d723';


var form = $('#search');

form.on('submit', getCity);


function getExisting(){
    if(localStorage.getItem('lastCity') != undefined){
        var data = localStorage.getItem('lastCity') || '';
        
        if(data == ''){
            return;
        }

        data = JSON.parse(data);

        var weatherData = data['weatherData'];
        var city = data['city'];

  
        if(!weatherData || !city){
            return;
        }

        populateToday(weatherData.today, city);
        var remainingWeather = weatherData;
        delete remainingWeather['today'];

        populateFiveDay(remainingWeather);
    }
}
getExisting();

async function addHistory(data) {

    console.log('Weather Data in add history: ');
    console.log(data.weatherData);
    var history = $('.history');
    var button = $('<button>').text(data.city);
    button.data('weatherData', data.weatherData);
    button.data('city', data.city);
    button.attr('id', `#history-${data.city}`);
    button.attr('onclick', 'cityButton(event)');
    history.append(button);
}

function cityButton({ target }) {
    var city = $(target).data('city');
    var weatherData = $(target).data('weatherData');
    populateToday(weatherData.today, city);
    var remainingWeather = { ...weatherData };
    delete remainingWeather['today'];
    populateFiveDay(remainingWeather);
}


async function getCity(event) {
    event.preventDefault();
    var { target } = event;

    var input = $(target).children()[0];
    var city = $(input).val()

    $('#city').val('')
    
    if(city == {} || city == undefined) {
        console.error("No Search Entry");
        return;
    }

    var coord = await getCoord(city);


    if(coord == 'No City Found') {
        return 'Coordinates Not Found';
    }

    var { lat, lon } = coord;

    var weatherData = await getWeather(lat, lon) || {};

    if(weatherData == {}) {
        console.error("No Weather Returned");
        return;
    }

    
    var dataToStore = {
        city: city,
        weatherData: { ...weatherData }
    };
    
    localStorage.setItem('lastCity', JSON.stringify(dataToStore));
    await addHistory(dataToStore);

    populateToday(weatherData.today, city);
    var remainingWeather = { ...weatherData };
    delete remainingWeather['today'];

    populateFiveDay(remainingWeather);

    
    
}

async function getCoord(city) {
    try{
        city = encodeURI(city);
        var url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${KEY}`
        var response = await fetch(url);

        if (response.status !== 200) {
            throw new Error("Failed to fetch coordinate data");
        }

        

            var data = await response.json();

            if(data.length == 0){
                return 'No City Found';
            }

            var lat = data[0].lat;
            var lon = data[0].lon;

            return { lat,lon };
        

    } catch(error) {

        console.error(error);

    }
}

async function getWeather(lat, lon) {
    try {

        url =  `http://api.openweathermap.org/data/2.5/forecast?units=metric&lat=${lat}&lon=${lon}&appid=${KEY}`;
        

        var response = await fetch(url);

        if (response.status !== 200) {
            throw new Error("Failed to fetch weather data");
        }
        
        var data = await response.json();

        return { 'today': data.list[1], 'dayOne': data.list[6], 'dayTwo': data.list[14], 'dayThree': data.list[22], 'dayFour': data.list[25], 'dayFive': data.list[30] };

        

    } catch(error) {
        console.error(error);
    }
}

function populateToday(weatherToday, city){

    var today = $('.today');
    today.text('');
    var span = $('<span>');

    const date = new Date(weatherToday.dt_txt);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // January is 0!
    const year = date.getFullYear();


    var h3 = $('<h3>').text(`${city} (${day}/${month}/${year})`);
    var icon = $('<img>').attr('src', `https://openweathermap.org/img/wn/${weatherToday.weather[0].icon}@2x.png`);


    span.append(h3, icon);

    var temp = $('<p>').text(`Temp: ${weatherToday.main.temp} °C`);
    var wind = $('<p>').text(`Wind: ${weatherToday.wind.speed} KPH`);
    var humidity = $('<p>').text(`Humidity: ${weatherToday.main.humidity}%`);


    today.append(span, temp, wind, humidity);
}

function populateFiveDay(weather){


    var cards = $('.cards');
    cards.text('');
    for (var obj in weather){
        var dayItem = weather[obj];
        var imgUrl = `https://openweathermap.org/img/wn/${dayItem.weather[0].icon}@2x.png`;
        var card = $('<div>').addClass('card');
        
        var dateFormat = new Date(dayItem.dt_txt);
        var day = dateFormat.getDate().toString().padStart(2, '0');
        var month = (dateFormat.getMonth() + 1).toString().padStart(2, '0'); // January is 0!
        var year = dateFormat.getFullYear();

        var date = $('<p>').text(`${day}/${month}/${year}`);
        var img = $('<img>').attr('src', imgUrl)
        var temp = $('<p>').text(`Temp: ${dayItem.main.temp} °C`);
        var wind = $('<p>').text(`Wind: ${dayItem.wind.speed} KPH`);
        var humidity = $('<p>').text(`Humidity: ${dayItem.main.humidity}%`);

        card.append(date, img, temp, wind, humidity);

        cards.append(card);
    }
    

}


