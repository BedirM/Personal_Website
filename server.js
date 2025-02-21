require('dotenv').config();

// Modülleri import et
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

// Mongoose ayarları
mongoose.set('strictQuery', false);

// MongoDB Bağlantısı - middleware'lerden önce
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB bağlantısı başarılı!'))
.catch(err => console.error('❌ MongoDB bağlantı hatası:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosyaları serve et
app.use(express.static(path.join(__dirname, 'public')));

// Favicon isteğini yönet
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// CORS ayarları
app.use(cors({
    origin: [
        'https://personal-website-kohl-psi.vercel.app',
        'https://personal-website-git-main-bedirs-projects-b20fcbc6.vercel.app',
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes dosyalarını yükle
console.log("Routes dosyalarını yüklemeye çalışıyorum...");
const aboutRoutes = require('./routes/aboutRoutes');
const messageRoutes = require('./routes/messageRoutes');
const blogRoutes = require('./routes/blogRoutes');
console.log("Routes dosyaları başarıyla yüklendi!");

// API routes
app.use('/api/about', aboutRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/blogs', blogRoutes);

// Admin sayfası route'ları
app.get(['/admin', '/admin.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
// Tüm diğer route'lar için index.html'i gönder
app.get('*', (req, res) => {
   if (req.path === '/admin' || req.path === '/admin.html') {
        res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    } else if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, 'public/index.html'));
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// MongoDB bağlantı testi
mongoose.connection.on('connected', () => {
    console.log('MongoDB bağlantısı başarılı');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB bağlantı hatası:', err);
});

// Sunucuyu Başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});

module.exports = app;
