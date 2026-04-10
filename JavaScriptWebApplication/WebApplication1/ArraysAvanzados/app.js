const MAX_HABITS = 5;

class DomainError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'DomainError';
        this.code = code;
    }
}

const ERROR_CODES = {
    INVALID_NAME: 'INVALID_NAME',
    INVALID_FREQUENCY: 'INVALID_FREQUENCY',
    DUPLICATE_CHECKIN: 'DUPLICATE_CHECKIN',
    INVALID_DATE: 'INVALID_DATE',
    FUTURE_DATE: 'FUTURE_DATE',
    INVALID_TARGET_MINUTES: 'INVALID_TARGET_MINUTES',
    HABIT_NOT_FOUND: 'HABIT_NOT_FOUND',
};

const motivationalQuotes = [
    'La fuerza no viene de la capacidad. Viene de la voluntad.',
    'El éxito es la suma de pequeños esfuerzos repetidos día tras día.',
    'No esperes. El momento nunca será perfecto.',
    'El único modo de hacer un gran trabajo es amar lo que haces.',
    'El futuro pertenece a quienes creen en la belleza de sus sueños.',
    'Tu tiempo es limitado, no lo desperdicies viviendo la vida de otros.',
    'El fracaso es la oportunidad de empezar de nuevo con más inteligencia.',
    'No cuentes los días, haz que los días cuenten.',
    'La disciplina es el puente entre metas y logros.',
    'Pequeños pasos diarios llevan a grandes cambios.',
    'La persistencia es el camino del éxito.',
    'Hoy es el primer día del resto de tu vida.',
    'El secreto para avanzar es empezar.',
    'Cada día es una nueva oportunidad para ser mejor.',
    'Los límites solo existen en tu mente.',
    'La acción es la clave fundamental para todo éxito.',
    'Transforma tus hábitos, transforma tu vida.',
    'El progreso es progreso, no importa lo pequeño que sea.',
    'La consistencia vence al talento.',
    'Hoy es el mañana que esperabas ayer.',
];

let dailyQuoteText = getRandomQuote();

class LogTracker {
    dates = [];

    addLog(date) {
        if (typeof date !== 'string' || date.length !== 10) {
            return null;
        }
        this.dates.push(date);
        return date;
    }

    getLogs() {
        return [...this.dates];
    }

    removeLog(date) {
        const index = this.dates.findIndex((d) => d === date);
        if (index !== -1) {
            this.dates.splice(index, 1);
            return true;
        }
        return false;
    }
}

class DailyStreakCalculator {
    calculate(habit, logs, today) {
        if (logs.length === 0) {
            return 0;
        }

        const sortedLogs = [...logs].sort((a, b) => b.localeCompare(a));

        let streak = 0;
        let currentDate = new Date(today);
        currentDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedLogs.length; i++) {
            const expectedDate = this.getDateString(currentDate);

            if (sortedLogs[i] === expectedDate) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    }

    getDateString(date) {
        return date.toISOString().split('T')[0];
    }
}

class WeeklyStreakCalculator {
    calculate(habit, logs, today) {
        if (logs.length === 0) {
            return 0;
        }

        const weeks = this.groupByWeek(logs);
        const sortedWeeks = Object.keys(weeks).sort((a, b) => b.localeCompare(a));

        let streak = 0;
        let expectedWeek = this.getWeekKey(today);

        for (const week of sortedWeeks) {
            if (week === expectedWeek) {
                streak++;
                expectedWeek = this.getPreviousWeek(expectedWeek);
            } else {
                break;
            }
        }

        return streak;
    }

    groupByWeek(logs) {
        const weeks = {};
        logs.forEach((log) => {
            const weekKey = this.getWeekKey(new Date(log + 'T00:00:00'));
            if (!weeks[weekKey]) {
                weeks[weekKey] = [];
            }
            weeks[weekKey].push(log);
        });
        return weeks;
    }

    getWeekKey(date) {
        const year = date.getFullYear();
        const week = this.getWeekNumber(date);
        return `${year}-W${String(week).padStart(2, '0')}`;
    }

    getWeekNumber(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
        return weekNo;
    }

    getPreviousWeek(weekKey) {
        const [year, weekStr] = weekKey.split('-W');
        let week = parseInt(weekStr);
        let y = parseInt(year);

        week--;
        if (week < 1) {
            y--;
            week = 52;
        }

        return `${y}-W${String(week).padStart(2, '0')}`;
    }
}

class MonthlyStreakCalculator {
    calculate(habit, logs, today) {
        if (logs.length === 0) {
            return 0;
        }

        const months = this.groupByMonth(logs);
        const sortedMonths = Object.keys(months).sort((a, b) => b.localeCompare(a));

        let streak = 0;
        let expectedMonth = this.getMonthKey(today);

        for (const month of sortedMonths) {
            if (month === expectedMonth) {
                streak++;
                expectedMonth = this.getPreviousMonth(expectedMonth);
            } else {
                break;
            }
        }

        return streak;
    }

    groupByMonth(logs) {
        const months = {};
        logs.forEach((log) => {
            const monthKey = log.substring(0, 7);
            if (!months[monthKey]) {
                months[monthKey] = [];
            }
            months[monthKey].push(log);
        });
        return months;
    }

    getMonthKey(date) {
        const d = typeof date === 'string' ? new Date(date) : date;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }

    getPreviousMonth(monthKey) {
        const [year, month] = monthKey.split('-').map(Number);
        let prevYear = year;
        let prevMonth = month - 1;

        if (prevMonth < 1) {
            prevYear--;
            prevMonth = 12;
        }

        return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
    }
}

const STREAK_CALCULATORS = {
    daily: new DailyStreakCalculator(),
    weekly: new WeeklyStreakCalculator(),
    monthly: new MonthlyStreakCalculator(),
};

class Habit {
    name;
    frequency;
    id;
    tracker;
    createdAt;

    constructor(name, frequency) {
        this.id = Habit.createId();
        this.name = name;
        this.frequency = frequency;
        this.createdAt = new Date().toISOString();
        this.tracker = new LogTracker();
    }

    get name() {
        return this.name;
    }

    set name(value) {
        const normalized = value.trim();
        if (normalized.length < 3) {
            throw new DomainError(
                'El nombre del hábito debe tener al menos 3 caracteres.',
                ERROR_CODES.INVALID_NAME,
            );
        }
        this.name = normalized;
    }

    get frequency() {
        return this.frequency;
    }

    set frequency(value) {
        const validFrequencies = ['daily', 'weekly', 'monthly'];
        if (!validFrequencies.includes(value)) {
            throw new DomainError(
                'La frecuencia debe ser "daily", "weekly" o "monthly".',
                ERROR_CODES.INVALID_FREQUENCY,
            );
        }
        this.frequency = value;
    }

    get id() {
        return this.id;
    }

    get createdAt() {
        return this.createdAt;
    }

    rename(newName) {
        this.name = newName;
    }

    validateDate(date) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(date)) {
            throw new DomainError(
                'Fecha inválida. Formato esperado: YYYY-MM-DD',
                ERROR_CODES.INVALID_DATE,
            );
        }

        const parsed = new Date(date + 'T00:00:00');
        if (isNaN(parsed.getTime())) {
            throw new DomainError('La fecha no es válida.', ERROR_CODES.INVALID_DATE);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (parsed > today) {
            throw new DomainError(
                'No se pueden registrar check-ins en fechas futuras.',
                ERROR_CODES.FUTURE_DATE,
            );
        }

        return date;
    }

    checkDuplicateCheckIn(date) {
        const logs = this.getLogs();
        if (logs.includes(date)) {
            throw new DomainError(
                `Ya existe un check-in para la fecha ${date}.`,
                ERROR_CODES.DUPLICATE_CHECKIN,
            );
        }
    }

    registerCheckIn(date) {
        const validDate = this.validateDate(date);
        this.checkDuplicateCheckIn(validDate);

        const created = this.tracker.addLog(validDate);
        if (!created) {
            return null;
        }
        return {
            habitId: this.id,
            date: created,
        };
    }

    getLogs() {
        return this.tracker.getLogs();
    }

    removeCheckIn(date) {
        return this.tracker.removeLog(date);
    }

    toDisplayString() {
        const streak = this.calculateStreak();
        const streakEmoji = streak > 0 ? ` 🔥 ${streak}` : '';
        return `📌 ${this.name} (${this.frequency})${streakEmoji}`;
    }

    calculateStreak(today = new Date()) {
        const calculator = STREAK_CALCULATORS[this.frequency];

        if (!calculator) {
            return 0;
        }

        return calculator.calculate(this, this.getLogs(), today);
    }

    static createId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }

    static daily(name) {
        return new Habit(name, 'daily');
    }

    static weekly(name) {
        return new Habit(name, 'weekly');
    }

    static monthly(name) {
        return new Habit(name, 'monthly');
    }
}

class TimedHabit extends Habit {
    targetMinutes;

    constructor(name, frequency, targetMinutes) {
        super(name, frequency);
        this.targetMinutes = targetMinutes;
    }

    get targetMinutes() {
        return this.targetMinutes;
    }

    set targetMinutes(value) {
        const minutes = Number(value);
        if (isNaN(minutes) || minutes <= 0) {
            throw new DomainError(
                'El objetivo de tiempo debe ser un número positivo.',
                ERROR_CODES.INVALID_TARGET_MINUTES,
            );
        }
        if (minutes > 240) {
            throw new DomainError(
                'El objetivo no puede superar 240 minutos (4 horas).',
                ERROR_CODES.INVALID_TARGET_MINUTES,
            );
        }
        this.targetMinutes = minutes;
    }

    toDisplayString() {
        const streak = this.calculateStreak();
        const streakEmoji = streak > 0 ? ` 🔥 ${streak}` : '';
        return `📌 ${this.name} (${this.frequency}) ⏱️ ${this.targetMinutes} min${streakEmoji}`;
    }

    static daily(name, targetMinutes) {
        return new TimedHabit(name, 'daily', targetMinutes);
    }

    static weekly(name, targetMinutes) {
        return new TimedHabit(name, 'weekly', targetMinutes);
    }

    static monthly(name, targetMinutes) {
        return new TimedHabit(name, 'monthly', targetMinutes);
    }
}

class InMemoryHabitRepository {
    habits = [];

    save(habit) {
        const index = this.habits.findIndex((h) => h.id === habit.id);
        if (index !== -1) {
            this.habits[index] = habit;
        } else {
            this.habits.push(habit);
        }
    }

    getById(id) {
        return this.habits.find((h) => h.id === id) || null;
    }

    list() {
        return [...this.habits];
    }

    delete(id) {
        const index = this.habits.findIndex((h) => h.id === id);
        if (index !== -1) {
            this.habits.splice(index, 1);
            return true;
        }
        return false;
    }
}

class HabitService {
    repository;

    constructor(repository) {
        this.repository = repository;
    }

    createHabit(name, frequency) {
        if (!name || name.trim().length === 0) {
            throw new DomainError('El nombre del hábito es obligatorio', ERROR_CODES.INVALID_NAME);
        }

        const habit = new Habit(name.trim(), frequency);
        this.repository.save(habit);
        return habit;
    }

    checkIn(habitId, date) {
        const habit = this.repository.getById(habitId);

        if (!habit) {
            throw new DomainError('Hábito no encontrado', ERROR_CODES.HABIT_NOT_FOUND);
        }

        return habit.registerCheckIn(date);
    }

    listHabits() {
        return this.repository.list();
    }

    getHabitById(habitId) {
        return this.repository.getById(habitId);
    }

    deleteHabit(habitId) {
        return this.repository.delete(habitId);
    }
}

const habitRepository = new InMemoryHabitRepository();
const habitService = new HabitService(habitRepository);

function addHabit(name, frequency) {
    const currentHabits = habitService.listHabits();

    if (currentHabits.length >= MAX_HABITS) {
        showMessage('Has alcanzado el límite de 5 hábitos', 'error');
        return null;
    }

    try {
        const habit = habitService.createHabit(name, frequency);
        return habit;
    } catch (error) {
        showMessage(error.message, 'error');
        return null;
    }
}

function logHabit(habitId, date) {
    try {
        return habitService.checkIn(habitId, date);
    } catch (error) {
        showMessage(error.message, 'error');
        return null;
    }
}

function getStatistics() {
    const habits = habitService.listHabits();
    const totalHabits = habits.length;
    let totalCheckIns = 0;

    const habitCounts = {};
    habits.forEach((habit) => {
        const logs = habit.getLogs();
        totalCheckIns += logs.length;
        habitCounts[habit.name] = logs.length;
    });

    let mostActiveHabit = '-';
    if (totalCheckIns > 0) {
        mostActiveHabit = Object.entries(habitCounts).sort((a, b) => b[1] - a[1])[0][0];
    }

    return {
        totalHabits,
        totalCheckIns,
        mostActiveHabit,
    };
}

function showMessage(message, type = 'success') {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;

    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 3000);
}

function safeAction(action, onSuccess, onError) {
    try {
        const result = action();
        if (onSuccess) {
            onSuccess(result);
        }
        return result;
    } catch (error) {
        let message = 'Error inesperado';

        if (error instanceof DomainError) {
            message = error.message;
            console.error(`[${error.code}] ${error.message}`);
        } else if (error instanceof Error) {
            message = error.message;
            console.error('Error:', error);
        }

        if (onError) {
            onError(error);
        }

        showMessage(message, 'error');
        return null;
    }
}

function renderStreaks() {
    const habits = habitService.listHabits();
    const streaksContainer = document.getElementById('streaksContainer');

    if (habits.length === 0) {
        streaksContainer.innerHTML =
            '<p class="empty-state">Las rachas aparecerán aquí cuando registres hábitos.</p>';
        return;
    }

    const streakCards = habits
        .map((habit) => {
            const streak = habit.calculateStreak();
            const logs = habit.getLogs();
            const frequencyText = habit.frequency === 'daily' ? 'días' : 'semanas';
            const streakClass = streak > 0 ? 'streak-active' : 'streak-inactive';

            return `
        <div class="streak-card ${streakClass}">
          <div class="streak-header">
            <span class="streak-habit-name">${habit.name}</span>
            <span class="streak-frequency">${
                habit.frequency === 'daily' ? 'Diario' : 'Semanal'
                }</span>
          </div>
          <div class="streak-body">
            <div class="streak-number">
              <span class="streak-flame">🔥</span>
              <span class="streak-count">${streak}</span>
              <span class="streak-label">${frequencyText} seguidos</span>
            </div>
            <div class="streak-stats">
              <span class="check-count">✓ ${logs.length} check-ins totales</span>
            </div>
          </div>
        </div>
      `;
        })
        .join('');

    streaksContainer.innerHTML = streakCards;
}

function renderHabits() {
    const habits = habitService.listHabits();
    const habitsTable = document.getElementById('habitsTable');
    const habitSelect = document.getElementById('habitSelect');
    const createHabitBtn = document.getElementById('openCreateModal');

    if (habits.length === 0) {
        habitsTable.innerHTML =
            '<p class="empty-state">No hay hábitos. Haz clic en "Crear Hábito" para comenzar.</p>';
        habitSelect.innerHTML = '<option value="">Selecciona un hábito</option>';
        createHabitBtn.style.display = 'block';
        renderStreaks();
        return;
    }

    if (habits.length >= MAX_HABITS) {
        createHabitBtn.style.display = 'none';
    } else {
        createHabitBtn.style.display = 'block';
    }

    const monthDays = getCurrentMonthDays();

    const headerRow = `
    <div class="habit-row habit-header">
      <span class="habit-day-label">Día</span>
      ${habits.map((habit) => `<span class="habit-name">${habit.name}</span>`).join('')}
    </div>
  `;

    const dayRows = monthDays
        .map((date, index) => {
            const dateObj = new Date(date + 'T00:00:00');
            const dayLabel = String(dateObj.getDate()).padStart(2, '0');

            return `
        <div class="habit-row">
          <span class="habit-day">${dayLabel}</span>
          ${habits
                    .map((habit) => {
                        const habitLogs = habit.getLogs();
                        const isChecked = habitLogs.includes(date);
                        return `<div class="habit-checkbox ${isChecked ? 'checked' : ''}" 
                         data-habit-id="${habit.id}" 
                         data-date="${date}"></div>`;
                    })
                    .join('')}
        </div>
      `;
        })
        .join('');

    habitsTable.innerHTML = headerRow + dayRows;

    habitSelect.innerHTML =
        '<option value="">Selecciona un hábito</option>' +
        habits.map((habit) => `<option value="${habit.id}">${habit.name}</option>`).join('');

    attachCheckboxListeners();
    renderStreaks();
}

function getCurrentMonthDays() {
    const dates = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const currentDay = today.getDate();

    for (let day = 1; day <= currentDay; day++) {
        const date = new Date(year, month, day);
        dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
}

function attachCheckboxListeners() {
    document.querySelectorAll('.habit-checkbox').forEach((checkbox) => {
        checkbox.addEventListener('click', function () {
            const habitId = parseInt(this.dataset.habitId);
            const date = this.dataset.date;

            if (this.classList.contains('checked')) {
                removeLog(habitId, date);
                this.classList.remove('checked');
                showMessage('Check-in removido', 'success');
                renderStreaks();
            } else {
                const log = logHabit(habitId, date);
                if (log) {
                    this.classList.add('checked');
                    showMessage('Check-in registrado', 'success');
                    renderStreaks();
                }
            }
        });
    });
}

function removeLog(habitId, date) {
    const habit = habitService.getHabitById(habitId);
    if (habit) {
        habit.removeCheckIn(date);
    }
}

function updateDateTime() {
    const now = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
    ];

    document.getElementById('dayNumber').textContent = now.getDate();
    document.getElementById('monthName').textContent = months[now.getMonth()];
    document.getElementById('dayName').textContent = days[now.getDay()];
}

function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[randomIndex];
}

function renderQuote() {
    const savedQuote = document.getElementById('savedQuote');
    savedQuote.textContent = dailyQuoteText || 'Escribe tu frase del día...';
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function setupModalListeners() {
    document.getElementById('openCreateModal').addEventListener('click', () => {
        openModal('createHabitModal');
    });

    document.getElementById('exportHabits').addEventListener('click', () => {
        exportHabitsToCVS();
    });

    function exportHabitsToCVS() {
        const habits = habitService.listHabits();
        const rows = habits.map((habit) => {
            return {
                name: habit.name,
                frequency: habit.frequency,
                count: habit.getLogs().length,
            }
        })
        console.log(rows);
        //    .map((row, index) => {
        //    if (index === 0) {
        //        return `HABITO,FRECUENCIA,CONTEO\n${row.name},${row.frequency},${row.count}`;
        //    }
        //    return `${row.name},${row.frequency},${row.count}`;
        //})
        //    .join('\n');
        //const blob = new Blob([rows], { type: 'text/csv' });
        //const url = URL.createObjectURL(blob);
        //const a = document.createElement('a');
        //a.href = url;
        //a.download = 'habits.csv';
        //a.click();
    }

    document.getElementById('openRegisterModal').addEventListener('click', () => {
        const habits = habitService.listHabits();
        if (habits.length === 0) {
            showMessage('Primero crea un hábito', 'error');
            return;
        }
        openModal('registerModal');
    });

    document.querySelectorAll('.close-modal').forEach((btn) => {
        btn.addEventListener('click', function () {
            closeModal(this.dataset.modal);
        });
    });

    document.querySelectorAll('.btn-secondary').forEach((btn) => {
        btn.addEventListener('click', function () {
            const modalId = this.dataset.modal;
            if (modalId) {
                closeModal(modalId);
            }
        });
    });

    document.querySelectorAll('.modal').forEach((modal) => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
}

function initApp() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkInDate').value = today;

    updateDateTime();
    setupModalListeners();

    document.getElementById('createHabitBtn').addEventListener('click', () => {
        const name = document.getElementById('habitName').value;
        const frequency = document.getElementById('habitFrequency').value;

        safeAction(
            () => addHabit(name, frequency),
            (habit) => {
                if (habit) {
                    showMessage(`Hábito "${habit.name}" creado exitosamente`, 'success');
                    document.getElementById('habitName').value = '';
                    renderHabits();
                    closeModal('createHabitModal');

                    const currentHabits = habitService.listHabits();
                    if (currentHabits.length >= MAX_HABITS) {
                        showMessage('Has alcanzado el límite máximo de 5 hábitos', 'success');
                    }
                }
            },
        );
    });

    document.getElementById('checkInBtn').addEventListener('click', () => {
        const habitId = parseInt(document.getElementById('habitSelect').value);
        const date = document.getElementById('checkInDate').value;

        if (!habitId || !date) {
            showMessage('Selecciona un hábito y una fecha', 'error');
            return;
        }

        const log = logHabit(habitId, date);
        if (log) {
            const habit = habitService.getHabitById(habitId);
            showMessage(`Check-in registrado para ${habit.name}`, 'success');
            renderHabits();
            closeModal('registerModal');
        }
    });

    renderHabits();
    renderQuote();
}

document.addEventListener('DOMContentLoaded', initApp);
