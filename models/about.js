const mongoose = require('mongoose');

const AboutSchema = new mongoose.Schema({
    title: String,
    content: String
});

module.exports = mongoose.model('About', AboutSchema);
