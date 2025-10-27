// GIRO GNORANTE 2025 - Script Mappe Ottimizzato
console.log('🏍️ Giro Gnorante 2025 - Script caricato!');

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

// Configurazione GPX - 8 FILE AGGIORNATI
const filesGpx = [
    "", // Indice 0 vuoto
    "01_TORINO_PORTOGRUARO.gpx",
    "02_PORTOGRUARO_PRIZNA.gpx",
    "03_PRIZNA_MARULOVO.gpx", 
    "04_MARULOVO_MOSTAR.gpx",
    "05_MOSTAR_DUBROVNIK.gpx",
    "06_DUBROVNIK_SPALATO.gpx",
    "07_SPALATO_ANCONA_TORINO.gpx",
    "08_PERCORSO_COMPLETO.gpx"
];

// COLORI DIVERSI PER OGNI TRACCIA + GIALLO PER COMPLETO
const coloriTappe = [
    '#667eea', // Tappa 1 - BLU (Torino → Portogruaro)
    '#4ecdc4', // Tappa 2 - TURCHESE (Portogruaro → Prizna)
    '#45b7d1', // Tappa 3 - AZZURRO (Prizna → Marulovo)
    '#96ceb4', // Tappa 4 - VERDE CHIARO (Marulovo → Mostar)
    '#feca57', // Tappa 5 - ARANCIONE CHIARO (Mostar → Dubrovnik)
    '#ff9ff3', // Tappa 6 - ROSA (Dubrovnik → Spalato)
    '#ff6b6b', // Tappa 7 - ROSSO (Spalato → Ancona → Torino)
    '#ffd93d'  // Tappa 8 - GIALLO (PERCORSO COMPLETO)
];

// Nomi colori per debug
const nomiColori = [
    "BLU", "TURCHESE", "AZZURRO", "VERDE CHIARO", 
    "ARANCIONE CHIARO", "ROSA", "ROSSO", "GIALLO"
];

// Gestione Navigazione
function showSection(sectionId, element) {
    // Nascondi tutte le sezioni
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });

    // Mostra sezione cliccata
    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
        
        // Inizializza mappe solo quando necessario
        if (!mappeInizializzate[sectionId]) {
            setTimeout(() => initMapsSezione(sectionId), 100);
            mappeInizializzate[sectionId] = true;
        } else {
            setTimeout(() => aggiornaMappeSezione(sectionId), 100);
        }
    }

    // Aggiorna stati bottoni
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
            // Le mini-mappe si auto-aggiornano
            break;
    }
}

// MAPPA COMPLETA - Versione con COLORI DIVERSI
function initMappaCompleta() {
    if (mappaCompleta || typeof L === 'undefined') return;

    try {
        console.log('🗺️ Inizializzazione mappa completa...');
        
        const mappaDiv = document.getElementById('mappa-completa');
        if (!mappaDiv) {
            console.error('❌ Elemento mappa-completa non trovato');
            return;
        }

        // Crea mappa
        mappaCompleta = L.map('mappa-completa').setView([44.5, 14.5], 7);

        // Aggiungi layer mappa
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(mappaCompleta);

        console.log('✅ Mappa base creata');

        // Verifica libreria GPX
        if (typeof L.GPX === 'undefined') {
            console.error('❌ Libreria L.GPX non disponibile');
            mappaDiv.innerHTML = '❌ Errore caricamento mappe';
            return;
        }

        let bounds = null;
        let tracceCaricate = 0;

        // Carica tutte le 8 tracce GPX con COLORI DIVERSI
        for (let i = 1; i <= 8; i++) {
            const gpxUrl = "assets/downloads/gpx/" + filesGpx[i];
            
            if (!filesGpx[i]) continue;

            console.log(`📁 Caricamento traccia ${i}: ${filesGpx[i]} - Colore: ${nomiColori[i-1]}`);

            try {
                const gpxLayer = new L.GPX(gpxUrl, {
                    async: true,
                    polyline_options: {
                        color: coloriTappe[i-1],
                        weight: i === 8 ? 8 : 5, // Più spessa per il percorso GIALLO (8)
                        opacity: i === 8 ? 0.9 : 0.8,
                        lineCap: 'round'
                    },
                    marker_options: { 
                        startIconUrl: null, 
                        endIconUrl: null, 
                        shadowUrl: null,
                        wptIconUrls: null
                    }
                }).on('loaded', function(e) {
                    tracceCaricate++;
                    const descrizione = i === 8 ? 
                        "🎯 PERCORSO COMPLETO GIALLO" :
                        `Tappa ${i}: ${(e.target.getDistance() / 1000).toFixed(1)} km`;
                    
                    console.log(`✅ ${descrizione} - ${nomiColori[i-1]}`);
                    
                    // Aggiorna bounds per fit
                    if (!bounds) {
                        bounds = e.target.getBounds();
                    } else {
                        bounds.extend(e.target.getBounds());
                    }
                    
                    // Fit bounds quando tutte le tracce sono caricate
                    if (tracceCaricate >= 8 && bounds.isValid()) {
                        mappaCompleta.fitBounds(bounds, { padding: [30, 30] });
                        console.log('🎯 Mappa adattata a tutte le 8 tracce');
                    }
                }).on('error', function(e) {
                    console.error(`❌ Errore traccia ${i}:`, e);
                }).addTo(mappaCompleta);
                
            } catch (error) {
                console.error(`💥 Errore creazione layer ${i}:`, error);
            }
        }

        // Fallback per vista iniziale
        setTimeout(() => {
            if (!bounds || !bounds.isValid()) {
                mappaCompleta.setView([44.5, 14.5], 7);
                console.log('📍 Usando vista default');
            }
        }, 5000);

    } catch (error) {
        console.error('💥 Errore critico mappa completa:', error);
        const mappaDiv = document.getElementById('mappa-completa');
        if (mappaDiv) {
            mappaDiv.innerHTML = '❌ Errore nel caricamento della mappa';
        }
    }
}

// MINI-MAPPE TAPPE - COLORI DIVERSI per ogni tappa
function initMappeTappe() {
    if (typeof L === 'undefined') return;
    
    for (let i = 1; i <= 7; i++) { // Solo tappe 1-7, non il percorso completo giallo (8)
        const mappaDiv = document.getElementById(`mappa-tappa-${i}`);
        if (mappaDiv && mappaDiv.offsetParent !== null) {
            initMiniMappa(i);
        }
    }
}

function initMiniMappa(numeroTappa) {
    const mappaDiv = document.getElementById(`mappa-tappa-${numeroTappa}`);
    if (!mappaDiv || mappaDiv._leaflet_map) return;

    try {
        console.log(`🔄 Inizializzazione mini-mappa ${numeroTappa}`);
        
        const miniMap = L.map(`mappa-tappa-${numeroTappa}`, {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            touchZoom: false
        }).setView([45.0, 12.0], 7);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 16
        }).addTo(miniMap);

        const gpxUrl = "assets/downloads/gpx/" + filesGpx[numeroTappa];
        
        if (filesGpx[numeroTappa] && typeof L.GPX !== 'undefined') {
            new L.GPX(gpxUrl, {
                async: true,
                marker_options: {
                    startIconUrl: null,
                    endIconUrl: null,
                    shadowUrl: null,
                    wptIconUrls: null
                },
                polyline_options: {
                    // COLORI DIVERSI per ogni tappa
                    color: coloriTappe[numeroTappa-1],
                    weight: 5,
                    opacity: 0.9,
                    lineCap: 'round'
                }
            }).on('loaded', function(e) {
                miniMap.fitBounds(e.target.getBounds(), { padding: [10, 10] });
                console.log(`✅ Mini-mappa ${numeroTappa} - ${nomiColori[numeroTappa-1]}`);
            }).on('error', function(e) {
                console.error(`❌ Errore mini-mappa ${numeroTappa}:`, e);
            }).addTo(miniMap);
        }

    } catch (error) {
        console.error(`💥 Errore critico mini-mappa ${numeroTappa}:`, error);
    }
}

// INIZIALIZZAZIONE
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Setup iniziale...');
    
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

    // Gestione menu mobile (se presente)
    const hamburger = document.getElementById('menuToggle');
    if (hamburger) {
        const nav = document.querySelector('.nav-container');
        hamburger.addEventListener('click', function() {
            nav.classList.toggle('show');
        });

        // Chiudi menu su click voce (mobile)
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (window.innerWidth <= 768 && nav) {
                    nav.classList.remove('show');
                }
            });
        });
    }

    console.log('✅ Setup completato');
});

// Gestione resize finestra
window.addEventListener('resize', function() {
    if (mappaCompleta) {
        setTimeout(() => mappaCompleta.invalidateSize(), 250);
    }
});
