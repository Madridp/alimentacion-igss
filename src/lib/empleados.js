"use client";

import Papa from "papaparse";

// Carga el catálogo desde /public/empleados.csv y arma un mapa por IBM.
// Se llama una sola vez al abrir el formulario.
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
      departamento: (fila.departamento ?? "").trim(),
      puesto: (fila.puesto ?? "").trim(),
    };
  }
  return mapa;
}

// Busca un empleado en el mapa ya cargado. Devuelve el empleado o null.
export function buscarEmpleado(mapa, ibm) {
  const clave = String(ibm ?? "").trim();
  if (!clave) return null;
  return mapa[clave] || null;
}

// =============================================================
//  ¿Tu lista de empleados es muy grande o cambia seguido?
//  Puedes conectar Supabase en lugar del CSV: crea una tabla
//  "empleados" (ibm, nombre, departamento, puesto) y reemplaza
//  cargarEmpleados/buscarEmpleado por una consulta:
//    const { data } = await supabase.from('empleados')
//       .select('*').eq('ibm', ibm).single();
//  El resto del formulario no cambia.
// =============================================================
