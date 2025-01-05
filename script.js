 /**
     * Calcula la fecha de Pascua para un año dado utilizando el algoritmo de Anonymous Gregorian.
     * @param {number} year - El año para el cual calcular Pascua.
     * @returns {Date} - La fecha de Pascua.
     */
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
      let month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0 = Enero
      let day = ((h + l - 7 * m + 114) % 31) + 1;

      return new Date(year, month, day);
    }

    /**
     * Obtiene las fechas de Viernes Santo y Sábado Santo para un año dado.
     * @param {number} year - El año para el cual obtener las fechas.
     * @returns {Array} - Un arreglo con dos elementos: Viernes Santo y Sábado Santo.
     */
    function obtenerFeriadosMoviles(year) {
      const pascua = calcularPascua(year);
      const viernesSanto = new Date(pascua);
      viernesSanto.setDate(pascua.getDate() - 2); // Dos días antes de Pascua

      const sabadoSanto = new Date(pascua);
      sabadoSanto.setDate(pascua.getDate() - 1); // Un día antes de Pascua

      return [
        { fecha: formatDate(viernesSanto), nombre: "Viernes Santo" },
        { fecha: formatDate(sabadoSanto), nombre: "Sábado Santo" }
      ];
    }

    /**
     * Formatea una fecha al formato YYYY-MM-DD.
     * @param {Date} date - La fecha a formatear.
     * @returns {string} - La fecha en formato YYYY-MM-DD.
     */
    function formatDate(date) {
      const year = date.getFullYear();
      const month = (`0${date.getMonth() + 1}`).slice(-2); // Mes en 0-11
      const day = (`0${date.getDate()}`).slice(-2);
      return `${year}-${month}-${day}`;
    }

    /**
     * Genera una lista de feriados para Chile para un año dado.
     * @param {number} year - El año para el cual generar los feriados.
     * @returns {Array} - Un arreglo de objetos con `fecha` y `nombre` de cada feriado.
     */
    function generarFeriados(year) {
      // Feriados Fijos
      const feriadosFijos = [
        { fecha: `${year}-01-01`, nombre: "Año Nuevo" },
        { fecha: `${year}-05-01`, nombre: "Día del Trabajador" },
        { fecha: `${year}-05-21`, nombre: "Día de las Glorias Navales" },
        { fecha: `${year}-06-29`, nombre: "San Pedro y San Pablo" },
        { fecha: `${year}-07-16`, nombre: "Virgen del Carmen" },
        { fecha: `${year}-08-15`, nombre: "Asunción de la Virgen" },
        { fecha: `${year}-09-18`, nombre: "Independencia Nacional" },
        { fecha: `${year}-09-1`, nombre: "Día de las Glorias del Ejército" },
        { fecha: `${year}-10-12`, nombre: "Encuentro de Dos Mundos" },
        { fecha: `${year}-10-31`, nombre: "Día de las Iglesias Evangélicas y Protestantes" },
        { fecha: `${year}-11-01`, nombre: "Día de Todos los Santos" },
        { fecha: `${year}-12-08`, nombre: "Inmaculada Concepción" },
        { fecha: `${year}-12-25`, nombre: "Navidad" }
      ];

      // Feriados Móviles
      const feriadosMoviles = obtenerFeriadosMoviles(year);

      // Combinar ambos
      return [...feriadosFijos, ...feriadosMoviles];
    }

    /******************************************************
     * MAPAS Y VARIABLES GLOBALES
     ******************************************************/
    /** 
     * Mapeo de empleados a colores para el calendario 
     */
    const employeeColors = {
      "Fabián H.":   "#FFB6C1",  // Light Pink
      "Marco V.":    "#ADD8E6",  // Light Blue
      "Gonzalo S.":  "#90EE90",  // Light Green
      "Patricio G.": "#FFD700",  // Gold
      "Cristian V.": "#D3D3D3"   // Light Gray
    };
    
    /** 
     * Mapeo de empleados a correo electrónico 
     */
    const employeesEmail = {
     
    };
    
    /** 
     * Listas de empleados para asignar 
     */
    const tecnicosRed   = ["Fabián H.", "Marco V."];
    const ingenieros    = ["Gonzalo S.", "Patricio G."];
    const plantaExterna = ["Cristian V."];
    
    /** 
     * Variables globales para control de calendario 
     */
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let semanaActual = 0; // Rastrea la semana actual a asignar
    // Objeto para guardar asignaciones: semanaIndex => { tecnico, ingeniero, planta }
    let asignacionesManual = {};
    
    // Referencias a elementos del DOM
    const calendarTitle = document.getElementById("calendar-title");
    const calendarBody = document.querySelector("#calendar tbody");
    const openEditBtn = document.getElementById("open-edit-modal");
    const editModal = document.getElementById("edit-modal");
    const closeModalBtn = document.querySelector(".close-modal");
    const updateWeekBtn = document.getElementById("update-week");
    const assignTurnsBtn = document.getElementById("assign-turns");
    
    /******************************************************
     * 1. Generar Calendario (Función Corregida y Actualizada)
     ******************************************************/
    function generarCalendario(mes, año) {
      calendarBody.innerHTML = "";

      // Generar la lista de feriados para el año actual
      const feriados = generarFeriados(año);

      const primerDiaDelMes = new Date(año, mes, 1).getDay();
      const diasEnMes = new Date(año, mes + 1, 0).getDate();
      const diasMesAnterior = new Date(año, mes, 0).getDate();

      // Ajustar para que la semana comience en lunes
      const primerDiaSemana = primerDiaDelMes === 0 ? 7 : primerDiaDelMes;
      const inicioPrimerSemana = 1 - (primerDiaSemana - 1);

      // Fórmula corregida para calcular el total de celdas
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
        
        // Calcular la fecha real de la celda
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

        // Formato YYYY-MM-DD
        const fechaStr = formatDate(fecha);

        // Verificar si la fecha es feriado
        const feriado = feriados.find(f => f.fecha === fechaStr);

        // Asignar data-fecha en formato YYYY-MM-DD
        celda.setAttribute('data-fecha', fechaStr);

        // Contenido de la celda
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

      // Título del calendario
      calendarTitle.textContent =
          `${new Intl.DateTimeFormat("es-ES", { month: "long" }).format(new Date(año, mes))} ${año}`;

      // Resetear "semanaActual" y "asignacionesManual" para el nuevo mes
      semanaActual = 0;
      asignacionesManual = {};

      // Deshabilitar el botón de editar, ya que no hay semanas asignadas
      openEditBtn.disabled = true;
    }

    /******************************************************
     * 2. Asignar Turnos (semana por semana)
     ******************************************************/
    function asignarTurnos() {
      console.log("Asignando semana #", semanaActual);

      const filas = document.querySelectorAll("#calendar tbody tr");
      
      if (semanaActual >= filas.length) {
        showCustomAlert("No hay más semanas disponibles en este mes.");
        return;
      }

      // Limpiar las celdas de semanas anteriores
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

      // Asignar turnos a la semanaActual
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

      // Marcar la semana como asignada
      fila.classList.add("assigned-week");

      // Guardar la asignación en nuestro objeto
      asignacionesManual[semanaActual] = {
        tecnico,
        ingeniero,
        planta
      };

      console.log("Semana asignada:", semanaActual, asignacionesManual);

      // Habilitar el botón "Editar Semanas", ya que hay al menos 1 semana asignada
      openEditBtn.disabled = false;

      // 3. Enviar correo a los seleccionados de la semana
      const turnosSemana = asignacionesManual[semanaActual];
      sendEmailNotification(turnosSemana);

      // Aumentar el contador para la próxima semana
      semanaActual++;
    }

    /******************************************************
     * 3. FUNCION PARA ENVIAR CORREO CON EMAILJS
     ******************************************************/
    function sendEmailNotification(turnosSemana) {
      // 1. Obtener correos de cada rol usando el objeto employeesEmail
      const tecnicoEmail   = employeesEmail[turnosSemana.tecnico];
      const ingenieroEmail = employeesEmail[turnosSemana.ingeniero];
      const plantaEmail    = employeesEmail[turnosSemana.planta];

      // 2. Combinar correos en un solo string (separados por comas)
      const toEmails = [tecnicoEmail, ingenieroEmail, plantaEmail].join(", ");

      // 3. Construir el objeto con los datos que necesita EmailJS
      const templateParams = {
        to_email:   toEmails,
        tecnico:    turnosSemana.tecnico,
        ingeniero:  turnosSemana.ingeniero,
        planta:     turnosSemana.planta
        // Puedes agregar más campos si tu template los requiere
      };

      // 4. Realizar el envío
      emailjs.send(
        "service_6g9q7ps",    // Reemplaza con tu Service ID
        "template_xtz4n5f",   // Reemplaza con tu Template ID
        templateParams
      )
      .then(function(response) {
        console.log("Correo enviado con éxito!", response.status, response.text);
        showCustomAlert("El correo fue enviado correctamente a los asignados.");
      })
      .catch(function(error) {
        console.error("Error al enviar correo:", error);
        showCustomAlert("Ocurrió un error al enviar el correo. Intenta nuevamente.");
      });
    }

    /******************************************************
     * 4. Botón "Actualizar Semana" (Edición Manual)
     ******************************************************/
    updateWeekBtn.addEventListener("click", () => {
      console.log("Clic en Actualizar Semana.");

      // 1. Encontrar la última semana asignada
      const assignedWeeks = Object.keys(asignacionesManual); 
      if (assignedWeeks.length === 0) {
        showCustomAlert("No hay semanas asignadas.");
        return;
      }
      const lastWeekIndexString = assignedWeeks[assignedWeeks.length - 1];
      const lastWeekIndex = parseInt(lastWeekIndexString, 10);

      // 2. Tomar los nuevos valores del modal
      const nuevoTecnico = document.getElementById("edit-tecnico").value;
      const nuevoIngeniero = document.getElementById("edit-ingeniero").value;
      const nuevaPlanta = document.getElementById("edit-planta").value;

      // 3. Editar las celdas de esa semana
      const filas = document.querySelectorAll("#calendar tbody tr");
      if (lastWeekIndex < 0 || lastWeekIndex >= filas.length) {
        showCustomAlert("Semana inválida.");
        return;
      }

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

      // 4. Actualizar en el objeto de asignaciones
      asignacionesManual[lastWeekIndex] = {
        tecnico: nuevoTecnico,
        ingeniero: nuevoIngeniero,
        planta: nuevaPlanta
      };

      // 5. Asegurar que la fila se marque como "assigned-week"
      fila.classList.add("assigned-week");

      // 6. Cerrar la modal
      editModal.style.display = "none";
      console.log("Modal cerrado.");

      // 7. Mostrar mensaje de confirmación
      showCustomAlert(`La Semana #${lastWeekIndex + 1} se ha actualizado correctamente.`);
    });

    /******************************************************
     * 5. Navegación de meses (Anterior / Siguiente)
     ******************************************************/
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

    /******************************************************
     * 6. Manejo de la Modal de Edición
     ******************************************************/
    openEditBtn.addEventListener("click", () => {
      editModal.style.display = "block"; // Mostrar la modal
      console.log("Modal abierto.");
    });

    closeModalBtn.addEventListener("click", () => {
      editModal.style.display = "none"; // Cerrar la modal
      console.log("Modal cerrado por botón X.");
    });

    // Cerrar modal si se hace clic en el fondo oscuro
    window.addEventListener("click", (event) => {
      if (event.target === editModal) {
        editModal.style.display = "none";
        console.log("Modal cerrado por clic fuera del contenedor.");
      }
    });

    /******************************************************
     * 7. INIT - Al Cargar la Página
     ******************************************************/
    document.addEventListener("DOMContentLoaded", () => {
      generarCalendario(currentMonth, currentYear);
      assignTurnsBtn.addEventListener("click", asignarTurnos);
    });

    /******************************************************
     * 8. Alerta Personalizada
     ******************************************************/
    function showCustomAlert(message) {
      const alertModal = document.getElementById("custom-alert");
      const alertMessage = document.getElementById("alert-message");
      const closeAlert = document.getElementById("close-alert");

      alertMessage.textContent = message;
      alertModal.style.display = "block";

      closeAlert.onclick = () => {
        alertModal.style.display = "none";
      };

      window.onclick = (event) => {
        if (event.target === alertModal) {
          alertModal.style.display = "none";
        }
      };
    }
