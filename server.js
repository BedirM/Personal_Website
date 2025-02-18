require('dotenv').config();

// Modülleri tek tek import edelim ve test edelim
console.log("Express modülünü yüklemeye çalışıyorum...");
const express = require('express');
console.log("Express modülü başarıyla yüklendi!");

console.log("Mongoose modülünü yüklemeye çalışıyorum...");
const mongoose = require('mongoose');
console.log("Mongoose modülü başarıyla yüklendi!");

console.log("CORS modülünü yüklemeye çalışıyorum...");
const cors = require('cors');
console.log("CORS modülü başarıyla yüklendi!");

const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// API routes - Önce API route'larını tanımlayalım
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/about', require('./routes/aboutRoutes'));

// Statik dosyaları sunmak için - API route'larından sonra
app.use(express.static(path.join(__dirname)));
app.use(cors({
    origin: [
        process.env.API_URL,
        'http://localhost:3000'
    ],
    credentials: true
}));

// MongoDB Bağlantısı
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB bağlantısı başarılı!'))
    .catch(err => console.error('❌ MongoDB bağlantı hatası:', err));

// Routes
console.log("Routes dosyasını yüklemeye çalışıyorum...");
const aboutRoutes = require('./routes/aboutRoutes');
console.log("Routes dosyası başarıyla yüklendi!");

const messageRoutes = require('./routes/messageRoutes');
console.log("Routes dosyası başarıyla yüklendi!");

const blogRoutes = require('./routes/blogRoutes');
console.log("Routes dosyası başarıyla yüklendi!");

app.use('/api/about', aboutRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/blogs', blogRoutes);

// Ana Sayfa Route (Test için)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin sayfası için
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Sunucuyu Başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});
