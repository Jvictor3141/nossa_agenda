
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

//Calendario
let selectedAgendaDate = new Date().toDateString();

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
    loadTasksFromFirebase();
    loadFinancialDataFromFirebase();
    renderAllTasks();
    renderAllTasksJV();
    updateTaskCounts();

    // Listener para atualizações em tempo real das finanças
    if (window.firestoreOnSnapshot) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        window.firestoreOnSnapshot(
            window.firestoreDoc(window.db, "financas", currentMonth),
            (docSnap) => {
                if (docSnap.exists()) {
                    financasData = docSnap.data();
                } else {
                    financasData = { entradas: [], gastos: [] };
                }
                updateFinancialSummary();
                renderTransactions();
            }
        );}

    // Listener para atualizações em tempo real da agenda
    if (window.firestoreOnSnapshot) {
    const today = new Date().toDateString();
    window.firestoreOnSnapshot(
        window.firestoreDoc(window.db, "agendas", today),
        (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                agendaData = data.larissa || { manha: [], tarde: [], noite: [] };
                agendaDataJV = data.joaovictor || { manha: [], tarde: [], noite: [] };
                renderAllTasks();
                renderAllTasksJV();
                updateTaskCounts();
            }
        }
    );}

    // FULLCALENDAR - Inicialização ao clicar no botão
    const toggleCalendarBtn = document.getElementById('toggle-calendar');
    const calendarContainer = document.getElementById('calendar-container');
    let calendarVisible = false;
    let calendarInstance = null;

    if (toggleCalendarBtn && calendarContainer) {
        toggleCalendarBtn.addEventListener('click', function() {
            calendarVisible = !calendarVisible;
            if (calendarVisible) {
                calendarContainer.classList.add('max-h-full', 'opacity-100');
                calendarContainer.classList.remove('max-h-0', 'opacity-0');
                toggleCalendarBtn.querySelector('span:last-child').textContent = 'Ocultar calendário';

                // Só inicializa o calendário na primeira vez
                if (!calendarInstance) {
                    const calendarEl = document.getElementById('fullcalendar');
                    calendarInstance = new FullCalendar.Calendar(calendarEl, {
                        initialView: 'dayGridMonth',
                        locale: 'pt-br',
                        height: 500,
                        headerToolbar: {
                            left: 'prev,next today',
                            center: 'title',
                            right: ''
                        },
                        buttonText: {
                            today: 'Hoje'
                        },
                        events: async function(fetchInfo, successCallback, failureCallback) {
                            try {
                                const agendasRef = window.firestoreCollection(window.db, "agendas");
                                const snapshot = await window.firestoreGetDocs(agendasRef);
                                const events = [];
                                snapshot.forEach(docSnap => {
                                    const data = docSnap.data();
                                    const date = docSnap.id;
                                    let tarefas = [];
                                    ['manha', 'tarde', 'noite'].forEach(periodo => {
                                        (data.larissa?.[periodo] || []).forEach(task => {
                                            tarefas.push({ cor: task.cor, status: task.completed ? 0.4 : 1, usuario: 'L' });
                                        });
                                        (data.joaovictor?.[periodo] || []).forEach(task => {
                                            tarefas.push({ cor: task.cor, status: task.completed ? 0.4 : 1, usuario: 'JV' });
                                        });
                                    });
                                    if (tarefas.length > 0) {
                                        events.push({
                                            title: '',
                                            start: new Date(date),
                                            allDay: true,
                                            extendedProps: { tarefas }
                                        });
                                    }
                                });
                                successCallback(events);
                            } catch (err) {
                                failureCallback(err);
                            }
                        },

                        eventContent: function(arg) {
                            const tarefas = arg.event.extendedProps.tarefas || [];
                            let html = '<div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;max-width:100%;">';
                            tarefas.forEach((tarefa, i) => {
                                if (i > 0 && i % 7 === 0) {
                                    html += '<span style="flex-basis:100%;height:0"></span>';
                                }
                                html += `<span style="
                                    display:inline-flex;
                                    align-items:center;
                                    justify-content:center;
                                    width:18px;
                                    height:18px;
                                    border-radius:50%;
                                    background:${tarefa.cor};
                                    margin:1.5px;
                                    opacity:${tarefa.status};
                                    font-size:10px;
                                    font-weight:bold;
                                    color:#fff;
                                    border:1.5px solid #fff;
                                    box-sizing:border-box;
                                    letter-spacing:1px;
                                ">${tarefa.usuario}</span>`;
                            });
                            html += '</div>';
                            return { html };
                        },
                        
                        dateClick: function(info) {
                            // Remove seleção anterior
                            document.querySelectorAll('.fc-daygrid-day.selected-day').forEach(el => {
                                el.classList.remove('selected-day');
                            });

                            // Marca o novo dia clicado
                            if (info.dayEl) {
                                info.dayEl.classList.add('selected-day');
                            }

                            // Atualiza a agenda normalmente
                            const [year, month, day] = info.dateStr.split('-');
                            const clickedDate = new Date(Number(year), Number(month) - 1, Number(day));
                            selectedAgendaDate = clickedDate.toDateString();
                            loadTasksFromFirebase();
                            updateCurrentDate(clickedDate);
                        },

                        datesSet: function(info) {
                            const today = new Date();
                            const calendarMonth = info.view.currentStart.getMonth();
                            const calendarYear = info.view.currentStart.getFullYear();
                            if (
                                today.getMonth() === calendarMonth &&
                                today.getFullYear() === calendarYear
                            ) {
                                if (selectedAgendaDate !== today.toDateString()) {
                                    selectedAgendaDate = today.toDateString();
                                    loadTasksFromFirebase();
                                    updateCurrentDate(today);
                                }
                            }
                        }
                    });
                    calendarInstance.render();
                    window.calendarInstance = calendarInstance;
                }
            } else {
                calendarContainer.classList.add('max-h-0', 'opacity-0');
                calendarContainer.classList.remove('max-h-full', 'opacity-100');
                toggleCalendarBtn.querySelector('span:last-child').textContent = 'Mostrar calendário';
            }
        });
    }
});

// Event listeners para formulários de finanças
const formEntrada = document.getElementById('form-entrada');
const formGasto = document.getElementById('form-gasto');

if (formEntrada) {
    formEntrada.addEventListener('submit', function(e) {
        e.preventDefault();
        addEntrada();
    });
}

if (formGasto) {
    formGasto.addEventListener('submit', function(e) {
        e.preventDefault();
        addGasto();
    });
}

// Event listener para filtro de transações
const filtroTipo = document.getElementById('filtro-tipo');
if (filtroTipo) {
    filtroTipo.addEventListener('change', function() {
        renderTransactions();
    });
}

// ===== MENU HAMBÚRGUER =====
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('menu-overlay');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

function closeMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('menu-overlay');
    
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
}

function showSection(section) {
    const agendaSection = document.getElementById('agenda-section');
    const financasSection = document.getElementById('financas-section');
    const pageTitle = document.getElementById('page-title');
    
    // Esconder todas as seções
    agendaSection.classList.add('section-hidden');
    financasSection.classList.add('section-hidden');
    
    // Mostrar seção selecionada
    if (section === 'agenda') {
        agendaSection.classList.remove('section-hidden');
        pageTitle.textContent = 'Nossa Agendinha';
        currentSection = 'agenda';
    } else if (section === 'financas') {
        financasSection.classList.remove('section-hidden');
        pageTitle.textContent = 'Controle Financeiro';
        currentSection = 'financas';
        updateFinancialSummary();
        renderTransactions();
    }
    
    closeMenu();
}

// Atualizar data atual
function updateCurrentDate(dateObj) {
    const now = dateObj || new Date();
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

// adiciona tarefas unificada
function getPeriodoByHora(hora) {
    const [h] = hora.split(':').map(Number);
    if (h >= 6 && h < 12) return 'manha';
    if (h >= 12 && h < 18) return 'tarde';
    return 'noite';
}

function addTaskUnificada(usuario) {
    const input = document.getElementById(usuario === 'larissa' ? 'input-larissa' : 'input-jv');
    const horaInput = document.getElementById(usuario === 'larissa' ? 'input-hora-larissa' : 'input-hora-jv');
    const taskText = input.value.trim();
    const hora = horaInput.value;
    const cor = document.querySelector(`input[name="cor-${usuario === 'larissa' ? 'larissa' : 'jv'}"]:checked`).value;

    if (!taskText || !hora) {
        showToast('Preencha a tarefa e o horário!');
        return;
    }

    const periodo = getPeriodoByHora(hora);
    const newTask = {
        id: generateId(),
        text: taskText,
        hora: hora,
        cor: cor,
        completed: false,
        createdAt: new Date().toISOString()
    };

    if (usuario === 'larissa') {
        agendaData[periodo].push(newTask);
    } else {
        agendaDataJV[periodo].push(newTask);
    }

    input.value = '';
    horaInput.value = '';
    // Resetar o radio para o padrão (primeiro radio)
    const corRadios = document.querySelectorAll(`input[name="cor-${usuario === 'larissa' ? 'larissa' : 'jv'}"]`);
    if (corRadios.length) corRadios[0].checked = true;

    renderAllTasks();
    renderAllTasksJV();
    saveTasksToFirebase();
    updateTaskCounts();

    if (window.calendarInstance) {
        window.calendarInstance.refetchEvents();
    }
}

// Remover tarefa para Larissa
function removeTask(periodo, taskId) {
    agendaData[periodo] = agendaData[periodo].filter(task => task.id !== taskId);
    renderTasks(periodo);
    updateTaskCounts();
    saveTasksToFirebase();

    if (window.calendarInstance) {
        window.calendarInstance.refetchEvents();
    }
}

// Remover tarefa para João Victor
function removeTaskJV(periodo, taskId) {
    agendaDataJV[periodo] = agendaDataJV[periodo].filter(task => task.id !== taskId);
    renderTasksJV(periodo);
    updateTaskCounts();
    saveTasksToFirebase();

    if (window.calendarInstance) {
        window.calendarInstance.refetchEvents();
    }
}

// Alternar status da tarefa para Larissa
function toggleTask(periodo, taskId) {
    const task = agendaData[periodo].find(task => task.id === taskId);
    if (task) {
        task.completed = !task.completed;
        renderTasks(periodo);
        updateTaskCounts();
        saveTasksToFirebase();

        if (window.calendarInstance) {
        window.calendarInstance.refetchEvents();
    }
    }
}

// Alternar status da tarefa para João Victor
function toggleTaskJV(periodo, taskId) {
    const task = agendaDataJV[periodo].find(task => task.id === taskId);
    if (task) {
        task.completed = !task.completed;
        renderTasksJV(periodo);
        updateTaskCounts();
        saveTasksToFirebase();

        if (window.calendarInstance) {
        window.calendarInstance.refetchEvents();
    }
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
        <div class="flex items-center justify-between p-3 rounded-lg border border-lavanda transition-all duration-300 hover:shadow-md"
             style="background-color: ${task.cor};"
             data-task-id="${task.id}">
            <input 
                type="checkbox" 
                ${task.completed ? 'checked' : ''} 
                onchange="toggleTask('${periodo}', '${task.id}')"
                class="w-4 h-4 text-rosa-vibrante bg-white border-2 border-lavanda rounded focus:ring-rosa-medio focus:ring-2 transition-all duration-300 mr-3"
            >
            <span class="flex-1 text-center ${task.completed ? 'task-completed' : ''} text-gray-700 transition-all duration-300">
                ${task.text}
            </span>
            <span class="text-xs font-bold text-gray-600 ml-3 min-w-[48px] text-right">${task.hora || ''}</span>
            <button 
                onclick="removeTask('${periodo}', '${task.id}')" 
                class="text-gray-400 hover:text-red-400 transition-colors duration-300 p-1 rounded hover:bg-white ml-2"
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
        <div class="flex items-center justify-between p-3 rounded-lg border border-lavanda transition-all duration-300 hover:shadow-md"
             style="background-color: ${task.cor};"
             data-task-jv-id="${task.id}">
            <input 
                type="checkbox" 
                ${task.completed ? 'checked' : ''} 
                onchange="toggleTaskJV('${periodo}', '${task.id}')"
                class="w-4 h-4 text-rosa-vibrante bg-white border-2 border-lavanda rounded focus:ring-rosa-medio focus:ring-2 transition-all duration-300 mr-3"
            >
            <span class="flex-1 text-center ${task.completed ? 'task-completed' : ''} text-gray-700 transition-all duration-300">
                ${task.text}
            </span>
            <span class="text-xs font-bold text-gray-600 ml-3 min-w-[48px] text-right">${task.hora || ''}</span>
            <button 
                onclick="removeTaskJV('${periodo}', '${task.id}')" 
                class="text-gray-400 hover:text-red-400 transition-colors duration-300 p-1 rounded hover:bg-white ml-2"
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

// ===== FUNÇÕES DE TOAST =====
// Toast com timeout para evitar sobreposição
let toastTimeout;
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('opacity-0', 'pointer-events-none');
    toast.classList.add('opacity-100');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('opacity-100');
        toast.classList.add('opacity-0', 'pointer-events-none');
    }, 1800);
}

// ===== FUNÇÕES DE FINANÇAS =====
function addEntrada() {
    const valor = parseFloat(document.getElementById('valor-entrada').value);
    const descricao = document.getElementById('desc-entrada').value.trim();
    const categoria = document.getElementById('cat-entrada').value;
    const pessoa = document.getElementById('pessoa-entrada').value;
    
    if (!valor || valor <= 0 || !descricao) {
        showToast('Por favor, preencha todos os campos corretamente.');
        return;
    }
    
    const entrada = {
        id: generateId(),
        tipo: 'entrada',
        valor: valor,
        descricao: descricao,
        categoria: categoria,
        pessoa: pessoa,
        data: new Date().toISOString()
    };
    
    financasData.entradas.push(entrada);
    
    // Limpar formulário
    document.getElementById('form-entrada').reset();
    
    saveFinancialDataToFirebase();
    updateFinancialSummary();
    renderTransactions();
}

function addGasto() {
    const valor = parseFloat(document.getElementById('valor-gasto').value);
    const descricao = document.getElementById('desc-gasto').value.trim();
    const categoria = document.getElementById('cat-gasto').value;
    const tipo = document.getElementById('tipo-gasto').value;
    
    if (!valor || valor <= 0 || !descricao) {
        showToast('Por favor, preencha todos os campos corretamente.');
        return;
    }
    
    const gasto = {
        id: generateId(),
        tipo: 'gasto',
        valor: valor,
        descricao: descricao,
        categoria: categoria,
        pessoa: tipo,
        data: new Date().toISOString()
    };
    
    financasData.gastos.push(gasto);
    
    // Limpar formulário
    document.getElementById('form-gasto').reset();
    
    saveFinancialDataToFirebase();
    updateFinancialSummary();
    renderTransactions();
}

function updateFinancialSummary() {
    const totalEntradas = financasData.entradas.reduce((sum, entrada) => sum + entrada.valor, 0);
    const totalGastos = financasData.gastos.reduce((sum, gasto) => sum + gasto.valor, 0);
    const saldo = totalEntradas - totalGastos;
    
    const totalEntradasElement = document.getElementById('total-entradas');
    const totalGastosElement = document.getElementById('total-gastos');
    const saldoAtualElement = document.getElementById('saldo-atual');
    
    if (totalEntradasElement) {
        totalEntradasElement.textContent = formatCurrency(totalEntradas);
    }
    
    if (totalGastosElement) {
        totalGastosElement.textContent = formatCurrency(totalGastos);
    }
    
    if (saldoAtualElement) {
        saldoAtualElement.textContent = formatCurrency(saldo);
        saldoAtualElement.className = `text-2xl font-bold ${saldo >= 0 ? 'text-rosa-vibrante' : 'text-red-600'}`;
    }
}

function renderTransactions() {
    const container = document.getElementById('lista-transacoes');
    if (!container) return;
    
    const filtro = document.getElementById('filtro-tipo')?.value || 'todos';
    
    // Combinar e ordenar transações
    let allTransactions = [];
    
    if (filtro === 'todos' || filtro === 'entrada') {
        allTransactions = allTransactions.concat(financasData.entradas);
    }
    
    if (filtro === 'todos' || filtro === 'gasto') {
        allTransactions = allTransactions.concat(financasData.gastos);
    }
    
    // Ordenar por data (mais recente primeiro)
    allTransactions.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    if (allTransactions.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-400 py-8">
                <div class="text-4xl mb-2">📊</div>
                <div>Nenhuma transação encontrada</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = allTransactions.map(transaction => {
        const isEntrada = transaction.tipo === 'entrada';
        const icon = getCategoryIcon(transaction.categoria, transaction.tipo);
        const pessoaText = getPessoaText(transaction.pessoa);
        const dataFormatada = new Date(transaction.data).toLocaleDateString('pt-BR');
        
        return `
            <div class="transaction-item flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">${icon}</span>
                    <div>
                        <div class="font-medium text-gray-800">${transaction.descricao}</div>
                        <div class="text-sm text-gray-500">${pessoaText} • ${dataFormatada}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="font-bold ${isEntrada ? 'text-green-600' : 'text-red-600'}">
                        ${isEntrada ? '+' : '-'} ${formatCurrency(transaction.valor)}
                    </div>
                    <button onclick="removeTransaction('${transaction.tipo}', '${transaction.id}')" 
                            class="text-xs text-gray-400 hover:text-red-500 transition-colors">
                        Remover
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

//remover transação
function removeTransaction(tipo, id) {
    if (confirm('Tem certeza que deseja remover esta transação?')) {
        if (tipo === 'entrada') {
            financasData.entradas = financasData.entradas.filter(item => item.id !== id);
        } else {
            financasData.gastos = financasData.gastos.filter(item => item.id !== id);
        }
        
        saveFinancialDataToFirebase();
        updateFinancialSummary();
        renderTransactions();
    }
}

function getCategoryIcon(categoria, tipo) {
    const icons = {
        // Entradas
        salario: '💼',
        freelance: '💻',
        presente: '🎁',
        investimento: '📈',
        // Gastos
        alimentacao: '🍕',
        transporte: '🚗',
        casa: '🏠',
        lazer: '🎮',
        roupas: '👕',
        saude: '💊',
        educacao: '📚',
        outros: '🔄'
    };
    
    return icons[categoria] || '🔄';
}

function getPessoaText(pessoa) {
    const pessoas = {
        pessoa1: 'Pessoa 1',
        pessoa2: 'Pessoa 2',
        ambos: 'Ambos',
        compartilhado: 'Compartilhado'
    };
    
    return pessoas[pessoa] || pessoa;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Limpar dados financeiros do mês atual
function clearFinancialData() {
    if (confirm('Tem certeza que deseja limpar todos os dados financeiros do mês atual?')) {
        financasData = { entradas: [], gastos: [] };
        saveFinancialDataToFirebase();
        updateFinancialSummary();
        renderTransactions();
    }
}

// Salvar todas as tarefas (Larissa e João Victor) no Firestore
async function saveTasksToFirebase() {
    try {
        await window.firestoreSetDoc(
            window.firestoreDoc(window.db, "agendas", selectedAgendaDate),
            {
                larissa: agendaData,
                joaovictor: agendaDataJV,
                updatedAt: new Date()
            }
        );
        showToast('Tarefas salvas na nuvem com sucesso!');
    } catch (error) {
        showToast('Erro ao salvar na nuvem!');
    }
}

// Salvar dados financeiros no Firestore
async function saveFinancialDataToFirebase() {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    try {
        await window.firestoreSetDoc(
            window.firestoreDoc(window.db, "financas", currentMonth),
            financasData
        );
        showToast('Finanças salvas na nuvem!');
    } catch (error) {
        showToast('Erro ao salvar finanças na nuvem!');
    }
}

// Carregar todas as tarefas do Firestore
async function loadTasksFromFirebase() {
    try {
        const docSnap = await window.firestoreGetDoc(
            window.firestoreDoc(window.db, "agendas", selectedAgendaDate)
        );
        if (docSnap.exists()) {
            const data = docSnap.data();
            agendaData = data.larissa || { manha: [], tarde: [], noite: [] };
            agendaDataJV = data.joaovictor || { manha: [], tarde: [], noite: [] };
        } else {
            agendaData = { manha: [], tarde: [], noite: [] };
            agendaDataJV = { manha: [], tarde: [], noite: [] };
        }
        renderAllTasks();
        renderAllTasksJV();
        updateTaskCounts();
    } catch (error) {
        showToast('Erro ao carregar da nuvem!');
    }
}

// Carregar dados financeiros do Firestore
async function loadFinancialDataFromFirebase() {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    try {
        const docSnap = await window.firestoreGetDoc(
            window.firestoreDoc(window.db, "financas", currentMonth)
        );
        if (docSnap.exists()) {
            financasData = docSnap.data();
        } else {
            financasData = { entradas: [], gastos: [] };
        }
        updateFinancialSummary();
        renderTransactions();
        showToast('Finanças carregadas da nuvem!');
    } catch (error) {
        showToast('Erro ao carregar finanças da nuvem!');
    }
}