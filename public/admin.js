// Admin paneli güvenlik kontrolü
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
        const password = prompt('Lütfen admin şifresini girin:');
        const ADMIN_PASSWORD = 'BedirMujde123';
        if (password === 'BedirMujde123' ) {
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
    loadBlogs();
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

    if (!title || !content) {
        alert('Başlık ve içerik alanları zorunludur!');
        return;
    }

    try {
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
        document.getElementById('blogForm').reset();
        loadBlogs();
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
        console.error('Hata:', error);
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
    if (confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) {
        try {
            await callAPI(`/blogs/${id}`, {
                method: 'DELETE'
            });
            loadBlogs();
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

// Çıkış yap
function logout() {
    sessionStorage.removeItem('adminAuthenticated');
    window.location.href = '/';
}
