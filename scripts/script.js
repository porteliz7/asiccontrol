// Datos de ejemplo para la demostración
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
        {
            id: 2,
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
        {
            id: 3,
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
        }
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

// Configurar eventos
function setupEventListeners() {
    // Botón para agregar máquina
    document.getElementById('add-machine-btn').addEventListener('click', function() {
        showAddMachineForm();
    });
    
    // Botón para exportar datos
    document.getElementById('export-data-btn').addEventListener('click', function() {
        exportData();
    });
}

// Renderizar selector de containers
function renderContainerSelector() {
    const containerSelector = document.getElementById('container-selector');
    containerSelector.innerHTML = '';
    
    farmData.containers.forEach(container => {
        const btn = document.createElement('button');
        btn.className = `container-btn ${container.id === currentContainer ? 'active' : ''}`;
        btn.setAttribute('data-container', container.id);
        btn.textContent = `Container ${container.id}`;
        btn.addEventListener('click', function() {
            document.querySelectorAll('.container-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentContainer = parseInt(this.getAttribute('data-container'));
            document.getElementById('current-container').textContent = currentContainer;
            renderShelves(currentContainer);
        });
        containerSelector.appendChild(btn);
    });
}

// Renderizar estantes
function renderShelves(containerId) {
    const shelvesContainer = document.getElementById('shelves-container');
    shelvesContainer.innerHTML = '';
    
    const container = farmData.containers.find(c => c.id === containerId);
    
    container.shelves.forEach(shelf => {
        const shelfElement = document.createElement('div');
        shelfElement.className = 'shelf';
        shelfElement.setAttribute('data-shelf', shelf.id);
        
        // Calcular estadísticas del estante
        let totalMachines = 0;
        let activeMachines = 0;
        let problemMachines = 0;
        
        shelf.tramos.forEach(tramo => {
            tramo.machines.forEach(machine => {
                if (machine.status !== 'empty') {
                    totalMachines++;
                    if (machine.status === 'active') activeMachines++;
                    if (machine.status === 'problem') problemMachines++;
                }
            });
        });
        
        shelfElement.innerHTML = `
            <h3>Estante ${shelf.id}</h3>
            <div class="shelf-info">
                <span>Máquinas: ${totalMachines}/35</span>
                <span>Activas: ${activeMachines}</span>
            </div>
            <div class="tramos-grid">
                ${shelf.tramos.map(tramo => {
                    const occupied = tramo.machines.filter(m => m.status !== 'empty').length;
                    return `
                        <div class="tramo" data-tramo="${tramo.id}">
                            <h4>Tramo ${tramo.id}</h4>
                            <div>${occupied}/5 ocupados</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        // Agregar evento para mostrar detalles del estante
        shelfElement.addEventListener('click', function() {
            showShelfDetails(containerId, shelf.id);
        });
        
        shelvesContainer.appendChild(shelfElement);
    });
}

// Mostrar detalles de un estante específico
function showShelfDetails(containerId, shelfId) {
    const container = farmData.containers.find(c => c.id === containerId);
    const shelf = container.shelves.find(s => s.id === shelfId);
    
    // Crear modal para mostrar detalles del estante
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    modal.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 8px; max-width: 90%; max-height: 90%; overflow: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>Container ${containerId} - Estante ${shelfId}</h2>
                <button id="close-modal" style="background: #e74c3c;">Cerrar</button>
            </div>
            <div class="tramos-detailed">
                ${shelf.tramos.map(tramo => `
                    <div style="margin-bottom: 20px;">
                        <h3>Tramo ${tramo.id}</h3>
                        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;">
                            ${tramo.machines.map((machine, index) => {
                                let slotClass = 'slot-empty';
                                let slotText = 'Vacío';
                                
                                if (machine.status === 'active') {
                                    slotClass = 'slot-occupied';
                                    slotText = machine.model || 'Máquina';
                                } else if (machine.status === 'problem') {
                                    slotClass = 'slot-problem';
                                    slotText = machine.model || 'Problema';
                                }
                                
                                return `
                                    <div class="machine-slot ${slotClass}" 
                                         data-container="${containerId}"
                                         data-shelf="${shelfId}"
                                         data-tramo="${tramo.id}"
                                         data-index="${index}">
                                        ${slotText}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Configurar evento para cerrar modal
    document.getElementById('close-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Configurar eventos para los slots de máquinas
    modal.querySelectorAll('.machine-slot').forEach(slot => {
        slot.addEventListener('click', function() {
            const containerId = parseInt(this.getAttribute('data-container'));
            const shelfId = parseInt(this.getAttribute('data-shelf'));
            const tramoId = parseInt(this.getAttribute('data-tramo'));
            const index = parseInt(this.getAttribute('data-index'));
            
            showMachineForm(containerId, shelfId, tramoId, index);
            document.body.removeChild(modal);
        });
    });
}

// Mostrar formulario para agregar/editar máquina
function showMachineForm(containerId, shelfId, tramoId, machineIndex) {
    const container = farmData.containers.find(c => c.id === containerId);
    const shelf = container.shelves.find(s => s.id === shelfId);
    const tramo = shelf.tramos.find(t => t.id === tramoId);
    const machine = tramo.machines[machineIndex];
    
    currentContainer = containerId;
    currentShelf = shelfId;
    currentTramo = tramoId;
    currentMachineIndex = machineIndex;
    
    const machineDetails = document.getElementById('machine-details');
    const machineForm = document.getElementById('machine-form');
    
    machineForm.innerHTML = `
        <div class="form-group">
            <label for="machine-id">ID de Máquina:</label>
            <input type="text" id="machine-id" value="${machine.id || ''}" ${machine.status !== 'empty' ? 'readonly' : ''}>
        </div>
        <div class="form-group">
            <label for="machine-model">Modelo:</label>
            <input type="text" id="machine-model" value="${machine.model || ''}">
        </div>
        <div class="form-group">
            <label for="machine-status">Estado:</label>
            <select id="machine-status">
                <option value="empty" ${machine.status === 'empty' ? 'selected' : ''}>Vacío</option>
                <option value="active" ${machine.status === 'active' ? 'selected' : ''}>Activa</option>
                <option value="problem" ${machine.status === 'problem' ? 'selected' : ''}>Con Problemas</option>
            </select>
        </div>
        <div class="form-group">
            <label for="machine-hashrate">Hashrate (TH/s):</label>
            <input type="number" id="machine-hashrate" value="${machine.hashrate || 0}">
        </div>
        <div class="form-group">
            <label for="machine-power">Consumo (W):</label>
            <input type="number" id="machine-power" value="${machine.power || 0}">
        </div>
        <div class="form-group">
            <label for="machine-temperature">Temperatura (°C):</label>
            <input type="number" id="machine-temperature" value="${machine.temperature || 0}">
        </div>
        <div class="form-group" style="grid-column: 1 / -1; display: flex; gap: 10px;">
            <button id="save-machine">Guardar</button>
            <button id="delete-machine" style="background: #e74c3c;">Eliminar</button>
            <button id="cancel-edit">Cancelar</button>
        </div>
    `;
    
    machineDetails.style.display = 'block';
    
    // Configurar eventos del formulario
    document.getElementById('save-machine').addEventListener('click', saveMachine);
    document.getElementById('delete-machine').addEventListener('click', deleteMachine);
    document.getElementById('cancel-edit').addEventListener('click', cancelEdit);
}

// Mostrar formulario para agregar nueva máquina
function showAddMachineForm() {
    // Buscar el primer slot vacío
    let found = false;
    
    for (let container of farmData.containers) {
        for (let shelf of container.shelves) {
            for (let tramo of shelf.tramos) {
                for (let i = 0; i < tramo.machines.length; i++) {
                    if (tramo.machines[i].status === 'empty') {
                        showMachineForm(container.id, shelf.id, tramo.id, i);
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
            if (found) break;
        }
        if (found) break;
    }
    
    if (!found) {
        alert('No hay espacios disponibles para agregar más máquinas.');
    }
}

// Guardar datos de la máquina
function saveMachine() {
    const container = farmData.containers.find(c => c.id === currentContainer);
    const shelf = container.shelves.find(s => s.id === currentShelf);
    const tramo = shelf.tramos.find(t => t.id === currentTramo);
    const machine = tramo.machines[currentMachineIndex];
    
    const id = document.getElementById('machine-id').value;
    const model = document.getElementById('machine-model').value;
    const status = document.getElementById('machine-status').value;
    const hashrate = parseFloat(document.getElementById('machine-hashrate').value) || 0;
    const power = parseFloat(document.getElementById('machine-power').value) || 0;
    const temperature = parseFloat(document.getElementById('machine-temperature').value) || 0;
    
    // Validaciones
    if (status !== 'empty' && (!id || !model)) {
        alert('Para máquinas activas o con problemas, debe proporcionar ID y modelo.');
        return;
    }
    
    // Actualizar datos de la máquina
    machine.id = status !== 'empty' ? id : null;
    machine.model = status !== 'empty' ? model : '';
    machine.status = status;
    machine.hashrate = status !== 'empty' ? hashrate : 0;
    machine.power = status !== 'empty' ? power : 0;
    machine.temperature = status !== 'empty' ? temperature : 0;
    
    // Guardar en localStorage
    localStorage.setItem('bitcoinFarmData', JSON.stringify(farmData));
    
    // Actualizar la vista
    renderShelves(currentContainer);
    updateStats();
    
    // Ocultar formulario
    document.getElementById('machine-details').style.display = 'none';
    
    alert('Máquina guardada correctamente.');
}

// Eliminar máquina
function deleteMachine() {
    if (confirm('¿Está seguro de que desea eliminar esta máquina?')) {
        const container = farmData.containers.find(c => c.id === currentContainer);
        const shelf = container.shelves.find(s => s.id === currentShelf);
        const tramo = shelf.tramos.find(t => t.id === currentTramo);
        
        // Restablecer máquina a estado vacío
        tramo.machines[currentMachineIndex] = {
            id: null,
            model: '',
            status: 'empty',
            hashrate: 0,
            power: 0,
            temperature: 0
        };
        
        // Guardar en localStorage
        localStorage.setItem('bitcoinFarmData', JSON.stringify(farmData));
        
        // Actualizar la vista
        renderShelves(currentContainer);
        updateStats();
        
        // Ocultar formulario
        document.getElementById('machine-details').style.display = 'none';
        
        alert('Máquina eliminada correctamente.');
    }
}

// Cancelar edición
function cancelEdit() {
    document.getElementById('machine-details').style.display = 'none';
}

// Actualizar estadísticas
function updateStats() {
    let totalMachines = 0;
    let activeMachines = 0;
    let problemMachines = 0;
    
    farmData.containers.forEach(container => {
        container.shelves.forEach(shelf => {
            shelf.tramos.forEach(tramo => {
                tramo.machines.forEach(machine => {
                    if (machine.status !== 'empty') {
                        totalMachines++;
                        if (machine.status === 'active') activeMachines++;
                        if (machine.status === 'problem') problemMachines++;
                    }
                });
            });
        });
    });
    
    document.getElementById('total-machines').textContent = `${totalMachines}/840`;
    document.getElementById('active-machines').textContent = activeMachines;
    document.getElementById('problem-machines').textContent = problemMachines;
}

// Exportar datos
function exportData() {
    const dataStr = JSON.stringify(farmData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bitcoin-farm-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // === AGREGA ESTAS FUNCIONES NUEVAS AL FINAL DE TU script.js ===

// Función para actualizar barras de progreso (NUEVA)
function updateProgressBars() {
    const totalMachines = parseInt(document.getElementById('total-machines').textContent.split('/')[0]);
    const progressFill = document.querySelector('.progress-fill');
    const capacityPercent = document.getElementById('capacity-percent');
    
    const percent = (totalMachines / 840) * 100;
    if (progressFill) {
        progressFill.style.width = `${percent}%`;
    }
    if (capacityPercent) {
        capacityPercent.textContent = `${Math.round(percent)}%`;
    }
}

// Botón de actualizar (NUEVO)
function setupRefreshButton() {
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            renderShelves(currentContainer);
            updateStats();
            alert('Datos actualizados correctamente');
        });
    }
}

// === ACTUALIZA la función updateStats() existente ===
// BUSCA esta función en tu script.js y MODIFÍCALA:

function updateStats() {
    let totalMachines = 0;
    let activeMachines = 0;
    let problemMachines = 0;
    
    farmData.containers.forEach(container => {
        container.shelves.forEach(shelf => {
            shelf.tramos.forEach(tramo => {
                tramo.machines.forEach(machine => {
                    if (machine.status !== 'empty') {
                        totalMachines++;
                        if (machine.status === 'active') activeMachines++;
                        if (machine.status === 'problem') problemMachines++;
                    }
                });
            });
        });
    });
    
    document.getElementById('total-machines').textContent = `${totalMachines}/840`;
    document.getElementById('active-machines').textContent = activeMachines;
    document.getElementById('problem-machines').textContent = problemMachines;
    
    // === AGREGA ESTA LÍNEA NUEVA ===
    updateProgressBars();
}

// === ACTUALIZA la función setupEventListeners() existente ===
// BUSCA esta función y MODIFÍCALA:

function setupEventListeners() {
    // Botón para agregar máquina
    document.getElementById('add-machine-btn').addEventListener('click', function() {
        showAddMachineForm();
    });
    
    // Botón para exportar datos
    document.getElementById('export-data-btn').addEventListener('click', function() {
        exportData();
    });
    
    // === AGREGA ESTA LÍNEA NUEVA ===
    setupRefreshButton();
}

// === AGREGA esta función para mejorar los estantes ===
function renderShelves(containerId) {
    const shelvesContainer = document.getElementById('shelves-container');
    shelvesContainer.innerHTML = '';
    
    const container = farmData.containers.find(c => c.id === containerId);
    
    container.shelves.forEach(shelf => {
        const shelfElement = document.createElement('div');
        shelfElement.className = 'shelf-card';
        shelfElement.setAttribute('data-shelf', shelf.id);
        
        // Calcular estadísticas del estante
        let totalMachines = 0;
        let activeMachines = 0;
        let problemMachines = 0;
        
        shelf.tramos.forEach(tramo => {
            tramo.machines.forEach(machine => {
                if (machine.status !== 'empty') {
                    totalMachines++;
                    if (machine.status === 'active') activeMachines++;
                    if (machine.status === 'problem') problemMachines++;
                }
            });
        });
        
        // Generar mini visualización de tramos
        const tramosMini = shelf.tramos.map(tramo => {
            const occupied = tramo.machines.filter(m => m.status !== 'empty').length;
            let tramoClass = 'tramo-mini';
            if (occupied > 0) {
                tramoClass += ' tramo-occupied';
            }
            return `<div class="${tramoClass}" title="Tramo ${tramo.id}: ${occupied}/5">${occupied}</div>`;
        }).join('');
        
        shelfElement.innerHTML = `
            <div class="shelf-header">
                <div class="shelf-title">🏗️ Estante ${shelf.id}</div>
                <div class="shelf-stats">
                    <span>${totalMachines}/35</span>
                    <span>✅ ${activeMachines}</span>
                    <span>⚠️ ${problemMachines}</span>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(totalMachines/35)*100}%"></div>
            </div>
            <div class="tramos-mini">
                ${tramosMini}
            </div>
            <div style="margin-top: 10px; font-size: 0.8rem; text-align: center;">
                👆 Haz clic para ver detalles
            </div>
        `;
        
        // Agregar evento para mostrar detalles del estante
        shelfElement.addEventListener('click', function() {
            showShelfDetails(containerId, shelf.id);
        });
        
        shelvesContainer.appendChild(shelfElement);
    });
}


}
