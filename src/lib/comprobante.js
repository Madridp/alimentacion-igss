import { jsPDF } from "jspdf";

function rgb(hex) {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

function folio(ibm) {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const fecha = `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}`;
  const hora = `${p(d.getHours())}${p(d.getMinutes())}`;
  return `VA-${fecha}-${String(ibm || "0000")}-${hora}`;
}

/**
 * Genera el vale de alimentación en PDF y devuelve { doc, ref }.
 */
export function generarComprobante(datos) {
  const m = datos.marca;
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const margen = 18;
  const ref = folio(datos.ibm);
  const emitido = new Date().toLocaleString("es-GT", { dateStyle: "long", timeStyle: "short" });

  // ---------- Masthead blanco: logo + institución ----------
  let logoW = 0;
  if (datos.logo) {
    const logoH = 20;
    logoW = logoH / (datos.logoRatio || 1.27);
    doc.addImage(datos.logo, "PNG", margen, 6, logoW, logoH);
  }
  const tx = margen + (logoW ? logoW + 5 : 0);
  doc.setTextColor(...rgb(m.ink));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.text(datos.institucion, tx, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...rgb(m.muted));
  doc.text(`${datos.siglas ? datos.siglas + "  ·  " : ""}${datos.subtitulo || ""}`, tx, 20);

  // Folio + emitido (derecha)
  doc.setFontSize(8);
  doc.text(`Folio: ${ref}`, W - margen, 12, { align: "right" });
  doc.text(`Emitido: ${emitido}`, W - margen, 17, { align: "right" });

  // ---------- Barra de título con color de marca ----------
  const bandY = 30, bandH = 12;
  doc.setFillColor(...rgb(m.brand));
  doc.rect(0, bandY, W, bandH, "F");
  doc.setFillColor(...rgb(m.accent));
  doc.rect(0, bandY + bandH, W, 1.6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("VALE DE ALIMENTACIÓN", margen, bandY + 8.4);

  let y = 58;

  // ---------- Datos del empleado (adaptable) ----------
  y = seccion(doc, m, margen, W, y, "Datos del empleado");
  y = filaFull(doc, m, margen, W, y, "Nombre completo", datos.nombre);
  const hayDepto = datos.departamento || datos.puesto;
  if (hayDepto) {
    y = fila(doc, m, margen, W, y, datos.etiquetaCodigo || "IBM", datos.ibm, "Departamento", datos.departamento || "—");
    if (datos.puesto) y = filaFull(doc, m, margen, W, y, "Puesto", datos.puesto);
  } else {
    y = filaFull(doc, m, margen, W, y, datos.etiquetaCodigo || "IBM", datos.ibm);
  }

  y += 6;

  // ---------- Detalle de la solicitud ----------
  y = seccion(doc, m, margen, W, y, "Detalle de la solicitud");
  y = fila(doc, m, margen, W, y, "Tiempo de comida", datos.tiempoComida, "Fecha", datos.fecha);
  y = fila(doc, m, margen, W, y, "Turno", datos.turno || "—", "Tipo de menú", datos.tipoMenu || "Normal");

  // Cantidad destacada
  y += 2;
  doc.setFillColor(...rgb(m.surfaceSoft));
  doc.roundedRect(margen, y, W - margen * 2, 16, 2, 2, "F");
  doc.setTextColor(...rgb(m.muted));
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Cantidad de raciones", margen + 6, y + 6.5);
  doc.setTextColor(...rgb(m.brand));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(String(datos.cantidad), margen + 6, y + 13.5);
  y += 24;

  // ---------- Observaciones ----------
  if (datos.observaciones) {
    y = seccion(doc, m, margen, W, y, "Observaciones");
    doc.setTextColor(...rgb(m.ink));
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lineas = doc.splitTextToSize(datos.observaciones, W - margen * 2);
    doc.text(lineas, margen, y);
    y += lineas.length * 5 + 8;
  }

  // ---------- Firmas ----------
  y = Math.max(y, 205);
  const anchoFirma = (W - margen * 2 - 16) / 2;
  doc.setDrawColor(...rgb(m.line));
  doc.setLineWidth(0.4);
  doc.line(margen, y, margen + anchoFirma, y);
  doc.line(W - margen - anchoFirma, y, W - margen, y);
  doc.setTextColor(...rgb(m.muted));
  doc.setFontSize(8.5);
  doc.text("Firma del solicitante", margen + anchoFirma / 2, y + 5, { align: "center" });
  doc.text("Recibido en cocina", W - margen - anchoFirma / 2, y + 5, { align: "center" });

  // ---------- Pie ----------
  const pieY = 270;
  doc.setDrawColor(...rgb(m.line));
  doc.line(margen, pieY - 6, W - margen, pieY - 6);
  doc.setTextColor(...rgb(m.muted));
  doc.setFontSize(8);
  doc.text(`${datos.pieTexto || ""}  ·  ${datos.pieContacto || ""}`, W / 2, pieY, { align: "center" });

  return { doc, ref };
}

function seccion(doc, m, margen, W, y, titulo) {
  doc.setFillColor(...rgb(m.accent));
  doc.rect(margen, y - 4, 3, 5, "F");
  doc.setTextColor(...rgb(m.ink));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(titulo.toUpperCase(), margen + 6, y);
  doc.setDrawColor(...rgb(m.line));
  doc.setLineWidth(0.3);
  doc.line(margen, y + 3, W - margen, y + 3);
  return y + 12;
}

function fila(doc, m, margen, W, y, l1, v1, l2, v2) {
  const col2 = margen + (W - margen * 2) / 2 + 4;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  doc.setTextColor(...rgb(m.muted));
  doc.text(String(l1).toUpperCase(), margen, y);
  doc.text(String(l2).toUpperCase(), col2, y);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11);
  doc.setTextColor(...rgb(m.ink));
  doc.text(String(v1 ?? "—"), margen, y + 6);
  doc.text(String(v2 ?? "—"), col2, y + 6);
  return y + 14;
}

function filaFull(doc, m, margen, W, y, label, value) {
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  doc.setTextColor(...rgb(m.muted));
  doc.text(String(label).toUpperCase(), margen, y);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11);
  doc.setTextColor(...rgb(m.ink));
  const lineas = doc.splitTextToSize(String(value ?? "—"), W - margen * 2);
  doc.text(lineas, margen, y + 6);
  return y + 8 + lineas.length * 5;
}
