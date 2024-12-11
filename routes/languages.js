const express = require('express');
const router = express.Router();
const Word = require('../models/Word.js');
const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const Streak = require('../models/streak.js');
const Unit = require('../models/Unit.js');  

router.get('/all', async (req,res)=>{
    const words = await Word.find();
    res.json({words});
});

router.get('/daily', async (req,res)=>{
    const today = Date.now();
    const words = await Word.find();
    res.json({words});
});

router.post('/add', async (req,res)=>{
    const {word, translation, image, frequency, type, definition, sauce, korean, russian, turkish } = req.body;
    const ourSouce = 'bsoeilrfjnerfbosinvsi'
    if (sauce !== ourSouce) return res.status(401).json({message:'wrong sauce'});

    try {
    const found = await Word.findOne({word:word});
    if(found) return res.status(401).json({message:'word exists'});

    const newWord = new Word({
        word:word,
        translation:translation,
        imageUrl:image,
        frequency:frequency,
        type:type,
        definition:definition,
        korean:korean,
        turkish:turkish,
        russian:russian
    });
    await newWord.save();
    res.json({message:'registration successful!'});

} catch (error) {
    console.error("Error saving word details:", error);
    res.status(500).json({ message: 'Internal server error' });
}
});

router.post('/search', async (req,res)=>{
    const {word} = req.body;
   try {
    const found = await Word.findOne({word:word});
    if (!found) return res.status(404).json({ error: 'Word not found' });
    res.json({word:found});
} catch (error) {
    console.error("Error fetching word details:", error);
    res.status(500).json({ message: 'Internal server error' });
}
});

router.get('/word/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const word = await Word.findById(id);
        if (!word) return res.status(404).json({ error: 'Word not found' });
        res.json({word});
    } catch (error) {
        console.error("Error fetching word details:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/word/progress/korean', async (req, res) => {
    const { id } = req.body;
    try {
        const found = await Word.findByIdAndUpdate(
            id,
            { korean:{
                timeStamp:Date.now(),
                isFinished:1
            }}
        );
        if (!found) return res.status(404).json({ error: 'Word not found' });
        res.json({ word: found });
    } catch (error) {
        console.error("Error fetching word details:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/word/progress/russian', async (req, res) => {
    const { id } = req.body;
    try {
        const found = await Word.findByIdAndUpdate(
            id,
            { russian:{
                timeStamp:Date.now(),
                isFinished:1
            }}
        );
        if (!found) return res.status(404).json({ error: 'Word not found' });
        res.json({ word: found });
    } catch (error) {
        console.error("Error fetching word details:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/word/progress/turkish', async (req, res) => {
    const { id } = req.body;
    try {
        const found = await Word.findByIdAndUpdate(
            id,
            { turkish:{
                timeStamp:Date.now(),
                isFinished:1
            }}
        );
        if (!found) return res.status(404).json({ error: 'Word not found' });
        res.json({ word: found });
    } catch (error) {
        console.error("Error fetching word details:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/check', async (req,res)=>{
    const {score,lang, status, streakid, token } = req.body;
    try {
        if(!token) return res.status(403).json({message:'token absent'});
        const decoded = jwt.decode(token, sauce);
        
        if(!decoded.id) return res.status(403).json({message:'id absent'});
        const streak = await Streak.findByIdAndUpdate(streakid,
            {
                score:score,
                status:status
            }
        );
    } catch (error) {
        console.error(error);
    }
});

router.post('/unit/start', async (req, res) => {
    const { userId, lang } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "Missing userId in the request body" });
    }

    try {
        // Determine the progress field based on the language
        let progressField;
        switch (lang) {
            case 'tur':
                progressField = 'tur_progress';
                break;
            case 'kor':
                progressField = 'kor_progress';
                break;
            case 'rus':
                progressField = 'rus_progress';
                break;
            default:
                progressField = 'progress'; // Default to English progress
                break;
        }

        // Prepare the update object dynamically
        const updateObject = {
            $set: {
                [`${progressField}.next`]: 1,
                [`${progressField}.startdate`]: new Date() // Overall start date
            }
        };

        // Update the user's progress using findByIdAndUpdate
        const user = await User.findByIdAndUpdate(
            userId,
            updateObject,
            { new: true } // Return the updated document
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Unit tracking started successfully", user });
    } catch (error) {
        console.error('Error starting unit tracking:', error);
        res.status(500).json({ message: "Failed to start unit tracking" });
    }
});
router.post('/unit/next', async (req, res) => {
    const { userId, unitNumber, lang } = req.body;

    try {
        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Determine the progress field based on the language
        let progressField;
        switch (lang) {
            case 'kor':
                progressField = 'kor_progress';
                break;
            case 'rus':
                progressField = 'rus_progress';
                break;
            case 'tur':
                progressField = 'tur_progress';
                break;
            case 'eng':
                progressField = 'progress';
                break;
            default:
                return res.status(400).json({ message: 'Invalid language' });
        }

        // Access the current progress and check if a start date is set
        const userProgress = user[progressField];
        const currentDate = new Date();
        
        // If no progress has started yet, initialize the progress
        if (!userProgress.startdate) {
            userProgress.startdate = currentDate;
        }

        // Update the 'next' unit number and add the new unit to the 'units' array
        userProgress.next = parseInt(unitNumber)+1;
        userProgress.units.push({
            unit: unitNumber,
            performance: 0, // Assuming performance starts at 0
            startdate: currentDate,
            finishdate: null, // Set finish date as null initially
        });

        // Save the updated user document
        await user.save();

        res.status(200).json({ message: 'Progress updated successfully', user: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating progress', error: error.message });
    }
});

router.post("/test", async (req, res) => {
    const { userId, unitNumber, lang, performance } = req.body;

    try {
        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Determine the progress field based on the language
        let progressField;
        switch (lang) {
            case "kor":
                progressField = "kor_progress";
                break;
            case "rus":
                progressField = "rus_progress";
                break;
            case "tur":
                progressField = "tur_progress";
                break;
            case "eng":
                progressField = "progress";
                break;
            default:
                return res.status(400).json({ message: "Invalid language" });
        }

        // Access the current progress
        const userProgress = user[progressField];
        if (!userProgress) {
            return res.status(400).json({ message: "No progress found for the selected language" });
        }

        // Find the corresponding unit in the user's progress
        const unit = userProgress.units.find((u) => u.unit === parseInt(unitNumber));
        if (!unit) {
            return res.status(404).json({ message: "Unit not found in user's progress" });
        }

        // Update the performance and finish date for the unit
        unit.performance = performance;
        unit.finishdate = new Date();

        // Save the updated user document
        await user.save();

        res.status(200).json({ message: "Performance updated successfully", user });
    } catch (error) {
        console.error("Error updating performance:", error);
        res.status(500).json({ message: "Error updating performance", error: error.message });
    }
});

router.post('/unit/update', async (req, res) => {
    const { unit, sauce } = req.body; // Extract the unit object from the request body
    const oursauce = "qwerty1234"
    if (!unit || (!unit._id && !unit.day)) {
        return res.status(400).json({ message: 'Unit must include _id or day for identification.' });
    }
    if(!sauce || sauce!==oursauce) return res.status(401).json({message:"sauce is not ours"});

    try {
        // Find unit by _id or day
        const filter = unit._id ? { _id: unit._id } : { day: unit.day };
        
        // Update the unit
        const updatedUnit = await Unit.findOneAndUpdate(filter, unit, {
            new: true, // Return the updated document
            upsert: false, // Do not create a new unit if it doesn't exist
        });

        if (!updatedUnit) {
            return res.status(404).json({ message: 'Unit not found.' });
        }

        // Respond with the updated unit
        console.log(updatedUnit);
        res.status(200).json({unit:updatedUnit});
    } catch (error) {
        console.error('Error updating unit:', error);
        res.status(500).json({ message: 'An error occurred while updating the unit.', error });
    }
});

router.post('/unit', async (req, res) => {
    const { unit } = req.body;
    if (!unit ) {
      return res.status(400).json({ message: "Missing unit or day in request" });
    }
  
    try {
      const newUnit = new Unit({
        day: unit.unit,
        words: unit.words,
        story: unit.story,
      });
  
      await newUnit.save();
      res.status(200).json({ message: `Unit ${unit.unit} saved successfully`, unit: newUnit });
    } catch (error) {
      console.error('Error saving unit:', error);
      res.status(500).json({ message: 'Error saving unit to database' });
    }
  });
router.get('/clear', async (req,res)=>{
    try {
        await Unit.deleteMany();
        res.status(200).res.send("Deleted all by your majesty ")
    } catch (error) {
        console.error(error);
    }
})
  
module.exports = router;
