
// Dados da agenda para Larissa
let agendaData = {
    manha: [],
    tarde: [],
    noite: []
};

// Dados da agenda para João Victor
let agendaDataJV = {
    manha: [],
    tarde: [],
    noite: []
};

// Dias da semana em português
const diasSemana = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
    'Quinta-feira', 'Sexta-feira', 'Sábado'
];

const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDate();
    renderAllTasks();
    renderAllTasksJV();
    updateTaskCounts();
    
    // Event listeners para Larissa
    ['manha', 'tarde', 'noite'].forEach(periodo => {
        const input = document.getElementById(`input-${periodo}`);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTask(periodo);
            }
        });
    });

    // Event listeners para João Victor
    ['manha', 'tarde', 'noite'].forEach(periodo => {
        const inputJV = document.getElementById(`input-jv-${periodo}`);
        inputJV.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTaskJV(periodo);
            }
        });
    });
});

// Atualizar data atual
function updateCurrentDate() {
    const now = new Date();
    const dayName = diasSemana[now.getDay()];
    const day = now.getDate();
    const month = meses[now.getMonth()];
    const year = now.getFullYear();
    
    document.getElementById('current-day').textContent = dayName;
    document.getElementById('current-date').textContent = `${day} de ${month} de ${year}`;
}

// Gerar ID único para tarefas
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Adicionar nova tarefa para Larissa
function addTask(periodo) {
    const input = document.getElementById(`input-${periodo}`);
    const taskText = input.value.trim();
    
    if (taskText === '') {
        input.focus();
        return;
    }
    
    const newTask = {
        id: generateId(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    agendaData[periodo].push(newTask);
    input.value = '';
    
    renderTasks(periodo);
    saveTasksToFirebase();
    updateTaskCounts();
    
    // Animar a adição da nova tarefa
    setTimeout(() => {
        const taskElement = document.querySelector(`[data-task-id="${newTask.id}"]`);
        if (taskElement) {
            taskElement.classList.add('fade-in');
        }
    }, 10);
}

// Adicionar nova tarefa para João Victor
function addTaskJV(periodo) {
    const input = document.getElementById(`input-jv-${periodo}`);
    const taskText = input.value.trim();
    if (taskText === '') {
        input.focus();
        return;
    }
    const newTask = {
        id: generateId(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };
    agendaDataJV[periodo].push(newTask);
    input.value = '';
    renderTasksJV(periodo);
    saveTasksToFirebase();
    updateTaskCounts();

    setTimeout(() => {
        const taskElement = document.querySelector(`[data-task-jv-id="${newTask.id}"]`);
        if (taskElement) {
            taskElement.classList.add('fade-in');
        }
    }, 10);
}

// Remover tarefa para Larissa
function removeTask(periodo, taskId) {
    agendaData[periodo] = agendaData[periodo].filter(task => task.id !== taskId);
    renderTasks(periodo);
    updateTaskCounts();
    saveTasksToFirebase();
}

// Remover tarefa para João Victor
function removeTaskJV(periodo, taskId) {
    agendaDataJV[periodo] = agendaDataJV[periodo].filter(task => task.id !== taskId);
    renderTasksJV(periodo);
    updateTaskCounts();
    saveTasksToFirebase();
}

// Alternar status da tarefa para Larissa
function toggleTask(periodo, taskId) {
    const task = agendaData[periodo].find(task => task.id === taskId);
    if (task) {
        task.completed = !task.completed;
        renderTasks(periodo);
        updateTaskCounts();
    }
}

// Alternar status da tarefa para João Victor
function toggleTaskJV(periodo, taskId) {
    const task = agendaDataJV[periodo].find(task => task.id === taskId);
    if (task) {
        task.completed = !task.completed;
        renderTasksJV(periodo);
    }
}

// Renderizar tarefas de um período para Larissa
function renderTasks(periodo) {
    const container = document.getElementById(`tasks-${periodo}`);
    const tasks = agendaData[periodo];
    
    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-400 py-8">
                <div class="text-4xl mb-2">✨</div>
                <div>Nenhuma tarefa para este período</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tasks.map(task => `
        <div class="flex items-center gap-3 p-3 bg-rosa-claro rounded-lg border border-lavanda transition-all duration-300 hover:shadow-md" data-task-id="${task.id}">
            <input 
                type="checkbox" 
                ${task.completed ? 'checked' : ''} 
                onchange="toggleTask('${periodo}', '${task.id}')"
                class="w-4 h-4 text-rosa-vibrante bg-white border-2 border-lavanda rounded focus:ring-rosa-medio focus:ring-2 transition-all duration-300"
            >
            <span class="flex-1 ${task.completed ? 'task-completed' : ''} text-gray-700 transition-all duration-300">
                ${task.text}
            </span>
            <button 
                onclick="removeTask('${periodo}', '${task.id}')" 
                class="text-gray-400 hover:text-red-400 transition-colors duration-300 p-1 rounded hover:bg-white"
                title="Remover tarefa"
            >
                ✕
            </button>
        </div>
    `).join('');
}

// Renderizar tarefas de um período para João Victor
function renderTasksJV(periodo) {
    const container = document.getElementById(`tasks-jv-${periodo}`);
    const tasks = agendaDataJV[periodo];
    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-400 py-8">
                <div class="text-4xl mb-2">✨</div>
                <div>Nenhuma tarefa para este período</div>
            </div>
        `;
        return;
    }
    container.innerHTML = tasks.map(task => `
        <div class="flex items-center gap-3 p-3 bg-rosa-claro rounded-lg border border-lavanda transition-all duration-300 hover:shadow-md" data-task-jv-id="${task.id}">
            <input 
                type="checkbox" 
                ${task.completed ? 'checked' : ''} 
                onchange="toggleTaskJV('${periodo}', '${task.id}')"
                class="w-4 h-4 text-rosa-vibrante bg-white border-2 border-lavanda rounded focus:ring-rosa-medio focus:ring-2 transition-all duration-300"
            >
            <span class="flex-1 ${task.completed ? 'task-completed' : ''} text-gray-700 transition-all duration-300">
                ${task.text}
            </span>
            <button 
                onclick="removeTaskJV('${periodo}', '${task.id}')" 
                class="text-gray-400 hover:text-red-400 transition-colors duration-300 p-1 rounded hover:bg-white"
                title="Remover tarefa"
            >
                ✕
            </button>
        </div>
    `).join('');
}

// Renderizar todas as tarefas para Larissa
function renderAllTasks() {
    ['manha', 'tarde', 'noite'].forEach(periodo => {
        renderTasks(periodo);
    });
}

// Renderizar todas as tarefas para João Victor
function renderAllTasksJV() {
    ['manha', 'tarde', 'noite'].forEach(periodo => {
        renderTasksJV(periodo);
    });
}

// Atualizar contadores de tarefas
function updateTaskCounts() {
    ['manha', 'tarde', 'noite'].forEach(periodo => {
        // Soma tarefas de ambos
        const totalTasks = agendaData[periodo].length + agendaDataJV[periodo].length;
        const completedTasks =
            agendaData[periodo].filter(task => task.completed).length +
            agendaDataJV[periodo].filter(task => task.completed).length;

        const countElement = document.getElementById(`count-${periodo}`);
        if (countElement) {
            countElement.textContent = `${completedTasks}/${totalTasks}`;

            // Mudar cor baseado no progresso
            if (totalTasks === 0) {
                countElement.className = 'text-2xl font-bold text-gray-400';
            } else if (completedTasks === totalTasks) {
                countElement.className = 'text-2xl font-bold text-green-500';
            } else {
                countElement.className = 'text-2xl font-bold text-rosa-vibrante';
            }
        }
    });
}

// Salvar todas as tarefas (Larissa e João Victor) no Firestore
async function saveTasksToFirebase() {
    const today = new Date().toDateString();
    try {
        await window.firestoreSetDoc(
            window.firestoreDoc(window.db, "agendas", today),
            {
                larissa: agendaData,
                joaovictor: agendaDataJV,
                updatedAt: new Date()
            }
        );
        alert('Tarefas salvas na nuvem com sucesso!');
    } catch (error) {
        alert('Erro ao salvar na nuvem: ' + error.message);
    }
}

// Carregar todas as tarefas do Firestore
async function loadTasksFromFirebase() {
    const today = new Date().toDateString();
    try {
        const docSnap = await window.firestoreGetDoc(
            window.firestoreDoc(window.db, "agendas", today)
        );
        if (docSnap.exists()) {
            const data = docSnap.data();
            agendaData = data.larissa || { manha: [], tarde: [], noite: [] };
            agendaDataJV = data.joaovictor || { manha: [], tarde: [], noite: [] };
            renderAllTasks();
            renderAllTasksJV();
            updateTaskCounts();
            alert('Tarefas carregadas da nuvem!');
        } else {
            alert('Nenhuma tarefa encontrada na nuvem para hoje.');
        }
    } catch (error) {
        alert('Erro ao carregar da nuvem: ' + error.message);
    }
}