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
    console.log('Cliccato! Mostrare sezione:', sectionId);
    
    // Nascondi tutte le sezioni
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostra la sezione cliccata
    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
        console.log('✓ Sezione mostrata:', sectionId);
        
        // Inizializza le mappe SOLO quando la sezione diventa visibile
        if (!mappeInizializzate[sectionId]) {
            setTimeout(() => initMapsSezione(sectionId), 100);
            mappeInizializzate[sectionId] = true;
        } else {
            // Se le mappe sono già inizializzate, aggiorna le dimensioni
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

// Inizializza mappe SOLO per la sezione specifica
function initMapsSezione(sectionId) {
    console.log('Inizializzo mappe per:', sectionId);
    
    switch(sectionId) {
        case 'mappa':
            initMappaCompleta();
            break;
        case 'tappe':
            initMappeTappe();
            break;
        // Aggiungi altri casi se necessario
    }
}

// Aggiorna dimensioni mappe per la sezione
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

// MAPPA COMPLETA - Solo quando serve
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

        // Dati semplificati per le tappe
        const tappe = [
            {
                partenza: [45.0703, 7.6869],
                arrivo: [45.7750, 12.8383],
                nome: 'Torino → Portogruaro',
                tipo: 'andata'
            },
            {
                partenza: [45.7750, 12.8383],
                arrivo: [44.6333, 14.8833],
                nome: 'Portogruaro → Prizna', 
                tipo: 'andata'
            },
            {
                partenza: [44.6333, 14.8833],
                arrivo: [44.2311, 15.5614],
                nome: 'Prizna → Marulovo',
                tipo: 'andata'
            },
            {
                partenza: [44.2311, 15.5614],
                arrivo: [43.3436, 17.8081],
                nome: 'Marulovo → Mostar',
                tipo: 'andata'
            },
            {
                partenza: [43.3436, 17.8081],
                arrivo: [42.6403, 18.1083],
                nome: 'Mostar → Dubrovnik',
                tipo: 'andata'
            },
            {
                partenza: [42.6403, 18.1083],
                arrivo: [43.5089, 16.4392],
                nome: 'Dubrovnik → Spalato',
                tipo: 'ritorno'
            },
            {
                partenza: [43.5089, 16.4392],
                arrivo: [45.0703, 7.6869],
                nome: 'Spalato → Torino',
                tipo: 'ritorno'
            }
        ];

        // Aggiungi percorsi semplificati
        tappe.forEach((tappa, index) => {
            const colore = tappa.tipo === 'andata' ? '#667eea' : '#fc4a1a';
            
            L.polyline([tappa.partenza, tappa.arrivo], {
                color: colore,
                weight: 4,
                opacity: 0.8
            }).addTo(mappaCompleta).bindPopup(`
                <div style="text-align: center;">
                    <b>Tappa ${index + 1}</b><br>
                    <small>${tappa.nome}</small>
                </div>
            `);
        });

        // Fit bounds
        const tuttiPunti = tappe.flatMap(tappa => [tappa.partenza, tappa.arrivo]);
        const bounds = L.latLngBounds(tuttiPunti);
        mappaCompleta.fitBounds(bounds, { padding: [20, 20] });
        
        console.log('✓ Mappa completa inizializzata');
        
    } catch (error) {
        console.error('Errore mappa completa:', error);
    }
}

// MAPPE TAPPE - Solo quando serve
function initMappeTappe() {
    if (typeof L === 'undefined') return;
    
    // Inizializza solo le mini-mappe visibili
    for (let i = 1; i <= 7; i++) {
        const mappaDiv = document.getElementById(`mappa-tappa-${i}`);
        if (mappaDiv && mappaDiv.offsetParent !== null) { // Controlla se è visibile
            initMiniMappa(i);
        }
    }
}

// Mini mappa singola
function initMiniMappa(numeroTappa) {
    const mappaDiv = document.getElementById(`mappa-tappa-${numeroTappa}`);
    if (!mappaDiv || mappaDiv._leaflet_map) return; // Evita doppia inizializzazione
    
    try {
        // Coordinate semplificate per ogni tappa
        const coordinateTappe = {
            1: { centro: [45.4, 10.3], partenza: [45.07, 7.68], arrivo: [45.77, 12.83] },
            2: { centro: [45.7, 13.8], partenza: [45.77, 12.83], arrivo: [44.63, 14.88] },
            3: { centro: [44.4, 14.7], partenza: [44.63, 14.88], arrivo: [44.23, 15.56] },
            4: { centro: [43.8, 16.7], partenza: [44.23, 15.56], arrivo: [43.34, 17.80] },
            5: { centro: [43.0, 17.9], partenza: [43.34, 17.80], arrivo: [42.64, 18.10] },
            6: { centro: [42.8, 17.2], partenza: [42.64, 18.10], arrivo: [43.50, 16.43] },
            7: { centro: [44.0, 12.5], partenza: [43.50, 16.43], arrivo: [45.07, 7.68] }
        };
        
        const tappa = coordinateTappe[numeroTappa];
        if (!tappa) return;
        
        const miniMap = L.map(`mappa-tappa-${numeroTappa}`, {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false
        }).setView(tappa.centro, 7);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 10
        }).addTo(miniMap);
        
        const colore = numeroTappa <= 5 ? '#667eea' : '#fc4a1a';
        
        L.polyline([tappa.partenza, tappa.arrivo], {
            color: colore,
            weight: 3,
            opacity: 0.9
        }).addTo(miniMap);
        
        // Fit bounds
        const bounds = L.latLngBounds([tappa.partenza, tappa.arrivo]);
        miniMap.fitBounds(bounds, { padding: [15, 15] });
        
        console.log(`✓ Mini-mappa ${numeroTappa} inizializzata`);
        
    } catch (error) {
        console.error(`Errore mini-mappa ${numeroTappa}:`, error);
    }
}

// Setup iniziale
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM pronto! Inizializzazione...');
    
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
            console.log('Bottone cliccato:', target);
            showSection(target, this);
        });
    });
    
    console.log('Navigazione inizializzata! Le mappe caricheranno on-demand.');
});

// Gestione resize finestra
window.addEventListener('resize', function() {
    if (mappaCompleta) {
        setTimeout(() => mappaCompleta.invalidateSize(), 250);
    }
});
