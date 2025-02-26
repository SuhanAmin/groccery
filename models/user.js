const mongoose = require('mongoose');
require('dotenv').config();

console.log("Mongo URI from .env:", process.env.MONGO_URI); // Verify URI is loaded

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    serverSelectionTimeoutMS: 5000, // Fail fast if no connection
})
.then(() => console.log("Successfully connected to MongoDB Atlas"))
.catch(err => console.error("MongoDB connection failed:", err.message, err.stack));

const userSchema = mongoose.Schema({
    username: String,
    email: String,
    mobile: {
        type: Number,
        unique: true
    },
    password: String,
    address: String,
    state: String,
    pincode: Number,
    payment: String,
    cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "delivery"
    }],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "delivery"
    }],
    latitude: Number,
    longitude: Number,
    myorders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "delivery"
    }]
});

module.exports = mongoose.model('user', userSchema);