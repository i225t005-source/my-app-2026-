document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const dateDisplay = document.getElementById('date-display');
    const itemsLeft = document.getElementById('items-left');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const characterBubble = document.getElementById('character-bubble');
    const character = document.getElementById('character');
    const bgm = document.getElementById('bgm');

    // Play BGM on first interaction (due to browser autoplay policies)
    const startBGM = () => {
        bgm.play().catch(error => {
            console.log("Autoplay prevented:", error);
        });
        document.removeEventListener('click', startBGM);
        document.removeEventListener('keydown', startBGM);
    };

    document.addEventListener('click', startBGM);
    document.addEventListener('keydown', startBGM);

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';

    const characterMessages = [
        "いい調子ですね！",
        "応援しています！",
        "休憩も大切ですよ。",
        "タスク、終わらせちゃいましょう！",
        "今日もお疲れ様です♪"
    ];

    const updateCharacterMessage = (message) => {
        characterBubble.textContent = message;
        characterBubble.style.animation = 'none';
        characterBubble.offsetHeight; // trigger reflow
        characterBubble.style.animation = 'fadeIn 0.3s ease';
    };

    character.addEventListener('click', () => {
        const randomMessage = characterMessages[Math.floor(Math.random() * characterMessages.length)];
        updateCharacterMessage(randomMessage);
    });

    // Set Date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = new Date().toLocaleDateString('ja-JP', options);

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    };

    const addTask = (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (text === '') return;

        const newTask = {
            id: Date.now(),
            text,
            completed: false
        };

        tasks.push(newTask);
        taskInput.value = '';
        updateCharacterMessage("新しいタスク！頑張りましょう！");
        saveTasks();
    };

    const toggleTask = (id) => {
        const task = tasks.find(t => t.id === id);
        if (task && !task.completed) {
            updateCharacterMessage("お見事です！その調子！");
        }
        tasks = tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
    };

    const deleteTask = (id) => {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
    };

    const clearCompleted = () => {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
    };

    const renderTasks = () => {
        taskList.innerHTML = '';
        
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <div class="checkbox"></div>
                <span class="task-text">${escapeHTML(task.text)}</span>
                <button class="delete-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            `;

            li.querySelector('.checkbox').addEventListener('click', () => toggleTask(task.id));
            li.querySelector('.task-text').addEventListener('click', () => toggleTask(task.id));
            li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

            taskList.appendChild(li);
        });

        const activeCount = tasks.filter(task => !task.completed).length;
        itemsLeft.textContent = `${activeCount} items left`;
    };

    const escapeHTML = (str) => {
        const p = document.createElement('p');
        p.textContent = str;
        return p.innerHTML;
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    taskForm.addEventListener('submit', addTask);
    clearCompletedBtn.addEventListener('click', clearCompleted);

    renderTasks();
});
