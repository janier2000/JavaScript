<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="WebForm1.aspx.cs" Inherits="WebApplication1.Aplication.WebForm1" %>

<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Habit Tracker</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="container">
      <header>
        <h1>FreeHabits</h1>
      </header>

      <main>
        <section class="date-section">
          <div class="date-display">
            <span class="day-number" id="dayNumber">12</span>
            <span class="separator">/</span>
            <span class="month" id="monthName">Enero</span>
          </div>
          <p class="day-name" id="dayName">Lunes</p>
        </section>

        <section class="greeting">
          <p id="greetingText">Hola, Usuario</p>
        </section>

        <section class="daily-quote">
          <p id="savedQuote" class="quote-text">
            La fuerza no viene de la capacidad. Viene de la voluntad.
          </p>
        </section>

        <section class="habits-section">
          <div class="section-header">
            <h2>Tablero mensual</h2>
            <button class="btn-primary" id="openRegisterModal">Registrar</button>
          </div>

          <div class="habits-table" id="habitsTable">
            <p class="empty-state">No hay hábitos. Haz clic en "Crear Hábito" para comenzar.</p>
          </div>
        </section>

        <section class="streaks-section" id="streaksSection">
          <div class="section-header">
            <h2>🔥 Rachas actuales</h2>
          </div>
          <div class="streaks-container" id="streaksContainer">
            <p class="empty-state">Las rachas aparecerán aquí cuando registres hábitos.</p>
          </div>
        </section>

        <button class="btn-add-habit" id="openCreateModal">+ Crear Hábito</button>
      </main>

      <footer>
        <p>Todos los Izquierdos reservados © 2026</p>
      </footer>
    </div>

    <div id="createHabitModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Crear Hábito</h3>
          <button class="close-modal" data-modal="createHabitModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="habitName">Nombre del hábito</label>
            <input type="text" id="habitName" placeholder="Ej: Hacer ejercicio" />
          </div>
          <div class="form-group">
            <label for="habitFrequency">Frecuencia</label>
            <select id="habitFrequency">
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
            </select>
          </div>
          <p class="info-text">Máximo 5 hábitos</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" data-modal="createHabitModal">Cancelar</button>
          <button class="btn-primary" id="createHabitBtn">Crear</button>
        </div>
      </div>
    </div>

    <div id="registerModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Registrar Hábito</h3>
          <button class="close-modal" data-modal="registerModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="habitSelect">Selecciona un hábito</label>
            <select id="habitSelect">
              <option value="">Selecciona un hábito</option>
            </select>
          </div>
          <div class="form-group">
            <label for="checkInDate">Fecha</label>
            <input type="date" id="checkInDate" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" data-modal="registerModal">Cancelar</button>
          <button class="btn-primary" id="checkInBtn">Registrar</button>
        </div>
      </div>
    </div>

    <div id="messageBox" class="message-box hidden"></div>

    <script src="app.js"></script>
  </body>
</html>
