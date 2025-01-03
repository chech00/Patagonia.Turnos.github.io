

    /******************************************************
     *           INICIALIZAR EMAILJS
     ******************************************************/
    (function() {
      // Reemplaza con TU User ID de EmailJS
      emailjs.init("U5yOwh_uooR2i_ctr");
      // Ejemplo: emailjs.init("user_xxxxxxxxxxxxxxx");
    })();

    /******************************************************
     *           MAPEO DE EMPLEADOS A CORREOS
     ******************************************************/
    // Ajusta estos correos a los de tu equipo:
    const employeeEmails = {
      "Fabián H.": "keane.kean87@gmail.com",
      "Marco V.":  "keane.kean87@gmail.com",
      "Gonzalo S.":"keane.kean87@gmail.com",
      "Patricio G.":"keane.kean87@gmail.com",
      "Cristian V.":"keane.kean87@gmail.com"
    };

    /******************************************************
     *           FUNCION PARA ENVIAR CORREO
     ******************************************************/
    /**
     * Envía un correo usando EmailJS a la persona asignada.
     * @param {string} employeeName - Nombre del empleado (ej: "Fabián H.")
     */
    function enviarCorreoAsignacion(employeeName) {
      const destinatario = employeeEmails[employeeName] || ""; 
      if (!destinatario) {
        console.warn("No se encontró correo para:", employeeName);
        return;
      }
      // Ajusta los nombres de variable según tu plantilla de EmailJS
      const templateParams = {
        to_name: employeeName,
        to_email: destinatario,
        message: `Hola ${employeeName}, ¡te toca el turno esta semana!`
      };

      // Reemplaza "TU_SERVICE_ID" y "TU_TEMPLATE_ID" con tus datos reales
      emailjs.send("service_6g9q7ps", "template_xtz4n5f", templateParams)
        .then((response) => {
          console.log(`Correo enviado a ${employeeName} (${destinatario})`, response.text);
        }, (error) => {
          console.error(`Error al enviar correo a ${employeeName}:`, error);
        });
    }

    /******************************************************
     *           MAPEO DE EMPLEADOS A COLORES
     ******************************************************/
    const employeeColors = {
      "Fabián H.":  "#FFB6C1",  // Light Pink
      "Marco V.":   "#ADD8E6",  // Light Blue
      "Gonzalo S.": "#90EE90",  // Light Green
      "Patricio G.":"#FFD700",  // Gold
      "Cristian V.":"#D3D3D3"   // Light Gray
    };

    const tecnicosRed = ["Fabián H.", "Marco V."];
    const ingenieros =  ["Gonzalo S.","Patricio G."];
    const plantaExterna=["Cristian V."];

    /******************************************************
     *           GENERAR EL CALENDARIO
     ******************************************************/
    let currentMonth = new Date().getMonth();
    let currentYear  = new Date().getFullYear();
    let semanaActual = 0; // Rastrea la semana asignada

    const calendarTitle = document.getElementById("calendar-title");
    const calendarBody  = document.querySelector("#calendar tbody");

    function generarCalendario(mes, año) {
      calendarBody.innerHTML = "";

      const primerDiaDelMes  = new Date(año, mes, 1).getDay(); // 0=Dom, 1=Lun...
      const diasEnMes        = new Date(año, mes + 1, 0).getDate();
      const diasMesAnterior  = new Date(año, mes, 0).getDate();

      // Ajustar para que la semana comience en lunes
      const primerDiaSemana    = (primerDiaDelMes === 0) ? 7 : primerDiaDelMes;
      const inicioPrimerSemana = 1 - (primerDiaSemana - 1);
      const totalCeldas        = Math.ceil((inicioPrimerSemana + diasEnMes) / 7) * 7;

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
          const mesSiguiente = (mes === 11) ? 0 : mes + 1;
          const añoSiguiente = (mes === 11) ? año + 1 : año;
          fecha = new Date(añoSiguiente, mesSiguiente, diaActual - diasEnMes);
        } else {
          fecha = new Date(año, mes, diaActual);
        }

        // Asignar data-fecha en formato YYYY-MM-DD
        celda.setAttribute("data-fecha", fecha.toISOString().split("T")[0]);

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
          celda.innerHTML = `
            <div class="dia">${diaActual}</div>
            <div class="nombres">
              <div class="nombre"></div>
              <div class="nombre"></div>
              <div class="nombre"></div>
            </div>`;
        }

        fila.appendChild(celda);
        diaActual++;
      }

      // Título del calendario
      calendarTitle.textContent = new Intl.DateTimeFormat("es-ES", {
        month: "long",
        year: "numeric"
      }).format(new Date(año, mes));
    }

    /******************************************************
     *           ASIGNAR TURNOS SEMANA A SEMANA
     ******************************************************/
    function asignarTurnos() {
      const filas = document.querySelectorAll("#calendar tbody tr");

      // Revisamos si ya no hay más semanas
      if (semanaActual >= filas.length) {
        alert("No hay más semanas disponibles en este mes.");
        return;
      }

      // Limpiar celdas de otras semanas
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
      const tecnico   = tecnicosRed[   semanaActual % tecnicosRed.length   ];
      const ingeniero = ingenieros[    semanaActual % ingenieros.length    ];
      const planta    = plantaExterna[ 0 ]; // Cristian siempre

      // Tomar la fila para la semana actual
      const fila = filas[semanaActual];
      const dias = fila.querySelectorAll("td");

      dias.forEach((dia) => {
        const nombresDiv = dia.querySelectorAll(".nombre");
        if (nombresDiv.length === 3) {
          // Asignar Técnico
          nombresDiv[0].textContent = tecnico;
          nombresDiv[0].style.backgroundColor = employeeColors[tecnico] || "#FFFFFF";
          // Asignar Ingeniero
          nombresDiv[1].textContent = ingeniero;
          nombresDiv[1].style.backgroundColor = employeeColors[ingeniero] || "#FFFFFF";
          // Asignar Planta Externa
          nombresDiv[2].textContent = planta;
          nombresDiv[2].style.backgroundColor = employeeColors[planta] || "#FFFFFF";
        }
      });

      // Resaltar la fila
      fila.classList.add("assigned-week");

      // ENVIAR CORREOS A QUIENES FUERON ASIGNADOS (Técnico, Ingeniero, Planta)
      enviarCorreoAsignacion(tecnico);
      enviarCorreoAsignacion(ingeniero);
      enviarCorreoAsignacion(planta);

      alert(`Semana #${semanaActual + 1} asignada y correos enviados.`);
      semanaActual++;
    }

    /******************************************************
     *           NAVEGACIÓN ENTRE MESES
     ******************************************************/
    document.getElementById("prev-month").addEventListener("click", () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      semanaActual = 0; // Reiniciamos
      generarCalendario(currentMonth, currentYear);
    });

    document.getElementById("next-month").addEventListener("click", () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      semanaActual = 0; // Reiniciamos
      generarCalendario(currentMonth, currentYear);
    });

    /******************************************************
     *           EVENTO DOMContentLoaded
     ******************************************************/
    document.addEventListener("DOMContentLoaded", () => {
      // Generar el calendario inicial
      generarCalendario(currentMonth, currentYear);

      // Botón para asignar turnos
      document.getElementById("assign-turns").addEventListener("click", asignarTurnos);
    });
