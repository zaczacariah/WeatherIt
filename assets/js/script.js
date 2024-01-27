// Ignoring that this wouldnt be best practice and would usually be fetched from backend where we would use process.env.
var KEY = 'af22f589c706c6e9db1fac3c65d9d723';

var form = $('#search');

// Handle searches
form.on('submit', goSearch);



// Run City Search
async function goSearch(event) {
    event.preventDefault();
    var { target } = event;

    var input = $(target).children()[0];
    var city = $(input).val()

    $('#city').val('')
    
    // Check for undefined values and trigger error
    if(city == {} || city == undefined) {
        console.error("No Search Entry");
        return;
    }

    // Get Coordinates of City  
    var coord = await getCoord(city);

    // break if city doesn't exist
    if(coord == 'No City Found') {
        return 'Coordinates Not Found';
    }

    // Destructure coord
    var { lat, lon } = coord;

    
    
    
}

// Get Coordinates
async function getCoord(city) {
    try{
        // Accounting for spaces in city name e.g. San Deigo needs %20
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



