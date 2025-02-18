const express = require('express');
const router = express.Router();
const About = require('../models/about');

// Hakkımda bilgisini getir
router.get('/', async (req, res) => {
    try {
        const about = await About.findOne();
        if (!about) {
            return res.status(404).json({ message: 'Veri bulunamadı' });
        }
        res.json(about);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Hakkımda bilgisini güncelle
router.post('/', async (req, res) => {
    try {
        let about = await About.findOne();
        if (about) {
            about.title = req.body.title;
            about.content = req.body.content;
            await about.save();
        } else {
            about = new About({
                title: req.body.title,
                content: req.body.content
            });
            await about.save();
        }
        res.status(200).json({ message: 'Bilgiler başarıyla güncellendi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;