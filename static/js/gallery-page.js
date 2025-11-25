const galleryManifestUrl = 'gallery-data.json';
const GALLERY_IMAGE_PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const MAX_IMAGE_LOAD_RETRIES = 3;

const categoryNames = {
    'exhibition': {
        title: { fa: 'کارهای نمایشگاهی', en: 'Exhibition Works' },
        description: { fa: 'نمونه کارهای نمایشگاهی', en: 'Exhibition project samples' }
    },
    'polygon-3d': {
        title: { fa: 'سازه های پلیگان /پارامتریک/ژئومتریک', en: '3D Polygon / Parametric Structures' },
        description: { fa: 'نمونه کارهای سازه‌های پلیگان و پارامتریک', en: 'Parametric and polygon structure portfolio' }
    },
    'channel-letters': {
        title: { fa: 'حروف چنلیوم', en: 'Channel Letters' },
        description: { fa: 'نمونه کارهای حروف چنلیوم', en: 'Channel letter signage projects' }
    },
    'steel-letters': {
        title: { fa: 'حروف استیل', en: 'Steel Letters' },
        description: { fa: 'نمونه کارهای حروف استیل', en: 'Premium steel lettering samples' }
    },
    'metal-letters': {
        title: { fa: 'حروف فلزی', en: 'Metal Letters' },
        description: { fa: 'نمونه کارهای حروف فلزی', en: 'Durable metal signage projects' }
    },
    'plastic-letters': {
        title: { fa: 'حروف پلاستیک', en: 'Plastic Letters' },
        description: { fa: 'نمونه کارهای حروف پلاستیک', en: 'Lightweight plastic lettering displays' }
    },
    'european': {
        title: { fa: 'تابلو اروپایی', en: 'European Signs' },
        description: { fa: 'نمونه کارهای تابلو اروپایی', en: 'Classic European-style signage' }
    },
    'lightbox': {
        title: { fa: 'انواع لایت باکس و باکس', en: 'Lightbox & Box Signs' },
        description: { fa: 'نمونه کارهای لایت باکس و باکس', en: 'Backlit lightbox installations' }
    },
    'neon-plex': {
        title: { fa: 'تابلو نئون فلکسی', en: 'Neon Flex Signs' },
        description: { fa: 'نمونه کارهای تابلو نئون فلکسی', en: 'Neon flex signage showcase' }
    },
    'led': {
        title: { fa: 'تابلوی LED', en: 'LED Signs' },
        description: { fa: 'نمونه کارهای تابلوی LED', en: 'Energy-efficient LED signage examples' }
    },
    'led-display': {
        title: { fa: 'تلویزیون شهری و تابلو روان', en: 'LED Display & Digital Signage' },
        description: { fa: 'نمونه کارهای تلویزیون شهری و تابلو روان', en: 'Urban LED screens and digital boards' }
    },
    'traffic-signs': {
        title: { fa: 'تابلوهای ترافیکی', en: 'Traffic Signs' },
        description: { fa: 'نمونه کارهای تابلوهای ترافیکی', en: 'Traffic and wayfinding signage' }
    }
};

function reorderPolygonProjects(items) {
    if (!Array.isArray(items)) {
        return items;
    }

    const startIndex = 52; // پروژه 53 (zero-based)
    const endIndex = 74;   // پروژه 74 (exclusive)

    if (items.length <= startIndex) {
        return items;
    }

    const sliceEnd = Math.min(endIndex, items.length);
    const featuredProjects = items.slice(startIndex, sliceEnd);
    const remainingProjects = items.slice(0, startIndex).concat(items.slice(sliceEnd));

    return featuredProjects.concat(remainingProjects);
}

let galleryDataByCategory = {};
let galleryDataAll = [];
let manifestLoaded = false;
let galleryImageObserver = null;
let galleryManifestCache = null;
let currentGalleryLang = getCurrentLanguage();

function buildGalleryData(manifest) {
    galleryManifestCache = manifest || galleryManifestCache;
    currentGalleryLang = getCurrentLanguage();
    galleryDataByCategory = {};
    galleryDataAll = [];

    const categories = new Set([
        ...Object.keys(categoryNames),
        ...(manifest ? Object.keys(manifest) : [])
    ]);

    categories.forEach((category) => {
        const images = Array.isArray(manifest?.[category]) ? manifest[category] : [];
        const { title: baseTitle } = getCategoryCopy(category, currentGalleryLang);
        const projectLabel = currentGalleryLang === 'en' ? 'Project' : 'پروژه';
        let items = images.map((image, index) => ({
            id: `${category}-${index + 1}`,
            title: `${baseTitle} - ${projectLabel} ${index + 1}`,
            category,
            image
        }));

        if (category === 'polygon-3d') {
            items = reorderPolygonProjects(items);
        }

        galleryDataByCategory[category] = items;
        galleryDataAll.push(...items);
    });

    manifestLoaded = true;
}

function getItemsForCategory(category) {
    if (category === 'all') {
        return galleryDataAll;
    }
    return galleryDataByCategory[category] || [];
}

function setGalleryLoadingState() {
    const galleryGrid = document.getElementById('categoryGallery');
    const emptyState = document.getElementById('emptyState');
    const lang = getCurrentLanguage();
    const loadingText = lang === 'en' ? 'Loading gallery...' : 'در حال بارگذاری گالری...';

    if (galleryGrid) {
        galleryGrid.style.display = 'grid';
        galleryGrid.innerHTML = `
            <div class="gallery-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>${loadingText}</p>
            </div>
        `;
    }

    if (emptyState) {
        emptyState.style.display = 'none';
    }
}

function showGalleryError() {
    const galleryGrid = document.getElementById('categoryGallery');
    const emptyState = document.getElementById('emptyState');
    const lang = getCurrentLanguage();
    const heading = lang === 'en' ? 'There was a problem loading images' : 'مشکلی در بارگذاری تصاویر رخ داد';
    const body = lang === 'en' ? 'Please refresh the page and try again.' : 'لطفاً صفحه را مجدداً بارگذاری کنید.';

    if (galleryGrid) {
        galleryGrid.style.display = 'none';
    }

    if (emptyState) {
        emptyState.style.display = 'block';
        emptyState.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <h3>${heading}</h3>
            <p>${body}</p>
        `;
    }
}

async function loadGalleryManifest() {
    setGalleryLoadingState();

    // Inline manifest support (for file:// usage)
    if (window.__GALLERY_MANIFEST__) {
        galleryManifestCache = window.__GALLERY_MANIFEST__;
        buildGalleryData(window.__GALLERY_MANIFEST__);
        displayCategoryGallery();
        return Promise.resolve();
    }

    try {
        const response = await fetch(`${galleryManifestUrl}?v=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('Failed to load gallery manifest');
        }

        const manifest = await response.json();
        window.__GALLERY_MANIFEST__ = manifest;
        buildGalleryData(manifest || {});
        displayCategoryGallery();
        return Promise.resolve();
    } catch (error) {
        console.error('Gallery manifest load error:', error);

        if (window.__GALLERY_MANIFEST__) {
            galleryManifestCache = window.__GALLERY_MANIFEST__;
            buildGalleryData(window.__GALLERY_MANIFEST__);
            displayCategoryGallery();
            return Promise.resolve();
        } else {
            showGalleryError();
            return Promise.reject(error);
        }
    }
}

function getCategoryFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('category') || 'all';
}

function displayCategoryGallery() {
    if (!manifestLoaded) {
        return;
    }

    const category = getCategoryFromURL();
    const galleryGrid = document.getElementById('categoryGallery');
    const emptyState = document.getElementById('emptyState');
    const categoryTitle = document.getElementById('categoryTitle');
    const categoryDescription = document.getElementById('categoryDescription');
    const galleryDescriptionBlock = document.getElementById('galleryDescriptionBlock');

    const lang = getCurrentLanguage();

    if (category === 'all') {
        categoryTitle.textContent = lang === 'en' ? 'Portfolio Gallery' : 'گالری نمونه کارها';
        categoryDescription.textContent = lang === 'en' ? 'Showcase of our successful projects' : 'نمونه‌هایی از پروژه‌های موفق ما';
        if (galleryDescriptionBlock) {
            galleryDescriptionBlock.style.display = 'block';
        }
    } else if (categoryNames[category]) {
        const copy = getCategoryCopy(category, lang);
        categoryTitle.textContent = copy.title;
        categoryDescription.textContent = copy.description;
        if (galleryDescriptionBlock) {
            galleryDescriptionBlock.style.display = 'none';
        }
    } else {
        categoryTitle.textContent = lang === 'en' ? 'Portfolio Gallery' : 'گالری نمونه کارها';
        categoryDescription.textContent = '';
        if (galleryDescriptionBlock) {
            galleryDescriptionBlock.style.display = 'none';
        }
    }

    const itemsForCategory = getItemsForCategory(category);

    if (!itemsForCategory.length) {
        if (galleryGrid) {
            galleryGrid.style.display = 'none';
        }
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        window.currentGalleryItems = [];
        return;
    }

    if (galleryGrid) {
        galleryGrid.style.display = 'grid';
        galleryGrid.innerHTML = itemsForCategory.map((item, index) => {
            // Load first 9 images with high priority to prevent hanging
            const isPriorityImage = index < 9;
            return `
            <div class="gallery-item" data-category="${item.category}" data-index="${index}" data-image="${item.image}" data-title="${item.title}">
                <img class="gallery-image loading" src="${GALLERY_IMAGE_PLACEHOLDER}" data-src="${item.image}" alt="${item.title}" loading="${isPriorityImage ? 'eager' : 'lazy'}" decoding="async" ${isPriorityImage ? 'fetchpriority="high"' : ''}>
                <div class="gallery-item-overlay">
                    <div class="gallery-item-title">${item.title}</div>
                </div>
            </div>
        `;
        }).join('');

        const renderedItems = galleryGrid.querySelectorAll('.gallery-item');
        const isMobile = window.innerWidth <= 768;
        // Reduce animation delay on mobile for better performance
        const delay = isMobile ? 15 : 80;
        const maxItems = isMobile ? 20 : renderedItems.length; // Limit animated items on mobile
        
        renderedItems.forEach((item, index) => {
            if (index < maxItems) {
                item.style.opacity = '0';
                item.style.transform = 'translateY(30px)';
                setTimeout(() => {
                    item.style.transition = 'all 0.4s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * delay);
            } else {
                // Show remaining items immediately on mobile
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }
        });

        renderedItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                openLightbox(index, itemsForCategory);
            });
        });

        initializeGalleryImages(renderedItems);
    }

    if (emptyState) {
        emptyState.style.display = 'none';
    }

    window.currentGalleryItems = itemsForCategory;
    
    // Update nav logo background slideshow
    initNavLogoSlideshow();
}

let currentLightboxIndex = 0;
let currentLightboxItems = [];

function openLightbox(index, items) {
    currentLightboxIndex = index;
    currentLightboxItems = items;

    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxCounter = document.getElementById('lightboxCounter');

    if (!lightbox || !lightboxImage || !lightboxTitle || !lightboxCounter) {
        return;
    }

    if (!items.length) {
        return;
    }

    const item = items[index];

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    lightboxTitle.textContent = item.title;
    lightboxCounter.textContent = `${index + 1} / ${items.length}`;

    loadLightboxImageWithRetry(item);

    updateLightboxNavigation();
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
    }
    document.body.style.overflow = '';
}

function nextImage() {
    if (!currentLightboxItems.length) {
        return;
    }
    currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxItems.length;
    updateLightboxImage();
}

function prevImage() {
    if (!currentLightboxItems.length) {
        return;
    }
    currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxItems.length) % currentLightboxItems.length;
    updateLightboxImage();
}

function updateLightboxImage() {
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxCounter = document.getElementById('lightboxCounter');

    if (!lightboxImage || !lightboxTitle || !lightboxCounter) {
        return;
    }

    const item = currentLightboxItems[currentLightboxIndex];

    lightboxTitle.textContent = item.title;
    lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${currentLightboxItems.length}`;

    loadLightboxImageWithRetry(item);

    updateLightboxNavigation();
}

function updateLightboxNavigation() {
    // Navigation controls remain visible; hook for future visual feedback.
}

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxContent = lightbox ? lightbox.querySelector('.lightbox-content') : null;

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', (event) => {
            event.stopPropagation();
            prevImage();
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', (event) => {
            event.stopPropagation();
            nextImage();
        });
    }

    if (lightbox) {
        lightbox.addEventListener('click', (event) => {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });
    }

    let touchStartX = 0;
    let touchEndX = 0;

    function handleTouchStart(event) {
        touchStartX = event.changedTouches[0].screenX;
    }

    function handleTouchEnd(event) {
        touchEndX = event.changedTouches[0].screenX;
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (document.documentElement.dir === 'rtl') {
                if (diff < 0) {
                    prevImage();
                } else {
                    nextImage();
                }
            } else {
                if (diff > 0) {
                    nextImage();
                } else {
                    prevImage();
                }
            }
        }
    }

    if (lightboxContent) {
        lightboxContent.addEventListener('touchstart', handleTouchStart, { passive: true });
        lightboxContent.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    document.addEventListener('keydown', (event) => {
        if (!lightbox || !lightbox.classList.contains('active')) {
            return;
        }

        switch (event.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowRight':
            case 'ArrowLeft':
                event.preventDefault();
                if (document.documentElement.dir === 'rtl') {
                    if (event.key === 'ArrowRight') {
                        prevImage();
                    } else {
                        nextImage();
                    }
                } else {
                    if (event.key === 'ArrowRight') {
                        nextImage();
                    } else {
                        prevImage();
                    }
                }
                break;
            default:
                break;
        }
    });
}

// Nav Logo Background Slideshow
let navLogoSlideshowInterval = null;

function initNavLogoSlideshow() {
    const navLogoBg = document.getElementById('navLogoBg');
    if (!navLogoBg) return;

    // Clear existing interval
    if (navLogoSlideshowInterval) {
        clearInterval(navLogoSlideshowInterval);
        navLogoSlideshowInterval = null;
    }

    // Get current category from URL
    const category = getCategoryFromURL();
    
    // Get manifest
    const manifest = window.__GALLERY_MANIFEST__ || galleryManifestCache || {};
    
    // If category is 'all', use channel-letters as default
    const categoryKey = category === 'all' ? 'channel-letters' : category;
    
    // Get images for this category
    const categoryImages = manifest[categoryKey] || [];
    
    if (categoryImages.length === 0) {
        navLogoBg.classList.remove('active');
        return;
    }
    
    let currentIndex = 0;
    
    function updateBackground() {
        if (categoryImages.length === 0) return;
        
        const imageUrl = categoryImages[currentIndex];
        navLogoBg.style.backgroundImage = `url('${imageUrl}')`;
        navLogoBg.classList.add('active');
        
        currentIndex = (currentIndex + 1) % categoryImages.length;
    }
    
    // Set initial background
    updateBackground();
    
    // Change every 2 seconds
    navLogoSlideshowInterval = setInterval(updateBackground, 2000);
}

function setupBackToTopButton() {
    const backToTopBtn = document.getElementById('categoryBackToTop');
    const categoryHeader = document.getElementById('categoryHeader');

    if (!backToTopBtn || !categoryHeader) {
        return;
    }

    const toggleVisibility = () => {
        if (window.scrollY > categoryHeader.offsetHeight + 200) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    };

    backToTopBtn.addEventListener('click', () => {
        categoryHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    toggleVisibility();
    window.addEventListener('scroll', toggleVisibility);
}

function initGalleryMobileNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const servicesDropdownMenu = document.querySelector('.nav-item-dropdown .nav-dropdown-menu');

    if (!hamburger || !navMenu || hamburger.dataset.navInitialized === 'true') {
        return;
    }

    hamburger.dataset.navInitialized = 'true';

    const navLinks = document.querySelectorAll('.nav-link, .nav-dropdown-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');

        if (servicesDropdownMenu && window.innerWidth <= 768) {
            servicesDropdownMenu.classList.toggle('show');
        }
    });

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            if (servicesDropdownMenu) {
                servicesDropdownMenu.classList.remove('show');
            }
        });
    });
}

function initializeGalleryImages(renderedItems) {
    const images = Array.from(renderedItems)
        .map((item) => item.querySelector('img[data-src]'))
        .filter(Boolean);

    if (!images.length) {
        return;
    }

    if ('IntersectionObserver' in window) {
        if (galleryImageObserver) {
            galleryImageObserver.disconnect();
        }

        galleryImageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    observer.unobserve(img);
                    const src = img.dataset.src;
                    if (src) {
                        loadImageWithRetry(img, src);
                    }
                }
            });
        }, {
            rootMargin: '200px 0px',
            threshold: 0.1
        });

        images.forEach((img, index) => {
            img.classList.add('loading');
            // Load first 9 images immediately to prevent hanging
            if (index < 9 && img.loading === 'eager') {
                const src = img.dataset.src;
                if (src) {
                    loadImageWithRetry(img, src);
                }
            } else {
                galleryImageObserver.observe(img);
            }
        });
    } else {
        images.forEach((img) => {
            img.classList.add('loading');
            loadImageWithRetry(img, img.dataset.src);
        });
    }
}

function buildCacheSafeSrc(src, attempt) {
    if (attempt <= 1) {
        return src;
    }
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}retry=${attempt}-${Date.now()}`;
}

function loadImageWithRetry(imgElement, src, attempt = 1) {
    if (!imgElement || !src) {
        return;
    }

    const targetSrc = buildCacheSafeSrc(src, attempt);
    const testImage = new Image();

    testImage.onload = () => {
        imgElement.src = targetSrc;
        imgElement.dataset.loaded = 'true';
        imgElement.classList.remove('loading', 'error');
    };

    testImage.onerror = () => {
        if (attempt < MAX_IMAGE_LOAD_RETRIES) {
            setTimeout(() => loadImageWithRetry(imgElement, src, attempt + 1), 400 * attempt);
        } else {
            imgElement.classList.remove('loading');
            imgElement.classList.add('error');
            imgElement.src = GALLERY_IMAGE_PLACEHOLDER;
            imgElement.alt = 'مشکل در بارگذاری تصویر';
        }
    };

    testImage.src = targetSrc;
}

function loadLightboxImageWithRetry(item, attempt = 1) {
    const lightboxImage = document.getElementById('lightboxImage');
    if (!lightboxImage || !item) {
        return;
    }

    const targetSrc = buildCacheSafeSrc(item.image, attempt);
    const loader = new Image();

    lightboxImage.style.opacity = '0';
    lightboxImage.style.filter = 'blur(6px)';
    lightboxImage.classList.remove('error');

    loader.onload = () => {
        lightboxImage.src = targetSrc;
        lightboxImage.alt = item.title;
        requestAnimationFrame(() => {
            lightboxImage.style.transition = 'opacity 0.3s ease, filter 0.3s ease';
            lightboxImage.style.opacity = '1';
            lightboxImage.style.filter = 'blur(0)';
        });
    };

    loader.onerror = () => {
        if (attempt < MAX_IMAGE_LOAD_RETRIES) {
            setTimeout(() => loadLightboxImageWithRetry(item, attempt + 1), 500 * attempt);
        } else {
            lightboxImage.classList.add('error');
            lightboxImage.src = GALLERY_IMAGE_PLACEHOLDER;
            lightboxImage.alt = 'مشکل در بارگذاری تصویر';
            lightboxImage.style.opacity = '1';
            lightboxImage.style.filter = 'blur(0)';
        }
    };

    loader.src = targetSrc;
}

function getCurrentLanguage() {
    return document.documentElement.lang === 'en' ? 'en' : 'fa';
}

function getCategoryCopy(category, lang) {
    const info = categoryNames[category];
    const fallbackTitle = lang === 'en' ? 'Sample Work' : 'نمونه کار';
    const fallbackDescription = lang === 'en' ? 'Selected project samples' : 'نمونه پروژه‌ها';

    if (!info) {
        return { title: fallbackTitle, description: fallbackDescription };
    }

    return {
        title: info.title?.[lang] || info.title?.fa || fallbackTitle,
        description: info.description?.[lang] || info.description?.fa || fallbackDescription
    };
}

window.addEventListener('languageChanged', (event) => {
    currentGalleryLang = event.detail?.lang || getCurrentLanguage();
    if (galleryManifestCache) {
        buildGalleryData(galleryManifestCache);
    }
    if (manifestLoaded) {
        displayCategoryGallery();
    }
});

function initializeGalleryPage() {
    initLightbox();
    initGalleryMobileNavigation();
    loadGalleryManifest().then(() => {
        // Initialize nav logo slideshow after manifest is loaded
        initNavLogoSlideshow();
        setupBackToTopButton();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGalleryPage);
} else {
    initializeGalleryPage();
}

