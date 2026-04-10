const MAX_HABITS = 5;

const habits = [];

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

class Error {
    message;
    stack;
    name = 'Error';
}

class DomainError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'DomainError';
        this.code = code;
    }
}

const ERROR_CODES = {
    INVALID_NAME: 'INVALID_NAME',
    INVALID_FREQUENCY: 'INVALID_FREQUECTY',
    DUPLICATE_CHECKIN: 'DUPLICATE_CHECKIN',
    INVALID_DATE: 'INVALID_DATE',
    FUTURE_DATE: 'FUTURE_DATE',
    INVALID_TARGET_MINUTES: 'INVALID_TARGET_MINUTES',
};

class LogTracker {
    #dates = [];

    addLog(date) {
        if (typeof date !== 'string' || date.length !== 10) {
            return null;
        }
        this.#dates.push(date);
        return date;
    }

    getLogs() {
        return [...this.#dates];
    }

    removeLog(date) {
        const index = this.#dates.findIndex((d) => d === date);
        if (index !== -1) {
            this.#dates.splice(index, 1);
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
            const expectedDate = this.#getDateString(currentDate);

            if (sortedLogs[i] === expectedDate) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    }

    #getDateString(date) {
        return date.toISOString().split('T')[0];
    }
}

class WeeklyStreakCalculator {
    calculate(habit, logs, today) {
        if (logs.length === 0) {
            return 0;
        }

        const weeks = this.#groupByWeek(logs);
        const sortedWeeks = Object.keys(weeks).sort((a, b) => b.localeCompare(a));

        let streak = 0;
        let expectedWeek = this.#getWeekKey(today);

        for (const week of sortedWeeks) {
            if (week === expectedWeek) {
                streak++;
                expectedWeek = this.#getPreviousWeek(expectedWeek);
            } else {
                break;
            }
        }

        return streak;
    }

    #groupByWeek(logs) {
        const weeks = {};
        logs.forEach((log) => {
            const weekKey = this.#getWeekKey(new Date(log + 'T00:00:00'));
            if (!weeks[weekKey]) {
                weeks[weekKey] = [];
            }
            weeks[weekKey].push(log);
        });
        return weeks;
    }

    #getWeekKey(date) {
        const year = date.getFullYear();
        const week = this.#getWeekNumber(date);
        return `${year}-W${String(week).padStart(2, '0')}`;
    }

    #getWeekNumber(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
        return weekNo;
    }

    #getPreviousWeek(weekKey) {
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

const STREK_CALCULATORS = {
    daily: new DailyStreakCalculator(),
    weekly: new WeeklyStreakCalculator(),
};

class Habit {
    #name;
    #frequency;
    #id;
    #tracker;
    #createdAt;

    constructor(name, frequency) {
        this.#id = Habit.createId();
        this.name = name;
        this.frequency = frequency;
        this.#createdAt = new Date().toISOString();
        this.#tracker = new LogTracker();
    }

    get name() {
        return this.#name;
    }

    get createdAt() {
        return this.#createdAt;
    }

    set name(value) {
        const normalized = value.trim();
        if (normalized.length < 3) {
            throw new DomainError(
                'El nombre del hábito debe tener al menos 3 caracteres.',
                ERROR_CODES.INVALID_NAME,
            );
        }
        this.#name = normalized;
    }

    get frequency() {
        return this.#frequency;
    }

    set frequency(value) {
        const validFrequencies = ['daily', 'weekly'];
        if (!validFrequencies.includes(value)) {
            throw new DomainError(
                'La frecuencia debe ser "daily" o "weekly".',
                ERROR_CODES.INVALID_FREQUENCY,
            );
        }
        this.#frequency = value;
    }

    get id() {
        return this.#id;
    }

    rename(newName) {
        this.name = newName;
    }

    registerCheckIn(date) {
        const created = this.#tracker.addLog(date);
        if (!created) {
            return null;
        }
        return {
            habitId: this.id,
            date: created,
        };
    }

    getLogs() {
        return this.#tracker.getLogs();
    }

    removeCheckIn(date) {
        return this.#tracker.removeLog(date);
    }

    calculateStreak(today = new Date()) {
        const calculator = STREK_CALCULATORS[this.#frequency];
        if (!calculator) {
            return 0;
        }
        return calculator.calculate(this, this.getLogs(), today);
    }

    toDisplayString() {
        return `${this.name} (${this.frequency})`;
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
}

class TimedHabit extends Habit {
    #targetMinutes;
    constructor(name, frequency, targetMinutes) {
        super(name, frequency);
        this.targetMinutes = targetMinutes;
    }

    get targetMinutes() {
        return this.#targetMinutes;
    }

    set targetMinutes(value) {
        const minutes = Number(value);
        if (isNaN(minutes) || minutes <= 0) {
            throw new Error('El Objetivo de tiempo debe de ser un número positivo');
        }
        this.#targetMinutes = minutes;
    }

    toDisplayString() {
        const baseString = super.toDisplayString();
        return `${baseString} ${this.#targetMinutes
    } `;
  }

  static daily(name, targetMinutes) {
    return new TimedHabit(name, 'daily', targetMinutes);
  }

  static weekly(name, targetMinutes) {
    return new TimedHabit(name, 'weekly', targetMinutes);
  }
}

function addHabit(name, frequency) {
  if (habits.length >= MAX_HABITS) {
    showMessage('Has alcanzado el límite de 5 hábitos', 'error');
    return null;
  }

  if (!name || name.trim().length === 0) {
    showMessage('El nombre del hábito es obligatorio', 'error');
    return null;
  }

  try {
    const habit = new Habit(name.trim(), frequency);
    habits.push(habit);
    return habit;
  } catch (error) {
    showMessage(error.message, 'error');
    return null;
  }
}

function logHabit(habitId, date) {
  const habit = habits.find((h) => h.id === habitId);

  if (!habit) {
    showMessage('Hábito no encontrado', 'error');
    return null;
  }

  return habit.registerCheckIn(date);
}

function getStatistics() {
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
  messageBox.className = `message - box ${ type } `;

  setTimeout(() => {
    messageBox.classList.add('hidden');
  }, 3000);
}

function renderHabits() {
  const habitsTable = document.getElementById('habitsTable');
  const habitSelect = document.getElementById('habitSelect');
  const createHabitBtn = document.getElementById('openCreateModal');

  if (habits.length === 0) {
    habitsTable.innerHTML =
      '<p class="empty-state">No hay hábitos. Haz clic en "Crear Hábito" para comenzar.</p>';
    habitSelect.innerHTML = '<option value="">Selecciona un hábito</option>';
    createHabitBtn.style.display = 'block';
    return;
  }

  // Ocultar botón de crear hábito si se alcanzó el límite
  if (habits.length >= MAX_HABITS) {
    createHabitBtn.style.display = 'none';
  } else {
    createHabitBtn.style.display = 'block';
  }

  const monthDays = getCurrentMonthDays();

  const headerRow = `
    < div class="habit-row habit-header" >
        <span class="habit-day-label">Día</span>
${ habits.map((habit) => `<span class="habit-name">${habit.name}</span>`).join('') }
    </div >
    `;

  const dayRows = monthDays
    .map((date, index) => {
      const dateObj = new Date(date + 'T00:00:00');
      const dayLabel = String(dateObj.getDate()).padStart(2, '0');

      return `
    < div class="habit-row" >
        <span class="habit-day">${dayLabel}</span>
${
    habits
        .map((habit) => {
            const habitLogs = habit.getLogs();
            const isChecked = habitLogs.includes(date);
            return `<div class="habit-checkbox ${isChecked ? 'checked' : ''}" 
                         data-habit-id="${habit.id}" 
                         data-date="${date}"></div>`;
        })
    .join('')
}
        </div >
    `;
    })
    .join('');

  habitsTable.innerHTML = headerRow + dayRows;

  habitSelect.innerHTML =
    '<option value="">Selecciona un hábito</option>' +
    habits.map((habit) => `< option value = "${habit.id}" > ${ habit.name }</option > `).join('');

  attachCheckboxListeners();
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
      } else {
        const log = logHabit(habitId, date);
        if (log) {
          this.classList.add('checked');
          showMessage('Check-in registrado', 'success');
        }
      }
    });
  });
}

function removeLog(habitId, date) {
  const habit = habits.find((h) => h.id === habitId);
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

  document.getElementById('openRegisterModal').addEventListener('click', () => {
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

    const habit = addHabit(name, frequency);
    if (habit) {
      showMessage(`Hábito "${habit.name}" creado exitosamente`, 'success');
      document.getElementById('habitName').value = '';
      renderHabits();
      closeModal('createHabitModal');

      // Si se alcanzó el límite, mostrar mensaje
      if (habits.length >= MAX_HABITS) {
        showMessage('Has alcanzado el límite máximo de 5 hábitos', 'success');
      }
    }
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
      const habit = habits.find((h) => h.id === habitId);
      showMessage(`Check -in registrado para ${ habit.name } `, 'success');
      renderHabits();
      closeModal('registerModal');
    }
  });

  renderHabits();
  renderQuote();

  console.log('Habit Tracker inicializado');
  const demoHabit1 = Habit.daily('Leer');
  demoHabit1.registerCheckIn('2026-01-10');
  demoHabit1.registerCheckIn('2026-01-11');
  demoHabit1.registerCheckIn('2026-01-12');

  const demoHabit2 = Habit.weekly('Ejercicio');
  demoHabit2.registerCheckIn('2026-01-06');
  demoHabit2.registerCheckIn('2026-01-13');

  const demoHabit3 = TimedHabit.daily('Meditar', 20);
  demoHabit3.registerCheckIn('2026-01-10');
  demoHabit3.registerCheckIn('2026-01-11');
  demoHabit3.registerCheckIn('2026-01-12');

  console.log('Hábito diario:', demoHabit1.toDisplayString());
  console.log('Racha diaria:', demoHabit1.calculateStreak(new Date('2026-01-13')));
  console.log('Hábito semanal:', demoHabit2.toDisplayString());
  console.log('Racha semanal:', demoHabit2.calculateStreak(new Date('2026-01-13')));
  console.log('Hábito con tiempo:', demoHabit3.toDisplayString());
}

document.addEventListener('DOMContentLoaded', initApp);
