document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    const ctaBtn = document.querySelector('.cta-btn');
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') {
                e.preventDefault();
                const section = link.textContent.toLowerCase();
                switch(section) {
                    case 'features':
                        document.querySelector('.features-section').scrollIntoView({ behavior: 'smooth' });
                        break;
                    case 'help':
                        window.location.href = 'help.html';
                        break;
                    case 'contact':
                        window.location.href = 'contact.html';
                        break;
                }
            }
        });
    });

    heroTitle.style.opacity = 0;
    heroTitle.style.transform = 'translateY(30px)';
    setTimeout(() => {
        heroTitle.style.transition = 'all 1s ease';
        heroTitle.style.opacity = 1;
        heroTitle.style.transform = 'translateY(0)';
    }, 200);

    ctaBtn.addEventListener('mouseover', () => {
        ctaBtn.style.transform = 'scale(1.05)';
        ctaBtn.style.boxShadow = '0 8px 20px rgba(0, 133, 255, 0.4)';
    });
    ctaBtn.addEventListener('mouseout', () => {
        ctaBtn.style.transform = 'scale(1)';
        ctaBtn.style.boxShadow = 'none';
    });
});