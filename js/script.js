function scrollToTopSmoothly() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

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
        } else if (cellurareField) {
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
    const body = document.body;
    const header = document.getElementById('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.getElementById('mobileNav');
    const backToTop = document.getElementById('backToTop');
    const currentYearSpan = document.getElementById('currentYear');
    const ospitalitaToggle = document.getElementById('ospitalitaToggle');
    const formContainer = document.getElementById('formContainer');
    const toggleArrow = ospitalitaToggle ? ospitalitaToggle.querySelector('.toggle-arrow') : null;

    const secretPopup = document.getElementById('secret-popup');
    const homeSection = document.getElementById('home');
    const secretPopupButton = secretPopup ? secretPopup.querySelector('.popup-button') : null;
    const secretPopupClose = secretPopup ? secretPopup.querySelector('.secret-popup-close') : null;

    const newsPopup = document.getElementById('news-popup');
    const closeNewsPopupBtn = document.getElementById('close-news-popup');

    let secretPopupHiddenByMenu = false;
    let hasSecretPopupAppearedOnce = false;
    let isSecretPopupManuallyClosed = false;

    function toggleMenu() {
        if (menuToggle && mobileNav) {
            const isActive = mobileNav.classList.contains('active');

            menuToggle.classList.toggle('active');
            mobileNav.classList.toggle('active');
            body.classList.toggle('no-scroll', mobileNav.classList.contains('active'));

            const isMobile = window.getComputedStyle(document.querySelector('.nav-links')).display === 'none';

            if (isMobile) {
                if (!isActive) {
                    if (secretPopup && secretPopup.classList.contains('is-active')) {
                        hideSecretPopup();
                        secretPopupHiddenByMenu = true;
                    }
                } else {
                    if (secretPopupHiddenByMenu) {
                        secretPopupHiddenByMenu = false;
                        const rect = homeSection.getBoundingClientRect();
                        if (rect.top === 0) {
                            if (!isSecretPopupManuallyClosed) {
                                showSecretPopup();
                            }
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

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && mobileNav && mobileNav.classList.contains('active')) {
            toggleMenu();
        }
    });

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
                    secretPopupHiddenByMenu = false;
                    if (!mobileNav.classList.contains('active') && !isSecretPopupManuallyClosed) {
                        showSecretPopup();
                    } else {
                        hideSecretPopup();
                    }
                } else {
                    hideSecretPopup();
                }
            }
        });
    });

    if (backToTop) {
        backToTop.addEventListener('click', scrollToTopSmoothly);
    }

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

    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    setupHospitalityForm();
    setupSubscriptionForm();

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

    if (formContainer) {
        formContainer.classList.remove('open');
    }

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

    function showSecretPopup() {
        if (isSecretPopupManuallyClosed) {
            hideSecretPopup();
            return;
        }

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

    function checkAndToggleSecretPopup() {
        if (isSecretPopupManuallyClosed) {
            hideSecretPopup();
            return;
        }

        if (!secretPopup || !homeSection) {
            return;
        }

        if (document.getElementById('minigame-secret-section')) {
            hideSecretPopup();
            return;
        }

        const rect = homeSection.getBoundingClientRect();

        const isHomeFullyInViewOrEntering = (
            rect.top <= 10 && rect.top >= - (window.innerHeight || document.documentElement.clientHeight) * 0.1 &&
            rect.bottom > (window.innerHeight || document.documentElement.clientHeight) * 0.9 
        );
        const isAtTopOfPage = window.scrollY < 50;

        if (isAtTopOfPage && isHomeFullyInViewOrEntering && !secretPopupHiddenByMenu) {
            showSecretPopup();
        } else {
            hideSecretPopup();
        }
    }

    if (secretPopup) {
        secretPopup.classList.add('is-hidden');
    }

    if (secretPopupButton) {
        secretPopupButton.addEventListener('click', function() {
            hideSecretPopup();
            secretPopupHiddenByMenu = false;
            isSecretPopupManuallyClosed = true;
            checkAndToggleSecretPopup();
        });
    }

    if (secretPopupClose) {
        secretPopupClose.addEventListener('click', function() {
            hideSecretPopup();
            secretPopupHiddenByMenu = false;
            isSecretPopupManuallyClosed = true;
            checkAndToggleSecretPopup();
        });
    }

    let scrollOrResizeTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollOrResizeTimeout);
        if (!isSecretPopupManuallyClosed) {
            scrollOrResizeTimeout = setTimeout(checkAndToggleSecretPopup, 100);
        } else {
            hideSecretPopup();
        }
    });
    window.addEventListener('resize', function() {
        clearTimeout(scrollOrResizeTimeout);
        if (!isSecretPopupManuallyClosed) {
            scrollOrResizeTimeout = setTimeout(checkAndToggleSecretPopup, 100);
        } else {
            hideSecretPopup();
        }
    });

    window.addEventListener('DOMContentLoaded', function() {
        if (isSecretPopupManuallyClosed) {
            hideSecretPopup();
            return;
        }

        if (!hasSecretPopupAppearedOnce && window.innerWidth <= 768) {
            setTimeout(() => {
                const rect = homeSection.getBoundingClientRect();
                if (rect.top === 0 && window.scrollY === 0 && !secretPopupHiddenByMenu && !isSecretPopupManuallyClosed) {
                    showSecretPopup();
                }
            }, 500);
        }
    });

    window.addEventListener('load', function() {
        if (isSecretPopupManuallyClosed) {
            hideSecretPopup();
        } else {
            checkAndToggleSecretPopup();
        }
    });

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

    setTimeout(showNewsPopup, 500);

    if (closeNewsPopupBtn) {
        closeNewsPopupBtn.addEventListener('click', hideNewsPopup);
    }
});
