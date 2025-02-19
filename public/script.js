// API URL'ini dinamik olarak ayarla
const API_URL = window.location.origin;
const starfield = document.getElementById('starfield');
const numStars = 400;

// Yıldız oluşturma
function createStars() {
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        const size = Math.random() * 4 + 1;
        const xPosition = Math.random() * window.innerWidth;
        const yPosition = Math.random() * window.innerHeight;
        const animationDuration = Math.random() * 40 + 20;

        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${xPosition}px`;
        star.style.top = `${yPosition}px`;
        star.style.animationDuration = `${animationDuration}s`;

        starfield.appendChild(star);
    }
}

// API çağrıları için basit fonksiyon
async function callAPI(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    };

    try {
        const response = await fetch(`${API_URL}/api${endpoint}`, {
            ...defaultOptions,
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Hatası (${endpoint}):`, error);
        throw error;
    }
}

// Hakkımda içeriğini getir
async function getHakkimdaContent() {
    const hakkimdaContent = document.getElementById('hakkimdaContent');
    if (!hakkimdaContent) return;

    try {
        const data = await callAPI('/about');
        if (data && data.content) {
            hakkimdaContent.innerHTML = data.content;
        }
    } catch (error) {
        console.error('Hakkımda içeriği yüklenemedi:', error);
    }
}

// Blog işlemleri
async function loadBlogs() {
    const blogContainer = document.getElementById('blogContainer');
    if (!blogContainer) return;

    try {
        const blogs = await callAPI('/blogs');
        displayBlogs(blogs);
    } catch (error) {
        console.error('Bloglar yüklenemedi:', error);
    }
}

// Blog görüntüleme
function displayBlogs(blogs) {
    const blogContainer = document.getElementById('blogContainer');
    if (!blogContainer || !Array.isArray(blogs)) return;
    
    blogContainer.innerHTML = blogs.map(blog => `
        <div class="blog-card" onclick="showBlogDetail('${blog._id}')">
            ${blog.imageUrl ? `<img src="${blog.imageUrl}" alt="${blog.title}">` : ''}
            <div class="blog-content">
                <h3>${blog.title}</h3>
                <p>${blog.content.substring(0, 150)}...</p>
                <div class="blog-meta">
                    <span class="date">${new Date(blog.date).toLocaleDateString()}</span>
                    <div class="tags">
                        ${blog.tags ? blog.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// İletişim formu
if (document.getElementById('contactForm')) {
    document.getElementById('contactForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        try {
            await callAPI('/messages', {
                method: 'POST',
                body: JSON.stringify({
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    message: document.getElementById('message').value
                })
            });

            alert('Mesajınız başarıyla gönderildi!');
            this.reset();
        } catch (error) {
            console.error('Mesaj gönderilemedi:', error);
            alert('Mesaj gönderilirken bir hata oluştu');
        }
    });
}

// Blog detayı
async function showBlogDetail(id) {
    try {
        const blog = await callAPI(`/blogs/${id}`);
        const blogDetail = document.getElementById('blogDetail');
        const blogDetailContent = document.getElementById('blogDetailContent');
        
        if (blogDetail && blogDetailContent) {
            blogDetailContent.innerHTML = `
                <h2>${blog.title}</h2>
                ${blog.imageUrl ? `<img src="${blog.imageUrl}" alt="${blog.title}" class="blog-detail-image">` : ''}
                <div class="blog-meta">
                    <span class="date">${new Date(blog.date).toLocaleDateString()}</span>
                    <div class="tags">
                        ${blog.tags ? blog.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                    </div>
                </div>
                <div class="blog-content">${blog.content}</div>
            `;
            
            blogDetail.style.display = 'block';
        }
    } catch (error) {
        console.error('Blog detayı yüklenemedi:', error);
    }
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    createStars(); // Yıldızları oluştur
    getHakkimdaContent();
    loadBlogs();
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const element = document.querySelector(this.getAttribute('href'));
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});