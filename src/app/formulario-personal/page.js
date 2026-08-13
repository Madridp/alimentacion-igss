"use client";

import { useEffect, useState } from "react";
import { config, marca } from "@/lib/config";
import { cargarEmpleados, buscarEmpleado } from "@/lib/empleados";
import { generarComprobante } from "@/lib/comprobante";
import { logoIGSS, logoRatio } from "@/lib/logo";

const hoy = () => new Date().toISOString().slice(0, 10);
const etiquetaCodigo = config.institucion.etiquetaCodigo || "Código";

const seleccionInicial = {
  tiempo_comida: "",
  fecha: hoy(),
  turno: "",
  cantidad: 1,
  tipo_menu: "",
  observaciones: "",
};

export default function FormularioPersonal() {
  const [catalogo, setCatalogo] = useState(null); // null = cargando
  const [errorCatalogo, setErrorCatalogo] = useState("");

  const [ibm, setIbm] = useState("");
  const [empleado, setEmpleado] = useState(null);
  const [buscoSinResultado, setBuscoSinResultado] = useState(false);

  const [sel, setSel] = useState(seleccionInicial);
  const [errores, setErrores] = useState({});
  const [folio, setFolio] = useState("");

  useEffect(() => {
    cargarEmpleados()
      .then(setCatalogo)
      .catch(() => setErrorCatalogo("No se pudo cargar el catálogo de empleados."));
  }, []);

  function onIbm(e) {
    const v = e.target.value;
    setIbm(v);
    setFolio("");
    if (!catalogo) return;
    const enc = buscarEmpleado(catalogo, v);
    setEmpleado(enc);
    setBuscoSinResultado(v.trim().length > 0 && !enc);
  }

  const set = (campo) => (e) => {
    setSel((s) => ({ ...s, [campo]: e.target.value }));
    setFolio("");
  };

  function validar() {
    const err = {};
    if (!empleado) err.ibm = `Escribe un ${etiquetaCodigo} válido para continuar.`;
    if (!sel.tiempo_comida) err.tiempo_comida = "Elige un tiempo de comida.";
    if (!sel.fecha) err.fecha = "Elige la fecha.";
    if (!sel.turno) err.turno = "Elige el turno.";
    if (!sel.cantidad || Number(sel.cantidad) < 1) err.cantidad = "Debe ser 1 o más.";
    setErrores(err);
    return Object.keys(err).length === 0;
  }

  function generar() {
    if (!validar()) return;
    const { doc, ref } = generarComprobante({
      institucion: config.institucion.nombre,
      siglas: config.institucion.siglas,
      subtitulo: config.institucion.subtitulo,
      etiquetaCodigo,
      marca,
      logo: logoIGSS,
      logoRatio,
      ibm: empleado.ibm,
      nombre: empleado.nombre,
      departamento: empleado.departamento,
      puesto: empleado.puesto,
      tiempoComida: sel.tiempo_comida,
      fecha: sel.fecha,
      turno: sel.turno,
      cantidad: Number(sel.cantidad),
      tipoMenu: sel.tipo_menu || "Normal",
      observaciones: sel.observaciones.trim(),
      pieTexto: config.pie.texto,
      pieContacto: config.pie.contacto,
    });
    doc.save(`Vale_alimentacion_${empleado.ibm}_${sel.fecha}.pdf`);
    setFolio(ref);
  }

  function nuevo() {
    setIbm("");
    setEmpleado(null);
    setBuscoSinResultado(false);
    setSel({ ...seleccionInicial, fecha: hoy() });
    setErrores({});
    setFolio("");
  }

  return (
    <main className="min-h-screen">
      <header className="brand-gradient px-4 pb-16 pt-10 text-white">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-3 rounded-xl bg-white/95 px-3 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-igss.png" alt="IGSS" className="h-11 w-auto" />
            <span className="pr-1 font-display text-sm font-bold text-[var(--brand-dark)]">IGSS</span>
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
            {config.institucion.nombre}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            Solicitud de alimentación
          </h1>
          <p className="mt-2 max-w-md text-sm text-white/80">
            Escribe tu {etiquetaCodigo}, elige tu tiempo de comida y descarga tu vale en PDF.
          </p>
        </div>
      </header>

      <div className="mx-auto -mt-10 max-w-2xl px-4 pb-16">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
          {folio ? (
            <Exito folio={folio} onNuevo={nuevo} />
          ) : (
            <div className="space-y-5">
              {errorCatalogo && <Aviso tono="error">{errorCatalogo}</Aviso>}

              {/* IBM */}
              <Campo label={etiquetaCodigo} error={errores.ibm} requerido>
                <input
                  type="text"
                  inputMode="numeric"
                  value={ibm}
                  onChange={onIbm}
                  placeholder={`Escribe tu ${etiquetaCodigo}`}
                  className={inputCls(errores.ibm) + " font-display text-lg tracking-wide"}
                  autoFocus
                />
              </Campo>

              {!catalogo && !errorCatalogo && (
                <p className="text-sm text-[var(--muted)]">Cargando catálogo…</p>
              )}

              {empleado && <TarjetaEmpleado empleado={empleado} />}
              {buscoSinResultado && (
                <Aviso tono="alerta">
                  No encontramos ese {etiquetaCodigo}. Verifica el número e inténtalo de nuevo.
                </Aviso>
              )}

              {/* Campos que el personal elige */}
              <fieldset
                disabled={!empleado}
                className={empleado ? "space-y-5" : "space-y-5 opacity-50"}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Campo label="Tiempo de comida" error={errores.tiempo_comida} requerido>
                    <Select value={sel.tiempo_comida} onChange={set("tiempo_comida")} error={errores.tiempo_comida}>
                      <option value="">Selecciona…</option>
                      {config.tiemposComida.map((t) => <option key={t} value={t}>{t}</option>)}
                    </Select>
                  </Campo>
                  <Campo label="Fecha" error={errores.fecha} requerido>
                    <input type="date" value={sel.fecha} min={hoy()} onChange={set("fecha")} className={inputCls(errores.fecha)} />
                  </Campo>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Campo label="Turno" error={errores.turno} requerido>
                    <Select value={sel.turno} onChange={set("turno")} error={errores.turno}>
                      <option value="">Selecciona…</option>
                      {config.turnos.map((t) => <option key={t} value={t}>{t}</option>)}
                    </Select>
                  </Campo>
                  <Campo label="Cantidad" error={errores.cantidad} requerido>
                    <input type="number" min={1} max={50} value={sel.cantidad} onChange={set("cantidad")} className={inputCls(errores.cantidad)} />
                  </Campo>
                </div>

                <Campo label="Tipo de menú" hint="opcional">
                  <Select value={sel.tipo_menu} onChange={set("tipo_menu")}>
                    <option value="">Normal</option>
                    {config.tiposMenu.map((mn) => <option key={mn} value={mn}>{mn}</option>)}
                  </Select>
                </Campo>

                <Campo label="Observaciones" hint="opcional">
                  <textarea rows={3} value={sel.observaciones} onChange={set("observaciones")}
                    placeholder="Alguna indicación especial (alergias, sin picante, etc.)"
                    className={inputCls() + " resize-none"} />
                </Campo>
              </fieldset>

              <button
                type="button"
                onClick={generar}
                disabled={!empleado}
                className="brand-gradient w-full rounded-xl px-5 py-3.5 text-center font-display text-base font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Generar vale en PDF
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-[var(--line)] px-4 py-6 text-center text-xs text-[var(--muted)]">
        <p>{config.pie.texto} · {config.pie.contacto}</p>
      </footer>
    </main>
  );
}

function TarjetaEmpleado({ empleado }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
      <div className="flex items-center gap-2 text-emerald-700">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <span className="text-sm font-semibold">Empleado encontrado</span>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Dato etiqueta="Nombre" valor={empleado.nombre} />
        <Dato etiqueta={etiquetaCodigo} valor={empleado.ibm} />
        {empleado.departamento && <Dato etiqueta="Departamento" valor={empleado.departamento} />}
        {empleado.puesto && <Dato etiqueta="Puesto" valor={empleado.puesto} />}
      </div>
    </div>
  );
}

function Dato({ etiqueta, valor }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{etiqueta}</p>
      <p className="text-sm font-semibold text-[var(--ink)]">{valor}</p>
    </div>
  );
}

function Exito({ folio, onNuevo }) {
  return (
    <div className="py-4 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 15v3m0 0v.01M8 21h8a2 2 0 0 0 2-2V9l-5-5H8a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z" />
        </svg>
      </div>
      <h2 className="mt-4 font-display text-2xl font-bold">Vale generado</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--muted)]">
        Tu PDF se descargó. Folio <span className="font-semibold text-[var(--ink)]">{folio}</span>.
      </p>
      <button type="button" onClick={onNuevo}
        className="mt-6 rounded-xl border border-[var(--line)] px-5 py-3 font-display text-sm font-semibold text-[var(--brand)] transition hover:bg-[var(--surface)]">
        Generar otro vale
      </button>
    </div>
  );
}

/* piezas */
function Aviso({ tono = "alerta", children }) {
  const cls = tono === "error"
    ? "bg-rose-50 text-rose-700 ring-rose-200"
    : "bg-amber-50 text-amber-800 ring-amber-200";
  return <p className={`rounded-lg px-4 py-3 text-sm ring-1 ${cls}`}>{children}</p>;
}

function Campo({ label, hint, error, requerido, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2 text-sm font-medium text-[var(--ink)]">
        {label}
        {requerido && <span className="text-[var(--brand-accent)]">*</span>}
        {hint && <span className="text-xs font-normal text-[var(--muted)]">({hint})</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}

function Select({ value, onChange, error, children }) {
  return (
    <select value={value} onChange={onChange} className={inputCls(error) + " appearance-none bg-[var(--card)]"}>
      {children}
    </select>
  );
}

function inputCls(error) {
  return [
    "w-full rounded-xl border bg-[var(--card)] px-4 py-3 text-sm text-[var(--ink)]",
    "placeholder:text-[var(--muted)]/60 transition focus:border-[var(--brand)] focus:outline-none",
    error ? "border-rose-300" : "border-[var(--line)]",
  ].join(" ");
}
