<meta name='viewport' content='width=device-width, initial-scale=1'/><script>// Datos de ejemplo para la demostración
let farmData = {
    containers: [
        {
            id: 1,
            shelves: Array(8).fill().map((_, shelfIndex) => ({
                id: shelfIndex + 1,
                tramos: Array(7).fill().map((_, tramoIndex) => ({
                    id: tramoIndex + 1,
                    machines: Array(5).fill().map((_, machineIndex) => ({
                        id: null,
                        model: '',
                        status: 'empty',
                        hashrate: 0,
                        power: 0,
                        temperature: 0
                    }))
                }))
            }))
        },
        // ... (todo el JavaScript que tenías en el script tag)
    ]
};

// Variables globales
let currentContainer = 1;
let currentShelf = null;
let currentTramo = null;
let currentMachineIndex = null;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos desde localStorage si existen
    const savedData = localStorage.getItem('bitcoinFarmData');
    if (savedData) {
        farmData = JSON.parse(savedData);
    }
    
    // Configurar eventos
    setupEventListeners();
    
    // Renderizar la vista inicial
    renderContainerSelector();
    renderShelves(currentContainer);
    updateStats();
});

// ... (todas las funciones restantes de tu JavaScript)</script>
