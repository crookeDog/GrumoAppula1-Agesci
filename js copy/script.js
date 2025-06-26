document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const header = document.getElementById('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.getElementById('mobileNav');
    const backToTop = document.getElementById('backToTop');

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

    if (mobileNav) {
        mobileNav.addEventListener('click', function(event) {
            if (event.target.closest('a')) {
                toggleMenu();
            }
        });
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && mobileNav && mobileNav.classList.contains('active')) {
            toggleMenu();
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
            }
        });
    });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
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

        setInterval(() => {
            images[currentIndex].classList.remove('slide-active');
            currentIndex = (currentIndex + 1) % images.length;
            images[currentIndex].classList.add('slide-active');
        }, 5000);
    });

    const ospitalitaToggle = document.getElementById('ospitalitaToggle');
    const formContainer = document.getElementById('formContainer');

    if (ospitalitaToggle && formContainer) {
        ospitalitaToggle.addEventListener('click', () => {
            ospitalitaToggle.classList.toggle('active');
            const isOpen = formContainer.classList.toggle('open');
            if (isOpen) {
                setTimeout(() => {
                    formContainer.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 300);
            }
        });
    }

    setupHospitalityForm();

    setupSubscriptionForm();

    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});


function setupHospitalityForm() {
    const form = document.getElementById('ospitalitaForm');
    const regioneSelect = document.getElementById('regione');
    const provinciaSelect = document.getElementById('provincia');

    if (!form || !regioneSelect || !provinciaSelect) return;

    const provinceData = {
        'Abruzzo': ['L\'Aquila', 'Chieti', 'Pescara', 'Teramo'], 'Basilicata': ['Matera', 'Potenza'], 'Calabria': ['Catanzaro', 'Cosenza', 'Crotone', 'Reggio Calabria', 'Vibo Valentia'], 'Campania': ['Avellino', 'Benevento', 'Caserta', 'Napoli', 'Salerno'], 'Emilia-Romagna': ['Bologna', 'Ferrara', 'Forlì-Cesena', 'Modena', 'Parma', 'Piacenza', 'Ravenna', 'Reggio Emilia', 'Rimini'], 'Friuli-Venezia Giulia': ['Gorizia', 'Pordenone', 'Trieste', 'Udine'], 'Lazio': ['Frosinone', 'Latina', 'Rieti', 'Roma', 'Viterbo'], 'Liguria': ['Genova', 'Imperia', 'La Spezia', 'Savona'], 'Lombardia': ['Bergamo', 'Brescia', 'Como', 'Cremona', 'Lecco', 'Lodi', 'Mantova', 'Milano', 'Monza e Brianza', 'Pavia', 'Sondrio', 'Varese'], 'Marche': ['Ancona', 'Ascoli Piceno', 'Fermo', 'Macerata', 'Pesaro e Urbino'], 'Molise': ['Campobasso', 'Isernia'], 'Piemonte': ['Alessandria', 'Asti', 'Biella', 'Cuneo', 'Novara', 'Torino', 'Verbano-Cusio-Ossola', 'Vercelli'], 'Puglia': ['Bari', 'Barletta-Andria-Trani', 'Brindisi', 'Foggia', 'Lecce', 'Taranto'], 'Sardegna': ['Cagliari', 'Nuoro', 'Oristano', 'Sassari', 'Sud Sardegna'], 'Sicilia': ['Agrigento', 'Caltanissetta', 'Catania', 'Enna', 'Messina', 'Palermo', 'Ragusa', 'Siracusa', 'Trapani'], 'Toscana': ['Arezzo', 'Firenze', 'Grosseto', 'Livorno', 'Lucca', 'Massa-Carrara', 'Pisa', 'Pistoia', 'Prato', 'Siena'], 'Trentino-Alto Adige': ['Bolzano', 'Trento'], 'Umbria': ['Perugia', 'Terni'], 'Valle d\'Aosta': ['Aosta'], 'Veneto': ['Belluno', 'Padova', 'Rovigo', 'Treviso', 'Venezia', 'Verona', 'Vicenza']
    };

    regioneSelect.addEventListener('change', function() {
        const regione = this.value;
        provinciaSelect.innerHTML = '<option value="">Seleziona provincia</option>';
        if (regione && provinceData[regione]) {
            provinciaSelect.disabled = false;
            provinceData[regione].forEach(prov => {
                provinciaSelect.innerHTML += `<option value="${prov}">${prov}</option>`;
            });
        } else {
            provinciaSelect.disabled = true;
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        emailjs.sendForm('service_w00p4hu', 'template_khxs8jg', this)
            .then(() => {
                alert('Richiesta inviata con successo! Riceverete una risposta entro 48 ore.');
                form.reset();
                provinciaSelect.disabled = true;
                provinciaSelect.innerHTML = '<option value="">Prima seleziona la regione</option>';
                document.getElementById('formContainer')?.classList.remove('open');
                document.getElementById('ospitalitaToggle')?.classList.remove('active');
            }, (error) => {
                alert('Si è verificato un errore durante l\'invio della richiesta.');
                console.error('Errore invio email Ospitalità:', error);
            });
    });
}

function setupSubscriptionForm() {
    const form = document.getElementById('formIscrizione');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        emailjs.sendForm('service_w00p4hu', 'template_irpk1cc', this)
            .then(() => {
                alert('Richiesta di iscrizione inviata con successo! Sarete contattati.');
                form.reset();
            }, (error) => {
                alert('Si è verificato un errore durante l\'invio della richiesta di iscrizione.');
                console.error('Errore invio iscrizione:', error);
            });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const newsPopup = document.getElementById('news-popup');
    const closePopupButton = document.getElementById('close-popup');
    const popupCtaButton = document.getElementById('popup-cta-button');

    function closePopup() {
        if (newsPopup) {
            newsPopup.classList.add('hidden');
        }
    }

    if (newsPopup && sessionStorage.getItem('popupShown') !== 'true') {
        setTimeout(() => {
            newsPopup.classList.remove('hidden');
            sessionStorage.setItem('popupShown', 'true');
        }, 2000);
    }
    
    if (closePopupButton) {
        closePopupButton.addEventListener('click', closePopup);
    }
    
    if (popupCtaButton) {
        popupCtaButton.addEventListener('click', closePopup);
    }

    if (newsPopup) {
        newsPopup.addEventListener('click', function(event) {
            if (event.target === newsPopup) {
                closePopup();
            }
        });
    }
});