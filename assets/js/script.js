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

// Configurazione GPX - NOMI CORRETTI
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
    '#667eea', // Tappa 1 - BLU
    '#4ecdc4', // Tappa 2 - TURCHESE
    '#45b7d1', // Tappa 3 - AZZURRO
    '#96ceb4', // Tappa 4 - VERDE CHIARO
    '#feca57', // Tappa 5 - ARANCIONE CHIARO
    '#ff9ff3', // Tappa 6 - ROSA
    '#ff6b6b', // Tappa 7 - ROSSO
    '#ffd93d'  // Tappa 8 - GIALLO (PERCORSO COMPLETO)
];

// ===== HAMBURGER MENU MOBILE =====
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navContainer = document.querySelector('.nav-container');
    
    if (menuToggle && navContainer) {
        // Toggle menu hamburger
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navContainer.classList.toggle('show');
        });
        
        // Chiudi menu quando si clicca fuori
        document.addEventListener('click', function(e) {
            if (!navContainer.contains(e.target) && e.target !== menuToggle) {
                navContainer.classList.remove('show');
            }
        });
        
        // Chiudi menu quando si clicca su un bottone di navigazione (mobile)
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navContainer.classList.remove('show');
                }
            });
        });
        
        // Chiudi menu con tasto ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                navContainer.classList.remove('show');
            }
        });
        
        console.log('🍔 Hamburger menu inizializzato');
    }
});




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

// MAPPA COMPLETA - Versione SICURA
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
        const tracceTotali = filesGpx.length - 1; // -1 per l'indice 0 vuoto

        // Carica tutte le tracce GPX con GESTIONE ERRORI COMPLETA
        for (let i = 1; i <= 8; i++) {
            const gpxUrl = "assets/downloads/gpx/" + filesGpx[i];
            
            if (!filesGpx[i]) continue;

            console.log(`📁 Tentativo caricamento traccia ${i}: ${filesGpx[i]}`);

            try {
                const gpxLayer = new L.GPX(gpxUrl, {
                    async: true,
                    polyline_options: {
                        color: coloriTappe[i-1],
                        weight: i === 8 ? 8 : 5,
                        opacity: i === 8 ? 0.9 : 0.8,
                        lineCap: 'round'
                    },
                    marker_options: { 
                        startIconUrl: null, 
                        endIconUrl: null, 
                        shadowUrl: null,
                        wptIconUrls: null
                    }
                });

                // Gestione evento loaded con CONTROLLO SICURO
                gpxLayer.on('loaded', function(e) {
                    tracceCaricate++;
                    
                    // CONTROLLO SICURO per evitare l'errore getDistance
                    let messaggio = '';
                    try {
                        if (e.target && e.target.getDistance && typeof e.target.getDistance === 'function') {
                            const distanza = (e.target.getDistance() / 1000).toFixed(1);
                            messaggio = i === 8 ? 
                                `🎯 PERCORSO COMPLETO GIALLO - ${distanza} km` :
                                `Tappa ${i}: ${distanza} km`;
                        } else {
                            messaggio = i === 8 ? 
                                "🎯 PERCORSO COMPLETO GIALLO" :
                                `Tappa ${i} caricata`;
                        }
                    } catch (error) {
                        messaggio = i === 8 ? 
                            "🎯 PERCORSO COMPLETO GIALLO (distanza non disponibile)" :
                            `Tappa ${i} caricata (distanza non disponibile)`;
                    }
                    
                    console.log(`✅ ${messaggio} - ${nomiColori[i-1]}`);
                    
                    // Aggiorna bounds per fit (con controllo sicurezza)
                    try {
                        if (e.target && e.target.getBounds && typeof e.target.getBounds === 'function') {
                            const layerBounds = e.target.getBounds();
                            if (layerBounds && layerBounds.isValid && layerBounds.isValid()) {
                                if (!bounds) {
                                    bounds = layerBounds;
                                } else {
                                    bounds.extend(layerBounds);
                                }
                            }
                        }
                    } catch (boundsError) {
                        console.warn(`⚠️ Impossibile ottenere bounds traccia ${i}`);
                    }
                });

                // Gestione errore
                gpxLayer.on('error', function(e) {
                    tracceCaricate++;
                    console.warn(`⚠️ Traccia ${i} non caricata: ${filesGpx[i]}`);
                });

                // Aggiungi alla mappa
                gpxLayer.addTo(mappaCompleta);
                
            } catch (error) {
                tracceCaricate++;
                console.warn(`⚠️ Errore creazione layer ${i}:`, error);
            }
        }

        // Fit bounds dopo caricamento (con timeout per sicurezza)
        setTimeout(() => {
            if (bounds && bounds.isValid && bounds.isValid()) {
                mappaCompleta.fitBounds(bounds, { padding: [30, 30] });
                console.log(`🎯 Mappa adattata a ${tracceCaricate}/${tracceTotali} tracce`);
            } else {
                mappaCompleta.setView([44.5, 14.5], 7);
                console.log('📍 Usando vista default');
            }
        }, 3000);

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
    
    for (let i = 1; i <= 7; i++) { // Solo tappe 1-7
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
                    color: coloriTappe[numeroTappa-1],
                    weight: 5,
                    opacity: 0.9,
                    lineCap: 'round'
                }
            }).on('loaded', function(e) {
                try {
                    miniMap.fitBounds(e.target.getBounds(), { padding: [10, 10] });
                    console.log(`✅ Mini-mappa ${numeroTappa} - ${nomiColori[numeroTappa-1]}`);
                } catch (boundsError) {
                    console.warn(`⚠️ Impossibile adattare mini-mappa ${numeroTappa}`);
                }
            }).on('error', function(e) {
                console.warn(`⚠️ Errore mini-mappa ${numeroTappa}`);
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
