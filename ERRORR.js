// ERRORR Products Gallery
// این فایل عکس‌ها و ویدیوهای محصولات ERRORR را نمایش می‌دهد

const ERRORR_IMAGES_PATH = 'images/errorr-products/';
const ERRORR_VIDEOS_PATH = 'images/errorr-products/';
const ERRORR_IMAGE_PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const MAX_IMAGE_LOAD_RETRIES = 3;
let errorrImageObserver = null;

// لیست فایل‌های عکس و ویدیو (باید به صورت دستی یا با اسکریپت به‌روزرسانی شود)
// یا می‌توانید از یک فایل JSON استفاده کنید
let errorrMediaFiles = [];

// تابع برای تشخیص نوع فایل
function getFileType(filename) {
    const ext = filename.toLowerCase().split('.').pop();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
    
    if (imageExts.includes(ext)) return 'image';
    if (videoExts.includes(ext)) return 'video';
    return 'unknown';
}

// تابع برای بارگذاری لیست فایل‌ها از سرور
async function loadErrorrMediaList() {
    try {
        // اگر فایل JSON وجود دارد، از آن استفاده کن
        const response = await fetch('static/data/errorr-media.json');
        if (response.ok) {
            const data = await response.json();
            errorrMediaFiles = data.files || [];
            return errorrMediaFiles;
        }
    } catch (error) {
        console.log('No errorr-media.json found, using default list');
    }
    
    // اگر فایل JSON وجود نداشت، از لیست پیش‌فرض استفاده کن
    // این لیست باید به صورت دستی به‌روزرسانی شود یا با اسکریپت Python
    return [];
}

// تابع برای پیدا کردن اولین عکس
function findFirstImage(files) {
    for (const file of files) {
        if (getFileType(file) === 'image') {
            return file;
        }
    }
    return null;
}

// تابع برای نمایش عکس اصلی در عنوان (غیرفعال شده - فقط متن با RGB نمایش داده می‌شود)
async function displayErrorrMainImage() {
    // این تابع دیگر استفاده نمی‌شود - متن با CSS RGB نمایش داده می‌شود
    return;
}

// تابع برای نمایش گالری ERRORR
async function displayErrorrGallery() {
    const container = document.getElementById('errorr-gallery-container');
    if (!container) return;
    
    const mediaFiles = await loadErrorrMediaList();
    
    if (mediaFiles.length === 0) {
        container.innerHTML = `
            <div class="errorr-empty-state">
                <i class="fas fa-images"></i>
                <p>هنوز محتوایی اضافه نشده است</p>
            </div>
        `;
        return;
    }
    
    // ایجاد گرید گالری
    const galleryGrid = document.createElement('div');
    galleryGrid.className = 'errorr-gallery-grid';
    
    mediaFiles.forEach((file, index) => {
        const fileType = getFileType(file);
        const filePath = file.startsWith('images/') ? file : `${ERRORR_IMAGES_PATH}${file}`;
        
        if (fileType === 'image') {
            const item = document.createElement('div');
            item.className = 'errorr-gallery-item errorr-image-item';
            item.innerHTML = `
                <img class="errorr-gallery-image loading" src="${ERRORR_IMAGE_PLACEHOLDER}" data-src="${filePath}" alt="محصولات ERRORR ${index + 1}" loading="lazy" decoding="async">
                <div class="errorr-item-overlay">
                    <i class="fas fa-search-plus"></i>
                </div>
            `;
            item.addEventListener('click', () => openErrorrLightbox(index, mediaFiles));
            galleryGrid.appendChild(item);
        } else if (fileType === 'video') {
            const item = document.createElement('div');
            item.className = 'errorr-gallery-item errorr-video-item';
            item.innerHTML = `
                <video muted playsinline>
                    <source src="${filePath}" type="video/${file.split('.').pop()}">
                </video>
                <div class="errorr-video-play-button">
                    <i class="fas fa-play"></i>
                </div>
                <div class="errorr-item-overlay">
                    <i class="fas fa-play-circle"></i>
                </div>
            `;
            item.addEventListener('click', () => openErrorrLightbox(index, mediaFiles));
            
            // پخش خودکار ویدیو هنگام hover
            const video = item.querySelector('video');
            item.addEventListener('mouseenter', () => {
                video.play().catch(() => {});
            });
            item.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });
            
            galleryGrid.appendChild(item);
        }
    });
    
    container.innerHTML = '';
    container.appendChild(galleryGrid);
    
    // Initialize image loading with IntersectionObserver
    initializeErrorrImages(galleryGrid);
}

// تابع برای لود کردن عکس‌ها با retry mechanism
function loadErrorrImageWithRetry(imgElement, src, attempt = 1) {
    if (!imgElement || !src) {
        return;
    }

    const targetSrc = attempt > 1 ? `${src}?retry=${attempt}-${Date.now()}` : src;
    const testImage = new Image();

    testImage.onload = () => {
        imgElement.src = targetSrc;
        imgElement.dataset.loaded = 'true';
        imgElement.classList.remove('loading', 'error');
    };

    testImage.onerror = () => {
        if (attempt < MAX_IMAGE_LOAD_RETRIES) {
            setTimeout(() => loadErrorrImageWithRetry(imgElement, src, attempt + 1), 400 * attempt);
        } else {
            imgElement.classList.remove('loading');
            imgElement.classList.add('error');
            imgElement.src = ERRORR_IMAGE_PLACEHOLDER;
            imgElement.alt = 'مشکل در بارگذاری تصویر';
        }
    };

    testImage.src = targetSrc;
}

// تابع برای initialize کردن عکس‌های گالری
function initializeErrorrImages(galleryGrid) {
    const images = Array.from(galleryGrid.querySelectorAll('img[data-src]'));

    if (!images.length) {
        return;
    }

    if ('IntersectionObserver' in window) {
        if (errorrImageObserver) {
            errorrImageObserver.disconnect();
        }

        errorrImageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    observer.unobserve(img);
                    const src = img.dataset.src;
                    if (src) {
                        loadErrorrImageWithRetry(img, src);
                    }
                }
            });
        }, {
            rootMargin: '200px 0px',
            threshold: 0.1
        });

        images.forEach((img) => {
            img.classList.add('loading');
            errorrImageObserver.observe(img);
        });
    } else {
        images.forEach((img) => {
            img.classList.add('loading');
            loadErrorrImageWithRetry(img, img.dataset.src);
        });
    }
}

// تابع برای باز کردن Lightbox
function openErrorrLightbox(index, mediaFiles) {
    // ایجاد overlay برای lightbox
    const lightbox = document.createElement('div');
    lightbox.className = 'errorr-lightbox';
    lightbox.innerHTML = `
        <div class="errorr-lightbox-content">
            <button class="errorr-lightbox-close" aria-label="بستن">
                <i class="fas fa-times"></i>
            </button>
            <button class="errorr-lightbox-prev" aria-label="قبلی">
                <i class="fas fa-chevron-right"></i>
            </button>
            <button class="errorr-lightbox-next" aria-label="بعدی">
                <i class="fas fa-chevron-left"></i>
            </button>
            <div class="errorr-lightbox-media"></div>
        </div>
    `;
    
    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';
    
    let currentIndex = index;
    
    function showMedia(idx) {
        if (idx < 0) idx = mediaFiles.length - 1;
        if (idx >= mediaFiles.length) idx = 0;
        currentIndex = idx;
        
        const file = mediaFiles[idx];
        const fileType = getFileType(file);
        const filePath = file.startsWith('images/') ? file : `${ERRORR_IMAGES_PATH}${file}`;
        const mediaContainer = lightbox.querySelector('.errorr-lightbox-media');
        
        if (fileType === 'image') {
            mediaContainer.innerHTML = `<img src="${filePath}" alt="محصولات ERRORR ${idx + 1}">`;
        } else if (fileType === 'video') {
            mediaContainer.innerHTML = `
                <video controls autoplay>
                    <source src="${filePath}" type="video/${file.split('.').pop()}">
                </video>
            `;
        }
    }
    
    showMedia(currentIndex);
    
    // رویدادهای دکمه‌ها
    lightbox.querySelector('.errorr-lightbox-close').addEventListener('click', () => {
        document.body.removeChild(lightbox);
        document.body.style.overflow = '';
    });
    
    lightbox.querySelector('.errorr-lightbox-prev').addEventListener('click', () => {
        showMedia(currentIndex - 1);
    });
    
    lightbox.querySelector('.errorr-lightbox-next').addEventListener('click', () => {
        showMedia(currentIndex + 1);
    });
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            document.body.removeChild(lightbox);
            document.body.style.overflow = '';
        }
    });
    
    // کلیدهای صفحه‌کلید
    document.addEventListener('keydown', function handleKeydown(e) {
        if (e.key === 'Escape') {
            document.body.removeChild(lightbox);
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKeydown);
        } else if (e.key === 'ArrowRight') {
            showMedia(currentIndex - 1);
        } else if (e.key === 'ArrowLeft') {
            showMedia(currentIndex + 1);
        }
    });
}

// بارگذاری گالری هنگام لود صفحه
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        displayErrorrMainImage();
        // فقط در صفحه errorr.html گالری را نمایش بده
        if (window.location.pathname.includes('errorr.html')) {
            displayErrorrGallery();
        }
    });
} else {
    displayErrorrMainImage();
    // فقط در صفحه errorr.html گالری را نمایش بده
    if (window.location.pathname.includes('errorr.html')) {
        displayErrorrGallery();
    }
}

