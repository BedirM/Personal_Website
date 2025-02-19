const express = require('express');
const router = express.Router();
const About = require('../models/about');

// Hakkımda içeriğini getir
router.get('/', async (req, res) => {
    try {
        const about = await About.findOne();
        if (!about) {
            return res.status(404).json({ message: 'İçerik bulunamadı' });
        }
        res.json(about);
    } catch (error) {
        console.error('Hakkımda içeriği getirme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Hakkımda içeriğini güncelle
router.post('/', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'İçerik gerekli' });
        }

        let about = await About.findOne();
        if (about) {
            about.content = content;
            await about.save();
        } else {
            about = new About({ content });
            await about.save();
        }

        res.json(about);
    } catch (error) {
        console.error('Hakkımda içeriği güncelleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router;