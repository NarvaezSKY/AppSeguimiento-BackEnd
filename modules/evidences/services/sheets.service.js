import evidenciaService from "./evidencia.service.js";
export const getAllEvidenciasFormatted = async (filter = {}) => {
  const evidencias = await evidenciaService.getAllEvidencias(filter);

  const rows = evidencias.map((ev) => {
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

  return [headers, ...rows];
};
