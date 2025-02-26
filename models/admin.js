const mongoose=require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI);

const adminSchema=mongoose.Schema({
    email:String,
    password:String,
    order:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"delivery"
        }
    ]
});
module.exports=mongoose.model('admin',adminSchema);