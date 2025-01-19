function guardarAsignacionEnFirestore(asignacion, semanaIndex, año, mes, fechasSemana) {
  if (!fechasSemana || !fechasSemana.length) return;
  const fechaInicio = fechasSemana[0];
  const fechaFin = fechasSemana[fechasSemana.length - 1];

  db.collection("AsignacionesSemanales").doc(`${año}-${mes}-${semanaIndex+1}`)
    .set({
      tecnico: asignacion.tecnico,
      ingeniero: asignacion.ingeniero,
      planta: asignacion.planta,
      semana: semanaIndex+1,
      año,
      mes,
      fechaInicio,
      fechaFin
    })
    .then(() => { console.log("Asignación guardada en Firestore."); })
    .catch((error) => console.error("Error al guardar asignación:", error));
}
