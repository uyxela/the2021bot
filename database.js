const mongoose = require('mongoose');
const { database } = require('./config.json');

mongoose.connect(`mongodb+srv://${database.username}:${database.password}@${database.url}`, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: '));

db.once('open', function() {
    console.log("we're connected!");
});