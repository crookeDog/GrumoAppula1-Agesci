// script.js

// Funzione scrollToTopSmoothly, rimane fuori da DOMContentLoaded per essere globale
function scrollToTopSmoothly() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Funzione per impostare il form di ospitalità
function setupHospitalityForm() {
    const form = document.getElementById('ospitalitaForm');
    const regioneSelect = document.getElementById('regione');
    const provinciaSelect = document.getElementById('provincia');
    if (!form || !regioneSelect || !provinciaSelect) return;

    const provinceData = {
        'Abruzzo': ['L\'Aquila', 'Chieti', 'Pescara', 'Teramo'],
        'Basilicata': ['Matera', 'Potenza'],
        'Calabria': ['Catanzaro', 'Cosenza', 'Crotone', 'Reggio Calabria', 'Vibo Valentia'],
        'Campania': ['Avellino', 'Benevento', 'Caserta', 'Napoli', 'Salerno'],
        'Emilia-Romagna': ['Bologna', 'Ferrara', 'Forlì-Cesena', 'Modena', 'Parma', 'Piacenza', 'Ravenna', 'Reggio Emilia', 'Rimini'],
        'Friuli-Venezia Giulia': ['Gorizia', 'Pordenone', 'Trieste', 'Udine'],
        'Lazio': ['Frosinone', 'Latina', 'Rieti', 'Roma', 'Viterbo'],
        'Liguria': ['Genova', 'Imperia', 'La Spezia', 'Savona'],
        'Lombardia': ['Bergamo', 'Brescia', 'Como', 'Cremona', 'Lecco', 'Lodi', 'Mantova', 'Milano', 'Monza e Brianza', 'Pavia', 'Sondrio', 'Varese'],
        'Marche': ['Ancona', 'Ascoli Piceno', 'Fermo', 'Macerata', 'Pesaro e Urbino'],
        'Molise': ['Campobasso', 'Isernia'],
        'Piemonte': ['Alessandria', 'Asti', 'Biella', 'Cuneo', 'Novara', 'Torino', 'Verbano-Cusio-Ossola', 'Vercelli'],
        'Puglia': ['Bari', 'Barletta-Andria-Trani', 'Brindisi', 'Foggia', 'Lecce', 'Taranto'],
        'Sardegna': ['Cagliari', 'Nuoro', 'Oristano', 'Sassari', 'Sud Sardegna'],
        'Sicilia': ['Agrigento', 'Caltanissetta', 'Catania', 'Enna', 'Messina', 'Palermo', 'Ragusa', 'Siracusa', 'Trapani'],
        'Toscana': ['Arezzo', 'Firenze', 'Grosseto', 'Livorno', 'Lucca', 'Massa-Carrara', 'Pisa', 'Pistoia', 'Prato', 'Siena'],
        'Trentino-Alto Adige': ['Bolzano', 'Trento'],
        'Umbria': ['Perugia', 'Terni'],
        'Valle d\'Aosta': ['Aosta'],
        'Veneto': ['Belluno', 'Padova', 'Rovigo', 'Treviso', 'Venezia', 'Verona', 'Vicenza']
    };

    // Inizializza il select della provincia disabilitato
    provinciaSelect.disabled = true;
    provinciaSelect.innerHTML = '<option value="">Prima seleziona la regione</option>';

    regioneSelect.addEventListener('change', function() {
        const regioneSelezionata = this.value;
        provinciaSelect.innerHTML = '<option value="">Seleziona provincia</option>';
        if (regioneSelezionata && provinceData[regioneSelezionata]) {
            provinciaSelect.disabled = false;
            provinceData[regioneSelezionata].forEach(provincia => {
                const option = document.createElement('option');
                option.value = provincia;
                option.textContent = provincia;
                provinciaSelect.appendChild(option);
            });
        } else {
            provinciaSelect.disabled = true;
            provinciaSelect.innerHTML = '<option value="">Prima seleziona la regione</option>';
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#e74c3c';
                isValid = false;
            } else {
                field.style.borderColor = '#A3B18A';
            }
        });

        const emailField = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailField && emailField.value && !emailRegex.test(emailField.value)) {
            emailField.style.borderColor = '#e74c3c';
            isValid = false;
        } else if (emailField) {
            emailField.style.borderColor = '#A3B18A';
        }

        const cellulareField = document.getElementById('cellulare');
        const cellulareRegex = /^[0-9]{8,15}$/;
        if (cellulareField && cellulareField.value && !cellulareRegex.test(cellulareField.value.replace(/\s/g, ''))) {
            cellulareField.style.borderColor = '#e74c3c';
            isValid = false;
        } else if (cellulareField) {
            cellulareField.style.borderColor = '#A3B18A';
        }

        const dataArrivoField = document.getElementById('dataArrivo');
        const dataPartenzaField = document.getElementById('dataPartenza');
        const oggi = new Date();
        oggi.setHours(0, 0, 0, 0);

        if (dataArrivoField && dataArrivoField.value) {
            if (new Date(dataArrivoField.value) < oggi) {
                dataArrivoField.style.borderColor = '#e74c3c';
                isValid = false;
            } else {
                dataArrivoField.style.borderColor = '#A3B18A';
            }
        }

        if (dataPartenzaField && dataPartenzaField.value) {
            if (dataArrivoField && dataArrivoField.value && new Date(dataPartenzaField.value) <= new Date(dataArrivoField.value)) {
                dataPartenzaField.style.borderColor = '#e74c3c';
                isValid = false;
            } else {
                dataPartenzaField.style.borderColor = '#A3B18A';
            }
        }

        if (isValid) {
            emailjs.sendForm('service_w00p4hu', 'template_khxs8jg', this)
                .then(function() {
                    alert('Richiesta inviata con successo! Riceverete una risposta entro 48 ore.');
                    form.reset();
                    provinciaSelect.disabled = true;
                    provinciaSelect.innerHTML = '<option value="">Prima seleziona la regione</option>';
                    document.getElementById('formContainer').classList.remove('open');
                    document.getElementById('ospitalitaToggle').classList.remove('active');
                }, function(error) {
                    alert('Si è verificato un errore durante l\'invio della richiesta.');
                    console.error('Errore invio email Ospitalità:', error);
                });
        } else {
            alert('Si prega di compilare correttamente tutti i campi obbligatori.');
            const firstErrorField = form.querySelector('[style*="border-color: rgb(231, 76, 60)"]');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                firstErrorField.focus();
            }
        }
    });

    const allInputsOspitalita = form.querySelectorAll('input, select, textarea');
    allInputsOspitalita.forEach(input => {
        input.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(231, 76, 60)') {
                this.style.borderColor = '#A3B18A';
            }
        });
    });
}

// Funzione per impostare il form di iscrizione
function setupSubscriptionForm() {
    const form = document.getElementById('formIscrizione');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#e74c3c';
                isValid = false;
            } else {
                field.style.borderColor = '#A3B18A';
            }
        });

        const emailGenitoreField = document.getElementById('emailGenitore');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailGenitoreField && emailGenitoreField.value && !emailRegex.test(emailGenitoreField.value)) {
            emailGenitoreField.style.borderColor = '#e74c3c';
            isValid = false;
        } else if (emailGenitoreField) {
            emailGenitoreField.style.borderColor = '#A3B18A';
        }

        const telefonoGenitoreField = document.getElementById('telefonoGenitore');
        const cellulareRegex = /^[0-9]{8,15}$/;
        if (telefonoGenitoreField && telefonoGenitoreField.value && !cellulareRegex.test(telefonoGenitoreField.value.replace(/\s/g, ''))) {
            telefonoGenitoreField.style.borderColor = '#e74c3c';
            isValid = false;
        } else if (telefonoGenitoreField) {
            telefonoGenitoreField.style.borderColor = '#A3B18A';
        }

        const dataNascitaField = document.getElementById('dataNascitaIscrizione');
        if (dataNascitaField && dataNascitaField.value) {
            const oggi = new Date();
            oggi.setHours(0, 0, 0, 0);
            const dataNascita = new Date(dataNascitaField.value);
            if (dataNascita > oggi) {
                dataNascitaField.style.borderColor = '#e74c3c';
                isValid = false;
                alert('La data di nascita non può essere nel futuro.');
            } else {
                dataNascitaField.style.borderColor = '#A3B18A';
            }
        } else if (dataNascitaField && dataNascitaField.hasAttribute('required')) {
            dataNascitaField.style.borderColor = '#e74c3c';
            isValid = false;
        }

        if (isValid) {
            emailjs.sendForm('service_w00p4hu', 'template_irpk1cc', this)
                .then(function() {
                    alert('Richiesta di iscrizione inviata con successo! Sarete contattati.');
                    form.reset();
                    const resetFields = form.querySelectorAll('input, select, textarea');
                    resetFields.forEach(field => field.style.borderColor = '');
                }, function(error) {
                    alert('Si è verificato un errore durante l\'invio della richiesta di iscrizione.');
                    console.error('Errore invio iscrizione:', error);
                });
        } else {
            alert('Si prega di compilare correttamente tutti i campi obbligatori per l\'iscrizione.');
            const firstErrorField = form.querySelector('[style*="border-color: rgb(231, 76, 60)"]');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                firstErrorField.focus();
            }
        }
    });

    const allInputsIscrizione = form.querySelectorAll('input, select, textarea');
    allInputsIscrizione.forEach(input => {
        input.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(231, 76, 60)') {
                this.style.borderColor = '#A3B18A';
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Variabili principali
    const body = document.body;
    const header = document.getElementById('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.getElementById('mobileNav');
    const backToTop = document.getElementById('backToTop');
    const currentYearSpan = document.getElementById('currentYear');
    const ospitalitaToggle = document.getElementById('ospitalitaToggle');
    const formContainer = document.getElementById('formContainer');
    const toggleArrow = ospitalitaToggle ? ospitalitaToggle.querySelector('.toggle-arrow') : null;

    // Pop-up segreto e minigioco
    const secretPopup = document.getElementById('secret-popup');
    const homeSection = document.getElementById('home');
    const secretPopupButton = secretPopup ? secretPopup.querySelector('.popup-button') : null;
    const secretPopupClose = secretPopup ? secretPopup.querySelector('.secret-popup-close') : null;

    // Aggiunta per il News Pop-up
    const newsPopup = document.getElementById('news-popup');
    const closeNewsPopupBtn = document.getElementById('close-news-popup');

    // Variabile per tracciare se il secretPopup è stato nascosto dal menu mobile
    let secretPopupHiddenByMenu = false;
    // Variabile per tracciare se il popup è già apparso per la prima volta
    let hasSecretPopupAppearedOnce = false;


    // Funzione Toggle Menu Mobile
    function toggleMenu() {
        if (menuToggle && mobileNav) {
            const isActive = mobileNav.classList.contains('active');

            menuToggle.classList.toggle('active');
            mobileNav.classList.toggle('active');
            body.classList.toggle('no-scroll', mobileNav.classList.contains('active'));

            const isMobile = window.getComputedStyle(document.querySelector('.nav-links')).display === 'none';

            if (isMobile) {
                if (!isActive) { // Menu sta per aprirsi
                    if (secretPopup && secretPopup.classList.contains('is-active')) {
                        hideSecretPopup();
                        secretPopupHiddenByMenu = true; // Imposta il flag perché è stato nascosto dal menu
                    }
                } else { // Menu sta per chiudersi
                    if (secretPopupHiddenByMenu) {
                        secretPopupHiddenByMenu = false; // Resetta il flag
                        const rect = homeSection.getBoundingClientRect();
                        if (rect.top === 0) { // Siamo sulla home all'inizio
                             showSecretPopup();
                        } else {
                             hideSecretPopup();
                        }
                    }
                }
            }
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }

    // Chiusura Menu Mobile (click fuori o su link)
    document.addEventListener('click', function(event) {
        if (mobileNav && mobileNav.classList.contains('active')) {
            const isClickInsideNav = mobileNav.contains(event.target);
            const isClickOnToggle = menuToggle && menuToggle.contains(event.target);
            const isNavLink = event.target.closest('.mobile-nav a');

            if (isNavLink || (!isClickInsideNav && !isClickOnToggle)) {
                toggleMenu();
            }
        }
    });

    // Chiusura Menu Mobile (tasto ESC)
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && mobileNav && mobileNav.classList.contains('active')) {
            toggleMenu();
        }
    });

    // Click sulla hero-section per scrollare a "Chi siamo"
    document.addEventListener('click', function(event) {
        const heroSection = document.querySelector('.hero-section');
        const isClickOnHeader = header && header.contains(event.target);
        const isClickOnHeroSection = heroSection && heroSection.contains(event.target);
        const isClickOnNavLink = event.target.closest('a[href^="#"]');

        if (isClickOnHeroSection && !isClickOnHeader && !isClickOnNavLink) {
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

    // Gestione Scroll (header e bottone torna su, animazioni sezioni)
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;

        if (header) {
            header.classList.toggle('scrolled', scrollPosition > 100);
        }

        if (backToTop) {
            backToTop.classList.toggle('visible', scrollPosition > 300);
        }

        document.querySelectorAll('.content-section').forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (sectionTop < windowHeight * 0.85) {
                section.classList.add('visible');
            }
        });

        if (!mobileNav.classList.contains('active')) {
            checkAndToggleSecretPopup();
        } else {
             hideSecretPopup();
        }
    });

    // Scroll fluido per link di navigazione
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = header ? header.offsetHeight : 0;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                if (targetId === '#home') {
                    secretPopupHiddenByMenu = false; // Reset del flag quando si torna alla home
                    if (!mobileNav.classList.contains('active')) {
                        showSecretPopup();
                    } else {
                        hideSecretPopup();
                    }
                } else { // Se si va a un'altra sezione, nascondi il popup
                    hideSecretPopup();
                }
            }
        });
    });

    // Funzione back to top
    if (backToTop) {
        backToTop.addEventListener('click', scrollToTopSmoothly);
    }

    // Sistema particelle
    const backgroundContainer = document.querySelector('.background');
    if (backgroundContainer) {
        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 7 + 3;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = (Math.random() * 5) + 's';
            particle.style.animationDuration = (Math.random() * 5 + 5) + 's';
            backgroundContainer.appendChild(particle);
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 10000);
        }
        for (let i = 0; i < 15; i++) {
            createParticle();
        }
    }

    // Anno corrente per il footer
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Inizializzazione form ospitalità e iscrizione
    setupHospitalityForm();
    setupSubscriptionForm();

    // Toggle Modulo Ospitalità
    if (ospitalitaToggle && formContainer && toggleArrow) {
        ospitalitaToggle.addEventListener('click', function() {
            const isOpen = formContainer.classList.contains('open');
            if (isOpen) {
                formContainer.classList.remove('open');
                ospitalitaToggle.classList.remove('active');
            } else {
                formContainer.classList.add('open');
                ospitalitaToggle.classList.add('active');
                formContainer.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // Assicurati che il form di ospitalità sia inizialmente chiuso
    if (formContainer) {
        formContainer.classList.remove('open');
    }

    // Logica per le "Unità Interattive" (slideshow e espansione)
    const unitaCards = document.querySelectorAll('.unita-card-interattiva');
    const unitaWrapper = document.querySelector('.unita-interattiva-wrapper');
    if (unitaCards.length > 0 && unitaWrapper) {
        unitaCards.forEach(card => {
            card.addEventListener('click', () => {
                const isAlreadyActive = card.classList.contains('is-active');
                unitaWrapper.classList.remove('is-active-child');
                unitaCards.forEach(c => c.classList.remove('is-active'));
                if (!isAlreadyActive) {
                    card.classList.add('is-active');
                    unitaWrapper.classList.add('is-active-child');
                }
            });
        });
    }

    document.querySelectorAll('.unita-card-interattiva').forEach(card => {
        const slideshow = card.querySelector('.unita-slideshow');
        if (!slideshow) return;
        const images = slideshow.querySelectorAll('img');
        if (images.length <= 1) return;
        let currentIndex = 0;
        images[currentIndex].classList.add('slide-active');
        setInterval(() => {
            images[currentIndex].classList.remove('slide-active');
            currentIndex = (currentIndex + 1) % images.length;
            images[currentIndex].classList.add('slide-active');
        }, 5000);
    });

    // --- Logica Pop-up Segreto (Secret Popup) con Animazioni ---

    // Funzione per mostrare il pop-up con animazione
    function showSecretPopup() {
        if (!secretPopup || secretPopup.classList.contains('is-entering') || secretPopup.classList.contains('is-active')) {
            return;
        }
        secretPopup.classList.remove('is-hidden', 'is-exiting');
        secretPopup.classList.add('is-entering');
        secretPopup.addEventListener('animationend', function handler() {
            secretPopup.classList.remove('is-entering');
            secretPopup.classList.add('is-active');
            secretPopup.onanimationend = null;
            hasSecretPopupAppearedOnce = true;
        }, {
            once: true
        });
    }

    // Funzione per nascondere il pop-up con animazione
    function hideSecretPopup() {
        if (!secretPopup || secretPopup.classList.contains('is-exiting') || (!secretPopup.classList.contains('is-active') && !secretPopup.classList.contains('is-entering'))) {
            return;
        }
        secretPopup.classList.remove('is-entering', 'is-active');
        secretPopup.classList.add('is-exiting');
        secretPopup.addEventListener('animationend', function handler() {
            secretPopup.classList.remove('is-exiting');
            secretPopup.classList.add('is-hidden');
            secretPopup.onanimationend = null;
        }, {
            once: true
        });
    }

    // Funzione per controllare la visibilità della sezione "home" e agire sul pop-up
    function checkAndToggleSecretPopup() {
        if (!secretPopup || !homeSection) {
            return;
        }

        // Se la sezione minigioco è già sbloccata, nascondi sempre il pop-up e non mostrarlo più
        if (document.getElementById('minigame-secret-section')) {
            hideSecretPopup();
            return;
        }

        const rect = homeSection.getBoundingClientRect();

        // MODIFICA QUI: Condizione per rendere il popup visibile solo e unicamente quando la home è in primo piano.
        // Il popup è visibile solo se la parte superiore della homeSection è molto vicina al top del viewport (o leggermente oltre),
        // e la parte inferiore della homeSection è ancora dentro (o appena fuori) il bottom del viewport.
        // Questo implica che l'intera homeSection è visibile o sta per essere visualizzata/lasciata.
        const isHomeFullyInViewOrEntering = (
            rect.top <= 10 && rect.top >= - (window.innerHeight || document.documentElement.clientHeight) * 0.1 && // La home è all'inizio dello schermo o leggermente scrollata su
            rect.bottom > (window.innerHeight || document.documentElement.clientHeight) * 0.9 // Almeno il 90% della home è ancora visibile
        );

        // Aggiungi un'ulteriore condizione per catturare lo scroll esattamente all'inizio della pagina.
        // window.scrollY è 0 all'inizio della pagina.
        const isAtTopOfPage = window.scrollY < 50; // consideriamo "inizio pagina" se lo scroll è meno di 50px


        // Il popup dovrebbe apparire se la home è la sezione "attiva" (in alto e ben visibile),
        // e non è stata nascosta dal menu mobile.
        if (isAtTopOfPage && isHomeFullyInViewOrEntering && !secretPopupHiddenByMenu) {
            showSecretPopup();
        } else {
            hideSecretPopup();
        }
    }

    // Inizializza il pop-up segreto come nascosto all'avvio
    if (secretPopup) {
        secretPopup.classList.add('is-hidden');
    }

    // Event listener per i bottoni del pop-up segreto
    if (secretPopupButton) {
        secretPopupButton.addEventListener('click', function() {
            hideSecretPopup();
            secretPopupHiddenByMenu = false;
        });
    }

    if (secretPopupClose) {
        secretPopupClose.addEventListener('click', function() {
            hideSecretPopup();
            secretPopupHiddenByMenu = false;
        });
    }

    // Esegui il controllo del pop-up segreto all'avvio e durante scroll/resize
    let scrollOrResizeTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollOrResizeTimeout);
        scrollOrResizeTimeout = setTimeout(checkAndToggleSecretPopup, 100);
    });
    window.addEventListener('resize', function() {
        clearTimeout(scrollOrResizeTimeout);
        scrollOrResizeTimeout = setTimeout(checkAndToggleSecretPopup, 100);
    });

    // Questo listener garantisce la comparsa iniziale su mobile
    window.addEventListener('DOMContentLoaded', function() {
        if (!hasSecretPopupAppearedOnce && window.innerWidth <= 768) {
            setTimeout(() => {
                const rect = homeSection.getBoundingClientRect();
                // MODIFICA QUI: La condizione di apparizione iniziale deve essere molto stretta
                // per assicurare che appaia solo quando la home è visibile per la prima volta
                // e l'utente è all'inizio dello scroll.
                if (rect.top === 0 && window.scrollY === 0 && !secretPopupHiddenByMenu) {
                    showSecretPopup();
                }
            }, 500); // Ritardo per consentire al layout di stabilizzarsi
        }
    });

    window.addEventListener('load', checkAndToggleSecretPopup);


    // --- Logica Pop-up Novità (News Popup) ---
    function showNewsPopup() {
        if (!newsPopup || newsPopup.classList.contains('is-active') || newsPopup.classList.contains('is-entering')) {
            return;
        }
        newsPopup.classList.remove('hidden');
        newsPopup.classList.add('is-active');
        document.body.style.overflow = 'hidden';
    }

    function hideNewsPopup() {
        if (!newsPopup || newsPopup.classList.contains('hidden') || newsPopup.classList.contains('is-exiting')) {
            return;
        }
        newsPopup.classList.remove('is-active');
        newsPopup.addEventListener('transitionend', function handler() {
            newsPopup.classList.add('hidden');
            newsPopup.removeEventListener('transitionend', handler);
            document.body.style.overflow = '';
        });
    }

    // Mostra il news popup quando il DOM è completamente caricato
    setTimeout(showNewsPopup, 500);

    // Chiudi il news popup quando si clicca il bottone di chiusura
    if (closeNewsPopupBtn) {
        closeNewsPopupBtn.addEventListener('click', hideNewsPopup);
    }
});
