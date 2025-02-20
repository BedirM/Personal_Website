const express = require('express');
const router = express.Router();
const About = require('../models/about');

// Hakkımda içeriğini getir
router.get('/', async (req, res) => {
    try {
        let aboutInfo = await About.findOne();
        if (!aboutInfo) {
            // Eğer veri yoksa varsayılan bir içerik oluştur
            aboutInfo = new About({
                content: 'Henüz içerik girilmemiş.'
            });
            await aboutInfo.save();
        }
        res.json(aboutInfo);
    } catch (error) {
        console.error('Hakkımda içeriği getirme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Hakkımda içeriğini güncelle
router.put('/', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'İçerik zorunludur' });
        }

        let aboutInfo = await About.findOne();
        if (aboutInfo) {
            aboutInfo.content = content;
        } else {
            aboutInfo = new About({ content });
        }

        await aboutInfo.save();
        res.json(aboutInfo);
    } catch (error) {
        console.error('Hakkımda içeriği güncelleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router;
