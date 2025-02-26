const mongoose=require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    serverSelectionTimeoutMS: 5000, // Fail fast if no connection
})

const postSchema=mongoose.Schema({
    filename:String,
    title:String,
    price:Number
});
module.exports=mongoose.model('post',postSchema);