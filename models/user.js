const mongoose = require('mongoose');

const newUser = new mongoose.Schema({
    username: String,
    email:String,
    password:String,
    timestamp: {type:Date, default:Date.now},
    progress:{next:Number, 
        units:[{
            unit : Number,
            performance: Number,
            startdate:Date,
            finishdate:Date,
           
        }],
        startdate:Date} ,
    kor_progress:{next:Number, 
        units:[{
            unit : Number,
            performance: Number,
            startdate:Date,
            finishdate:Date,
           
        }],
        startdate:Date}, 
    rus_progress:{next:Number, 
        units:[{
            unit : Number,
            performance: Number,
            startdate:Date,
            finishdate:Date,
           
        }],
        startdate:Date} ,
    tur_progress:{next:Number, 
        units:[{
            unit : Number,
            performance: Number,
            startdate:Date,
            finishdate:Date,
           
        }],
        startdate:Date} 
});

module.exports = mongoose.model("User",newUser);