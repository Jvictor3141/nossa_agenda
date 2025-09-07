# 📋 Agenda Diária - Rosa Bebê

Uma agenda colaborativa, minimalista e elegante, desenvolvida em **HTML**, **CSS (TailwindCSS)** e **JavaScript**, com integração ao **Firebase Firestore** para sincronização em tempo real.

## ✨ Características

- **Design Minimalista:** Interface clean com cores pastéis suaves
- **Responsiva:** Funciona perfeitamente em desktop e mobile
- **Dois Usuários:** Larissa e João Victor, cada um com suas tarefas separadas
- **Três Períodos:** Organização por Manhã (6h-12h), Tarde (12h-18h), Noite (18h-24h)
- **Calendário Interativo:** Visualização mensal com bolinhas coloridas para tarefas e estrelas para datas especiais
- **Datas Especiais:** Eventos recorrentes (anual, mensal, semanal) com destaque no calendário e na agenda
- **Persistência:** Sincronização automática com Firebase Firestore
- **Configuração Avançada:** Tarefas podem ser recorrentes (diário, semanal, mensal)
- **Modal Dinâmico:** Visualização detalhada do dia, tarefas e datas especiais
- **Remoção Segura:** Confirmação estilizada para exclusão de datas especiais

## 🎨 Paleta de Cores

- **Background:** Rosa bebê muito claro (`#fdf2f8`)
- **Cards:** Rosa bebê (`#fce7f3`)
- **Acentos:** Rosa médio (`#f9a8d4`)
- **Destaque:** Rosa vibrante (`#ec4899`)
- **Bordas:** Lavanda claro (`#f3e8ff`)

## 🚀 Funcionalidades

### ➕ Adicionar Tarefas
- Digite a tarefa e o horário
- Escolha a cor e, se desejar, marque "Avançado" para definir frequência (diário, semanal, mensal)
- Clique no botão "+" para adicionar

### ✅ Marcar Tarefas
- Clique no checkbox para marcar como concluída
- Tarefas concluídas ficam riscadas e com opacidade reduzida
- Para tarefas recorrentes, a conclusão é registrada apenas no dia marcado

### 🗑️ Remover Tarefas
- Clique no "✕" ao lado da tarefa para removê-la de todos os dias (inclusive recorrentes)

### 📅 Calendário Interativo
- Visualize o mês com bolinhas coloridas para tarefas e estrelas para datas especiais
- Legenda dinâmica mostra datas especiais do mês exibido
- Modal do calendário exibe tarefas e datas especiais do dia selecionado

### 🎉 Datas Especiais
- Adicione eventos únicos ou recorrentes (anual, mensal, semanal)
- Eventos recorrentes aparecem automaticamente nos dias corretos do calendário e modal

### 📊 Resumo do Dia
- Visualize o progresso de cada período
- Contadores coloridos: cinza (vazio), rosa (pendente), verde (completo)

### 💰 Controle Financeiro
- Adicione entradas e gastos, categorizados e atribuídos a cada pessoa
- Resumo mensal, saldo e lista de transações

## 📱 Como Usar

1. **Abrir:** Abra o arquivo `index.html` em qualquer navegador moderno
2. **Adicionar:** Digite suas tarefas nos campos correspondentes aos períodos e usuários
3. **Organizar:** Use as três seções para organizar seu dia
4. **Acompanhar:** Marque as tarefas conforme as completa
5. **Calendário:** Use o calendário para visualizar tarefas e datas especiais do mês
6. **Financeiro:** Controle entradas e gastos na aba de finanças

## 🔧 Arquivos do Projeto

- `index.html` — Interface principal
- `main.css` — Estilos customizados e tema
- `script.js` — Funcionalidades JavaScript e integração Firebase
- `README.md` — Esta documentação

## 💡 Dicas de Uso

- **Planejamento:** Use a manhã para tarefas importantes, tarde para reuniões, noite para relaxamento
- **Produtividade:** Marque as tarefas conforme completa para ver seu progresso
- **Organização:** Adicione tarefas específicas e mensuráveis
- **Flexibilidade:** Remova ou edite tarefas conforme necessário
- **Recorrência:** Use a configuração avançada para tarefas que se repetem

## 🌟 Recursos Especiais

- **Sincronização em Tempo Real:** Todas as alterações são salvas e sincronizadas via Firebase
- **Datas Especiais Recorrentes:** Eventos aparecem automaticamente nos dias corretos
- **Modal de Confirmação:** Exclusão de datas especiais com confirmação estilizada
- **Tema Escuro:** Alternância rápida entre claro e escuro
- **Acessibilidade:** Cores contrastantes e elementos focáveis

## 📅 Persistência de Dados

As tarefas e eventos são salvos automaticamente na nuvem (Firebase Firestore) para cada dia, permitindo histórico organizado e acesso em múltiplos dispositivos.

---

**Desenvolvido usando HTML5, TailwindCSS, JavaScript e Firebase. Para organizar o nosso dia a dia.**