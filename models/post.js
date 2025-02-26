const mongoose=require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI);

const postSchema=mongoose.Schema({
    filename:String,
    title:String,
    price:Number
});
module.exports=mongoose.model('post',postSchema);