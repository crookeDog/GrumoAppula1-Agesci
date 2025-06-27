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
    // Non c'è bisogno di mainElement qui per la logica dei popup
    const secretPopupButton = secretPopup ? secretPopup.querySelector('.popup-button') : null; // Cambiato nome
    const secretPopupClose = secretPopup ? secretPopup.querySelector('.secret-popup-close') : null; // Cambiato nome e selettore

    // Aggiunta per il News Pop-up
    const newsPopup = document.getElementById('news-popup');
    const closeNewsPopupBtn = document.getElementById('close-news-popup'); // AGGIORNATO L'ID QUI!

    // Funzione Toggle Menu Mobile
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

    // Chiusura Menu Mobile (click fuori o su link)
    document.addEventListener('click', function(event) {
        if (mobileNav && mobileNav.classList.contains('active')) {
            const isClickInsideNav = mobileNav.contains(event.target);
            const isClickOnToggle = menuToggle && menuToggle.contains(event.target);
            const isNavLink = event.target.closest('.mobile-nav a'); // Aggiunto per gestire i link interni al menu

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
            if (sectionTop < windowHeight * 0.85) { // Attiva un po' prima che la sezione sia completamente visibile
                section.classList.add('visible');
            }
            // Opzionale: per rimuovere la classe 'visible' se si scrolla indietro
            // else {
            //    section.classList.remove('visible');
            // }
        });
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
            }
        });
    });

    // Funzione back to top (associata al bottone)
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

        // Inizializza la prima immagine come attiva
        images[currentIndex].classList.add('slide-active');

        setInterval(() => {
            images[currentIndex].classList.remove('slide-active');
            currentIndex = (currentIndex + 1) % images.length;
            images[currentIndex].classList.add('slide-active');
        }, 5000);
    });


    // --- Logica Pop-up Segreto (Secret Popup) con Animazioni ---

    // Funzione per mostrare il pop-up con animazione
    function showSecretPopup() { // Rinominate per evitare conflitti con il news popup
        if (!secretPopup || secretPopup.classList.contains('is-entering') || secretPopup.classList.contains('is-active')) {
            return; // Già in fase di ingresso o già attivo
        }
        secretPopup.classList.remove('is-hidden', 'is-exiting'); // Rimuovi classi di stato nascosto/uscita
        secretPopup.classList.add('is-entering'); // Aggiungi classe di ingresso
        secretPopup.addEventListener('animationend', function handler() {
            secretPopup.classList.remove('is-entering');
            secretPopup.classList.add('is-active'); // Aggiungi la classe attiva dopo l'animazione di ingresso
            secretPopup.onanimationend = null; // Rimuovi l'handler
        }, {
            once: true
        }); // Rimuove l'handler dopo una singola esecuzione
    }

    // Funzione per nascondere il pop-up con animazione
    function hideSecretPopup() { // Rinominate per evitare conflitti con il news popup
        if (!secretPopup || secretPopup.classList.contains('is-exiting') || (!secretPopup.classList.contains('is-active') && !secretPopup.classList.contains('is-entering'))) {
            return; // Già in fase di uscita, non attivo, o non in ingresso
        }
        secretPopup.classList.remove('is-entering', 'is-active'); // Rimuovi classi di ingresso/attivo
        secretPopup.classList.add('is-exiting'); // Aggiungi classe di uscita
        secretPopup.addEventListener('animationend', function handler() {
            secretPopup.classList.remove('is-exiting');
            secretPopup.classList.add('is-hidden'); // Ritorna allo stato nascosto
            secretPopup.onanimationend = null; // Rimuovi l'handler
        }, {
            once: true
        }); // Rimuove l'handler dopo una singola esecuzione
    }

    // Funzione per controllare la visibilità della sezione "home" e agire sul pop-up
    function checkAndToggleSecretPopup() { // Rinominate per specificità
        if (!secretPopup || !homeSection) {
            return;
        }

        // Se la sezione minigioco è già sbloccata, nascondi sempre il pop-up e non mostrarlo più
        if (document.getElementById('minigame-secret-section')) {
            hideSecretPopup();
            return;
        }

        const rect = homeSection.getBoundingClientRect();
        // Il pop-up appare quando la sezione home è completamente visibile all'utente.
        const isHomeFullyVisible = (
            rect.height > 0 &&
            rect.top >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        );

        if (isHomeFullyVisible) {
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
    if (secretPopupButton) { // Usato il nuovo nome della variabile
        secretPopupButton.addEventListener('click', function() {
            hideSecretPopup(); // Nasconde il pop-up con animazione
        });
    }
    if (secretPopupClose) { // Usato il nuovo nome della variabile
        secretPopupClose.addEventListener('click', function() {
            hideSecretPopup(); // Nasconde il pop-up con animazione
        });
    }

    // Esegui il controllo del pop-up segreto all'avvio e durante scroll/resize
    let scrollOrResizeTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollOrResizeTimeout);
        scrollOrResizeTimeout = setTimeout(checkAndToggleSecretPopup, 100); // Debounce
    });
    window.addEventListener('resize', function() {
        clearTimeout(scrollOrResizeTimeout);
        scrollOrResizeTimeout = setTimeout(checkAndToggleSecretPopup, 100); // Debounce
    });

    // --- Logica Pop-up Novità (News Popup) ---

    // Funzione per mostrare il news popup
    function showNewsPopup() {
        // Controllo se il popup è già visibile o in fase di animazione per evitare problemi
        if (!newsPopup || newsPopup.classList.contains('is-active') || newsPopup.classList.contains('is-entering')) {
            return;
        }

        // Rimuovi la classe 'hidden' per iniziare la transizione
        newsPopup.classList.remove('hidden');
        // Aggiungi la classe 'is-active' per attivare gli stili di visibilità e animazione
        newsPopup.classList.add('is-active');

        // Blocca lo scroll del body quando il popup è attivo
        document.body.style.overflow = 'hidden';
    }

    // Funzione per nascondere il news popup
    function hideNewsPopup() {
        if (!newsPopup || newsPopup.classList.contains('hidden') || newsPopup.classList.contains('is-exiting')) {
            return;
        }

        // Rimuovi la classe 'is-active' per avviare l'animazione di uscita
        newsPopup.classList.remove('is-active');

        // Aggiungi un listener per la fine della transizione
        newsPopup.addEventListener('transitionend', function handler() {
            // Aggiungi la classe 'hidden' solo dopo che l'animazione di uscita è completa
            newsPopup.classList.add('hidden');
            // Rimuovi l'event listener per evitare esecuzioni multiple
            newsPopup.removeEventListener('transitionend', handler);
            // Ripristina lo scroll del body
            document.body.style.overflow = '';
        });
    }

    // Mostra il news popup quando il DOM è completamente caricato
    // Utilizziamo un setTimeout per un leggero ritardo, evitando problemi di rendering iniziali
    setTimeout(showNewsPopup, 500); // Mostra dopo 0.5 secondi

    // Chiudi il news popup quando si clicca il bottone di chiusura
    if (closeNewsPopupBtn) {
        closeNewsPopupBtn.addEventListener('click', hideNewsPopup);
    }
});