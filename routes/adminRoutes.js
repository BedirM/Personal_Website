const express = require('express');
const router = express.Router();

// Admin sayfası için gerekli route'lar
router.get('/', (req, res) => {
    res.send('Admin Paneli');
});

// Diğer admin route'larınızı buraya ekleyin

module.exports = router;
