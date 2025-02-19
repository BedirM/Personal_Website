const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Model zaten tanımlıysa onu kullan, değilse yeni model oluştur
module.exports = mongoose.models.About || mongoose.model('About', aboutSchema);
