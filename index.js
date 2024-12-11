const express = require('express');
const mongoose = require('mongoose'), app = express();
const morgan = require('morgan'), PORT = process.env.PORT || 3050;
const bodyParser = require('body-parser');
const lang = require('./routes/languages.js');
const auth = require('./routes/auth.js');
const cors = require('cors');

app.use(bodyParser.urlencoded({extended:true}));
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use('/',lang);

app.use('/auth',auth);

mongoose.connect("mongodb://localhost/myDcitionary")
.then(()=>console.log('connected!'))
.catch(err=> console.log('error happened', err));
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
