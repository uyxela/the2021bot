const mongoose = require('mongoose');
const { database } = require('./config.json');

mongoose.connect(`mongodb+srv://${database.username}:${database.password}@${database.url}`, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: '));

db.once('open', function() {
    console.log("we're connected!");
});

const goalSchema = new mongoose.Schema({
    name: String,
    description: String,
    type: String,
    frequency: {
        times: Number,
        per: String
    },
    percentage: {
        numerator: Number,
        denominator: Number
    },
    completion: Boolean,
});

const userSchema = new mongoose.Schema({
    id: String,
    name: String,
    bio: String,
    age: Number,
    location: String,
    links: [String],
    cohorts: [String],
    goals: [goalSchema]
});

const Goal = mongoose.model('Goal', goalSchema);

const User = mongoose.model('User', userSchema);

module.exports = {
    Goal, User
}