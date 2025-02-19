const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    isRead: {
        type: Boolean,
        default: false
    }
});

// Model zaten tanımlıysa onu kullan, değilse yeni model oluştur
module.exports = mongoose.models.Message || mongoose.model('Message', MessageSchema);
