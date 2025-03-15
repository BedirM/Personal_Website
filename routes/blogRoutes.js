const express = require('express');
const router = express.Router();
const Blog = require('../models/blog');

// Tüm blogları getir
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ date: -1 });
        if (!blogs || !Array.isArray(blogs)) {
            return res.json([]);
        }
        res.json(blogs);
    } catch (error) {
        console.error('Blog getirme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası', blogs: [] });
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
        if (!req.body.title || !req.body.content) {
            return res.status(400).json({ message: 'Başlık ve içerik zorunludur' });
        }

        const blog = new Blog({
            title: req.body.title,
            content: req.body.content,
            tags: req.body.tags || [],
            imageUrl: req.body.imageUrl || ''
        });

        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        console.error('Blog kaydetme hatası:', error);
        res.status(500).json({ message: 'Blog kaydedilirken bir hata oluştu' });
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
