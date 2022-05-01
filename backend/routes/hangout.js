const express = require("express");
const router = express.Router();
const axios = require("axios");

const Hangout = require("../models/hangout");

let apiKey = process.env.GOOGLE_API_KEY;
let baseUrl = `https://maps.googleapis.com/maps/api/`;

const types = [
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

/**
 * Store user stuff in MongoDB
 * Return user ID to Angular
 */
router.post("/create", (req, res) => {
    const formData = req.body;

    const hangout = new Hangout({
        date: formData.date,
        time: formData.time,
        commute: formData.commute,
        friends: [
            {
                emoji: formData.friend1.emoji,
                address: formData.friend1.address,
            },
            {
                emoji: formData.friend2.emoji,
                address: formData.friend2.address,
            },
            {
                emoji: formData.friend3.emoji,
                address: formData.friend3.address,
            },
        ],
    });

    hangout
        .save()
        .then((result) => {
            // console.log(result);
            res.status(201).json({
                message: "Hangout created!",
                hangoutId: result._id,
            });
            console.log("created!");
        })
        .catch((err) => {
            console.log(err),
                res.status(500).json({
                    error: err,
                });
        });
});

/**
 * Google Maps API calls + data pre-processing
 */
router.get("/:id", (req, res) => {
    Hangout.findOne({ _id: req.params.id })
        .then((hangoutDocument) => {
            // google maps stuff
            // 1. Convert street addresses to Lat/Long (3 addresses)
            let latLongArr = [];
            // console.log(hangoutDocument);
            let addr = [
                "647 Roberts Ave Glenside PA 19038",
                "3141 Chestnut Street Philadelphia PA 19104",
                "1913 Hamilton St Philadelphia PA 19130",
            ];


            for (let i = 0; i < hangoutDocument.friends.length; i++) {
                console.log(hangoutDocument.friends[i].address);
                let temp = streetAddressToLatLong(
                    hangoutDocument.friends[i].address
                );
                latLongArr.push(temp);
                // console.log(`friend a`);
            }
            console.log(latLongArr);
            console.log("step 1");

            // 2. Calculate center coordinate
            midpointLatLong = calculateCenterCoordinate(latLongArr);
            console.log("step 2");

            // 3. Get hangout spots
            finalHangoutSpots = getHangoutSpots(midpointLatLong);
            console.log("step 3");

            // 4. Add spots to db
            console.log(finalHangoutSpots);
            res.json({ message: "Hangout info fetched!" });
        })
        .catch((err) => {
            res.status(404).json({ message: "Hangout does not exist!" });
            console.log("Error with GETting Hangouts");
        });
});

// Google Maps API Functions
// Calculates distance between two points
function directionsMetrics(origin, destination, mode) {
    // default is driving, but we can provide transit as well
    spaceReplacedAddress = origin.replace(" ", "%20");
    axios
        .get(
            baseUrl +
                `directions/json?origin=${spaceReplacedAddress}&destination=${destination}&key=${apiKey}&mode=${mode}`
        )
        .then(function (response) {
            //console.log(response.routes)
            console.log(response.data.routes[0].legs[0].distance.text); // returns distance in text, e.g. 15.3 mi
            console.log(response.data.routes[0].legs[0].duration.text); // returns duration in seconds, e.g. 2131 for 36 mins
        });
}

//address is the street address as a string
async function streetAddressToLatLong(address) {
    spaceReplacedAddress = address.replace(" ", "%20");
    axios(
        baseUrl + `geocode/json?address=${spaceReplacedAddress}&key=${apiKey}`
    ).then(function (response) {
        //console.log(response.data.results[0].geometry.location);
        //console.log(`Geocode recieved`);
        //console.log(`Returning: lat as ${response.results}`);
        //console.log(`Returning: long as ${response.results[0].geometry.location.lng}`);
        return {
            lat: response.data.results[0].geometry.location.lat,
            lng: response.data.results[0].geometry.location.lng,
        };
    });
    /* return {
        lat: resp.data.results[0].geometry.location.lat,
        lng: resp.data.results[0].geometry.location.lng,
    }; */
}

//arrayOfLatLong has array of JSON objects in the form of {lat:number, lng:number}
function calculateCenterCoordinate(arrayOfLatLong) {
    let latSum = 0;
    let longSum = 0;
    // console.log("center 1");
    for (let i = 0; i < arrayOfLatLong.length; i++) {
        // console.log(`center i ${i}`);
        //console.log(arrayOfLatLong[i]);
        latSum += arrayOfLatLong[i].lat;
        longSum += arrayOfLatLong[i].lng;
    }
    return {
        lat: latSum / arrayOfLatLong.length,
        lng: longSum / arrayOfLatLong.length,
    };
}

//{lat:number, lng:number} for latLongAddress
async function getHangoutSpots(latLongAddress) {
    let hangoutOptions = [];
    for (let i = 0; i < types.length; i++) {
        const resp = await axios(
            baseUrl +
                `place/nearbysearch/json?location=${latLongAddress.lat},${latLongAddress.lng}&radius=8000&key=${apiKey}&type=${types[i]}`
        );
        if (resp.data.results[0]) {
            hangoutOptions.push(resp.data.results[0]);
        }
    }

    filteredHangoutList = filterHangoutOptions(hangoutOptions);

    return filteredHangoutList;
}

/**
 * filter relevant fields
 * ranking hangout options (default: )
 */
function filterHangoutOptions(hangoutList) {
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

module.exports = router;
