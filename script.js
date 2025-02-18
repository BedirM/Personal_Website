const starfield = document.getElementById('starfield');
const numStars = 400;
const API_URL = 'http://localhost:3000';

for (let i = 0; i < numStars; i++) {
    const star = document.createElement('div');
    star.classList.add('star');

    // Rastgele boyut ve konum
    const size = Math.random() * 4 + 1; // 1px - 4px
    const xPosition = Math.random() * window.innerWidth;
    const yPosition = Math.random() * window.innerHeight;// Doğru
    const animationDuration = Math.random() * 40 + 20; // Yıldızların hızları rastgele

    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${xPosition}px`;
    star.style.top = `${yPosition}px`;
    star.style.animationDuration = `${animationDuration}s`;

    starfield.appendChild(star);
}

window.addEventListener('load', () => {
    document.querySelector('.container').classList.add('loaded');
});

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    try {
        const response = await fetch('http://localhost:3000/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, message })
        });

        if (response.ok) {
            alert('Mesajınız başarıyla gönderildi!');
            this.reset();
        } else {
            alert('Bir hata oluştu!');
        }
    } catch (error) {
        console.error('Hata:', error);
        alert('Bir hata oluştu!');
    }
});

// Admin paneli için mesajları görüntüleme
async function loadMessages() {
    try {
        const response = await fetch(`${API_URL}/api/messages`);
        const messages = await response.json();
        displayMessages(messages);
    } catch (error) {
        console.error('Hata:', error);
    }
}

function displayMessages(messages) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;

    messagesContainer.innerHTML = messages.map(msg => `
        <div class="message ${msg.isRead ? 'read' : 'unread'}">
            <h3>${msg.name}</h3>
            <p><strong>Email:</strong> ${msg.email}</p>
            <p>${msg.message}</p>
            <small>${new Date(msg.date).toLocaleString()}</small>
            ${!msg.isRead ? `<button onclick="markAsRead('${msg._id}')">Okundu olarak işaretle</button>` : ''}
        </div>
    `).join('');
}

async function markAsRead(id) {
    try {
        const response = await fetch(`${API_URL}/api/messages/${id}`, {
            method: 'PATCH'
        });
        if (response.ok) {
            loadMessages(); // Mesajları yeniden yükle
        }
    } catch (error) {
        console.error('Hata:', error);
    }
}

const hakkimdaContent = document.getElementById('hakkimdaContent');
const editLink = document.getElementById('editLink');
const editForm = document.getElementById('editForm');
const hakkimdaTextArea = document.getElementById('hakkimdaTextArea');
const passwordInput = document.getElementById('password');

// Hakkımda içeriğini API'den al
async function getHakkimdaContent() {
    try {
        const response = await fetch('http://localhost:3000');
        const data = await response.json();
        if (data) {
            hakkimdaContent.innerHTML = data.content;
            hakkimdaTextArea.value = data.content;
        }
    } catch (error) {
        console.error('Hata:', error);
    }
}

// Sayfa yüklendiğinde içeriği getir
document.addEventListener('DOMContentLoaded', getHakkimdaContent);

// İçerik kaydedildiğinde, API'ye gönder
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (passwordInput.value === "SeninGizliSifren") {
        try {
            const response = await fetch('http://localhost:3000', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: 'Hakkımda',
                    content: hakkimdaTextArea.value
                })
            });

            if (response.ok) {
                hakkimdaContent.innerHTML = hakkimdaTextArea.value;
                editForm.style.display = 'none';
                editLink.style.display = 'block';
            } else {
                alert("Güncelleme başarısız!");
            }
        } catch (error) {
            console.error('Hata:', error);
            alert("Bir hata oluştu!");
        }
    } else {
        alert("Şifre hatalı!");
    }
});

// Yeni animasyon ekleme: Sayfa yüklendiğinde yıldızları içeren animasyon başlatılıyor
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    container.classList.add('loaded');
});

// Blog yazılarını yükle
async function loadBlogs() {
    try {
        const response = await fetch('http://localhost:3000/api/blogs');
        const blogs = await response.json();
        displayBlogs(blogs);
    } catch (error) {
        console.error('Hata:', error);
    }
}

// Blog yazılarını görüntüle
function displayBlogs(blogs) {
    const blogContainer = document.getElementById('blogContainer');
    blogContainer.innerHTML = blogs.map(blog => `
        <div class="blog-card" onclick="showBlogDetail('${blog._id}')">
            ${blog.imageUrl ? `<img src="${blog.imageUrl}" alt="${blog.title}">` : ''}
            <div class="blog-content">
                <h3>${blog.title}</h3>
                <p>${blog.content.substring(0, 150)}...</p>
                <div class="blog-meta">
                    <span class="date">${new Date(blog.date).toLocaleDateString()}</span>
                    <div class="tags">
                        ${blog.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Blog detayını göster
async function showBlogDetail(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/blogs/${id}`);
        const blog = await response.json();
        
        const blogDetail = document.getElementById('blogDetail');
        const blogDetailContent = document.getElementById('blogDetailContent');
        
        blogDetailContent.innerHTML = `
            <h2>${blog.title}</h2>
            ${blog.imageUrl ? `<img src="${blog.imageUrl}" alt="${blog.title}" class="blog-detail-image">` : ''}
            <div class="blog-meta">
                <span class="date">${new Date(blog.date).toLocaleDateString()}</span>
                <div class="tags">
                    ${blog.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
            <div class="blog-content">${blog.content}</div>
        `;
        
        blogDetail.style.display = 'block';
    } catch (error) {
        console.error('Hata:', error);
    }
}

// Blog detayını kapat
function closeBlogDetail() {
    document.getElementById('blogDetail').style.display = 'none';
}

// Sayfa yüklendiğinde blog yazılarını yükle
document.addEventListener('DOMContentLoaded', () => {
    loadBlogs();
});

// Smooth scroll için
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Mesaj gönderme
async function sendMessage(data) {
    try {
        const response = await fetch(`${API_URL}/api/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Hata:', error);
        throw error;
    }
}
