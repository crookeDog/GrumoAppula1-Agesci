document.addEventListener('DOMContentLoaded', function() {

    // Toggle menu mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.getElementById('mobileNav');
    const body = document.body;

    function toggleMenu() {
        if (menuToggle && mobileNav) {
            menuToggle.classList.toggle('active');
            mobileNav.classList.toggle('active');
            body.classList.toggle('no-scroll', mobileNav.classList.contains('active'));
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }

    // Chiudi menu cliccando fuori o su un link
    document.addEventListener('click', function(event) {
        if (mobileNav && mobileNav.classList.contains('active')) {
            const isClickInsideNav = mobileNav.contains(event.target);
            const isClickOnToggle = menuToggle && menuToggle.contains(event.target);
            const isNavLink = event.target.closest('.mobile-nav a');

            if (isNavLink) {
                toggleMenu(); // Chiude il menu se si clicca un link di navigazione
            } else if (!isClickInsideNav && !isClickOnToggle) {
                toggleMenu(); // Chiude il menu se si clicca fuori
            }
        }
    });

    // Chiudi menu con ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && mobileNav && mobileNav.classList.contains('active')) {
            toggleMenu();
        }
    });

    // NUOVA FUNZIONALITÀ: Click sulla home per andare a "Chi siamo"
    document.addEventListener('click', function(event) {
        const header = document.querySelector('.main-header');
        const heroSection = document.querySelector('.hero-section');
        const isClickOnHeader = header && header.contains(event.target);
        const isClickOnHeroSection = heroSection && heroSection.contains(event.target);
        const isClickOnNavLink = event.target.closest('a[href^="#"]');
        
        // Naviga alla sezione "Chi siamo" solo se il click è nella hero section e non sull'header
        if (isClickOnHeroSection && !isClickOnHeader && !isClickOnNavLink) {
            // Naviga alla sezione "Chi siamo"
            const chiSiamoSection = document.querySelector('#chi-siamo');
            if (chiSiamoSection) {
                const headerOffset = header ? header.offsetHeight : 0;
                const elementPosition = chiSiamoSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });

    // Gestione scroll: header e bottone torna su
    const header = document.getElementById('header');
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;

        if (header) {
            if (scrollPosition > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        if (backToTop) {
            if (scrollPosition > 300) { // Mostra il bottone un po' dopo
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        // Animazioni sezioni in viewport
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const windowHeight = window.innerHeight;
            
            if (scrollPosition + windowHeight > sectionTop + sectionHeight * 0.15) { // Leggermente prima
                section.classList.add('visible');
            }
            // else {
            //    section.classList.remove('visible'); // Per far ripartire animazione se si torna su
            // }
        });
    });

    // Funzione torna su (associata al bottone HTML)
    // La funzione scrollToTop() è globale perché usata da onclick nell'HTML
    // Se preferisci, puoi aggiungere l'event listener qui:
    if (backToTop) {
        backToTop.addEventListener('click', scrollToTopSmoothly);
    }


    // Scroll fluido per i link di navigazione (considerando l'header fisso)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                let headerOffset = 0;
                if (header) {
                     headerOffset = header.offsetHeight;
                }
                
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Se è un link del menu mobile (diverso dal toggle stesso), chiudi il menu
                if (mobileNav && mobileNav.classList.contains('active') && !this.classList.contains('menu-toggle')) {
                   // La chiusura è gestita dal click listener generale sul document per i navLink
                }
            }
        });
    });

    // Sistema particelle
    const backgroundContainer = document.querySelector('.background');
    if (backgroundContainer) {
        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 7 + 3; // Dimensione particelle 3px-10px
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            // Variazione su durata e delay per un movimento meno sincrono
            particle.style.animationDelay = (Math.random() * 5) + 's'; 
            particle.style.animationDuration = (Math.random() * 5 + 5) + 's'; // Durata tra 5s e 10s
            
            backgroundContainer.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 10000); // Rimuovi dopo 10s (deve essere > animation-duration)
        }

        // Crea un numero iniziale di particelle
        for (let i = 0; i < 15; i++) { // Aumentato numero iniziale
            createParticle();
        }
        // Crea nuove particelle a intervalli
        // setInterval(createParticle, 2500); // Meno frequente
    }
    
    // Anno corrente per il footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

});

// Funzione globale per il bottone back-to-top (se usi onclick="" nell'HTML)
function scrollToTopSmoothly() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
