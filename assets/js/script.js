// VERSIONE SEMPLIFICATA - Navigazione funzionante
console.log('Script JavaScript caricato!');

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
    } else {
        console.log('✗ Sezione NON trovata:', sectionId);
    }
    
    // Aggiorna bottoni attivi
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (element) {
        element.classList.add('active');
    }
}

// Setup iniziale quando la pagina carica
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM pronto! Inizializzazione...');
    
    // Nascondi tutte le sezioni tranne la prima (Overview)
    document.querySelectorAll('.section').forEach((section, index) => {
        if (index === 0) {
            // La prima sezione (Overview) è visibile
            section.style.display = 'block';
        } else {
            // Tutte le altre sono nascoste
            section.style.display = 'none';
        }
    });
    
    // Collegamento bottoni di navigazione
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            console.log('Bottone cliccato, target:', target);
            showSection(target, this);
        });
    });
    
    console.log('Navigazione inizializzata!');
});
