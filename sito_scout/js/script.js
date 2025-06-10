document.addEventListener('DOMContentLoaded', function() {

    // ---------- Funzionalità dal primo script ----------

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


    // ---------- Funzionalità per il form di ospitalità (integrata EmailJS) ----------

    // Province per regione
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

    const regioneSelect = document.getElementById('regione');
    const provinciaSelect = document.getElementById('provincia');
    const formOspitalita = document.getElementById('ospitalitaForm'); // Rinominato per chiarezza

    // Inizializza il select della provincia disabilitato
    if(provinciaSelect) {
         provinciaSelect.disabled = true;
         provinciaSelect.innerHTML = '<option value="">Prima seleziona la regione</option>';
    }

    // Gestione cambio regione
    if(regioneSelect && provinciaSelect) {
        regioneSelect.addEventListener('change', function() {
            const regioneSelezionata = this.value;
            provinciaSelect.innerHTML = '<option value="">Seleziona provincia</option>'; // Reset province

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
    }

    // Validazione form e Invio EmailJS
    if(formOspitalita) { // Usiamo il nome rinominato
        formOspitalita.addEventListener('submit', function(e) {
            e.preventDefault();

            const requiredFields = formOspitalita.querySelectorAll('[required]'); // Usiamo il nome rinominato
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.style.borderColor = '#e74c3c';
                    isValid = false;
                } else {
                    field.style.borderColor = '#A3B18A';
                }
            });

            // Validazione email
            const emailField = document.getElementById('email');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailField && emailField.value && !emailRegex.test(emailField.value)) {
                emailField.style.borderColor = '#e74c3c';
                isValid = false;
            } else if (emailField) {
                 emailField.style.borderColor = '#A3B18A'; // Reset border if valid
            }

            // Validazione cellulare
            const cellulareField = document.getElementById('cellulare');
            const cellulareRegex = /^[0-9]{8,15}$/;
            if (cellulareField && cellulareField.value && !cellulareRegex.test(cellulareField.value.replace(/\s/g, ''))) {
                cellulareField.style.borderColor = '#e74c3c';
                isValid = false;
            } else if (cellulareField) {
                cellulareField.style.borderColor = '#A3B18A'; // Reset border if valid
            }

            // Validazione date
            const dataArrivoField = document.getElementById('dataArrivo');
            const dataPartenzaField = document.getElementById('dataPartenza');
            const oggi = new Date();
            oggi.setHours(0, 0, 0, 0); // Reset hours for accurate comparison

            let dataArrivo, dataPartenza;

            if(dataArrivoField && dataArrivoField.value) {
                dataArrivo = new Date(dataArrivoField.value);
                 if (new Date(dataArrivoField.value) < oggi) { // Confrontiamo la data del campo con oggi
                    dataArrivoField.style.borderColor = '#e74c3c';
                    isValid = false;
                } else {
                     dataArrivoField.style.borderColor = '#A3B18A'; // Reset border if valid
                }
            } else if (dataArrivoField) {
                 dataArrivoField.style.borderColor = '#A3B18A'; // Reset border if empty (handled by required)
            }

             if(dataPartenzaField && dataPartenzaField.value) {
                 dataPartenza = new Date(dataPartenzaField.value);
                 if (dataArrivoField && dataArrivoField.value && new Date(dataPartenzaField.value) <= new Date(dataArrivoField.value)) { // Confrontiamo le date dei campi
                    dataPartenzaField.style.borderColor = '#e74c3c';
                    isValid = false;
                } else {
                     dataPartenzaField.style.borderColor = '#A3B18A'; // Reset border if valid
                }
            } else if (dataPartenzaField) {
                 dataPartenzaField.style.borderColor = '#A3B18A'; // Reset border if empty (handled by required)
            }

            if (isValid) {
                // QUESTA È LA PARTE MODIFICATA PER INVIARE CON EMAILJS
                // Assicurati di sostituire 'YOUR_TEMPLATE_ID' con il tuo Template ID effettivo
                emailjs.sendForm('service_w00p4hu', 'template_khxs8jg', this) // 'this' si riferisce al form 'formOspitalita'
                    .then(function() {
                        // Questo codice viene eseguito se l'invio ha successo
                        alert('Richiesta inviata con successo! Riceverete una risposta entro 48 ore.');
                        formOspitalita.reset(); // Resettiamo il form di ospitalità
                        if(provinciaSelect) {
                            provinciaSelect.disabled = true;
                            provinciaSelect.innerHTML = '<option value="">Prima seleziona la regione</option>';
                        }
                    }, function(error) {
                        // Questo codice viene eseguito se c'è un errore nell'invio
                        alert('Si è verificato un errore durante l\'invio della richiesta.');
                        console.log('Errore invio email:', error); // Logga l'errore nella console per debug
                    });

            } else {
                // Questo codice viene eseguito se la validazione fallisce (nessun cambiamento qui)
                alert('Si prega di compilare correttamente tutti i campi obbligatori.');
                // Scroll al primo campo con errore
                const firstErrorField = formOspitalita.querySelector('[style*="border-color: rgb(231, 76, 60)"]');
                if (firstErrorField) {
                    firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstErrorField.focus();
                }
            }
        });

        // Reset colore bordo quando l'utente inizia a digitare (per form ospitalità)
        const allInputsOspitalita = formOspitalita.querySelectorAll('input, select, textarea');
        allInputsOspitalita.forEach(input => {
            input.addEventListener('input', function() {
                if (this.style.borderColor === 'rgb(231, 76, 60)') {
                    this.style.borderColor = '#A3B18A';
                }
            });
        });
    }

    // Nota: Il form "Iscriviti" (con id="contact-form" o simile) non è gestito qui per l'invio EmailJS.
    // Se volessi fare lo stesso anche per quello, dovresti replicare la logica.


});

// Funzione globale per il bottone back-to-top (se usi onclick="" nell'HTML)
function scrollToTopSmoothly() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
