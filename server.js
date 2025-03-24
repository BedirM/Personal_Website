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

// Google Translate API için
const { Translate } = require('@google-cloud/translate').v2;
const translate = new Translate({
    key: process.env.GOOGLE_TRANSLATE_API_KEY
});

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

// Admin sayfası route'ları
app.get(['/admin', '/admin.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
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
app.use('/api/admin', adminAuth);

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
        }, { new: true });

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

// Diğer admin API endpoint'leri için adminAuth middleware'i
app.use('/api/admin/messages', adminAuth);
app.use('/api/admin/about', adminAuth);

// Google Translate endpoint'i
app.get('/api/translate', async (req, res) => {
    const targetLang = req.query.lang || 'tr';

    // Orijinal metinler (Türkçe) – HTML'deki data-translate anahtarlarıyla eşleşecek
    const originals = {
        siteTitleGreen: "Bedir",
        siteTitleWhite: "Müjde",
        navHome: "Ana Sayfa",
        navAbout: "Hakkımda",
        navBlog: "Blog Yazılarım",
        navContact: "İletişim",
        welcomeTitle: "Kişisel Web Siteme Hoşgeldiniz!",
        welcomeSubtitle: "Yazılım Geliştirici & Teknoloji Tutkunu",
        welcomeDesc1: "Merhaba! Ben Bedir Müjde. Yazılım geliştirme ve teknoloji dünyasındaki deneyimlerimi, düşüncelerimi ve projelerimi paylaştığım kişisel blog sayfama hoş geldiniz.",
        welcomeDesc2: "Burada yazılım, teknoloji ve kişisel gelişim üzerine içerikler bulacaksınız.",
        readLatestPosts: "Son Yazıları Oku",
        blogTitle: "Blog Yazılarım",
        contactTitle: "İletişim",
        contactHeader: "Bana Ulaşın",
        contactNamePlaceholder: "Adınız",
        contactEmailPlaceholder: "E-posta",
        contactMessagePlaceholder: "Mesajınız",
        submitContact: "Gönder",
        footerText: "© 2025 Bedir Müjde. Tüm hakları saklıdır."
    };

    // Hedef dil Türkçe ise, orijinal metinleri döndür
    if (targetLang === 'tr') {
        return res.json({ translations: originals });
    }

    try {
        const keys = Object.keys(originals);
        const translationResults = await Promise.all(keys.map(async key => {
            const text = originals[key];
            const [translatedText] = await translate.translate(text, targetLang);
            return { key, translatedText };
        }));
        const translations = {};
        translationResults.forEach(item => {
            translations[item.key] = item.translatedText;
        });
        res.json({ translations });
    } catch (err) {
        console.error("Çeviri API Hatası:", err);
        res.status(500).json({ error: "Çeviri işlemi başarısız oldu." });
    }
});

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
