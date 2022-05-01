const mongoose = require("mongoose");

const hangoutSchema = mongoose.Schema({
    date: { type: Date, required: true },
    time: { type: String, required: true },
    commute: { type: Number, required: true },
    friends: [
        {
            emoji: String,
            address: String,
        },
    ],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Hangout", hangoutSchema);
