const mongoose = require('mongoose');

const streaksChema = new mongoose.Schema({
    day:Number,  /// streak day 
    type:String,  /// type of streak for example: my first 500
    streaker:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
    streak:{type:Date, default:Date.now},  // day of streak creation
    words:[{type:mongoose.Schema.Types.ObjectId, ref:'Word'}],  // list of words 
    questions:[{
        desc:String, 
        options:[String],
        answer:String,
        check: {type:Boolean, default:false}
    }],
    score:{
        korean:Number,
            russian:Number, 
            turkish:Number
    },
    story:{
        origin : [{String}], // Story in english so i marked as origin
            korean:[{String}],  //  each sentence will be separate string in array in all languages
            russian:[{String}],  
            turkish:[{String}],
    },
    status:{type:Boolean, default:false}  // whether this streak is finished or not
});

module.exports = mongoose.model("Streak", streaksChema);