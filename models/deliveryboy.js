const mongoose=require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    serverSelectionTimeoutMS: 5000, // Fail fast if no connection
})

const dbSchema=mongoose.Schema({
    email:String,
    password:String,
    order:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"delivery"
        }
    ]
});
module.exports=mongoose.model('db',dbSchema);