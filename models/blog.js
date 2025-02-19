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

// Model zaten tanımlıysa onu kullan, değilse yeni model oluştur
module.exports = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
