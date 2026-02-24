// Admin paneli güvenlik kontrolü
async function checkAuth() {
    const passwordInput = document.getElementById('adminPassword'); // Şifre inputunu al
    const yourPasswordInputValue = passwordInput.value; // Kullanıcının girdiği şifreyi al

    const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: yourPasswordInputValue }), // Kullanıcının girdiği şifre
    });

    if (response.ok) {

        const button = document.getElementById('adminSubmitBtn');
        const form = document.getElementById('adminLoginForm');

        if (button) {
            button.textContent = "ACCESS GRANTED";
            button.classList.add("granted");
    }

    // 0.5 saniyelik neon bekleme
        setTimeout(() => {

            document.getElementById('authSection').style.display = 'none';
            document.getElementById('adminContent').style.display = 'block';

            loadAboutContent();
            loadBlogs();
            loadMessages();

        }, 500);

    }
    else {

        const button = document.getElementById('adminSubmitBtn');

        if (button) {
            button.textContent = "EXECUTE";
            button.disabled = false;
        }

        alert('Yanlış şifre!');
    }
// Sayfa yüklendiğinde güvenlik kontrolü yap
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('adminPassword');
    if (passwordInput) {
        passwordInput.focus(); // Sayfa yüklendiğinde inputa odaklan
    }
});

// API URL'ini ayarla
const API_URL = window.location.origin;

// API çağrıları için yardımcı fonksiyon
async function callAPI(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
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
        console.error('API Hatası:', error);
        throw error;
    }
}

// Blog yazısı kaydet
async function saveBlog() {
    const title = document.getElementById('blogTitle').value;
    const content = document.getElementById('blogContent').value;
    const tags = document.getElementById('blogTags').value.split(',').map(tag => tag.trim());
    const imageUrl = document.getElementById('blogImage').value;
    const blogId = document.getElementById('blogId').value; // Blog ID'sini al

    if (!title || !content) {
        alert('Başlık ve içerik alanları zorunludur!');
        return;
    }

    try {
        if (blogId) {
            // Güncelleme işlemi için onay iste
            if (confirm('Bu blog yazısını güncellemek istediğinizden emin misiniz?')) {
                await callAPI(`/blogs/${blogId}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        title,
                        content,
                        tags,
                        imageUrl
                    })
                });
                alert('Blog yazısı başarıyla güncellendi!');
            }
        } else {
            // Blog ekleme işlemi
            await callAPI('/blogs', {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    content,
                    tags,
                    imageUrl
                })
            });
            alert('Blog yazısı başarıyla kaydedildi!');
        }

        document.getElementById('addBlogForm').reset(); // Formu sıfırla
        loadBlogs(); // Blogları yeniden yükle
    } catch (error) {
        console.error('Blog kaydedilemedi:', error);
        alert('Blog kaydedilirken bir hata oluştu!');
    }
}

// Blog yazılarını yükle
async function loadBlogs() {
    try {
        const response = await fetch(`${API_URL}/api/blogs`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blogs = await response.json();
        displayBlogs(blogs);
    } catch (error) {
        console.error('Bloglar yüklenemedi:', error);
    }
}

// Blog yazılarını görüntüle
function displayBlogs(blogs) {
    const blogList = document.getElementById('blogList');
    if (!blogList) return;
    
    if (!Array.isArray(blogs) || blogs.length === 0) {
        blogList.innerHTML = '<p>Henüz blog yazısı bulunmuyor.</p>';
        return;
    }

    blogList.innerHTML = blogs.map(blog => {
        try {
            return `
                <div class="blog-item">
                    <h3>${blog.title || 'Başlıksız Blog'}</h3>
                    <p>${blog.content ? blog.content.substring(0, 100) + '...' : 'İçerik yok'}</p>
                    <div class="blog-meta">
                        <span>Tarih: ${new Date(blog.date || Date.now()).toLocaleDateString()}</span>
                        <div class="tags">
                            ${blog.tags ? blog.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                        </div>
                    </div>
                    <div class="blog-actions">
                        <button onclick="editBlog('${blog._id}')">Düzenle</button>
                        <button onclick="deleteBlog('${blog._id}')">Sil</button>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Blog render hatası:', error);
            return '';
        }
    }).join('');
}

// Blog yazısını sil
async function deleteBlog(id) {
    // Silme işlemi için onay iste
    if (confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) {
        try {
            await callAPI(`/blogs/${id}`, {
                method: 'DELETE'
            });
            alert('Blog yazısı başarıyla silindi!'); // Silme işlemi başarılı mesajı
            loadBlogs(); // Blogları yeniden yükle
        } catch (error) {
            console.error('Hata:', error);
        }
    }
}

// Blog yazısını düzenle
async function editBlog(id) {
    try {
        const blog = await callAPI(`/blogs/${id}`);
        document.getElementById('blogTitle').value = blog.title;
        document.getElementById('blogContent').value = blog.content;
        document.getElementById('blogTags').value = blog.tags ? blog.tags.join(', ') : '';
        document.getElementById('blogImage').value = blog.imageUrl || '';
        document.getElementById('blogId').value = blog._id;
    } catch (error) {
        console.error('Hata:', error);
    }
}

// Hakkımda içeriğini yükle
async function loadAboutContent() {
    try {
        const response = await fetch(`${API_URL}/api/about`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        document.getElementById('aboutContent').value = data.content || '';
    } catch (error) {
        console.error('Hakkımda içeriği yüklenemedi:', error);
    }
}

// Hakkımda formunu gönder
document.getElementById('aboutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const content = document.getElementById('aboutContent').value;
        const response = await fetch('/api/about', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        alert('Hakkımda içeriği başarıyla güncellendi!');
    } catch (error) {
        console.error('Hakkımda içeriği güncellenemedi:', error);
        alert('Güncelleme sırasında bir hata oluştu!');
    }
});

// Mesajları yükle
async function loadMessages() {
    try {
        const response = await fetch(`${API_URL}/api/messages`, {
            credentials: 'include' // Cookie'leri gönder
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const messages = await response.json();
        displayMessages(messages);
    } catch (error) {
        console.error('Mesajlar yüklenemedi:', error);
    }
}

// Mesajları görüntüle
function displayMessages(messages) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;

    if (!messages.length) {
        messagesContainer.innerHTML = '<p>Henüz mesaj bulunmuyor.</p>';
        return;
    }

    messagesContainer.innerHTML = messages.map(message => `
        <div class="message ${message.isRead ? 'read' : 'unread'}">
            <h3>Gönderen: ${message.name}</h3>
            <p>Email: ${message.email}</p>
            <p>Mesaj: ${message.message}</p>
            <p>Tarih: ${new Date(message.date).toLocaleString()}</p>
            <div class="message-actions">
                ${!message.isRead ? 
                    `<button onclick="markAsRead('${message._id}')" class="read-btn">Okundu Olarak İşaretle</button>` : 
                    ''
                }
                <button onclick="deleteMessage('${message._id}')" class="delete-btn">Sil</button>
            </div>
        </div>
    `).join('');
}

// Mesajı okundu olarak işaretle
async function markAsRead(messageId) {
    try {
        const response = await fetch(`${API_URL}/api/messages/${messageId}`, {
            method: 'PATCH',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        loadMessages(); // Mesajları yeniden yükle
    } catch (error) {
        console.error('Mesaj durumu güncellenemedi:', error);
    }
}

// Mesajı sil
async function deleteMessage(messageId) {
    if (confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
        try {
            const response = await fetch(`${API_URL}/api/messages/${messageId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            loadMessages(); // Mesajları yeniden yükle
        } catch (error) {
            console.error('Mesaj silinemedi:', error);
        }
    }
}

// Çıkış yap
function logout() {
    sessionStorage.removeItem('token'); // Token'ı sil
    window.location.href = '/';
}


document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("adminLoginForm");
    const button = document.getElementById("adminSubmitBtn");

    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        button.textContent = "AUTHORIZING...";
        button.disabled = true;

        checkAuth();
    });

});    


