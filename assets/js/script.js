// Gestione navigazione
function showSection(sectionId) {
    // Nascondi tutte le sezioni
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostra la sezione selezionata
    document.getElementById(sectionId).style.display = 'block';
    
    // Aggiorna bottoni attivi
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Aggiorna mappe quando diventano visibili
    setTimeout(() => {
        if (window.mappaCompleta) window.mappaCompleta.invalidateSize();
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
        colore: '#ff6b6b',
        tipo: 'andata'
    },
    { // Giorno 2
        partenza: [45.7750, 12.8383],
        arrivo: [44.6333, 14.8833],
        waypoints: [
            [45.6480, 13.7790], // Trieste
            [45.3271, 14.4422]  // Fiume/Rijeka
        ],
        colore: '#4ecdc4',
        tipo: 'andata'
    },
    { // Giorno 3
        partenza: [44.6333, 14.8833],
        arrivo: [44.2311, 15.5614],
        waypoints: [
            [44.5667, 15.0667], // Zara
            [44.1167, 15.2333]  // Biograd na Moru
        ],
        colore: '#45b7d1',
        tipo: 'andata'
    },
    { // Giorno 4
        partenza: [44.2311, 15.5614],
        arrivo: [43.3436, 17.8081],
        waypoints: [
            [43.5089, 16.4392], // Spalato
            [43.5125, 16.2517]  // Trogir
        ],
        colore: '#96ceb4',
        tipo: 'andata'
    },
    { // Giorno 5
        partenza: [43.3436, 17.8081],
        arrivo: [42.6403, 18.1083],
        waypoints: [
            [43.0500, 17.6333], // Metković
            [42.6500, 18.0833]  // Cavtat
        ],
        colore: '#feca57',
        tipo: 'andata'
    },
    { // Giorno 6
        partenza: [42.6403, 18.1083],
        arrivo: [43.5089, 16.4392],
        waypoints: [
            [42.7750, 17.8119], // Ston
            [43.0417, 17.4667]  // Ploče
        ],
        colore: '#ff9ff3',
        tipo: 'ritorno'
    },
    { // Giorno 7-8
        partenza: [43.5089, 16.4392],
        arrivo: [45.0703, 7.6869],
        waypoints: [
            [43.6167, 13.5167], // Ancona (traghetto)
            [44.4949, 11.3426]  // Bologna
        ],
        colore: '#54a0ff',
        tipo: 'ritorno'
    }
];

let mappaCompleta;
let miniMaps = [];

// Inizializza mappe
function initMaps() {
    // Mappa completa
    mappaCompleta = L.map('mappa-completa').setView([44.5, 14.5], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
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
            opacity: 0.7,
            lineJoin: 'round'
        }).addTo(mappaCompleta).bindPopup(`<b>Tappa ${index + 1}</b><br>${getTappaNome(index)}`);

        // Aggiungi marker partenza (solo per la prima tappa)
        if (index === 0) {
            L.marker(tappa.partenza).addTo(mappaCompleta)
                .bindPopup(`<b>Partenza</b><br>Torino`);
        }

        // Aggiungi marker arrivo (solo per l'ultima tappa)
        if (index === tappe.length - 1) {
            L.marker(tappa.arrivo).addTo(mappaCompleta)
                .bindPopup(`<b>Arrivo</b><br>Torino`);
        }
    });

    // Aggiungi layer per i paesi
    const confini = L.geoJSON().addTo(mappaCompleta);
    
    // Mappe mini per ogni tappa
    tappe.forEach((tappa, index) => {
        const mappaDiv = document.getElementById(`mappa-tappa-${index + 1}`);
        if (mappaDiv && mappaDiv.offsetWidth > 0) {
            const centro = [
                (tappa.partenza[0] + tappa.arrivo[0]) / 2,
                (tappa.partenza[1] + tappa.arrivo[1]) / 2
            ];
            
            const miniMap = L.map(`mappa-tappa-${index + 1}`, {
                zoomControl: false,
                attributionControl: false
            }).setView(centro, 8);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(miniMap);
            
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
                opacity: 0.8
            }).addTo(miniMap);
            
            // Aggiungi marker
            L.marker(tappa.partenza).addTo(miniMap)
                .bindPopup('Partenza');
            L.marker(tappa.arrivo).addTo(miniMap)
                .bindPopup('Arrivo');
            
            miniMaps.push(miniMap);
        }
    });
}

function getTappaNome(index) {
    const nomi = [
        'Torino → Portogruaro',
        'Portogruaro → Prizna',
        'Prizna → Marulovo',
        'Marulovo → Mostar',
        'Mostar → Dubrovnik',
        'Dubrovnik → Spalato',
        'Spalato → Ancona → Torino'
    ];
    return nomi[index] || `Tappa ${index + 1}`;
}

// Animazioni al scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Inizializza tutto quando il DOM è pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inizializza mappe
    setTimeout(initMaps, 1000);
    
    // Osserva elementi per animazioni
    document.querySelectorAll('.stat-box, .tappa, .highlight-card, .partecipante-card, .info-card').forEach(el => {
        observer.observe(el);
    });
    
    // Gestione checklist interattiva
    document.querySelectorAll('.checklist-category input').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const category = this.closest('.checklist-category');
            const checkedCount = category.querySelectorAll('input:checked').length;
            const totalCount = category.querySelectorAll('input').length;
            
            if (checkedCount === totalCount) {
                category.style.borderLeft = '4px solid #4ecdc4';
            } else {
                category.style.borderLeft = '4px solid #ff6b6b';
            }
        });
    });
});

// Ridimensiona mappe al resize
window.addEventListener('resize', function() {
    if (mappaCompleta) {
        setTimeout(() => {
            mappaCompleta.invalidateSize();
        }, 300);
    }
    if (miniMaps) {
        miniMaps.forEach(mappa => {
            if (mappa) {
                setTimeout(() => {
                    mappa.invalidateSize();
                }, 300);
            }
        });
    }
});

// Smooth scroll per anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
