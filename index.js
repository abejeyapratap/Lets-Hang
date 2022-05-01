const express = require("express");
const app = express();
const port = 3001;
const axios = require("axios"); //TODO remove
let apiKey = process.env.GOOGLE_API_KEY; //TODO remove
let baseUrl = `https://maps.googleapis.com/maps/api/`; //TODO remove

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});

//{lat:40, lng:-75}
async function getHangoutSpots(latLongAddress) {
    types = [
        "shopping_mall",
        "zoo",
        "amusement_park",
        "aquarium",
        "park",
        "bowling_alley",
        "cafe",
        "museum",
        "tourist_attraction",
    ];
    let hangoutOptions = [];
    for (let i = 0; i < types.length; i++) {
        const resp = await axios(
            baseUrl +
                `place/nearbysearch/json?location=${latLongAddress.lat},${latLongAddress.lng}&radius=8000&key=${apiKey}&type=${types[i]}`
        );
        /* .then(function (response) {
            console.log(`Hangouts for ${types[i]}: ${response.data.results}`);
            contole.log(type)
            hangoutOptions.concat(response.data.results);
            console.log(hangoutOptions.length);
            console.log(hangoutOptions);
        }); */
        // console.log(resp.data.results[0]);
        if (resp.data.results[0]) {
            hangoutOptions.push(resp.data.results[0]);
        }
    }

    // console.log("Hangout length");
    // console.log(hangoutOptions.length);
    // console.log(hangoutOptions);
    filteredHangoutList = filterHangoutOptions(hangoutOptions);

    console.log(filteredHangoutList);
    return filteredHangoutList;
}

/**
 * filter relevant fields
 * ranking hangout options (default: )
 */
function filterHangoutOptions(hangoutList) {
    // console.log(result);
    /* hangoutList = hangoutList.filter(function( element ) {
        return element != undefined;
     }); */

    let places = [];

    hangoutList.forEach((element) => {
        // console.log(element.name)
        let hangoutPlace = {};
        hangoutPlace.name = element.name;
        hangoutPlace.rating = element.rating;
        hangoutPlace.vicinity = element.vicinity;
        hangoutPlace.lat = element.geometry.location.lat;
        hangoutPlace.long = element.geometry.location.lng;
        places.push(hangoutPlace);
    });

    return places;
}

getHangoutSpots({ lat: 40, lng: -75 });
