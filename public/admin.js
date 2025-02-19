// Admin paneli güvenlik kontrolü
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
        const password = prompt('Lütfen admin şifresini girin:');
        if (password === process.env.ADMIN_PASSWORD) {
            sessionStorage.setItem('adminAuthenticated', 'true');
        } else {
            alert('Yanlış şifre!');
            window.location.href = '/';
            return;
        }
    }
}

// Sayfa yüklendiğinde güvenlik kontrolü yap
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadMessages();
    loadAboutContent();
    loadBlogs();
});

// API çağrılarını güncelle
const API_URL = window.location.origin;

// Mesajları yükle
async function loadMessages() {
    try {
        const response = await fetch(`${API_URL}/api/messages`);
        const messages = await response.json();
        displayMessages(messages);
    } catch (error) {
        console.error('Hata:', error);
    }
}

// Mesajları görüntüle
function displayMessages(messages) {
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.innerHTML = messages.map(msg => `
        <div class="message ${msg.isRead ? 'read' : 'unread'}">
            <h3>${msg.name}</h3>
            <p><strong>Email:</strong> ${msg.email}</p>
            <p>${msg.message}</p>
            <small>${new Date(msg.date).toLocaleString()}</small>
            ${!msg.isRead ? `<button onclick="markAsRead('${msg._id}')">Okundu olarak işaretle</button>` : ''}
            <button onclick="deleteMessage('${msg._id}')" class="delete-btn">Sil</button>
        </div>
    `).join('');
}

// Mesajı okundu olarak işaretle
async function markAsRead(id) {
    try {
        const response = await fetch(`${API_URL}/api/messages/${id}`, {
            method: 'PATCH'
        });
        if (response.ok) {
            loadMessages();
        }
    } catch (error) {
        console.error('Hata:', error);
    }
}

// Mesajı sil
async function deleteMessage(id) {
    if (confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
        try {
            const response = await fetch(`${API_URL}/api/messages/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadMessages();
            }
        } catch (error) {
            console.error('Hata:', error);
        }
    }
}

// Hakkımda içeriğini yükle
async function loadAboutContent() {
    try {
        const response = await fetch(`${API_URL}/api/about`);
        const data = await response.json();
        if (data) {
            document.getElementById('aboutContent').value = data.content;
        }
    } catch (error) {
        console.error('Hata:', error);
    }
}

// Hakkımda formunu gönder
document.getElementById('aboutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('aboutContent').value;

    try {
        const response = await fetch(`${API_URL}/api/about`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: 'Hakkımda',
                content: content
            })
        });

        if (response.ok) {
            alert('Hakkımda içeriği başarıyla güncellendi!');
        } else {
            alert('Güncelleme sırasında bir hata oluştu!');
        }
    } catch (error) {
        console.error('Hata:', error);
        alert('Bir hata oluştu!');
    }
});

// Çıkış yap
function logout() {
    sessionStorage.removeItem('adminAuthenticated');
    window.location.href = 'index.html';
}

// Blog yazılarını yükle
async function loadBlogs() {
    try {
        const response = await fetch(`${API_URL}/api/blogs`);
        const blogs = await response.json();
        displayBlogs(blogs);
    } catch (error) {
        console.error('Hata:', error);
    }
}

// Blog yazılarını görüntüle
function displayBlogs(blogs) {
    const blogList = document.getElementById('blogList');
    blogList.innerHTML = blogs.map(blog => `
        <div class="blog-item">
            <h3>${blog.title}</h3>
            <p>${blog.content.substring(0, 100)}...</p>
            <small>Tarih: ${new Date(blog.date).toLocaleString()}</small>
            <div class="blog-actions">
                <button onclick="editBlog('${blog._id}')">Düzenle</button>
                <button onclick="deleteBlog('${blog._id}')" class="delete-btn">Sil</button>
            </div>
        </div>
    `).join('');
}

// Blog formunu göster
function showBlogForm() {
    document.getElementById('blogForm').style.display = 'block';
    document.getElementById('blogId').value = '';
    document.getElementById('addBlogForm').reset();
}

// Blog düzenleme formunu göster
async function editBlog(id) {
    try {
        const response = await fetch(`${API_URL}/api/blogs/${id}`);
        const blog = await response.json();
        
        document.getElementById('blogId').value = blog._id;
        document.getElementById('blogTitle').value = blog.title;
        document.getElementById('blogContent').value = blog.content;
        document.getElementById('blogTags').value = blog.tags.join(', ');
        document.getElementById('blogImage').value = blog.imageUrl || '';
        
        document.getElementById('blogForm').style.display = 'block';
    } catch (error) {
        console.error('Hata:', error);
    }
}

// Blog düzenlemeyi iptal et
function cancelBlogEdit() {
    document.getElementById('blogForm').style.display = 'none';
    document.getElementById('addBlogForm').reset();
}

// Blog ekle/güncelle
document.getElementById('addBlogForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const blogId = document.getElementById('blogId').value;
    const blogData = {
        title: document.getElementById('blogTitle').value,
        content: document.getElementById('blogContent').value,
        tags: document.getElementById('blogTags').value.split(',').map(tag => tag.trim()),
        imageUrl: document.getElementById('blogImage').value
    };

    try {
        const url = blogId 
            ? `${API_URL}/api/blogs/${blogId}`
            : `${API_URL}/api/blogs`;
        
        const response = await fetch(url, {
            method: blogId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(blogData)
        });

        if (response.ok) {
            alert(blogId ? 'Blog yazısı güncellendi!' : 'Blog yazısı eklendi!');
            document.getElementById('blogForm').style.display = 'none';
            loadBlogs();
        }
    } catch (error) {
        console.error('Hata:', error);
        alert('Bir hata oluştu!');
    }
});

// Blog sil
async function deleteBlog(id) {
    if (confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) {
        try {
            const response = await fetch(`${API_URL}/api/blogs/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadBlogs();
            }
        } catch (error) {
            console.error('Hata:', error);
        }
    }
}
