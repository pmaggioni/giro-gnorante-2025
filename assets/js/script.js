// ===== MAPPA COMPLETA - Con bandierine partenza/arrivo =====
function initMappaCompleta() {
    if (mappaCompleta || typeof L === 'undefined') return;

    try {
        console.log('🗺️ Inizializzazione mappa completa con bandierine...');
        
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
        const tracceTotali = filesGpx.length - 1;

        // Carica tutte le tracce GPX con BANDIERINE
        for (let i = 1; i <= 8; i++) {
            const gpxUrl = "assets/downloads/gpx/" + filesGpx[i];
            
            if (!filesGpx[i]) continue;

            console.log(`📁 Tentativo caricamento traccia ${i}: ${filesGpx[i]}`);

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

                // Gestione evento loaded con BANDIERINE
                gpxLayer.on('loaded', function(e) {
                    tracceCaricate++;
                    
                    // Aggiungi bandierine personalizzate
                    aggiungiBandierineTappa(e.target, i);
                    
                    let messaggio = '';
                    try {
                        if (e.target && e.target.getDistance && typeof e.target.getDistance === 'function') {
                            const distanza = (e.target.getDistance() / 1000).toFixed(1);
                            messaggio = i === 8 ? 
                                `🎯 PERCORSO COMPLETO NERO - ${distanza} km` :
                                `Tappa ${i}: ${distanza} km`;
                        } else {
                            messaggio = i === 8 ? 
                                "🎯 PERCORSO COMPLETO NERO" :
                                `Tappa ${i} caricata`;
                        }
                    } catch (error) {
                        messaggio = i === 8 ? 
                            "🎯 PERCORSO COMPLETO NERO (distanza non disponibile)" :
                            `Tappa ${i} caricata (distanza non disponibile)`;
                    }
                    
                    console.log(`✅ ${messaggio} - ${nomiColori[i-1]}`);
                    
                    // Aggiorna bounds per fit
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

        // Fit bounds dopo caricamento
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

// ===== FUNZIONE PER AGGIUNGERE BANDIERINE =====
function aggiungiBandierineTappa(gpxLayer, numeroTappa) {
    try {
        // Ottieni punti di inizio e fine
        const startPoint = gpxLayer.getStartPoint();
        const endPoint = gpxLayer.getEndPoint();
        
        if (startPoint && startPoint._latlng) {
            // Bandierina di PARTENZA - VERDE
            const startIcon = L.divIcon({
                className: 'bandierina-partenza',
                html: `🏁<div class="bandierina-numero">${numeroTappa}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            });
            
            L.marker(startPoint._latlng, { icon: startIcon })
                .addTo(mappaCompleta)
                .bindPopup(`<strong>Partenza Tappa ${numeroTappa}</strong><br>${getNomePartenzaTappa(numeroTappa)}`);
        }
        
        if (endPoint && endPoint._latlng) {
            // Bandierina di ARRIVO - ROSSA
            const endIcon = L.divIcon({
                className: 'bandierina-arrivo',
                html: `🎯<div class="bandierina-numero">${numeroTappa}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            });
            
            L.marker(endPoint._latlng, { icon: endIcon })
                .addTo(mappaCompleta)
                .bindPopup(`<strong>Arrivo Tappa ${numeroTappa}</strong><br>${getNomeArrivoTappa(numeroTappa)}`);
        }
        
    } catch (error) {
        console.warn(`⚠️ Impossibile aggiungere bandierine per tappa ${numeroTappa}:`, error);
    }
}

// ===== NOMI TAPPE PER I POPUP =====
function getNomePartenzaTappa(numeroTappa) {
    const nomi = {
        1: "Torino",
        2: "Portogruaro", 
        3: "Prizna",
        4: "Marulovo",
        5: "Mostar",
        6: "Dubrovnik",
        7: "Spalato",
        8: "Torino (Partenza)"
    };
    return nomi[numeroTappa] || `Tappa ${numeroTappa}`;
}

function getNomeArrivoTappa(numeroTappa) {
    const nomi = {
        1: "Portogruaro",
        2: "Prizna",
        3: "Marulovo", 
        4: "Mostar",
        5: "Dubrovnik",
        6: "Spalato",
        7: "Ancona (Traghetto)",
        8: "Torino (Arrivo)"
    };
    return nomi[numeroTappa] || `Tappa ${numeroTappa}`;
}

// ===== MINI-MAPPE TAPPE - Con bandierine =====
function initMiniMappa(numeroTappa) {
    const mappaDiv = document.getElementById(`mappa-tappa-${numeroTappa}`);
    if (!mappaDiv || mappaDiv._leaflet_map) return;

    try {
        console.log(`🔄 Inizializzazione mini-mappa ${numeroTappa} con bandierine...`);
        
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
                    // Aggiungi bandierine alle mini-mappe
                    aggiungiBandierineMiniMappa(e.target, numeroTappa, miniMap);
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

// ===== BANDIERINE PER MINI-MAPPE =====
function aggiungiBandierineMiniMappa(gpxLayer, numeroTappa, miniMap) {
    try {
        const startPoint = gpxLayer.getStartPoint();
        const endPoint = gpxLayer.getEndPoint();
        
        if (startPoint && startPoint._latlng) {
            const startIcon = L.divIcon({
                className: 'bandierina-partenza-mini',
                html: '🏁',
                iconSize: [20, 20],
                iconAnchor: [10, 20]
            });
            
            L.marker(startPoint._latlng, { icon: startIcon }).addTo(miniMap);
        }
        
        if (endPoint && endPoint._latlng) {
            const endIcon = L.divIcon({
                className: 'bandierina-arrivo-mini', 
                html: '🎯',
                iconSize: [20, 20],
                iconAnchor: [10, 20]
            });
            
            L.marker(endPoint._latlng, { icon: endIcon }).addTo(miniMap);
        }
        
    } catch (error) {
        console.warn(`⚠️ Impossibile aggiungere bandierine mini-mappa ${numeroTappa}`);
    }
}
