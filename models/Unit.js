const mongoose = require('mongoose');

const unit = new mongoose.Schema({
    day:Number,
    words:[
    {word:String, pronunciation:String, part_of_speech:String,
     url:String, definition:String, example:String,
     korean:String, kor_definition:String, kor_example:String,   
     russian:String, rus_definition:String, rus_example:String,   
     turkish:String, tur_definition:String, tur_example:String,   
    }],
    story :{
        title:String, kor_title:String,
        rus_title:String, tur_title:String,
        content:String, kor_content:String,
        rus_content:String, tur_content:String
    },
    timestamp:{type:Date, default:Date.now},
});

module.exports = mongoose.model('Unit', unit);