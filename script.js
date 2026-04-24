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
    window.sharedObserver = observer;

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
    window.reinitTestimonials = function() {
        const track = document.getElementById('testimonial-track');
        if (!track) return;
        const cards = track.querySelectorAll('.testimonial-card');
        const dotsContainer = document.getElementById('testimonial-dots');
        let prevBtn = document.getElementById('prev-testimonial');
        let nextBtn = document.getElementById('next-testimonial');
        let currentSlide = 0;
        
        if (window.testiAutoSlideInterval) clearInterval(window.testiAutoSlideInterval);

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

            const dots = dotsContainer ? dotsContainer.querySelectorAll('.testimonial-dot') : [];
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        }

        function startAutoSlide() {
            window.testiAutoSlideInterval = setInterval(() => {
                goToSlide(currentSlide + 1);
            }, 5000);
        }

        function resetAutoSlide() {
            clearInterval(window.testiAutoSlideInterval);
            startAutoSlide();
        }

        if (cards.length > 0) {
            createDots();
            startAutoSlide();

            if (prevBtn) {
                const newPrev = prevBtn.cloneNode(true);
                prevBtn.parentNode.replaceChild(newPrev, prevBtn);
                prevBtn = newPrev;
                prevBtn.addEventListener('click', () => {
                    goToSlide(currentSlide - 1);
                    resetAutoSlide();
                });
            }

            if (nextBtn) {
                const newNext = nextBtn.cloneNode(true);
                nextBtn.parentNode.replaceChild(newNext, nextBtn);
                nextBtn = newNext;
                nextBtn.addEventListener('click', () => {
                    goToSlide(currentSlide + 1);
                    resetAutoSlide();
                });
            }

            // Remove previous touch event listeners if any (hard to remove anonymous functions cleanly so just reassigning)
            let cloneTrack = track.cloneNode(true);
            track.parentNode.replaceChild(cloneTrack, track);
            const actualTrack = cloneTrack;
            let touchStartX = 0;
            let touchEndX = 0;

            actualTrack.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            actualTrack.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const diff = touchStartX - touchEndX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0) goToSlide(currentSlide + 1);
                    else goToSlide(currentSlide - 1);
                    resetAutoSlide();
                }
            }, { passive: true });
        }
    };
    window.reinitTestimonials();

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
            let waText = window.whatsappMessageTemplate || `Halo admin Orca Swimming Club, saya ingin mendaftar/bertanya:\n\n*Nama Lengkap:* {name}\n*Email:* {email}\n*No. Telepon:* {phone}\n*Program Diminati:* {program}\n*Pesan:*\n{message}\n\nMohon informasinya lebih lanjut. Terima kasih!`;
            
            waText = waText.replace('{name}', name)
                           .replace('{email}', email)
                           .replace('{phone}', phone)
                           .replace('{program}', program)
                           .replace('{message}', message);

            // Button loading state
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengalihkan ke WhatsApp...';
            submitBtn.disabled = true;

            setTimeout(() => {
                // Redirect ke wa.me
                let phoneWa = window.whatsappPhone || "6285731555537";
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

    // ── Load Site Content from CMS JSON ──
    fetch('data/site.json')
        .then(res => {
            if (!res.ok) throw new Error('Data CMS tidak ditemukan');
            return res.json();
        })
        .then(data => {
            // -- Hero --
            if(data.hero) {
                const badge = document.querySelector('.hero-badge');
                if(badge && data.hero.badge) badge.innerHTML = `<i class="fas fa-award"></i> ${data.hero.badge}`;
                const title = document.querySelector('.hero-title');
                if(title && data.hero.title) title.innerHTML = data.hero.title;
                const subtitle = document.querySelector('.hero-subtitle');
                if(subtitle && data.hero.subtitle) subtitle.innerHTML = data.hero.subtitle;
            }

            // -- About --
            if(data.about) {
                const aboutSubtitle = document.querySelector('#about .section-subtitle');
                if(aboutSubtitle && data.about.subtitle) aboutSubtitle.textContent = data.about.subtitle;
                const aboutGrid = document.querySelector('.about-grid');
                if(aboutGrid && data.about.cards) {
                    aboutGrid.innerHTML = data.about.cards.map((card, i) => `
                        <div class="about-card" data-animate="fade-up" data-delay="${i * 100}">
                            <div class="about-card-icon"><i class="${card.icon}"></i></div>
                            <h3>${card.title}</h3>
                            <p>${card.desc}</p>
                        </div>
                    `).join('');
                }
            }

            // -- Team --
            if(data.team) {
                const teamSubtitle = document.querySelector('#team .section-subtitle');
                if(teamSubtitle && data.team.subtitle) teamSubtitle.textContent = data.team.subtitle;
                const teamGallery = document.querySelector('.team-gallery');
                if(teamGallery && data.team.members) {
                    teamGallery.innerHTML = data.team.members.map((member, i) => `
                        <div class="team-photo-card" data-animate="fade-up" data-delay="${(i+1) * 100}">
                            <img src="${member.image}" alt="${member.name}">
                        </div>
                    `).join('');
                }
            }

            // -- Programs --
            if(data.programs) {
                const progSubtitle = document.querySelector('#programs .section-subtitle');
                if(progSubtitle && data.programs.subtitle) progSubtitle.textContent = data.programs.subtitle;
                const progGrid = document.querySelector('.programs-grid');
                if(progGrid && data.programs.items) {
                    progGrid.innerHTML = data.programs.items.map((item, i) => `
                        <div class="program-card ${item.badge === 'Populer' ? 'featured' : ''}" data-animate="fade-up" data-delay="${i * 150}">
                            <div class="program-card-image">
                                <img src="${item.image}" alt="${item.title}">
                                ${item.badge ? `<div class="program-card-badge ${item.badge === 'Populer' ? 'featured-badge' : ''}">${item.badge}</div>` : ''}
                            </div>
                            <div class="program-card-body">
                                <div class="program-card-tag">${item.tag}</div>
                                <h3 class="program-card-title">${item.title}</h3>
                                <p class="program-card-desc">${item.desc}</p>
                                <ul class="program-card-features">
                                    ${(item.features || []).map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('')}
                                </ul>
                                <div class="program-card-footer">
                                    <a href="#contact" class="btn btn-primary btn-sm">Daftar Sekarang</a>
                                </div>
                            </div>
                        </div>
                    `).join('');
                }
            }

            // -- Testimonials --
            if(data.testimonials && Array.isArray(data.testimonials)) {
                const testTrack = document.getElementById('testimonial-track');
                if(testTrack) {
                    testTrack.innerHTML = data.testimonials.map(item => `
                        <div class="testimonial-card">
                            <div class="testimonial-stars">
                                ${`<i class="fas fa-star"></i>`.repeat(Math.min(5, item.stars || 5))}
                            </div>
                            <p class="testimonial-text">${item.text}</p>
                            <div class="testimonial-author">
                                <div class="testimonial-avatar"><i class="fas fa-user-circle"></i></div>
                                <div>
                                    <strong>${item.name}</strong>
                                    <span>${item.role}</span>
                                </div>
                            </div>
                        </div>
                    `).join('');
                    
                    window.reinitTestimonials();
                }
            }

            // -- Contact --
            if(data.contact) {
                if(data.contact.phone) {
                    let phone = data.contact.phone.replace(/[^0-9]/g, '');
                    if(phone.startsWith('0')) phone = '62' + phone.substring(1);
                    window.whatsappPhone = phone;
                    document.querySelectorAll('a[href^="https://wa.me/"]').forEach(a => {
                        a.href = `https://wa.me/${phone}`;
                        if(a.innerText.includes('08')) {
                            a.innerHTML = `<i class="fab fa-whatsapp" style="color: #25D366;"></i> ${data.contact.phone}`;
                        }
                    });
                }
                
                const emailCards = document.querySelectorAll('.contact-info-card');
                emailCards.forEach(c => {
                    if(c.innerHTML.includes('info@orcaswimmingclub.com') || c.innerHTML.includes('Email')) {
                        const p = c.querySelector('p');
                        if(p) p.innerHTML = `${data.contact.email_1}<br>${data.contact.email_2 || ''}`;
                    }
                });

                if(data.contact.whatsapp_message) {
                    window.whatsappMessageTemplate = data.contact.whatsapp_message;
                }
            }

            // Re-observe new elements
            if(window.sharedObserver) {
                document.querySelectorAll('[data-animate]:not(.animated)').forEach(el => window.sharedObserver.observe(el));
            }
        })
        .catch(err => console.log('Menggunakan halaman statis:', err));
});
