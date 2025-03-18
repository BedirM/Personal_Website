// API URL'ini production ve development ortamları için ayarla
const API_URL = window.location.origin;
const starfield = document.getElementById('starfield');
const numStars = 200;

// Yıldız oluşturma
function createStars() {
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        const size = Math.random() * 2 + 1;
        const xPosition = Math.random() * window.innerWidth;
        const yPosition = Math.random() * window.innerHeight;

        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${xPosition}px`;
        star.style.top = `${yPosition}px`;
        star.style.animationDuration = `${Math.random() * 40 + 20}s`;

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
            console.error(`API Hatası: ${response.status} - ${response.statusText}`);
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
        const response = await fetch('/api/about'); // API'den hakkımda içeriğini al
        const data = await response.json();
        if (data && data.content) {
            hakkimdaContent.innerHTML = data.content; // İçeriği yerleştir
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
    if (!blogContainer) return;
    
    if (!Array.isArray(blogs) || blogs.length === 0) {
        blogContainer.innerHTML = '<p>Henüz blog yazısı bulunmuyor.</p>';
        return;
    }

    blogContainer.innerHTML = blogs.map(blog => {
        try {
            return `
                <div class="blog-card" onclick="showBlogDetail('${blog._id}')">
                    ${blog.imageUrl ? `<img src="${blog.imageUrl}" alt="${blog.title || 'Blog Resmi'}">` : ''}
                    <div class="blog-content">
                        <h3>${blog.title || 'Başlıksız Blog'}</h3>
                        <p>${blog.content ? blog.content.substring(0, 150) + '...' : 'İçerik yok'}</p>
                        <div class="blog-meta">
                            <span class="date">${new Date(blog.date || Date.now()).toLocaleDateString()}</span>
                            <div class="tags">
                                ${blog.tags ? blog.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Blog render hatası:', error);
            return '';
        }
    }).join('');
}

// İletişim formu
if (document.getElementById('contactForm')) {
    document.getElementById('contactForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        // Form elemanlarını al
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        // Doğrulama kuralları
        if (!name || !isNaN(name) || name.length > 20) {
            alert('Lütfen geçerli bir isim girin (sadece harfler, en fazla 20 karakter).');
            return;
        }

        const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|yahoo)\.com$/; // Sadece belirli e-posta sağlayıcıları
        if (!email || !emailPattern.test(email) || email.length > 50) {
            alert('Lütfen geçerli bir e-posta adresi girin (örneğin: example@gmail.com, en fazla 50 karakter).');
            return;
        }

        if (!message || message.length > 500) {
            alert('Mesaj kısmı boş bırakılamaz ve en fazla 500 karakter olmalıdır.');
            return;
        }

        try {
            await callAPI('/messages', {
                method: 'POST',
                body: JSON.stringify({
                    name: name,
                    email: email,
                    message: message
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
        const mainContent = document.querySelector('.container'); // Ana içerik container'ı
        
        if (blogDetail && blogDetailContent) {
            document.body.style.overflow = 'hidden';
            
            // Ana içeriği bulanıklaştır
            mainContent.classList.add('blur-background');
            
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

// Blog detayını kapat
function closeBlogDetail() {
    const blogDetail = document.getElementById('blogDetail');
    const mainContent = document.querySelector('.container'); // Ana içerik container'ı
    
    blogDetail.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Bulanıklığı kaldır
    mainContent.classList.remove('blur-background');
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    console.log('Sayfa yüklendi!'); // Kontrol için
    createStars(); // Yıldızları oluştur
    getHakkimdaContent();
    loadBlogs();

    // Admin sayfasında checkAuth fonksiyonunu çağır
    if (window.location.pathname === '/admin.html') {
        checkAuth(); // Admin sayfasında checkAuth fonksiyonunu çağır
    }

    // Hakkımda sayfasında içerik yükle
    if (window.location.pathname === '/about.html') {
        getHakkimdaContent();
    }

    // "Blog Yazılarım" bağlantısına tıklanıldığında smooth scroll
    const blogLink = document.querySelector('nav ul li a[href="#blog"]');
    if (blogLink) {
        blogLink.addEventListener('click', function(e) {
            e.preventDefault(); // Varsayılan davranışı engelle
            const target = document.getElementById('blog'); // Hedef bölüm
            if (target) {
                const targetPosition = target.getBoundingClientRect().top + window.scrollY; // Hedefin konumunu al
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth' // Yumuşak kaydırma
                });
            }
        });
    }

    // İletişim butonuna tıklandığında ana sayfanın iletişim kısmına git
    document.querySelectorAll('nav ul li a[href="index.html#iletisim"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector('#iletisim');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Smooth scroll için bağlantıları ayarlama
    document.querySelectorAll('nav ul li a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const passwordInput = document.getElementById('adminPassword');
    if (passwordInput) {
        passwordInput.focus(); // Sayfa yüklendiğinde inputa odaklan
    }

    // "Son Yazıları Oku" butonuna tıklanıldığında smooth scroll
    const readLatestPostsButton = document.getElementById('readLatestPosts');
    if (readLatestPostsButton) {
        readLatestPostsButton.addEventListener('click', function(e) {
            e.preventDefault(); // Varsayılan davranışı engelle
            const target = document.getElementById('blog'); // Hedef bölüm
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' }); // Yumuşak kaydırma
            }
        });
    }
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

// Hakkımda sayfasındaki iletişim ve blog bağlantılarına tıklanıldığında ana sayfadaki ilgili bölümlere git
document.querySelectorAll('nav ul li a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        if (target === '#iletisim') {
            document.getElementById('iletisim').scrollIntoView({ behavior: 'smooth' });
        } else if (target === 'blog.html') {
            window.location.href = 'blog.html';
        } else {
            window.location.href = target; // Ana sayfaya git
        }
    });
});

// Logoya tıklanıldığında ana sayfaya git
document.querySelector('.logo-link').addEventListener('click', function(e) {
    e.preventDefault(); // Varsayılan davranışı engelle
    window.location.href = 'index.html'; // Ana sayfaya yönlendir
});

