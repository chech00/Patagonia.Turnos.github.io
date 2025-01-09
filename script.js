  // --- Funciones para calcular feriados móviles y formatear fechas ---
    function calcularPascua(year) {
      let a = year % 19;
      let b = Math.floor(year / 100);
      let c = year % 100;
      let d = Math.floor(b / 4);
      let e = b % 4;
      let f = Math.floor((b + 8) / 25);
      let g = Math.floor((b - f + 1) / 3);
      let h = (19 * a + b - d - g + 15) % 30;
      let i = Math.floor(c / 4);
      let k = c % 4;
      let l = (32 + 2 * e + 2 * i - h - k) % 7;
      let m = Math.floor((a + 11 * h + 22 * l) / 451);
      let month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
      let day = ((h + l - 7 * m + 114) % 31) + 1;
      return new Date(year, month, day);
    }
    function obtenerFeriadosMoviles(year) {
      const pascua = calcularPascua(year);
      const viernesSanto = new Date(pascua);
      viernesSanto.setDate(pascua.getDate() - 2);
      const sabadoSanto = new Date(pascua);
      sabadoSanto.setDate(pascua.getDate() - 1);
      return [
        { fecha: formatDate(viernesSanto), nombre: "Viernes Santo" },
        { fecha: formatDate(sabadoSanto), nombre: "Sábado Santo" }
      ];
    }
    function formatDate(date) {
      const year = date.getFullYear();
      const month = (`0${date.getMonth() + 1}`).slice(-2);
      const day = (`0${date.getDate()}`).slice(-2);
      return `${year}-${month}-${day}`;
    }
    function generarFeriados(year) {
      const feriadosFijos = [
        { fecha: `${year}-01-01`, nombre: "Año Nuevo" },
        { fecha: `${year}-05-01`, nombre: "Día del Trabajador" },
        { fecha: `${year}-05-21`, nombre: "Día de las Glorias Navales" },
        { fecha: `${year}-06-29`, nombre: "San Pedro y San Pablo" },
        { fecha: `${year}-07-16`, nombre: "Virgen del Carmen" },
        { fecha: `${year}-08-15`, nombre: "Asunción de la Virgen" },
        { fecha: `${year}-10-12`, nombre: "Encuentro de Dos Mundos" },
        { fecha: `${year}-10-31`, nombre: "Día de las Iglesias Evangélicas y Protestantes" },
        { fecha: `${year}-11-01`, nombre: "Día de Todos los Santos" },
        { fecha: `${year}-12-08`, nombre: "Inmaculada Concepción" },
        { fecha: `${year}-12-25`, nombre: "Navidad" }
      ];
      const feriadosMoviles = obtenerFeriadosMoviles(year);
      return [...feriadosFijos, ...feriadosMoviles];
    }

    // --- Variables Globales y Mapeos ---
    let additionalTelegram = {}; 
    const employeeColors = {
      "Fabián H.":   "#d53206", // Índigo
      "Marco V.":    "#176795",
      "Gonzalo S.":  "#0fb733", // Cian Claro
      "Patricio G.": "#11615a",
      "Cristian V.": "#3c137b"
    };
    const employeesTelegram = {
      // Mapea nombres de empleados a sus chat IDs de Telegram aquí
    };
    const tecnicosRed   = ["Fabián H.", "Marco V."];
    const ingenieros    = ["Gonzalo S.", "Patricio G."];
    const plantaExterna = ["Cristian V."];

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let semanaActual = 0;
    let asignacionesManual = {};

    const calendarTitle = document.getElementById("calendar-title");
    const calendarBody = document.querySelector("#calendar tbody");
    const openEditBtn = document.getElementById("open-edit-modal");
    const editModal = document.getElementById("edit-modal");
    const closeModalBtn = document.querySelector(".close-modal");
    const updateWeekBtn = document.getElementById("update-week");
    const assignTurnsBtn = document.getElementById("assign-turns");
    const calendarViewBtn = document.getElementById("calendar-view-btn");
    const linearViewBtn = document.getElementById("linear-view-btn");
    const calendarContainer = document.querySelector(".calendar-container");
    const linearContainer = document.getElementById("linear-view");
    const linearList = document.getElementById("linear-list");
    const externalArrow = document.getElementById("external-arrow");

    // Elementos para la gestión de contactos adicionales
    const manageAdditionalBtn = document.getElementById("manage-additional-btn");
    const manageAdditionalModal = document.getElementById("manage-additional-modal");
    const closeAdditionalModal = document.getElementById("close-additional-modal");
    const contactNameInput = document.getElementById("contact-name");
    const contactIdInput = document.getElementById("contact-id");
    const saveContactBtn = document.getElementById("save-contact");
    let editIndex = null;

    // --- Cargar y guardar contactos ---
    function cargarContactos() {
      const almacenados = localStorage.getItem("additionalTelegram");
      if (almacenados) {
        additionalTelegram = JSON.parse(almacenados);
      } else {
        additionalTelegram = {
          "Carlos B.": "6346944155",
          "Roberto C.": "6346944155"
        };
      }
    }
    function guardarContactos() {
      localStorage.setItem("additionalTelegram", JSON.stringify(additionalTelegram));
    }

    // --- Actualización: Renderizar contactos en el desplegable ---
    function renderizarContactosEnSelect() {
      const contactSelect = document.getElementById("contact-select");
      // Limpiar opciones previas
      contactSelect.innerHTML = `<option value="">-- Seleccione un contacto --</option>`;
      Object.keys(additionalTelegram).forEach(nombre => {
        const option = document.createElement("option");
        option.value = nombre;
        option.textContent = nombre;
        contactSelect.appendChild(option);
      });
      // Reiniciar botones de editar y eliminar
      document.getElementById("edit-contact-btn").disabled = true;
      document.getElementById("delete-contact-btn").disabled = true;
    }

    // --- Renderizar contactos --- (ya no se usa en esta versión)
    /* function renderizarContactos() {
      // Función antigua para renderizar lista simple de contactos
    } */

    // --- Función para generar el calendario ---
    function generarCalendario(mes, año) {
      calendarBody.innerHTML = "";
      const feriados = generarFeriados(año);
      const primerDiaDelMes = new Date(año, mes, 1).getDay();
      const diasEnMes = new Date(año, mes + 1, 0).getDate();
      const diasMesAnterior = new Date(año, mes, 0).getDate();
      const primerDiaSemana = primerDiaDelMes === 0 ? 7 : primerDiaDelMes;
      const inicioPrimerSemana = 1 - (primerDiaSemana - 1);
      const totalCeldas = Math.ceil((diasEnMes + primerDiaSemana - 1) / 7) * 7;
      let diaActual = inicioPrimerSemana;

      for (let i = 0; i < totalCeldas; i++) {
        if (i % 7 === 0) {
          const fila = document.createElement("tr");
          calendarBody.appendChild(fila);
        }
        const fila = calendarBody.lastChild;
        const celda = document.createElement("td");
        celda.classList.add("calendario-celda");
        let fecha;
        if (diaActual < 1) {
          const mesAnterior = mes === 0 ? 11 : mes - 1;
          const añoAnterior = mes === 0 ? año - 1 : año;
          fecha = new Date(añoAnterior, mesAnterior, diasMesAnterior + diaActual);
        } else if (diaActual > diasEnMes) {
          const mesSiguiente = mes === 11 ? 0 : mes + 1;
          const añoSiguiente = mes === 11 ? año + 1 : año;
          fecha = new Date(añoSiguiente, mesSiguiente, diaActual - diasEnMes);
        } else {
          fecha = new Date(año, mes, diaActual);
        }
        const fechaStr = formatDate(fecha);
        const feriado = feriados.find(f => f.fecha === fechaStr);
        celda.setAttribute('data-fecha', fechaStr);

        if (diaActual < 1) {
          celda.innerHTML = `
            <div class="dia">${diasMesAnterior + diaActual}</div>
            <div class="nombres">
              <div class="nombre"></div>
              <div class="nombre"></div>
              <div class="nombre"></div>
            </div>`;
          celda.classList.add("fuera-de-mes");
        } else if (diaActual > diasEnMes) {
          celda.innerHTML = `
            <div class="dia">${diaActual - diasEnMes}</div>
            <div class="nombres">
              <div class="nombre"></div>
              <div class="nombre"></div>
              <div class="nombre"></div>
            </div>`;
          celda.classList.add("fuera-de-mes");
        } else {
          if (feriado) {
            celda.classList.add("feriado");
            celda.innerHTML = `
              <div class="dia">${diaActual}</div>
              <div class="feriado-nombre">${feriado.nombre}</div>
              <div class="nombres">
                <div class="nombre"></div>
                <div class="nombre"></div>
                <div class="nombre"></div>
              </div>`;
          } else {
            celda.innerHTML = `
              <div class="dia">${diaActual}</div>
              <div class="nombres">
                <div class="nombre"></div>
                <div class="nombre"></div>
                <div class="nombre"></div>
              </div>`;
          }
        }
        fila.appendChild(celda);
        diaActual++;
      }
      calendarTitle.textContent =
        `${new Intl.DateTimeFormat("es-ES", { month: "long" }).format(new Date(año, mes))} ${año}`;
      semanaActual = 0;
      asignacionesManual = {};
      openEditBtn.disabled = true;
      calendarViewBtn.disabled = true;
      linearViewBtn.disabled = false;
      if (linearContainer.style.display === "block") {
        generarVistaLineal();
      }
      resaltarSemanaActual();
    }

    // --- Función para asignar turnos ---
    function asignarTurnos() {
      console.log("Asignando semana #", semanaActual);
      const filas = document.querySelectorAll("#calendar tbody tr");
      if (semanaActual >= filas.length) {
        showCustomAlert("No hay más semanas disponibles en este mes.");
        return;
      }
      filas.forEach((fila, index) => {
        if (index !== semanaActual) {
          const nombresDivs = fila.querySelectorAll(".nombre");
          nombresDivs.forEach((div) => {
            div.textContent = "";
            div.style.backgroundColor = ""; 
          });
          fila.classList.remove("assigned-week");
        }
      });

      const tecnico = tecnicosRed[semanaActual % tecnicosRed.length];
      const ingeniero = ingenieros[semanaActual % ingenieros.length];
      const planta = plantaExterna[0]; 
      const fila = filas[semanaActual];
      const dias = fila.querySelectorAll("td");
      dias.forEach((dia) => {
        const nombresDiv = dia.querySelectorAll(".nombre");
        if (nombresDiv.length === 3) {
          nombresDiv[0].textContent = tecnico;
          nombresDiv[0].style.backgroundColor = employeeColors[tecnico] || "#FFFFFF";
          nombresDiv[1].textContent = ingeniero;
          nombresDiv[1].style.backgroundColor = employeeColors[ingeniero] || "#FFFFFF";
          nombresDiv[2].textContent = planta;
          nombresDiv[2].style.backgroundColor = employeeColors[planta] || "#FFFFFF";
        }
      });
      fila.classList.add("assigned-week");
      asignacionesManual[semanaActual] = { tecnico, ingeniero, planta };
      console.log("Semana asignada:", semanaActual, asignacionesManual);
      openEditBtn.disabled = false;

      const diasSemana = fila.querySelectorAll("td");
      const fechaInicio = diasSemana.length > 0 ? diasSemana[0].getAttribute("data-fecha") : null;
      const fechaFin = diasSemana.length > 0 ? diasSemana[diasSemana.length - 1].getAttribute("data-fecha") : null;

      guardarTurnoEnSheet(semanaActual, fechaInicio, fechaFin, tecnico, ingeniero, planta);

      sendEmailNotification({ tecnico, ingeniero, planta });
      semanaActual++;
      resaltarSemanaActual();
      if (linearContainer.style.display === "block") {
        generarVistaLineal();
      }
    }

    // --- Función para guardar turno en Google Sheets ---
    function guardarTurnoEnSheet(semana, fechaInicio, fechaFin, tecnico, ingeniero, planta) {
      const url = "https://script.google.com/macros/s/AKfycbyNi9FmLzqLYh0Zd3jTDymKJvr4U2D6BIZgso6jVWqrJWtq6zqMGdLGf1Und3_-hgVUcQ/exec";
      const params = {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "guardarTurno",
          semana: semana,
          fechaInicio: fechaInicio,
          fechaFin: fechaFin,
          tecnico: tecnico,
          ingeniero: ingeniero,
          planta: planta
        })
      };
      fetch(url, params)
        .then(response => response.json())
        .then(data => {
          console.log("Turno guardado:", data);
        })
        .catch(error => {
          console.error("Error al guardar turno:", error);
        });
    }

    // --- Funciones de notificación por Telegram ---
    function sendEmailNotification(turnosSemana) {
      cargarContactos(); 
      const messageTecnico = `Hola ${turnosSemana.tecnico}, se te ha asignado el turno de esta semana.\n` +
                             `Ingeniero: ${turnosSemana.ingeniero}\n` +
                             `Planta: ${turnosSemana.planta}`;

      sendTelegramNotification(turnosSemana.tecnico, messageTecnico);
      sendTelegramNotification(turnosSemana.ingeniero, `Hola ${turnosSemana.ingeniero}, se te ha asignado el turno de esta semana.`);
      sendTelegramNotification(turnosSemana.planta, `Hola ${turnosSemana.planta}, se te ha asignado el turno de esta semana.`);

      Object.keys(additionalTelegram).forEach(nombre => {
        const chatId = additionalTelegram[nombre];
        const mensajeAdicional = `${nombre}: Los encargados del turno de la semana actual son:\n` +
                                 `Técnico: ${turnosSemana.tecnico}\n` +
                                 `Ingeniero: ${turnosSemana.ingeniero}\n` +
                                 `Planta: ${turnosSemana.planta}`;
        sendTelegramNotificationConChatId(chatId, mensajeAdicional);
      });
    }

    function sendTelegramNotification(employeeName, message) {
      const botToken = "7783582845:AAHWX4551HSQcDHRU_54r7DgJGKY9WB-I6g";
      const chatId = employeesTelegram[employeeName];
      if (!chatId) {
        console.error(`No se encontró chat ID para ${employeeName}`);
        return;
      }
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const params = {
        chat_id: chatId,
        text: message
      };
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(params)
      })
      .then(response => response.json())
      .then(data => {
        console.log(`Mensaje de Telegram enviado a ${employeeName}:`, data);
      })
      .catch(error => {
        console.error(`Error al enviar mensaje a ${employeeName}:`, error);
      });
    }

    function sendTelegramNotificationConChatId(chatId, message) {
      const botToken = "7783582845:AAHWX4551HSQcDHRU_54r7DgJGKY9WB-I6g";
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const params = {
        chat_id: chatId,
        text: message
      };
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(params)
      })
      .then(response => response.json())
      .then(data => {
        console.log(`Mensaje de Telegram enviado al chat ${chatId}:`, data);
      })
      .catch(error => {
        console.error(`Error al enviar mensaje al chat ${chatId}:`, error);
      });
    }

    updateWeekBtn.addEventListener("click", () => {
      console.log("Clic en Actualizar Semana.");
      const assignedWeeks = Object.keys(asignacionesManual);
      if (assignedWeeks.length === 0) {
        showCustomAlert("No hay semanas asignadas.");
        return;
      }
      const lastWeekIndexString = assignedWeeks[assignedWeeks.length - 1];
      const lastWeekIndex = parseInt(lastWeekIndexString, 10);
      const nuevoTecnico   = document.getElementById("edit-tecnico").value;
      const nuevoIngeniero = document.getElementById("edit-ingeniero").value;
      const nuevaPlanta    = document.getElementById("edit-planta").value;

      const filas = document.querySelectorAll("#calendar tbody tr");
      if (lastWeekIndex < 0 || lastWeekIndex >= filas.length) {
        showCustomAlert("Semana inválida.");
        return;
      }

      const asignacionAnterior = asignacionesManual[lastWeekIndex] || {};
      const { tecnico: anteriorTecnico, ingeniero: anteriorIngeniero, planta: anteriorPlanta } = asignacionAnterior;

      const fila = filas[lastWeekIndex];
      const dias = fila.querySelectorAll("td");
      dias.forEach((dia) => {
        const nombresDiv = dia.querySelectorAll(".nombre");
        if (nombresDiv.length === 3) {
          nombresDiv[0].textContent = nuevoTecnico;
          nombresDiv[0].style.backgroundColor = employeeColors[nuevoTecnico] || "#FFFFFF";
          nombresDiv[1].textContent = nuevoIngeniero;
          nombresDiv[1].style.backgroundColor = employeeColors[nuevoIngeniero] || "#FFFFFF";
          nombresDiv[2].textContent = nuevaPlanta;
          nombresDiv[2].style.backgroundColor = employeeColors[nuevaPlanta] || "#FFFFFF";
        }
      });

      asignacionesManual[lastWeekIndex] = {
        tecnico: nuevoTecnico,
        ingeniero: nuevoIngeniero,
        planta: nuevaPlanta
      };
      fila.classList.add("assigned-week");
      editModal.style.display = "none";
      console.log("Modal cerrado.");
      showCustomAlert(`La Semana #${lastWeekIndex + 1} se ha actualizado correctamente.`);
      resaltarSemanaActual();
      if (linearContainer.style.display === "block") {
        generarVistaLineal();
      }

      let mensajeCambio = `Se ha actualizado la Semana #${lastWeekIndex + 1}.\n`;
      let cambios = false;

      if (nuevoTecnico !== anteriorTecnico) {
        mensajeCambio += `Nuevo Técnico: ${nuevoTecnico}\n`;
        cambios = true;
      } else {
        mensajeCambio += `Técnico sin cambios (${nuevoTecnico})\n`;
      }

      if (nuevoIngeniero !== anteriorIngeniero) {
        mensajeCambio += `Nuevo Ingeniero: ${nuevoIngeniero}\n`;
        cambios = true;
      } else {
        mensajeCambio += `Ingeniero sin cambios (${nuevoIngeniero})\n`;
      }

      if (nuevaPlanta !== anteriorPlanta) {
        mensajeCambio += `Nueva Planta: ${nuevaPlanta}\n`;
        cambios = true;
      } else {
        mensajeCambio += `Planta sin cambios (${nuevaPlanta})\n`;
      }

      sendTelegramNotification(nuevoTecnico, mensajeCambio);
      sendTelegramNotification(nuevoIngeniero, mensajeCambio);
      sendTelegramNotification(nuevaPlanta, mensajeCambio);
      Object.keys(additionalTelegram).forEach(nombre => {
        const chatId = additionalTelegram[nombre];
        sendTelegramNotificationConChatId(chatId, mensajeCambio);
      });
    });

    document.getElementById("prev-month").addEventListener("click", () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      generarCalendario(currentMonth, currentYear);
    });

    document.getElementById("next-month").addEventListener("click", () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      generarCalendario(currentMonth, currentYear);
    });

    openEditBtn.addEventListener("click", () => {
      editModal.style.display = "flex";
    });
    closeModalBtn.addEventListener("click", () => {
      editModal.style.display = "none";
    });
    window.addEventListener("click", (event) => {
      if (event.target === editModal) {
        editModal.style.display = "none";
      }
    });

    // Gestión del modal de contactos adicionales
    manageAdditionalBtn.addEventListener("click", () => {
      cargarContactos();
      renderizarContactosEnSelect();
      manageAdditionalModal.style.display = "flex";
    });
    closeAdditionalModal.addEventListener("click", () => {
      manageAdditionalModal.style.display = "none";
    });
    window.addEventListener("click", (event) => {
      if (event.target === manageAdditionalModal) {
        manageAdditionalModal.style.display = "none";
      }
    });
    saveContactBtn.addEventListener("click", () => {
      const nombre = contactNameInput.value.trim();
      const chatId = contactIdInput.value.trim();
      if (!nombre || !chatId) {
        alert("Por favor, ingrese nombre y chat ID.");
        return;
      }
      
      if (editIndex && editIndex !== nombre) {
        delete additionalTelegram[editIndex];
      }
      
      additionalTelegram[nombre] = chatId;
      
      guardarContactos();
      renderizarContactosEnSelect();
      
      contactNameInput.value = "";
      contactIdInput.value = "";
      editIndex = null;
    });

    // Manejadores para selección, edición y eliminación de contactos
    document.getElementById("contact-select").addEventListener("change", function() {
      const seleccionado = this.value;
      const editBtn = document.getElementById("edit-contact-btn");
      const deleteBtn = document.getElementById("delete-contact-btn");
      
      if (seleccionado) {
        // Habilitar botones al haber un contacto seleccionado
        editBtn.disabled = false;
        deleteBtn.disabled = false;
      } else {
        editBtn.disabled = true;
        deleteBtn.disabled = true;
      }
    });

    document.getElementById("edit-contact-btn").addEventListener("click", () => {
      const seleccionado = document.getElementById("contact-select").value;
      if (seleccionado && additionalTelegram[seleccionado]) {
        // Llenar los inputs con los datos del contacto seleccionado para editar
        contactNameInput.value = seleccionado;
        contactIdInput.value = additionalTelegram[seleccionado];
        editIndex = seleccionado;
      }
    });

    document.getElementById("delete-contact-btn").addEventListener("click", () => {
      const seleccionado = document.getElementById("contact-select").value;
      if (seleccionado && additionalTelegram[seleccionado]) {
        // Eliminar contacto seleccionado
        delete additionalTelegram[seleccionado];
        guardarContactos();
        renderizarContactosEnSelect();
        // Limpiar selección y deshabilitar botones
        document.getElementById("contact-select").value = "";
        document.getElementById("edit-contact-btn").disabled = true;
        document.getElementById("delete-contact-btn").disabled = true;
      }
    });

    document.addEventListener("DOMContentLoaded", () => {
      generarCalendario(currentMonth, currentYear);
      assignTurnsBtn.addEventListener("click", asignarTurnos);
      calendarViewBtn.disabled = true;
      inicializarAutomatizacion();
    });

    function showCustomAlert(message) {
      const alertModal = document.getElementById("custom-alert");
      const alertMessage = document.getElementById("alert-message");
      const closeAlert = document.getElementById("close-alert");
      alertMessage.textContent = message;
      alertModal.style.display = "flex";
      closeAlert.onclick = () => {
        alertModal.style.display = "none";
      };
      window.onclick = (event) => {
        if (event.target === alertModal) {
          alertModal.style.display = "none";
        }
      };
    }

    calendarViewBtn.addEventListener("click", () => {
      calendarContainer.style.display = "block";
      linearContainer.style.display = "none";
      calendarViewBtn.disabled = true;
      linearViewBtn.disabled = false;
    });

    linearViewBtn.addEventListener("click", () => {
      calendarContainer.style.display = "none";
      linearContainer.style.display = "block";
      calendarViewBtn.disabled = false;
      linearViewBtn.disabled = true;
      generarVistaLineal();
    });

    document.addEventListener("DOMContentLoaded", () => {
      calendarViewBtn.disabled = true;
    });

    function generarVistaLineal() {
      linearList.innerHTML = "";
      Object.keys(asignacionesManual).forEach(semanaIndex => {
        const asignacion = asignacionesManual[semanaIndex];
        const fila = document.querySelector(`#calendar tbody tr:nth-child(${parseInt(semanaIndex) + 1})`);
        const fechasSemana = [];
        fila.querySelectorAll("td").forEach(td => {
          const fechaStr = td.getAttribute("data-fecha");
          fechasSemana.push(fechaStr);
        });
        const fechaInicio = new Date(fechasSemana[0]);
        const fechaFin = new Date(fechasSemana[6]);
        const opcionesFecha = { year: 'numeric', month: 'short', day: 'numeric' };
        const fechaInicioStr = fechaInicio.toLocaleDateString("es-ES", opcionesFecha);
        const fechaFinStr = fechaFin.toLocaleDateString("es-ES", opcionesFecha);
        const listItem = document.createElement("li");
        listItem.classList.add("linear-item");
        listItem.innerHTML = `
          <h3>Semana ${parseInt(semanaIndex) + 1}: ${fechaInicioStr} - ${fechaFinStr}</h3>
          <p><strong>Técnico:</strong> ${asignacion.tecnico}</p>
          <p><strong>Ingeniero:</strong> ${asignacion.ingeniero}</p>
          <p><strong>Planta Externa:</strong> ${asignacion.planta}</p>
        `;
        linearList.appendChild(listItem);
      });
      if (Object.keys(asignacionesManual).length === 0) {
        linearList.innerHTML = "<p>No hay turnos asignados para mostrar en la Vista Lineal.</p>";
      }
    }

    function obtenerSemanaActual() {
      const hoy = new Date();
      const mes = hoy.getMonth();
      const año = hoy.getFullYear();
      const primerDiaDelMes = new Date(año, mes, 1);
      const diaSemanaPrimerDia = primerDiaDelMes.getDay() === 0 ? 7 : primerDiaDelMes.getDay();
      const diaDelMes = hoy.getDate();
      return Math.floor((diaDelMes + diaSemanaPrimerDia - 2) / 7);
    }

    function resaltarSemanaActual() {
      const semanaActualIndex = obtenerSemanaActual();
      const filas = document.querySelectorAll("#calendar tbody tr");
      filas.forEach((fila, index) => {
        if (index === semanaActualIndex) {
          const celdaLunes = fila.querySelector("td");
          if (celdaLunes) {
            const diaDiv = celdaLunes.querySelector(".dia");
            if (diaDiv) {
              const filaRect = fila.getBoundingClientRect();
              const containerRect = calendarContainer.getBoundingClientRect();
              const topPosition = filaRect.top - containerRect.top + (filaRect.height / 2) - 10;
              externalArrow.style.top = `${topPosition}px`;
              externalArrow.style.display = "block";
            }
          }
        } else {
          externalArrow.style.display = "none";
        }
      });
    }

    function asignacionAutomaticaTurnos() {
      const hoy = new Date();
      const dia = hoy.getDay();
      const hora = hoy.getHours();
      const minutos = hoy.getMinutes();
      if (dia === 1 && hora === 7 && minutos === 0) {
        const semanaIndex = obtenerSemanaActual();
        if (!asignacionesManual.hasOwnProperty(semanaIndex)) {
          semanaActual = semanaIndex;
          asignarTurnos();
          console.log("Asignación automática de turnos para la semana:", semanaIndex + 1);
        }
      }
    }

    function inicializarAutomatizacion() {
      resaltarSemanaActual();
      setInterval(asignacionAutomaticaTurnos, 60000);
      const hoy = new Date();
      const dia = hoy.getDay();
      const hora = hoy.getHours();
      if (dia === 1 && hora >= 7) {
        const semanaIndex = obtenerSemanaActual();
        if (!asignacionesManual.hasOwnProperty(semanaIndex)) {
          semanaActual = semanaIndex;
          asignarTurnos();
          console.log("Asignación automática de turnos al cargar la página para la semana:", semanaIndex + 1);
        }
      }
      const observer = new MutationObserver(resaltarSemanaActual);
      observer.observe(calendarBody, { childList: true, subtree: true });
    }
