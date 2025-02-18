const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        default: 'Bedir Müjde'
    },
    date: {
        type: Date,
        default: Date.now
    },
    tags: [String],
    imageUrl: String
});

module.exports = mongoose.model('Blog', BlogSchema);
