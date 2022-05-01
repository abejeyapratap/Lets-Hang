const express = require("express");
const router = express.Router();
const axios = require("axios");

const Hangout = require("../models/hangout");

let apiKey = process.env.GOOGLE_API_KEY;
let baseUrl = `https://maps.googleapis.com/maps/api/`;

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
    console.log(req.params.id);
    Hangout.findOne({ _id: req.params.id })
        .then((hangoutDocument) => {
            console.log(hangoutDocument);
            res.json({ message: "Hangout info fetched!" });
            // google maps stuff

            // 1. Convert street addresses to Lat/Long
            // 2. Calculate center coordinate
            // 3. Get hangout spots
            // 4. 
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

function streetAddressToLatLong(address) {
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
}

function calculateCenterCoordinate(arrayOfLatLong) {
    let latSum = 0;
    let longSum = 0;
    for (let i = 0; i < arrayOfLatLong.length; i++) {
        latSum += arrayOfLatLong[i].lat;
        longSum += arrayOfLatLong[i].lng;
    }
    return {
        lat: latSum / arrayOfLatLong.length,
        lng: longSum / arrayOfLatLong.length,
    };
}

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
        hangoutOptions.push(resp.data.results[0]);
    }

    // console.log("Hangout length");
    console.log(hangoutOptions.length);
    console.log(hangoutOptions);
    return hangoutOptions;
}

module.exports = router;
