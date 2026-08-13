"use client";

import Papa from "papaparse";

// Carga el catálogo desde /public/empleados.csv y arma un mapa por IBM.
export async function cargarEmpleados() {
  const res = await fetch("/empleados.csv", { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo leer el catálogo de empleados.");
  const texto = await res.text();
  const { data } = Papa.parse(texto, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });
  const mapa = {};
  for (const fila of data) {
    const ibm = String(fila.ibm ?? "").trim();
    if (!ibm) continue;
    mapa[ibm] = {
      ibm,
      nombre: (fila.nombre ?? "").trim(),
      cargo: (fila.cargo ?? "").trim(),
      servicio: (fila.servicio ?? "").trim(),
    };
  }
  return mapa;
}

export function buscarEmpleado(mapa, ibm) {
  const clave = String(ibm ?? "").trim();
  if (!clave) return null;
  return mapa[clave] || null;
}

// =============================================================
//  Para agregar/editar empleados: edita public/empleados.csv
//  Columnas: ibm,nombre,cargo,servicio  (cargo y servicio son opcionales;
//  si los llenas se autocompletan en el formulario y el documento).
// =============================================================
