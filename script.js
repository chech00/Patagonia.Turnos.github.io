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
      ];
      const feriadosMoviles = obtenerFeriadosMoviles(year);
      return [...feriadosFijos, ...feriadosMoviles];
    }

    let tecnicosRed = [];
    let ingenieros = [];
    let plantaExterna = [];

    let additionalTelegram = {}; 
    const employeeColors = {
      "Fabian H.": "#2e5e7e",
      "Marco V.": "#2e5e7e",
      "Gonzalo S.": "#1b448b",
      "Patricio G.": "#1b448b",
      "Cristian V.": "#176fe1"
    };
    const employeesTelegram = {};

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

    const manageAdditionalBtn = document.getElementById("manage-additional-btn");
    const manageAdditionalModal = document.getElementById("manage-additional-modal");
    const closeAdditionalModal = document.getElementById("close-additional-modal");
    const contactNameInput = document.getElementById("contact-name");
    const contactIdInput = document.getElementById("contact-id");
    const saveContactBtn = document.getElementById("save-contact");

    const manageEmpleadosBtn = document.getElementById("manage-empleados-btn");
    const manageEmpleadosModal = document.getElementById("manage-empleados-modal");
    const closeEmpleadosModal = document.getElementById("close-empleados-modal");
    const empleadoNameInput = document.getElementById("empleado-name");
    const empleadoRolSelect = document.getElementById("empleado-rol");
    const empleadoChatIdInput = document.getElementById("empleado-chatid");
    const saveEmpleadoBtn = document.getElementById("save-empleado");

    const editContactBtn = document.getElementById("edit-contact-btn");
    const deleteContactBtn = document.getElementById("delete-contact-btn");
    let editIndex = null;

    const empleadosSelect = document.getElementById("empleados-select");
    const editEmployeeBtn = document.getElementById("edit-employee-btn");
    const deleteEmployeeBtn = document.getElementById("delete-employee-btn");

    // Listener para habilitar/deshabilitar botones editar/eliminar en contactos
    const contactSelect = document.getElementById("contact-select");
    contactSelect.addEventListener("change", function() {
      if (this.value) {
        editContactBtn.disabled = false;
        deleteContactBtn.disabled = false;
      } else {
        editContactBtn.disabled = true;
        deleteContactBtn.disabled = true;
      }
    });

    function renderizarContactosEnSelect() {
      const contactSelect = document.getElementById("contact-select");
      contactSelect.innerHTML = `<option value="">-- Seleccione un contacto --</option>`;
      Object.keys(additionalTelegram).forEach(nombre => {
        const option = document.createElement("option");
        option.value = nombre;
        option.textContent = nombre;
        contactSelect.appendChild(option);
      });
      editContactBtn.disabled = true;
      deleteContactBtn.disabled = true;
    }

    function cargarYOrganizarEmpleados() {
      return leerEmpleados().then(empleados => {
        tecnicosRed = [];
        ingenieros = [];
        plantaExterna = [];

        empleados.forEach(emp => {
          switch(emp.rol) {
            case "Técnico de Red":
              tecnicosRed.push(emp.nombre);
              break;
            case "Ingeniero":
              ingenieros.push(emp.nombre);
              break;
            case "Planta Externa":
              plantaExterna.push(emp.nombre);
              break;
          }
        });

        empleados.forEach(emp => {
          employeesTelegram[emp.nombre] = emp.telegramChatId;
          if(emp.color) {
            employeeColors[emp.nombre] = emp.color;
          }
        });

        console.log("Empleados organizados:", {tecnicosRed, ingenieros, plantaExterna});
      });
    }

    function cargarEmpleadosEnSelect(selectId, empleados) {
      const selectElement = document.getElementById(selectId);
      selectElement.innerHTML = "";
      empleados.forEach(nombre => {
        const option = document.createElement("option");
        option.value = nombre;
        option.textContent = nombre;
        selectElement.appendChild(option);
      });
    }

    function cargarEmpleadosEnLista() {
      leerEmpleados().then(empleados => {
      }).catch(error => {
        console.error("Error al cargar empleados para la lista:", error);
      });
    }

    function cargarEmpleadosEnSelectGeneral() {
      empleadosSelect.innerHTML = `<option value="">-- Seleccione un empleado --</option>`;
      leerEmpleados().then(empleados => {
        empleados.forEach(emp => {
          const option = document.createElement("option");
          option.value = emp.nombre;
          option.textContent = `${emp.nombre} - ${emp.rol}`;
          empleadosSelect.appendChild(option);
        });
      }).catch(error => {
        console.error("Error al cargar empleados en select:", error);
      });
    }

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
      const fechasSemana = [];
      diasSemana.forEach(td => {
        const fechaStr = td.getAttribute("data-fecha");
        fechasSemana.push(fechaStr);
      });

      const asignacion = { tecnico, ingeniero, planta };
      guardarAsignacionEnFirestore(asignacion, semanaActual, currentYear, currentMonth, fechasSemana);

      sendEmailNotification({ tecnico, ingeniero, planta });
      semanaActual++;
      resaltarSemanaActual();
      if (linearContainer.style.display === "block") {
        generarVistaLineal();
      }
    }

    function sendEmailNotification(turnosSemana) {
      cargarContactosDesdeFirestore()
        .then((contactos) => {
          additionalTelegram = contactos;
          const messageTecnico = `Hola ${turnosSemana.tecnico},
Felicidades!! se te ha asignado el turno de esta semana.\nIngeniero: ${turnosSemana.ingeniero}\nPlanta: ${turnosSemana.planta}`;

          sendTelegramNotification(turnosSemana.tecnico, messageTecnico);
          sendTelegramNotification(turnosSemana.ingeniero, `Hola ${turnosSemana.ingeniero},Felicidades!! se te ha asignado el turno de esta semana.`);
          sendTelegramNotification(turnosSemana.planta, `Hola ${turnosSemana.planta},Felicidades!! se te ha asignado el turno de esta semana.`);

          Object.keys(additionalTelegram).forEach(nombre => {
            const chatId = additionalTelegram[nombre];
            const mensajeAdicional = `${nombre}: Los encargados del turno de la semana actual son:\nTécnico: ${turnosSemana.tecnico}\nIngeniero: ${turnosSemana.ingeniero}\nPlanta: ${turnosSemana.planta}`;
            sendTelegramNotificationConChatId(chatId, mensajeAdicional);
          });
        })
        .catch(error => console.error("Error cargando contactos:", error));
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      })
      .then(response => response.json())
      .then(data => console.log(`Mensaje de Telegram enviado a ${employeeName}:`, data))
      .catch(error => console.error(`Error al enviar mensaje a ${employeeName}:`, error));
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      })
      .then(response => response.json())
      .then(data => console.log(`Mensaje de Telegram enviado al chat ${chatId}:`, data))
      .catch(error => console.error(`Error al enviar mensaje al chat ${chatId}:`, error));
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
  cargarAsignacionesGuardadas(currentMonth, currentYear); // Cargar asignaciones guardadas
});

document.getElementById("next-month").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  generarCalendario(currentMonth, currentYear);
  cargarAsignacionesGuardadas(currentMonth, currentYear); // Cargar asignaciones guardadas
});


    openEditBtn.addEventListener("click", () => {
      cargarYOrganizarEmpleados().then(() => {
        cargarEmpleadosEnSelect("edit-tecnico", tecnicosRed);
        cargarEmpleadosEnSelect("edit-ingeniero", ingenieros);
        cargarEmpleadosEnSelect("edit-planta", plantaExterna);
        editModal.style.display = "flex";
      }).catch(error => {
        console.error("Error al cargar empleados:", error);
      });
    });

    closeModalBtn.addEventListener("click", () => {
      editModal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
      if (event.target === editModal) {
        editModal.style.display = "none";
      }
    });

    manageAdditionalBtn.addEventListener("click", () => {
      cargarContactosDesdeFirestore()
        .then((contactos) => {
          additionalTelegram = contactos;
          renderizarContactosEnSelect();
          manageAdditionalModal.style.display = "flex";
        })
        .catch(error => {
          console.error("Error al cargar contactos:", error);
        });
    });

    closeAdditionalModal.addEventListener("click", () => {
      manageAdditionalModal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
      if (event.target === manageAdditionalModal) {
        manageAdditionalModal.style.display = "none";
      }
    });

    deleteContactBtn.addEventListener("click", () => {
      const selected = contactSelect.value;
      if (!selected) return;

      eliminarContactoEnFirestore(selected)
        .then(() => {
          alert("Contacto eliminado correctamente.");
          return cargarContactosDesdeFirestore();
        })
        .then((contactos) => {
          additionalTelegram = contactos;
          renderizarContactosEnSelect();
          contactSelect.value = "";
          editContactBtn.disabled = true;
          deleteContactBtn.disabled = true;
        })
        .catch(error => console.error("Error al eliminar contacto:", error));
    });

    editContactBtn.addEventListener("click", () => {
      const selected = contactSelect.value;
      if (!selected) return;

      contactNameInput.value = selected;
      contactIdInput.value = additionalTelegram[selected] || "";
    });

    saveContactBtn.addEventListener("click", () => {
      const nombre = contactNameInput.value.trim();
      const chatId = contactIdInput.value.trim();
      if (!nombre || !chatId) {
        alert("Por favor, ingrese nombre y chat ID.");
        return;
      }
      guardarContactoEnFirestore(nombre, chatId)
        .then(() => cargarContactosDesdeFirestore())
        .then((contactos) => {
          additionalTelegram = contactos;
          renderizarContactosEnSelect();
          contactNameInput.value = "";
          contactIdInput.value = "";
          contactSelect.value = "";
          editContactBtn.disabled = true;
          deleteContactBtn.disabled = true;
        })
        .catch(error => {
          console.error("Error al guardar contacto en Firestore:", error);
        });
    });

    manageEmpleadosBtn.addEventListener("click", () => {
      cargarEmpleadosEnSelectGeneral();
      cargarEmpleadosEnLista();
      manageEmpleadosModal.style.display = "flex";
    });

    closeEmpleadosModal.addEventListener("click", () => {
      manageEmpleadosModal.style.display = "none";
    });

    empleadosSelect.addEventListener("change", function() {
      const seleccionado = this.value;
      if (seleccionado) {
        editEmployeeBtn.disabled = false;
        deleteEmployeeBtn.disabled = false;
      } else {
        editEmployeeBtn.disabled = true;
        deleteEmployeeBtn.disabled = true;
      }
    });

    editEmployeeBtn.addEventListener("click", () => {
      const seleccionado = empleadosSelect.value;
      if (!seleccionado) return;
      leerEmpleados().then(empleados => {
        const emp = empleados.find(e => e.nombre === seleccionado);
        if(emp) {
          empleadoNameInput.value = emp.nombre;
          empleadoRolSelect.value = emp.rol;
          empleadoChatIdInput.value = emp.telegramChatId;
        }
      }).catch(error => console.error(error));
    });

    deleteEmployeeBtn.addEventListener("click", () => {
      const seleccionado = empleadosSelect.value;
      if (!seleccionado) return;
      eliminarEmpleado(seleccionado)
        .then(() => {
          alert("Empleado eliminado correctamente.");
          return cargarYOrganizarEmpleados();
        })
        .then(() => {
          cargarEmpleadosEnSelectGeneral();
          cargarEmpleadosEnLista();
          if(editModal.style.display === "flex") {
            cargarEmpleadosEnSelect("edit-tecnico", tecnicosRed);
            cargarEmpleadosEnSelect("edit-ingeniero", ingenieros);
            cargarEmpleadosEnSelect("edit-planta", plantaExterna);
          }
        })
        .catch(error => console.error("Error al eliminar empleado:", error));
    });

    saveEmpleadoBtn.addEventListener("click", () => {
      const nombre = empleadoNameInput.value.trim();
      const rol = empleadoRolSelect.value;
      const telegramChatId = empleadoChatIdInput.value.trim();
      if (!nombre || !telegramChatId) {
        alert("Por favor, ingrese nombre y chat ID.");
        return;
      }
      guardarEmpleadoEnFirestore(nombre, rol, telegramChatId)
        .then(() => {
          alert("Empleado guardado correctamente.");
          empleadoNameInput.value = "";
          empleadoChatIdInput.value = "";
          manageEmpleadosModal.style.display = "none";
          return cargarYOrganizarEmpleados();
        })
        .then(() => {
          cargarEmpleadosEnSelectGeneral();
          cargarEmpleadosEnLista();
          if(editModal.style.display === "flex") {
            cargarEmpleadosEnSelect("edit-tecnico", tecnicosRed);
            cargarEmpleadosEnSelect("edit-ingeniero", ingenieros);
            cargarEmpleadosEnSelect("edit-planta", plantaExterna);
          }
        })
        .catch(error => {
          console.error("Error al guardar empleado:", error);
        });
    });

    document.addEventListener("DOMContentLoaded", () => {
      cargarContactosDesdeFirestore()
        .then((contactos) => {
          additionalTelegram = contactos;
          renderizarContactosEnSelect();
        })
        .catch(error => {
          console.error("Error al cargar contactos desde Firestore:", error);
        });
      cargarYOrganizarEmpleados()
        .then(() => {
          generarCalendario(currentMonth, currentYear);
          // Cargar asignaciones guardadas y luego configurar el evento del botón
          return cargarAsignacionesGuardadas(currentMonth, currentYear);
        })
        .then(() => {
          assignTurnsBtn.addEventListener("click", asignarTurnos);
          calendarViewBtn.disabled = true;
          inicializarAutomatizacion();
        })
        .catch(error => {
          console.error("Error al inicializar la página:", error);
        });
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

    // Nueva funcionalidad: Búsqueda de asignación por fecha
    document.getElementById("search-button").addEventListener("click", () => {
      const dateInput = document.getElementById("search-date").value;
      const resultDiv = document.getElementById("search-result");
      resultDiv.innerHTML = ""; // Limpiar resultados anteriores

      if (!dateInput) {
        resultDiv.textContent = "Por favor, ingrese una fecha válida.";
        return;
      }

      const fechaBuscada = new Date(dateInput);

      // Consultar todas las asignaciones para luego filtrar por fecha.
      db.collection('AsignacionesSemanales').get()
        .then(querySnapshot => {
          let encontrado = false;
          querySnapshot.forEach(doc => {
            const data = doc.data();
            const inicio = new Date(data.fechaInicio);
            const fin = new Date(data.fechaFin);

            // Verifica si la fecha buscada está entre la fecha de inicio y fin
            if (fechaBuscada >= inicio && fechaBuscada <= fin) {
              encontrado = true;
              resultDiv.innerHTML = `
                <h3>Semana ${data.semana} (${data.fechaInicio} - ${data.fechaFin})</h3>
                <p><strong>Técnico:</strong> ${data.tecnico}</p>
                <p><strong>Ingeniero:</strong> ${data.ingeniero}</p>
                <p><strong>Planta Externa:</strong> ${data.planta}</p>
              `;
            }
          });
          if (!encontrado) {
            resultDiv.textContent = "No se encontró ninguna asignación para la fecha ingresada.";
          }
        })
        .catch(error => {
          console.error("Error al buscar asignaciones:", error);
          resultDiv.textContent = "Ocurrió un error al buscar la asignación.";
        });
    });

    function cargarAsignacionesGuardadas(mes, año) {
      return db.collection('AsignacionesSemanales')
        .where('mes', '==', mes)
        .where('año', '==', año)
        .get()
        .then(querySnapshot => {
          let ultimaSemanaAsignada = -1;
          querySnapshot.forEach(doc => {
            const data = doc.data();
            const semanaIndex = data.semana - 1;
            
            // Almacenar la asignación recuperada en asignacionesManual.
            asignacionesManual[semanaIndex] = {
              tecnico: data.tecnico,
              ingeniero: data.ingeniero,
              planta: data.planta
            };

            // Actualizar el calendario para esa semana.
            const filas = document.querySelectorAll("#calendar tbody tr");
            if(filas[semanaIndex]) {
              const fila = filas[semanaIndex];
              const dias = fila.querySelectorAll("td");
              dias.forEach((dia) => {
                const nombresDiv = dia.querySelectorAll(".nombre");
                if (nombresDiv.length === 3) {
                  nombresDiv[0].textContent = data.tecnico;
                  nombresDiv[0].style.backgroundColor = employeeColors[data.tecnico] || "#FFFFFF";
                  nombresDiv[1].textContent = data.ingeniero;
                  nombresDiv[1].style.backgroundColor = employeeColors[data.ingeniero] || "#FFFFFF";
                  nombresDiv[2].textContent = data.planta;
                  nombresDiv[2].style.backgroundColor = employeeColors[data.planta] || "#FFFFFF";
                }
              });
              fila.classList.add("assigned-week");
            }

            if (semanaIndex > ultimaSemanaAsignada) {
              ultimaSemanaAsignada = semanaIndex;
            }
          });

          semanaActual = ultimaSemanaAsignada + 1;
        })
        .catch(error => {
          console.error("Error al cargar asignaciones guardadas:", error);
        });
    }
          
          // Validación para contactos adicionales
saveContactBtn.addEventListener("click", () => {
  const nombre = contactNameInput.value.trim();
  const chatId = contactIdInput.value.trim();

  // Limpiar errores anteriores
  const errorElements = document.querySelectorAll(".error-message");
  errorElements.forEach(el => el.remove());

  let hasError = false;

  // Validar nombre
  if (!nombre) {
    mostrarError(contactNameInput, "Por favor, ingrese un nombre.");
    hasError = true;
  }

  // Validar ID de Telegram
  if (!chatId) {
    mostrarError(contactIdInput, "Por favor, ingrese un ID de Telegram.");
    hasError = true;
  } else if (!/^\d+$/.test(chatId)) {
    mostrarError(contactIdInput, "El ID de Telegram debe contener solo números.");
    hasError = true;
  }

  if (hasError) return;

  // Guardar contacto en Firestore
  guardarContactoEnFirestore(nombre, chatId)
    .then(() => cargarContactosDesdeFirestore())
    .then(contactos => {
      additionalTelegram = contactos;
      renderizarContactosEnSelect();
      contactNameInput.value = "";
      contactIdInput.value = "";
      contactSelect.value = "";
      editContactBtn.disabled = true;
      deleteContactBtn.disabled = true;
    })
    .catch(error => {
      console.error("Error al guardar contacto en Firestore:", error);
    });
});

// Validación para empleados
saveEmpleadoBtn.addEventListener("click", () => {
  const nombre = empleadoNameInput.value.trim();
  const rol = empleadoRolSelect.value;
  const telegramChatId = empleadoChatIdInput.value.trim();

  // Limpiar errores anteriores
  const errorElements = document.querySelectorAll(".error-message");
  errorElements.forEach(el => el.remove());

  let hasError = false;

  // Validar nombre
  if (!nombre) {
    mostrarError(empleadoNameInput, "Por favor, ingrese un nombre.");
    hasError = true;
  }

  // Validar ID de Telegram
  if (!telegramChatId) {
    mostrarError(empleadoChatIdInput, "Por favor, ingrese un ID de Telegram.");
    hasError = true;
  } else if (!/^\d+$/.test(telegramChatId)) {
    mostrarError(empleadoChatIdInput, "El ID de Telegram debe contener solo números.");
    hasError = true;
  }

  if (hasError) return;

  // Guardar empleado en Firestore
  guardarEmpleadoEnFirestore(nombre, rol, telegramChatId)
    .then(() => {
      alert("Empleado guardado correctamente.");
      empleadoNameInput.value = "";
      empleadoChatIdInput.value = "";
      manageEmpleadosModal.style.display = "none";
      return cargarYOrganizarEmpleados();
    })
    .then(() => {
      cargarEmpleadosEnSelectGeneral();
      cargarEmpleadosEnLista();
      if (editModal.style.display === "flex") {
        cargarEmpleadosEnSelect("edit-tecnico", tecnicosRed);
        cargarEmpleadosEnSelect("edit-ingeniero", ingenieros);
        cargarEmpleadosEnSelect("edit-planta", plantaExterna);
      }
    })
    .catch(error => {
      console.error("Error al guardar empleado:", error);
    });
});

// Función para mostrar mensajes de error
function mostrarError(inputElement, message) {
  const errorMessage = document.createElement("span");
  errorMessage.className = "error-message";
  errorMessage.style.color = "var(--color-error)";
  errorMessage.style.fontSize = "0.9rem";
  errorMessage.style.marginTop = "4px";
  errorMessage.textContent = message;

  inputElement.parentElement.appendChild(errorMessage);
}
