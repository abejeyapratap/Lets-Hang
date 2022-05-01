const express = require("express");
const mongoose = require("mongoose");

const axios = require("axios"); //TODO remove
let apiKey = process.env.GOOGLE_API_KEY; //TODO remove
let baseUrl = `https://maps.googleapis.com/maps/api/`; //TODO remove

const app = express();

app.use(express.json());

const hangoutRoutes = require("./routes/hangout");

mongoose
    .connect(
        "mongodb+srv://root:" +
            process.env.MONGO_ATLAS_PW +
            "@cluster0.2pizy.mongodb.net/lets-hang?retryWrites=true&w=majority"
    )
    .then(() => {
        console.log("Connected to database");
    })
    .catch(() => {
        console.log("Connection failed");
    });

// CORS Middleware
const ANGULAR_ORIGIN = process.env.ANGULAR_CLIENT_URL;
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", ANGULAR_ORIGIN); // filter domain
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    ); // filter headers
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    next();
});

app.use("/api/hangout", hangoutRoutes); // forward requests to /api/hangout

module.exports = app;
