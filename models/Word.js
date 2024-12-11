const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
    word:String,
    type:String,  ///streak relation for example: my first 500 or just 500
    definition:String,
    imageUrl:String,
    frequency:{type:Number, max:5, min:1, default:1},
    timeStamp:{type:Date, default:Date.now},
    translation:String,
    korean:{
        word:String,
        translation:String,
        definition:String,
        type:String,
        example:[{word:String, translation:String}],
        timeStamp:{type:Date},
        isFinished:Number
    },
    russian:{
        word:String,
        translation:String,
        definition:String,
        example:[{word:String, translation:String}],
        timeStamp:{type:Date},
        isFinished:Number
    },
    turkish:{
        word:String,
        translation:String,
        definition:String,
        example:[{word:String, translation:String}],
        timeStamp:{type:Date},
        isFinished:Number
    },
});

module.exports = mongoose.model('Word', wordSchema);