const express = require('express');
const router = express.Router();
const Blog = require('../models/blog');

// Tüm blogları getir
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ date: -1 });
        res.json(blogs);
    } catch (error) {
        console.error('Blog getirme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Tek bir blog yazısını getir
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog yazısı bulunamadı' });
        }
        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Yeni blog ekle
router.post('/', async (req, res) => {
    try {
        const blog = new Blog(req.body);
        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        console.error('Blog kaydetme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Blog yazısını güncelle
router.put('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog yazısı bulunamadı' });
        }

        blog.title = req.body.title || blog.title;
        blog.content = req.body.content || blog.content;
        blog.tags = req.body.tags || blog.tags;
        blog.imageUrl = req.body.imageUrl || blog.imageUrl;

        const updatedBlog = await blog.save();
        res.json(updatedBlog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Blog yazısını sil
router.delete('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog yazısı bulunamadı' });
        }
        await blog.deleteOne();
        res.json({ message: 'Blog yazısı silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
