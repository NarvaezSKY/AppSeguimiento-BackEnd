import evidenciaService from "./evidencia.service.js";

// 👉 genera las filas a partir de las evidencias
export const getAllEvidenciasFormatted = async (filter = {}) => {
  const evidencias = await evidenciaService.getAllEvidencias(filter);

  // Mapeamos las evidencias al formato "fila"
  const rows = evidencias.map((ev) => {
    // puede haber múltiples responsables → los concatenamos
    const responsables = ev.responsables
      .map((r) => `${r.nombre} (${r.email}) [${r.vinculacion}]`)
      .join("; ");

    return [
      ev._id.toString(),
      ev.actividad?.componente?.nombreComponente || "",
      ev.actividad?.actividad?.trim() || "",
      ev.tipoEvidencia || "",
      ev.trimestre ?? "",
      ev.mes ?? "",
      ev.anio ?? "",
      responsables,
      ev.estado || "",
      ev.fechaEntrega ? new Date(ev.fechaEntrega).toISOString().split("T")[0] : "",
      ev.entregadoEn ? new Date(ev.entregadoEn).toISOString() : "",
      ev.creadoEn ? new Date(ev.creadoEn).toISOString() : "",
    ];
  });

  // Cabeceras para la primera fila
  const headers = [
    "ID Evidencia",
    "Componente",
    "Actividad",
    "Tipo Evidencia",
    "Trimestre",
    "Mes",
    "Año",
    "Responsables",
    "Estado",
    "Fecha Entrega",
    "Entregado En",
    "Creado En",
  ];

  // Devolvemos cabeceras + filas
  return [headers, ...rows];
};
