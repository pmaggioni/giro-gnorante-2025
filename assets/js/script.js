// Gestione navigazione
function showSection(sectionId, element) {
    console.log('Mostrando sezione:', sectionId);
    
    // Nascondi tutte le sezioni
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostra la sezione selezionata
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        console.log('Sezione trovata e attivata');
    } else {
        console.error('Sezione non trovata:', sectionId);
        return;
    }
    
    // Aggiorna bottoni attivi
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Aggiungi classe active al bottone cliccato
    if (element) {
        element.classList.add('active');
    }
    
    // Aggiorna mappe quando diventano visibili
    setTimeout(() => {
        if (window.mappaCompleta) {
            window.mappaCompleta.invalidateSize();
        }
        if (window.miniMaps) {
            window.miniMaps.forEach(mappa => {
                if (mappa) mappa.invalidateSize();
            });
        }
    }, 100);
    
    // Scroll to top smooth
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Dati delle tappe complete
const tappe = [
    { // Giorno 1
        partenza: [45.0703, 7.6869],
        arrivo: [45.7750, 12.8383],
        waypoints: [
            [45.4642, 9.1900], // Milano
            [45.4386, 10.9927] // Verona
        ],
        colore: '#667eea',
        tipo: 'andata',
        nome: 'Torino → Portogruaro',
        distanza: '~400 km'
    },
    { // Giorno 2
        partenza: [45.7750, 12.8383],
        arrivo: [44.6333, 14.8833],
        waypoints: [
            [45.6480, 13.7790], // Trieste
            [45.3271, 14.4422]  // Fiume/Rijeka
        ],
        colore: '#667eea',
        tipo: 'andata',
        nome: 'Portogruaro → Prizna',
        distanza: '~250 km'
    },
    { // Giorno 3
        partenza: [44.6333, 14.8833],
        arrivo: [44.2311, 15.5614],
        waypoints: [
            [44.5667, 15.0667], // Zara
            [44.1167, 15.2333]  // Biograd na Moru
        ],
        colore: '#667eea',
        tipo: 'andata',
        nome: 'Prizna → Marulovo',
        distanza: '~180 km'
    },
    { // Giorno 4
        partenza: [44.2311, 15.5614],
        arrivo: [43.3436, 17.8081],
        waypoints: [
            [43.5089, 16.4392], // Spalato
            [43.5125, 16.2517]  // Trogir
        ],
        colore: '#667eea',
        tipo: 'andata',
        nome: 'Marulovo → Mostar',
        distanza: '~220 km'
    },
    { // Giorno 5
        partenza: [43.3436, 17.8081],
        arrivo: [42.6403, 18.1083],
        waypoints: [
            [43.0500, 17.6333], // Metković
            [42.6500, 18.0833]  // Cavtat
        ],
        colore: '#667eea',
        tipo: 'andata',
        nome: 'Mostar → Dubrovnik',
        distanza: '~130 km'
    },
    { // Giorno 6
        partenza: [42.6403, 18.1083],
        arrivo: [43.5089, 16.4392],
        waypoints: [
            [42.7750, 17.8119], // Ston
            [43.0417, 17.4667]  // Ploče
        ],
        colore: '#fc4a1a',
        tipo: 'ritorno',
        nome: 'Dubrovnik → Spalato',
        distanza: '~230 km'
    },
    { // Giorno 7-8
        partenza: [43.5089, 16.4392],
        arrivo: [45.0703, 7.6869],
        waypoints: [
            [43.6167, 13.5167], // Ancona (traghetto)
            [44.4949, 11.3426]  // Bologna
        ],
        colore: '#fc4a1a',
        tipo: 'ritorno',
        nome: 'Spalato → Ancona → Torino',
        distanza: '~800 km'
    }
];

let mappaCompleta;
let miniMaps = [];

// Inizializza mappe
function initMaps() {
    // Controlla se Leaflet è caricato
    if (typeof L === 'undefined') {
        console.error('Leaflet non è caricato!');
        setTimeout(initMaps, 500);
        return;
    }

    try {
        // Mappa completa
        const mappaCompletaDiv = document.getElementById('mappa-completa');
        if (mappaCompletaDiv) {
            mappaCompleta = L.map('mappa-completa').setView([44.5, 14.5], 7);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(mappaCompleta);

            // Aggiungi tutte le tappe alla mappa completa
            tappe.forEach((tappa, index) => {
                const percorso = [tappa.partenza];
                if (tappa.waypoints) {
                    percorso.push(...tappa.waypoints);
                }
                percorso.push(tappa.arrivo);
                
                const colore = tappa.tipo === 'andata' ? '#667eea' : '#fc4a1a';

                // Aggiungi linea del percorso
                L.polyline(percorso, {
                    color: colore,
                    weight: 4,
                    opacity: 0.8,
                    lineJoin: 'round'
                }).addTo(mappaCompleta).bindPopup(`
                    <div style="text-align: center;">
                        <b>Tappa ${index + 1}</b><br>
                        <small>${tappa.nome}</small><br>
                        <small>${tappa.distanza}</small>
                    </div>
                `);

                // Aggiungi marker partenza (solo per la prima tappa)
                if (index === 0) {
                    L.marker(tappa.partenza).addTo(mappaCompleta)
                        .bindPopup(`
                            <div style="text-align: center;">
                                <b>🏁 Partenza</b><br>
                                <b>Torino</b><br>
                                <small>Tappa 1</small>
                            </div>
                        `);
                }

                // Aggiungi marker arrivo (solo per l'ultima tappa)
                if (index === tappe.length - 1) {
                    L.marker(tappa.arrivo).addTo(mappaCompleta)
                        .bindPopup(`
                            <div style="text-align: center;">
                                <b>🎯 Arrivo</b><br>
                                <b>Torino</b><br>
                                <small>Tappa ${index + 1}</small>
                            </div>
                        `);
                }
            });

            // Fit bounds per mostrare tutto il percorso
            const tuttiPunti = tappe.flatMap(tappa => 
                [tappa.partenza, ...(tappa.waypoints || []), tappa.arrivo]
            );
            const bounds = L.latLngBounds(tuttiPunti);
            mappaCompleta.fitBounds(bounds, { padding: [20, 20] });
        }

        // Mappe mini per ogni tappa
        tappe.forEach((tappa, index) => {
            const mappaDiv = document.getElementById(`mappa-tappa-${index + 1}`);
            if (mappaDiv) {
                const centro = [
                    (tappa.partenza[0] + tappa.arrivo[0]) / 2,
                    (tappa.partenza[1] + tappa.arrivo[1]) / 2
                ];
                
                const miniMap = L.map(`mappa-tappa-${index + 1}`, {
                    zoomControl: false,
                    attributionControl: false,
                    dragging: false,
                    scrollWheelZoom: false,
                    doubleClickZoom: false,
                    boxZoom: false
                }).setView(centro, 8);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 13
                }).addTo(miniMap);
                
                // Crea percorso con waypoints
                const percorsoMini = [tappa.partenza];
                if (tappa.waypoints) {
                    percorsoMini.push(...tappa.waypoints);
                }
                percorsoMini.push(tappa.arrivo);
                
                const coloreMini = tappa.tipo === 'andata' ? '#667eea' : '#fc4a1a';
                
                L.polyline(percorsoMini, {
                    color: coloreMini,
                    weight: 3,
                    opacity: 0.9
                }).addTo(miniMap);
                
                // Aggiungi marker
                L.marker(tappa.partenza).addTo(miniMap)
                    .bindPopup('<b>Partenza</b>');
                L.marker(tappa.arrivo).addTo(miniMap)
                    .bindPopup('<b>Arrivo</b>');
                
                // Fit bounds per la tappa specifica
                const tappaBounds = L.latLngBounds(percorsoMini);
                miniMap.fitBounds(tappaBounds, { padding: [10, 10] });
                
                miniMaps.push(miniMap);
            }
        });
    } catch (error) {
        console.error('Errore nell\'inizializzazione delle mappe:', error);
    }
}

// Animazioni al scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Inizializza tutto quando il DOM è pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM caricato, inizializzazione in corso...');
    
    // Imposta sezione iniziale
    const primaSezione = document.querySelector('.section');
    if (primaSezione) {
        primaSezione.classList.add('active');
        console.log('Sezione iniziale attivata:', primaSezione.id);
    }
    
    // Inizializza bottoni navigazione - VERSIONE SEMPLIFICATA
    document.querySelectorAll('.nav-btn').forEach((btn) => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-target');
            console.log('Bottone cliccato, target:', targetSection);
            
            if (targetSection) {
                showSection(targetSection, this);
            }
        });
    });
    
    // Imposta primo bottone come attivo
    const primoBottone = document.querySelector('.nav-btn');
    if (primoBottone) {
        primoBottone.classList.add('active');
    }
    
    // Inizializza mappe
    setTimeout(initMaps, 1000);
    
    // Osserva elementi per animazioni
    document.querySelectorAll('.stat-box, .tappa, .highlight-card, .partecipante-card, .info-card').forEach(el => {
        observer.observe(el);
    });
    
    // Gestione responsive per mappe
    window.addEventListener('resize', function() {
        setTimeout(() => {
            if (mappaCompleta) mappaCompleta.invalidateSize();
            if (miniMaps) {
                miniMaps.forEach(mappa => {
                    if (mappa) mappa.invalidateSize();
                });
            }
        }, 250);
    });
    
    console.log('Inizializzazione completata!');
});
