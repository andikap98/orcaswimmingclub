/* ===========================
   ORCA SWIMMING CLUB — SCRIPT
   =========================== */

document.addEventListener('DOMContentLoaded', () => {
    // ── Preloader ──
    const preloader = document.getElementById('preloader');
    document.body.classList.add('loading');

    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.classList.remove('loading');
        }, 800);
    });

    // ── Load Gallery from Decap CMS JSON ──
    const mainGallery = document.getElementById('mainGallery');

    // Lightbox
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-overlay" id="lightbox-overlay">
            <button class="lightbox-close" id="lightbox-close" aria-label="Tutup">&times;</button>
            <button class="lightbox-nav lightbox-prev" id="lightbox-prev" aria-label="Sebelumnya">&#8249;</button>
            <div class="lightbox-content">
                <img src="" alt="" id="lightbox-img">
                <p id="lightbox-caption"></p>
            </div>
            <button class="lightbox-nav lightbox-next" id="lightbox-next" aria-label="Berikutnya">&#8250;</button>
        </div>`;
    document.body.appendChild(lightbox);

    let galleryPhotos = [];
    let lightboxIndex = 0;

    function openLightbox(index) {
        const overlay = document.getElementById('lightbox-overlay');
        const img = document.getElementById('lightbox-img');
        const caption = document.getElementById('lightbox-caption');
        lightboxIndex = index;
        img.src = galleryPhotos[index].image;
        img.alt = galleryPhotos[index].caption || 'Foto Kegiatan Renang';
        caption.textContent = galleryPhotos[index].caption || '';
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        document.getElementById('lightbox-overlay').classList.remove('open');
        document.body.style.overflow = '';
    }

    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeLightbox();
    });
    document.getElementById('lightbox-prev').addEventListener('click', (e) => {
        e.stopPropagation();
        lightboxIndex = (lightboxIndex - 1 + galleryPhotos.length) % galleryPhotos.length;
        openLightbox(lightboxIndex);
    });
    document.getElementById('lightbox-next').addEventListener('click', (e) => {
        e.stopPropagation();
        lightboxIndex = (lightboxIndex + 1) % galleryPhotos.length;
        openLightbox(lightboxIndex);
    });
    document.addEventListener('keydown', (e) => {
        const overlay = document.getElementById('lightbox-overlay');
        if (!overlay.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') { lightboxIndex = (lightboxIndex - 1 + galleryPhotos.length) % galleryPhotos.length; openLightbox(lightboxIndex); }
        if (e.key === 'ArrowRight') { lightboxIndex = (lightboxIndex + 1) % galleryPhotos.length; openLightbox(lightboxIndex); }
    });

    if (mainGallery) {
        fetch('data/gallery.json')
            .then(response => {
                if (!response.ok) throw new Error('Data galeri tidak ditemukan');
                return response.json();
            })
            .then(data => {
                if (data.photos && data.photos.length > 0) {
                    galleryPhotos = data.photos;
                    mainGallery.innerHTML = '';
                    data.photos.forEach((item, idx) => {
                        const card = document.createElement('div');
                        card.className = 'gallery-card';
                        card.setAttribute('tabindex', '0');
                        card.title = item.caption || 'Lihat foto';
                        card.innerHTML = `
                            <img src="${item.image}" alt="${item.caption || 'Foto Kegiatan Renang'}" loading="lazy">
                            ${item.caption ? `<div class="gallery-caption"><i class="fas fa-search-plus"></i> ${item.caption}</div>` : `<div class="gallery-caption"><i class="fas fa-search-plus"></i> Lihat foto</div>`}
                        `;
                        card.addEventListener('click', () => openLightbox(idx));
                        card.addEventListener('keydown', (e) => { if (e.key === 'Enter') openLightbox(idx); });
                        mainGallery.appendChild(card);
                    });
                }
            })
            .catch(error => {
                console.log('Galeri belum ada / Gagal memuat:', error);
            });
    }

    // ── Navbar scroll effect ──
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('back-to-top');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        // Navbar background
        if (currentScroll > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top
        if (currentScroll > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        lastScroll = currentScroll;
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ── Mobile navigation ──
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('open');
        document.body.classList.toggle('loading');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('open');
            document.body.classList.remove('loading');
        });
    });

    // ── Active nav link on scroll ──
    const sections = document.querySelectorAll('section[id]');

    function setActiveNav() {
        const scrollY = window.scrollY + 120;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`);

            if (link) {
                if (scrollY >= top && scrollY < top + height) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('scroll', setActiveNav);

    // ── Counter animation ──
    const counters = document.querySelectorAll('.hero-stat-number[data-count]');
    let counterAnimated = false;

    function animateCounters() {
        if (counterAnimated) return;

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += step;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };

            updateCounter();
        });

        counterAnimated = true;
    }

    // ── Scroll animations (Intersection Observer) ──
    const animatedElements = document.querySelectorAll('[data-animate]');

    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));

    // Observe hero stats for counter trigger
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        counterObserver.observe(heroStats);
    }

    // ── Schedule tabs ──
    const scheduleTabs = document.querySelectorAll('.schedule-tab');
    const scheduleWrappers = document.querySelectorAll('.schedule-table-wrapper');

    scheduleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');

            scheduleTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            scheduleWrappers.forEach(w => {
                w.classList.remove('active');
                if (w.id === target) {
                    w.classList.add('active');
                }
            });
        });
    });

    // ── Testimonials slider ──
    const track = document.getElementById('testimonial-track');
    const cards = track ? track.querySelectorAll('.testimonial-card') : [];
    const dotsContainer = document.getElementById('testimonial-dots');
    const prevBtn = document.getElementById('prev-testimonial');
    const nextBtn = document.getElementById('next-testimonial');
    let currentSlide = 0;
    let autoSlideInterval;

    function createDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        cards.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('testimonial-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });
    }

    function goToSlide(index) {
        if (cards.length === 0) return;
        currentSlide = index;
        if (currentSlide < 0) currentSlide = cards.length - 1;
        if (currentSlide >= cards.length) currentSlide = 0;

        const offset = currentSlide * 100;
        track.style.transform = `translateX(-${offset}%)`;

        // Update dots
        const dots = dotsContainer ? dotsContainer.querySelectorAll('.testimonial-dot') : [];
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, 5000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    if (cards.length > 0) {
        createDots();
        startAutoSlide();

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                goToSlide(currentSlide - 1);
                resetAutoSlide();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                goToSlide(currentSlide + 1);
                resetAutoSlide();
            });
        }

        // Touch/Swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    goToSlide(currentSlide + 1);
                } else {
                    goToSlide(currentSlide - 1);
                }
                resetAutoSlide();
            }
        }, { passive: true });
    }

    // ── Contact form ──
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Ambil data form
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const program = document.getElementById('program').value || 'Tidak disebutkan';
            const message = document.getElementById('message').value;

            // Buat template pesan WhatsApp
            const waText = `Halo admin Orca Swimming Club, saya ingin mendaftar/bertanya: 
            
*Nama Lengkap:* ${name}
*Email:* ${email}
*No. Telepon:* ${phone}
*Program Diminati:* ${program}
*Pesan:* 
${message}
            
Mohon informasinya lebih lanjut. Terima kasih!`;

            // Button loading state
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengalihkan ke WhatsApp...';
            submitBtn.disabled = true;

            setTimeout(() => {
                // Redirect ke wa.me
                const phoneWa = "6285731555537";
                const waUrl = `https://wa.me/${phoneWa}?text=${encodeURIComponent(waText)}`;
                window.open(waUrl, '_blank');
                
                submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Terkirim via WA!';
                submitBtn.style.background = 'var(--success)';

                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    form.reset();
                }, 3000);
            }, 1000);
        });
    }

    // ── Smooth scroll for all anchor links ──
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
