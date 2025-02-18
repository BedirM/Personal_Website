const express = require('express');
const router = express.Router();
const Message = require('../models/message');

// Mesaj gönderme
router.post('/', async (req, res) => {
    try {
        const message = new Message({
            name: req.body.name,
            email: req.body.email,
            message: req.body.message
        });
        await message.save();
        res.status(201).json({ message: 'Mesajınız başarıyla gönderildi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tüm mesajları getir (Admin için)
router.get('/', async (req, res) => {
    try {
        const messages = await Message.find().sort({ date: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mesajı okundu olarak işaretle
router.patch('/:id', async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (message) {
            message.isRead = true;
            await message.save();
            res.json({ message: 'Mesaj okundu olarak işaretlendi' });
        } else {
            res.status(404).json({ message: 'Mesaj bulunamadı' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mesajı sil
router.delete('/:id', async (req, res) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Mesaj bulunamadı' });
        }
        res.json({ message: 'Mesaj başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
