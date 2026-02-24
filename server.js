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
const jwt = require('jsonwebtoken');

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
app.use('/', express.static(path.join(__dirname, 'public'), {
    index: false
}));

// Favicon isteğini yönet
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// CORS ayarları
app.use(cors({
    origin: [
        'http://localhost:3000', // Geliştirme ortamı
        'https://bedirmujde-personal-website.vercel.app', // Vercel URL'si
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
const adminRoutes = require('./routes/adminRoutes');
console.log("Routes dosyaları başarıyla yüklendi!");

// Admin yetkilendirme kontrolü middleware'i
const adminAuth = (req, res, next) => {
    const password = req.headers['authorization']?.split(' ')[1]; // Şifreyi başlıktan al
    if (password === process.env.ADMIN_PASSWORD) {
        next(); // Giriş başarılı, devam et
    } else {
        res.status(403).json({ message: 'Yetkisiz erişim' }); // Yetkisiz erişim
    }
};

// API routes
app.use('/api/about', aboutRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/blogs', blogRoutes);

// Drive şifre kontrol endpointi
app.post('/api/check-password', (req, res) => {

    const { password } = req.body;

    if (password === process.env.DRIVE_PASSWORD) {
        return res.status(200).json({
            success: true,
            driveUrl: process.env.DRIVE_URL
        });
    }

    return res.status(200).json({ success: false });
});

// Admin sayfası route'ları
app.get(['/admin', '/admin.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html')); // Admin sayfasını gönder
});

// API endpoint'leri için admin yetkilendirme kontrolü
app.post('/api/admin/auth', (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
        res.status(200).send({ success: true });
    } else {
        res.status(401).send({ success: false });
    }
});

// Admin API endpoint'leri için yetkilendirme
app.use('/api/admin', adminAuth); // Admin API'leri için yetkilendirme kontrolü

// Blog ekleme
app.post('/api/admin/blogs', adminAuth, async (req, res) => {
    // Blog ekleme işlemleri
});

// Blog güncelleme
app.put('/api/blogs/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content, tags, imageUrl } = req.body;

    try {
        const updatedBlog = await Blog.findByIdAndUpdate(id, {
            title,
            content,
            tags,
            imageUrl
        }, { new: true }); // Yeni güncellenmiş belgeyi döndür

        if (!updatedBlog) {
            return res.status(404).send('Blog bulunamadı');
        }

        res.status(200).json(updatedBlog);
    } catch (error) {
        res.status(500).send('Güncelleme sırasında bir hata oluştu');
    }
});

// Blog silme
app.delete('/api/admin/blogs/:id', adminAuth, async (req, res) => {
    // Blog silme işlemleri
});

// Diğer admin API endpoint'leri için de adminAuth middleware'ini ekleyin
app.use('/api/admin/messages', adminAuth); // Mesajlar için
app.use('/api/admin/about', adminAuth); // Hakkımda için

// Tüm diğer route'lar için index.html'i gönder
app.use('*', (req, res) => {
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
