const calendar = document.getElementById('calendar');
const assignButton = document.getElementById('assign');
const assignmentsDiv = document.getElementById('assignments');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const monthYearDisplay = document.getElementById('monthYear');
const progressBar = document.getElementById('progress');

const networkTechnicians = ['Juan', 'Carlos', 'Pedro'];
const engineers = ['Roberto', 'Gonzalo', 'Patricio'];
const externalTechnicians = ['Fabián', 'Cristian', 'Ignacio'];

let rotationIndex = 0;
let currentDate = new Date(2025, 0, 1);
let lastAssignedIndex = 0;

const holidays = {
    "0-1": "Año Nuevo",
    "3-18": "Viernes Santo",
    "3-19": "Sábado Santo",
    "4-1": "Día del Trabajador",
    "8-18": "Fiestas Patrias",
    "8-19": "Fiestas Patrias",
    "11-25": "Navidad"
};

function renderCalendar(date) {
    calendar.innerHTML = '';
    monthYearDisplay.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const previousMonthLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    const startDay = (firstDayOfMonth.getDay() + 6) % 7; // Convertir a lunes=0,...domingo=6

    // Crear encabezados de días
    ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].forEach(day => {
        const header = document.createElement('div');
        header.textContent = day;
        header.classList.add('day', 'header');
        calendar.appendChild(header);
    });

    // Días del mes anterior
    for (let i = 0; i < startDay; i++) {
        const previousDay = previousMonthLastDay - (startDay - 1) + i;
        const prevDayDiv = document.createElement('div');
        prevDayDiv.classList.add('day', 'previous-month');
        prevDayDiv.textContent = previousDay;
        calendar.appendChild(prevDayDiv);
    }

    // Días del mes actual
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        dayDiv.textContent = day;

        const holidayKey = `${date.getMonth()}-${day}`;
        if (holidays[holidayKey]) {
            dayDiv.style.backgroundColor = '#f56565';
            dayDiv.style.color = '#fff';
            dayDiv.title = holidays[holidayKey];
        }

        calendar.appendChild(dayDiv);
    }

    // Días del mes siguiente
    const totalCells = calendar.children.length;
    const remainingDays = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
        const nextDayDiv = document.createElement('div');
        nextDayDiv.classList.add('day', 'next-month');
        nextDayDiv.textContent = i;
        calendar.appendChild(nextDayDiv);
    }
}

function assignWeek() {
    const days = [...calendar.children].filter(day => !day.classList.contains('header')); // Filtrar días sin cabeceras
    const totalWeeks = Math.ceil(days.length / 7); // Calcular semanas totales en el calendario

    if (lastAssignedIndex >= totalWeeks) {
        alert('Todas las semanas ya han sido asignadas.');
        return;
    }

    const weekStart = lastAssignedIndex * 7; // Índice de inicio de la semana
    const weekDays = days.slice(weekStart, weekStart + 7); // Obtener días de la semana actual

    // Desmarcar todas las semanas anteriores
    days.forEach(day => day.classList.remove('week-assigned'));

    // Marcar visualmente solo la semana actual
    weekDays.forEach(day => {
        day.classList.add('week-assigned');
    });

    // Obtener los turnos según el índice de rotación
    const technician = networkTechnicians[rotationIndex % networkTechnicians.length];
    const engineer = engineers[rotationIndex % engineers.length];
    const externalTechnician = externalTechnicians[rotationIndex % externalTechnicians.length];

    const startDay = weekDays[0].textContent; // Primer día de la semana
    const endDay = weekDays[weekDays.length - 1].textContent; // Último día de la semana
    const currentMonth = monthYearDisplay.textContent; // Mes actual

    // Crear un objeto de asignación
    const assignment = {
        semana: `Semana ${startDay} - ${endDay}`,
        mes: currentMonth,
        tecnicoRed: technician,
        ingeniero: engineer,
        tecnicoExterno: externalTechnician,
        horario: "9:00 AM - 8:00 PM"
    };

    // Mostrar asignación actual
assignmentsDiv.innerHTML = `
<div class="assignment" data-week="${assignment.semana}">
<div class="title">Semana: ${startDay} - ${endDay} (${currentMonth})</div>
<div class="details">
    <p><strong>Técnico en Red:</strong> ${technician}</p>
    <p><strong>Ingeniero:</strong> ${engineer}</p>
    <p><strong>Técnico Externo:</strong> ${externalTechnician}</p>
    <p><strong>Horario:</strong> 9:00 AM - 8:00 PM</p>
    <button class="btn edit-btn" data-week="${assignment.semana}">Editar</button>
</div>
</div>
`;



    rotationIndex++; // Actualizar índice de rotación
    lastAssignedIndex++; // Aumentar el índice de la última semana asignada

    // Actualizar la barra de progreso
    progressBar.style.width = `${(lastAssignedIndex / totalWeeks) * 100}%`;

    // Guardar la asignación en Google Sheets
    google.script.run.withFailureHandler(errorHandler).saveAssignmentToGoogleSheet(assignment);
}

function errorHandler(error) {
    alert('Error: ' + error.message);
}

assignButton.addEventListener('click', assignWeek);

prevMonthButton.addEventListener('click', () => {
currentDate.setMonth(currentDate.getMonth() - 1);
lastAssignedIndex = 0; // Reiniciar el índice de asignaciones al cambiar de mes
progressBar.style.width = '0%'; // Reiniciar la barra de progreso
renderCalendar(currentDate);
});

nextMonthButton.addEventListener('click', () => {
currentDate.setMonth(currentDate.getMonth() + 1);
lastAssignedIndex = 0; // Reiniciar el índice de asignaciones al cambiar de mes
progressBar.style.width = '0%'; // Reiniciar la barra de progreso
renderCalendar(currentDate);
});


// Cargar asignaciones existentes al cargar la página
window.onload = function() {
    renderCalendar(currentDate);
   
};

function renderExistingAssignments(assignments) {
// Toma sólo la última asignación
const lastAssignment = assignments[assignments.length - 1];

if (lastAssignment) {
assignmentsDiv.innerHTML = `
    <div class="assignment" data-week="${lastAssignment.semana}">
        <div class="title">Semana: ${lastAssignment.semana} (${lastAssignment.mes})</div>
        <div class="details">
            <p><strong>Técnico en Red:</strong> ${lastAssignment.tecnicoRed}</p>
            <p><strong>Ingeniero:</strong> ${lastAssignment.ingeniero}</p>
            <p><strong>Técnico Externo:</strong> ${lastAssignment.tecnicoExterno}</p>
            <p><strong>Horario:</strong> ${lastAssignment.horario}</p>
            <button class="btn edit-btn" data-week="${lastAssignment.semana}">Editar</button>
        </div>
    </div>
`;
} else {
assignmentsDiv.innerHTML = '<p>No hay asignaciones disponibles.</p>';
}
}

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('edit-btn')) {
        const week = event.target.dataset.week;
        openEditModal(week);
    }
});

function openEditModal(week) {
const modal = document.createElement('div');
modal.innerHTML = `
<div class="modal-overlay active" id="modalOverlay"></div>
<div class="modal active" id="editModal">
    <div class="modal-header">Editar Turnos - ${week}</div>
    <div class="modal-body">
        <label for="networkTechnician">Técnico en Red:</label>
        <select id="networkTechnician">
            ${networkTechnicians.map(name => `<option value="${name}">${name}</option>`).join('')}
        </select>
        <label for="engineer">Ingeniero:</label>
        <select id="engineer">
            ${engineers.map(name => `<option value="${name}">${name}</option>`).join('')}
        </select>
        <label for="externalTechnician">Técnico Externo:</label>
        <select id="externalTechnician">
            ${externalTechnicians.map(name => `<option value="${name}">${name}</option>`).join('')}
        </select>
    </div>
    <div class="modal-footer">
        <button class="btn" id="saveChanges">Guardar</button>
        <button class="btn" id="closeModal">Cancelar</button>
    </div>
</div>
`;

document.body.appendChild(modal);

// Cargar los valores actuales en el modal
const existingAssignment = document.querySelector(`.assignment[data-week="${week}"]`);
if (existingAssignment) {
document.getElementById('networkTechnician').value = existingAssignment.querySelector('p:nth-child(1)').textContent.split(': ')[1];
document.getElementById('engineer').value = existingAssignment.querySelector('p:nth-child(2)').textContent.split(': ')[1];
document.getElementById('externalTechnician').value = existingAssignment.querySelector('p:nth-child(3)').textContent.split(': ')[1];
}

document.getElementById('closeModal').addEventListener('click', closeEditModal);

document.getElementById('saveChanges').addEventListener('click', () => {
const newTechnician = document.getElementById('networkTechnician').value;
const newEngineer = document.getElementById('engineer').value;
const newExternalTechnician = document.getElementById('externalTechnician').value;

// Actualizar en la interfaz
updateAssignment(week, newTechnician, newEngineer, newExternalTechnician);

// Enviar los cambios a Google Sheets
google.script.run.updateAssignmentInGoogleSheet(
    week,
    newTechnician,
    newEngineer,
    newExternalTechnician
);

closeEditModal();
});
}



function closeEditModal() {
    const overlay = document.getElementById('modalOverlay');
    const modal = document.getElementById('editModal');
    if (overlay) overlay.remove();
    if (modal) modal.remove();
}

function updateAssignment(week, tecnicoRed, ingeniero, tecnicoExterno) {
const assignment = document.querySelector(`.assignment[data-week="${week}"]`);
if (assignment) {
assignment.querySelector('p:nth-child(1)').innerHTML = `<strong>Técnico en Red:</strong> ${tecnicoRed}`;
assignment.querySelector('p:nth-child(2)').innerHTML = `<strong>Ingeniero:</strong> ${ingeniero}`;
assignment.querySelector('p:nth-child(3)').innerHTML = `<strong>Técnico Externo:</strong> ${tecnicoExterno}`;
}
}

assignButton.addEventListener('click', () => {
// Datos dinámicos de la asignación
const assignment = {
semana: "30 - 5",
mes: "Enero",
tecnicoRed: "Carlos",
ingeniero: "Gonzalo",
tecnicoExterno: "Cristian",
horario: "9:00 AM - 8:00 PM"
};

// Llamada al backend para guardar la asignación y enviar correos
google.script.run.saveAssignmentToGoogleSheet(assignment);
});

function testSendEmail() {
const testAssignment = {
semana: "30 - 5",
mes: "Enero",
tecnicoRed: "Carlos",
ingeniero: "Gonzalo",
tecnicoExterno: "Cristian",
horario: "9:00 AM - 8:00 PM"
};

sendEmailNotification(testAssignment);
}

function showCustomAlert(message) {
const customAlert = document.getElementById('customAlert');
const customAlertMessage = document.getElementById('customAlertMessage');
const customAlertClose = document.getElementById('customAlertClose');

// Configurar el mensaje
customAlertMessage.textContent = message;

// Mostrar el modal
customAlert.classList.remove('hidden');

// Cerrar el modal al hacer clic en "Aceptar"
customAlertClose.addEventListener('click', () => {
customAlert.classList.add('hidden');
});
}

// Usar el modal en lugar de alert
assignButton.addEventListener('click', () => {
const allWeeksAssigned = lastAssignedIndex >= totalWeeks; // Simulando la lógica actual
if (allWeeksAssigned) {
showCustomAlert('Todas las semanas ya han sido asignadas.');
return;
}

// Lógica para asignar la semana
assignWeek();
});

let weekAssignments = {}; // Objeto para rastrear asignaciones por semana

function assignWeek() {
const days = [...calendar.children].filter(day => !day.classList.contains('header')); // Filtrar días sin cabeceras
const totalWeeks = Math.ceil(days.length / 7); // Calcular semanas totales en el calendario

if (lastAssignedIndex >= totalWeeks) {
showCustomAlert('Todas las semanas ya han sido asignadas.');
return;
}

const weekStart = lastAssignedIndex * 7; // Índice de inicio de la semana
const weekDays = days.slice(weekStart, weekStart + 7); // Obtener días de la semana actual

// Marcar visualmente la semana actual
days.forEach(day => day.classList.remove('week-assigned')); // Desmarcar semanas anteriores
weekDays.forEach(day => day.classList.add('week-assigned'));

const startDay = weekDays[0].textContent; // Primer día de la semana
const endDay = weekDays[weekDays.length - 1].textContent; // Último día de la semana
const currentMonth = monthYearDisplay.textContent; // Mes actual
const weekKey = `${startDay}-${endDay}-${currentMonth}`; // Clave única para identificar la semana

let assignment;

// Verificar si ya existe una asignación para esta semana
if (weekAssignments[weekKey]) {
assignment = weekAssignments[weekKey]; // Usar la asignación existente
} else {
// Asignar nuevos empleados si no existe una asignación previa
const technician = networkTechnicians[rotationIndex % networkTechnicians.length];
const engineer = engineers[rotationIndex % engineers.length];
const externalTechnician = externalTechnicians[rotationIndex % externalTechnicians.length];

assignment = {
    semana: `Semana ${startDay} - ${endDay}`,
    mes: currentMonth,
    tecnicoRed: technician,
    ingeniero: engineer,
    tecnicoExterno: externalTechnician,
    horario: "9:00 AM - 8:00 PM"
};

// Guardar la asignación en el objeto global
weekAssignments[weekKey] = assignment;
rotationIndex++; // Actualizar índice de rotación
}

// Mostrar la asignación actual
assignmentsDiv.innerHTML = `
<div class="assignment" data-week="${assignment.semana}">
    <div class="title">Semana: ${assignment.semana} (${assignment.mes})</div>
    <div class="details">
        <p><strong>Técnico en Red:</strong> ${assignment.tecnicoRed}</p>
        <p><strong>Ingeniero:</strong> ${assignment.ingeniero}</p>
        <p><strong>Técnico Externo:</strong> ${assignment.tecnicoExterno}</p>
        <p><strong>Horario:</strong> ${assignment.horario}</p>
        <button class="btn edit-btn" data-week="${assignment.semana}">Editar</button>
    </div>
</div>
`;

lastAssignedIndex++; // Aumentar el índice de la última semana asignada

// Actualizar la barra de progreso
progressBar.style.width = `${(lastAssignedIndex / totalWeeks) * 100}%`;

// Guardar la asignación en Google Sheets
google.script.run.withFailureHandler(errorHandler).saveAssignmentToGoogleSheet(assignment);
}


