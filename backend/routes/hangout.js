const express = require("express");
const router = express.Router();
const axios = require("axios");
const fetch = require('node-fetch');
const Hangout = require("../models/hangout");
const { MongoClient } = require("mongodb");

let uri = "mongodb+srv://root:"+process.env.MONGO_ATLAS_PW+"@cluster0.2pizy.mongodb.net/test";
console.log(uri)
const client = new MongoClient(uri);
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

async function mongoRun(id, hangs) {
    try {
      // Connect the client to the server
      await client.connect();
      // Establish and verify connection
      await client.db("root").command({ ping: 1 });
      console.log("Connected successfully to server");

      const hangouts = client.db("lets-hang").collection("hangouts");
      console.log("ID:", id)
      const result = await hangouts.updateOne(
        { _id: `ObjectId(${id})`},
        {
          $set: {
            spots: hangs
          },
        },
        { upsert: true }
      );
      console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
      );

    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }

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
        .then((doc) => {
            let latLongArr = [];
            doc.friends.forEach(async function(element) {
                console.log(element["address"])
                let temp = await streetAddressToLatLdocumentLastShot(element["address"]);
                console.log("Temp:", temp)
                await latLongArr.push(temp);
                if (latLongArr.length == 3){
                    console.log(latLongArr)
                    midpointLatLong = await calculateCenterCoordinate(latLongArr);
                    console.log("Midpoint", midpointLatLong)

                // 3. Get hangout spots
                    finalHangoutSpots = await getHangoutSpots(midpointLatLong);
                    console.log("Final hangout spots", finalHangoutSpots)
                 // console.log("step 3");

                    mongoRun(req.params.id, finalHangoutSpots)
                
                }


            })


        })
        .catch((err) => {
            res.status(404).json({ message: "Hangout does not exist!" });
            console.log("Error with GETting Hangouts");
        });
        return 0;
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

function streetAddressToLatLdocumentLastShot(address) { // driving
    spaceReplacedAddress = address.replace(' ', '%20');
    let url = baseUrl+ `geocode/json?address=${spaceReplacedAddress}&key=${apiKey}`;
    let settings = { method: "Get" };
    
    return fetch(url, settings)
        .then(res => res.json())
        .then((jsonres) => {
            //console.log(jsonres)
            console.log(`Geocode recieved`);
            console.log(jsonres["results"][0]["geometry"])
            let lat = jsonres["results"][0]["geometry"]["location"]["lat"];
            let lng = jsonres["results"][0]["geometry"]["location"]["lng"];
            //let x = addToLatandLongs(lat, lng)
            return {
                "lat": lat,
                "lng": lng,
            };
        });
        
    }
latandlongs = []
async function addToLatandLongs(lat, lng){

    latandlongs.push(coords);
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