const mongoose=require('mongoose');
const user = require('./user');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI);

const deliverySchema=mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    pic:String,
    item:String,
    quantity:Number,
    price:Number
});
module.exports=mongoose.model('delivery',deliverySchema);