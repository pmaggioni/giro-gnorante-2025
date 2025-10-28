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

// COLORI AD ALTO CONTRASTO
const coloriTappe = [
    '#e11d48', // Tappa 1 - ROSSO RUBINO
    '#2563eb', // Tappa 2 - BLU REALE
    '#16a34a', // Tappa 3 - VERDE FORTE
    '#7c3aed', // Tappa 4 - VIOLA INTENSO
    '#ea580c', // Tappa 5 - ARANCIONE FUOCO
    '#db2777', // Tappa 6 - ROSA ELETTRICO
    '#ca8a04', // Tappa 7 - ORO LUCIDO
    '#000000'  // Tappa 8 - NERO
];

// ===== INIZIALIZZAZIONE COMPLETA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Setup iniziale...');
    
    // Inizializza hamburger menu
    initHamburgerMenu();
    
    // Setup navigazione e sezioni
    initNavigazione();
    
    console.log('✅ Setup completato');
});

// ===== HAMBURGER MENU MOBILE =====
function initHamburgerMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navContainer = document.querySelector('.nav-container');
    
    if (menuToggle && navContainer) {
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            navContainer.classList.toggle('show');
        });
        
        document.addEventListener('click', function(e) {
            if (!navContainer.contains(e.target) && e.target !== menuToggle) {
                navContainer.classList.remove('show');
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                navContainer.classList.remove('show');
            }
        });
        
        console.log('🍔 Hamburger menu inizializzato');
    }
}

// ===== NAVIGAZIONE E SEZIONI =====
function initNavigazione() {
    document.querySelectorAll('.section').forEach((section, index) => {
        if (index === 0) {
            section.style.display = 'block';
            mappeInizializzate.overview = true;
        } else {
            section.style.display = 'none';
        }
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');
            showSection(target, this);
        });
    });
}

function showSection(sectionId, element) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });

    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
        
        if (!mappeInizializzate[sectionId]) {
            setTimeout(() => initMapsSezione(sectionId), 100);
            mappeInizializzate[sectionId] = true;
        } else {
            setTimeout(() => aggiornaMappeSezione(sectionId), 100);
        }
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (element) {
        element.classList.add('active');
    }
    
    if (window.innerWidth <= 768) {
        const navContainer = document.querySelector('.nav-container');
        if (navContainer) {
            navContainer.classList.remove('show');
        }
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
    }
}

// ===== MAPPA COMPLETA CON BANDIERINE =====
function initMappaCompleta() {
    if (mappaCompleta || typeof L === 'undefined') return;

    try {
        console.log('🗺️ Inizializzazione mappa completa...');
        
        const mappaDiv = document.getElementById('mappa-completa');
        if (!mappaDiv) return;

        mappaCompleta = L.map('mappa-completa').setView([44.5, 14.5], 7);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(mappaCompleta);

        console.log('✅ Mappa base creata');

        if (typeof L.GPX === 'undefined') {
            mappaDiv.innerHTML = '❌ Errore caricamento mappe';
            return;
        }

        let bounds = null;
        let tracceCaricate = 0;

        // Carica tutte le tracce GPX
        for (let i = 1; i <= 8; i++) {
            const gpxUrl = "assets/downloads/gpx/" + filesGpx[i];
            if (!filesGpx[i]) continue;

            console.log(`📁 Caricamento traccia ${i}: ${filesGpx[i]}`);

            try {
                const gpxLayer = new L.GPX(gpxUrl, {
                    async: true,
                    polyline_options: {
                        color: coloriTappe[i-1],
                        weight: i === 8 ? 10 : 6,
                        opacity: i === 8 ? 1.0 : 0.9,
                        lineCap: 'round'
                    },
                    marker_options: {
                        startIconUrl: null,
                        endIconUrl: null,
                        shadowUrl: null,
                        wptIconUrls: null
                    }
                });

                gpxLayer.on('loaded', function(e) {
                    tracceCaricate++;
                    console.log(`✅ Traccia ${i} caricata`);
                    
                    // AGGIUNGI BANDIERINE QUI
                    aggiungiBandierineTappa(e.target, i);
                    
                    try {
                        if (e.target && e.target.getBounds) {
                            const layerBounds = e.target.getBounds();
                            if (layerBounds && layerBounds.isValid()) {
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

                gpxLayer.on('error', function(e) {
                    tracceCaricate++;
                    console.warn(`⚠️ Traccia ${i} non caricata`);
                });

                gpxLayer.addTo(mappaCompleta);
                
            } catch (error) {
                tracceCaricate++;
                console.warn(`⚠️ Errore creazione layer ${i}:`, error);
            }
        }

        // Fit bounds dopo caricamento
        setTimeout(() => {
            if (bounds && bounds.isValid()) {
                mappaCompleta.fitBounds(bounds, { padding: [30, 30] });
                console.log(`🎯 Mappa adattata a ${tracceCaricate}/8 tracce`);
            } else {
                mappaCompleta.setView([44.5, 14.5], 7);
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

// ===== FUNZIONE BANDIERINE - VERSIONE SEMPLIFICATA =====
function aggiungiBandierineTappa(gpxLayer, numeroTappa) {
    console.log(`🎯 Aggiungo bandierine per tappa ${numeroTappa}`);
    
    try {
        // Crea bandierina di PARTENZA
        const startIcon = L.divIcon({
            className: 'bandierina-partenza',
            html: `🏁<div class="bandierina-numero">${numeroTappa}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        });
        
        // Crea bandierina di ARRIVO
        const endIcon = L.divIcon({
            className: 'bandierina-arrivo',
            html: `🎯<div class="bandierina-numero">${numeroTappa}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        });

        // Aggiungi bandierine approssimative (poi si sistemano quando il GPX carica)
        const nomiTappe = {
            1: { start: [45.0703, 7.6869], end: [45.775, 12.8386], startName: "Torino", endName: "Portogruaro" },
            2: { start: [45.775, 12.8386], end: [44.6333, 14.8833], startName: "Portogruaro", endName: "Prizna" },
            3: { start: [44.6333, 14.8833], end: [43.5, 16.25], startName: "Prizna", endName: "Marulovo" },
            4: { start: [43.5, 16.25], end: [43.3433, 17.8081], startName: "Marulovo", endName: "Mostar" },
            5: { start: [43.3433, 17.8081], end: [42.6403, 18.1083], startName: "Mostar", endName: "Dubrovnik" },
            6: { start: [42.6403, 18.1083], end: [43.5081, 16.4403], startName: "Dubrovnik", endName: "Spalato" },
            7: { start: [43.5081, 16.4403], end: [45.0703, 7.6869], startName: "Spalato", endName: "Torino" },
            8: { start: [45.0703, 7.6869], end: [45.0703, 7.6869], startName: "Torino", endName: "Torino" }
        };

        const tappa = nomiTappe[numeroTappa];
        if (tappa) {
            // Bandierina partenza
            L.marker(tappa.start, { icon: startIcon })
                .addTo(mappaCompleta)
                .bindPopup(`<strong>Partenza Tappa ${numeroTappa}</strong><br>${tappa.startName}`);
            
            // Bandierina arrivo
            L.marker(tappa.end, { icon: endIcon })
                .addTo(mappaCompleta)
                .bindPopup(`<strong>Arrivo Tappa ${numeroTappa}</strong><br>${tappa.endName}`);
            
            console.log(`✅ Bandierine aggiunte per tappa ${numeroTappa}`);
        }
        
    } catch (error) {
        console.warn(`⚠️ Errore bandierine tappa ${numeroTappa}:`, error);
    }
}

// ===== MINI-MAPPE TAPPE CON BANDIERINE =====
function initMappeTappe() {
    if (typeof L === 'undefined') return;
    
    for (let i = 1; i <= 7; i++) {
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
        console.log(`🔄 Mini-mappa ${numeroTappa} con bandierine`);
        
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
                    weight: 6,
                    opacity: 1.0,
                    lineCap: 'round'
                }
            }).on('loaded', function(e) {
                try {
                    // AGGIUNGI BANDIERINE ALLE MINI-MAPPE
                    aggiungiBandierineMiniMappa(e.target, numeroTappa, miniMap);
                    miniMap.fitBounds(e.target.getBounds(), { padding: [10, 10] });
                    console.log(`✅ Mini-mappa ${numeroTappa} con bandierine`);
                } catch (boundsError) {
                    console.warn(`⚠️ Impossibile adattare mini-mappa ${numeroTappa}`);
                }
            }).on('error', function(e) {
                console.warn(`⚠️ Errore mini-mappa ${numeroTappa}`);
            }).addTo(miniMap);
        }

    } catch (error) {
        console.error(`💥 Errore mini-mappa ${numeroTappa}:`, error);
    }
}

// ===== BANDIERINE PER MINI-MAPPE =====
function aggiungiBandierineMiniMappa(gpxLayer, numeroTappa, miniMap) {
    console.log(`🎯 Aggiungo bandierine mini-mappa ${numeroTappa}`);
    
    try {
        // Bandierina di PARTENZA per mini-mappa
        const startIconMini = L.divIcon({
            className: 'bandierina-partenza-mini',
            html: `🏁<div class="bandierina-numero-mini">${numeroTappa}</div>`,
            iconSize: [25, 25],
            iconAnchor: [12, 25]
        });
        
        // Bandierina di ARRIVO per mini-mappa
        const endIconMini = L.divIcon({
            className: 'bandierina-arrivo-mini',
            html: `🎯<div class="bandierina-numero-mini">${numeroTappa}</div>`,
            iconSize: [25, 25],
            iconAnchor: [12, 25]
        });

        // Coordinate approssimative per ogni tappa
        const coordinateTappe = {
            1: { start: [45.0703, 7.6869], end: [45.775, 12.8386], startName: "Torino", endName: "Portogruaro" },
            2: { start: [45.775, 12.8386], end: [44.6333, 14.8833], startName: "Portogruaro", endName: "Prizna" },
            3: { start: [44.6333, 14.8833], end: [43.5, 16.25], startName: "Prizna", endName: "Marulovo" },
            4: { start: [43.5, 16.25], end: [43.3433, 17.8081], startName: "Marulovo", endName: "Mostar" },
            5: { start: [43.3433, 17.8081], end: [42.6403, 18.1083], startName: "Mostar", endName: "Dubrovnik" },
            6: { start: [42.6403, 18.1083], end: [43.5081, 16.4403], startName: "Dubrovnik", endName: "Spalato" },
            7: { start: [43.5081, 16.4403], end: [43.5167, 13.5167], startName: "Spalato", endName: "Ancona" }
        };

        const tappa = coordinateTappe[numeroTappa];
        if (tappa) {
            // Bandierina partenza
            L.marker(tappa.start, { icon: startIconMini })
                .addTo(miniMap)
                .bindPopup(`<strong>Partenza Tappa ${numeroTappa}</strong><br>${tappa.startName}`);
            
            // Bandierina arrivo
            L.marker(tappa.end, { icon: endIconMini })
                .addTo(miniMap)
                .bindPopup(`<strong>Arrivo Tappa ${numeroTappa}</strong><br>${tappa.endName}`);
            
            console.log(`✅ Bandierine aggiunte a mini-mappa ${numeroTappa}`);
        }
        
    } catch (error) {
        console.warn(`⚠️ Errore bandierine mini-mappa ${numeroTappa}:`, error);
    }
}

// ===== GESTIONE RESIZE =====
window.addEventListener('resize', function() {
    if (mappaCompleta) {
        setTimeout(() => mappaCompleta.invalidateSize(), 250);
    }
});
