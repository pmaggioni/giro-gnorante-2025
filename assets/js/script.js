// VERSIONE OTTIMIZZATA - Mappe caricate solo quando servono
console.log('Script JavaScript caricato!');

// Variabili globali
let mappaCompleta = null;
let mappeInizializzate = {
    overview: false,
    tappe: false,
    mappa: false,
    downloads: false,
    partecipanti: false,
    info: false
};

function showSection(sectionId, element) {
    // Nascondi tutte le sezioni
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });

    // Mostra la sezione cliccata
    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
        // Inizializza le mappe SOLO quando la sezione diventa visibile
        if (!mappeInizializzate[sectionId]) {
            setTimeout(() => initMapsSezione(sectionId), 100);
            mappeInizializzate[sectionId] = true;
        } else {
            setTimeout(() => aggiornaMappeSezione(sectionId), 100);
        }
    }

    // Aggiorna bottoni attivi
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (element) {
        element.classList.add('active');
    }
}

function initMapsSezione(sectionId) {
    switch(sectionId) {
        case 'mappa':
            initMappaCompleta();
            break;
        case 'tappe':
            initMappeTappe();
            break;
    }
}

function aggiornaMappeSezione(sectionId) {
    switch(sectionId) {
        case 'mappa':
            if (mappaCompleta) {
                setTimeout(() => mappaCompleta.invalidateSize(), 300);
            }
            break;
        case 'tappe':
            // Le mini-mappe si aggiornano automaticamente
            break;
    }
}

// -------- INTEGRAZIONE GPX --------

// Lista dei file GPX per tappe (indice parte da 1)
const filesGpx = [
  "", // dummy per 0
  "01_TORINO_PORTOGRUARO.gpx",
  "02_PORTOGRUARO_PRIZNA.gpx",
  "03_PRIZNA_MARULOVO.gpx",
  "04_MARULOVO_MOSTAR.gpx",
  "05_MOSTAR_DUBROVNIK.gpx",
  "06_DUBROVNIK_SPALATO.gpx",
  "07_Percorso_Completo.gpx"
];

// MAPPA COMPLETA - ognuna delle tappe caricata via GPX
function initMappaCompleta() {
    if (mappaCompleta || typeof L === 'undefined') return;

    try {
        const mappaDiv = document.getElementById('mappa-completa');
        if (!mappaDiv) return;

        mappaCompleta = L.map('mappa-completa').setView([44.5, 14.5], 7);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(mappaCompleta);

        // Colori per le tracce: personalizza l'ultimo colore per la traccia completa
        const coloriTappe = ['#667eea', '#667eea', '#667eea', '#667eea', '#667eea', '#fc4a1a', '#ffd93d'];

        // Carica tutte le tappe GPX inclusa la n.7
        for (let i = 1; i <= 7; i++) {
            let gpxUrl = "assets/downloads/gpx/" + filesGpx[i];
            if (filesGpx[i]) {
                new L.GPX(gpxUrl, {
                    async: true,
                    polyline_options: {
                        color: coloriTappe[i-1] || '#000', // default nero se qualcosa va storto
                        weight: 4,
                        opacity: 0.85
                    },
                    marker_options: { startIconUrl: null, endIconUrl: null, shadowUrl: null }
                }).on('loaded', function(e) {
                    mappaCompleta.fitBounds(e.target.getBounds());
                }).addTo(mappaCompleta);
            }
        }

        console.log('✓ Mappa completa inizializzata con tutte le tracce GPX');

    } catch (error) {
        console.error('Errore mappa completa:', error);
    }
}



// MAPPE TAPPE - Solo quando serve
function initMappeTappe() {
    if (typeof L === 'undefined') return;
    for (let i = 1; i <= 7; i++) {
        const mappaDiv = document.getElementById(`mappa-tappa-${i}`);
        if (mappaDiv && mappaDiv.offsetParent !== null) { // Controlla se è visibile
            initMiniMappa(i);
        }
    }
}

// Mini mappa singola: carica la GPX di riferimento
function initMiniMappa(numeroTappa) {
    const mappaDiv = document.getElementById(`mappa-tappa-${numeroTappa}`);
    if (!mappaDiv || mappaDiv._leaflet_map) return;

    try {
        const miniMap = L.map(`mappa-tappa-${numeroTappa}`, {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false
        }).setView([45.0, 12.0], 7);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 16
        }).addTo(miniMap);
       // TEST: usa questa riga per provare un GPX online funzionante
      //  const gpxUrl = "https://raw.githubusercontent.com/gps-touring/sample-gpx/main/track-good.gpx";
        const gpxUrl = "assets/downloads/gpx/" + filesGpx[numeroTappa];
        if (filesGpx[numeroTappa]) {
            new L.GPX(gpxUrl, {
                async: true,
                marker_options: {
                    startIconUrl: null,
                    endIconUrl: null,
                    shadowUrl: null
                },
                polyline_options: {
                    color: numeroTappa <= 5 ? "#667eea" : "#fc4a1a",
                    weight: 3,
                    opacity: 0.9
                }
            }).on('loaded', function(e) {
                miniMap.fitBounds(e.target.getBounds());
            }).addTo(miniMap);
        }

        console.log(`✓ Mini-mappa ${numeroTappa} caricata con GPX`);

    } catch (error) {
        console.error(`Errore mini-mappa ${numeroTappa}:`, error);
    }
}

// Setup iniziale
document.addEventListener('DOMContentLoaded', function() {
    // Nascondi tutte le sezioni tranne Overview
    document.querySelectorAll('.section').forEach((section, index) => {
        if (index === 0) {
            section.style.display = 'block';
            mappeInizializzate.overview = true;
        } else {
            section.style.display = 'none';
        }
    });

    // Collegamento bottoni navigazione
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            showSection(target, this);
        });
    });

    // Hamburger menu mobile
    const hamburger = document.getElementById('menuToggle');
    const nav = document.querySelector('.nav-container');
    hamburger.addEventListener('click', function() {
        nav.classList.toggle('show');
    });

    // Chiudi menu su click voce (opzionale)
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (window.innerWidth <= 768) nav.classList.remove('show');
        });
    });
});

// Gestione resize finestra
window.addEventListener('resize', function() {
    if (mappaCompleta) {
        setTimeout(() => mappaCompleta.invalidateSize(), 250);
    }
});
