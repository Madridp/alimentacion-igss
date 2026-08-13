"use client";

import { useEffect, useMemo, useState } from "react";
import { config } from "@/lib/config";
import { cargarEmpleados, buscarEmpleado } from "@/lib/empleados";

const hoy = () => new Date().toISOString().slice(0, 10);
const etiquetaCodigo = config.institucion.etiquetaCodigo || "Código";

const fmtFecha = (iso) => {
  if (!iso) return "";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
};

const inicial = {
  fecha: hoy(),
  cargo: "",
  servicio: "",
  tipo_dieta: "Libre",
  tiempos: [],
  justificacion: "",
};

export default function FormularioPersonal() {
  const [catalogo, setCatalogo] = useState(null);
  const [errorCatalogo, setErrorCatalogo] = useState("");
  const [ibm, setIbm] = useState("");
  const [empleado, setEmpleado] = useState(null);
  const [sinResultado, setSinResultado] = useState(false);
  const [d, setD] = useState(inicial);
  const [errores, setErrores] = useState({});
  const [modo, setModo] = useState("form"); // form | preview

  useEffect(() => {
    cargarEmpleados().then(setCatalogo).catch(() =>
      setErrorCatalogo("No se pudo cargar el catálogo de empleados.")
    );
  }, []);

  function onIbm(e) {
    const v = e.target.value;
    setIbm(v);
    if (!catalogo) return;
    const enc = buscarEmpleado(catalogo, v);
    setEmpleado(enc);
    setSinResultado(v.trim().length > 0 && !enc);
    if (enc) setD((s) => ({ ...s, cargo: enc.cargo || s.cargo, servicio: enc.servicio || s.servicio }));
  }

  const set = (campo) => (e) => setD((s) => ({ ...s, [campo]: e.target.value }));

  function toggleTiempo(t) {
    setD((s) => ({
      ...s,
      tiempos: s.tiempos.includes(t) ? s.tiempos.filter((x) => x !== t) : [...s.tiempos, t],
    }));
  }

  function validar() {
    const err = {};
    if (!empleado) err.ibm = `Escribe un ${etiquetaCodigo} válido.`;
    if (!d.fecha) err.fecha = "Elige la fecha.";
    if (d.tiempos.length === 0) err.tiempos = "Marca al menos un tiempo de comida.";
    setErrores(err);
    return Object.keys(err).length === 0;
  }

  function verPreview() {
    if (validar()) {
      setModo("preview");
      window.scrollTo(0, 0);
    }
  }

  function imprimir() {
    const prev = document.title;
    document.title = `Solicitud_Personal_${empleado.nombre}`;
    const restaurar = () => {
      document.title = prev;
      window.removeEventListener("afterprint", restaurar);
    };
    window.addEventListener("afterprint", restaurar);
    window.print();
  }

  if (modo === "preview") {
    return (
      <main className="min-h-screen bg-[var(--surface)] py-6">
        {/* barra de acciones (no se imprime) */}
        <div className="no-print mx-auto mb-5 flex max-w-[820px] items-center justify-between gap-3 px-4">
          <button onClick={() => setModo("form")}
            className="rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface)]">
            ← Volver a editar
          </button>
          <button onClick={imprimir}
            className="brand-gradient rounded-xl px-5 py-2.5 font-display text-sm font-semibold text-white transition hover:brightness-110">
            Imprimir / Guardar PDF
          </button>
        </div>

        <p className="no-print mx-auto mb-4 max-w-[820px] px-4 text-xs text-[var(--muted)]">
          Consejo: en el cuadro de impresión, en “Más ajustes” puedes desactivar “Encabezados y pies de página”
          y elegir “Guardar como PDF” en Destino.
        </p>

        <div className="px-4">
          <DocumentoIGSS ibm={empleado.ibm} nombre={empleado.nombre} d={d} />
        </div>
      </main>
    );
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
            Escribe tu {etiquetaCodigo}, completa los datos y genera la solicitud para imprimir.
          </p>
        </div>
      </header>

      <div className="mx-auto -mt-10 max-w-2xl px-4 pb-16">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
          <div className="space-y-5">
            {errorCatalogo && <Aviso tono="error">{errorCatalogo}</Aviso>}

            <Campo label={etiquetaCodigo} error={errores.ibm} requerido>
              <input type="text" inputMode="numeric" value={ibm} onChange={onIbm}
                placeholder={`Escribe tu ${etiquetaCodigo}`} autoFocus
                className={inputCls(errores.ibm) + " font-display text-lg tracking-wide"} />
            </Campo>

            {!catalogo && !errorCatalogo && <p className="text-sm text-[var(--muted)]">Cargando catálogo…</p>}
            {empleado && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Check /><span className="text-sm font-semibold">Empleado encontrado</span>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Dato etiqueta="Nombre" valor={empleado.nombre} />
                  <Dato etiqueta={etiquetaCodigo} valor={empleado.ibm} />
                </div>
              </div>
            )}
            {sinResultado && (
              <Aviso tono="alerta">No encontramos ese {etiquetaCodigo}. Verifica el número.</Aviso>
            )}

            <fieldset disabled={!empleado} className={empleado ? "space-y-5" : "space-y-5 opacity-50"}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Campo label="Fecha" error={errores.fecha} requerido>
                  <input type="date" value={d.fecha} onChange={set("fecha")} className={inputCls(errores.fecha)} />
                </Campo>
                <Campo label="Tipo de dieta">
                  <Select value={d.tipo_dieta} onChange={set("tipo_dieta")}>
                    {config.tiposDieta.map((t) => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </Campo>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Campo label="Cargo" hint="opcional">
                  <input type="text" value={d.cargo} onChange={set("cargo")} placeholder="Ej. Camarero" className={inputCls()} />
                </Campo>
                <Campo label="Servicio" hint="opcional">
                  <input type="text" value={d.servicio} onChange={set("servicio")} placeholder="Ej. Encamamiento" className={inputCls()} />
                </Campo>
              </div>

              <Campo label="Tiempos de comida solicitados" error={errores.tiempos} requerido>
                <div className="flex flex-wrap gap-2">
                  {config.tiemposComida.map((t) => {
                    const on = d.tiempos.includes(t);
                    return (
                      <button type="button" key={t} onClick={() => toggleTiempo(t)}
                        className={
                          "rounded-xl border px-4 py-2.5 text-sm font-medium transition " +
                          (on
                            ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                            : "border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[var(--surface)]")
                        }>
                        {on ? "✓ " : ""}{t}
                      </button>
                    );
                  })}
                </div>
              </Campo>

              <Campo label="Justificación" hint="opcional">
                <textarea rows={3} value={d.justificacion} onChange={set("justificacion")}
                  placeholder="Motivo de la solicitud (opcional)" className={inputCls() + " resize-none"} />
              </Campo>
            </fieldset>

            <button type="button" onClick={verPreview} disabled={!empleado}
              className="brand-gradient w-full rounded-xl px-5 py-3.5 text-center font-display text-base font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
              Vista previa e imprimir
            </button>
          </div>
        </div>
      </div>

      <footer className="border-t border-[var(--line)] px-4 py-6 text-center text-xs text-[var(--muted)]">
        <p>{config.pie.texto} · {config.pie.contacto}</p>
      </footer>
    </main>
  );
}

/* ============ DOCUMENTO OFICIAL ============ */
function DocumentoIGSS({ ibm, nombre, d }) {
  return (
    <div id="documento-imprimible" className="hoja">
      <div className="doc-head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-igss.png" alt="IGSS" />
        <div className="titulos">
          <div className="t1">{config.institucion.nombre.toUpperCase()}</div>
          <div className="t2">{config.institucion.siglas}</div>
          <div className="t3">{config.institucion.tituloDocumento}</div>
        </div>
        <div style={{ width: 66 }} />
      </div>
      <hr className="regla-gruesa" />

      <div className="doc-fecha">
        <b>Fecha:</b><span className="linea">{fmtFecha(d.fecha)}</span>
      </div>

      <p className="doc-intro">Atentamente solicito a usted se brinde alimentación a:</p>
      <div className="doc-subseccion">Datos del solicitante</div>

      <div className="doc-campo"><span className="et">Nombre completo:</span><span className="val">{nombre}</span></div>
      <div className="doc-campo"><span className="et">No. empleado:</span><span className="val">{ibm}</span></div>
      <div className="doc-campo"><span className="et">Cargo:</span><span className="val">{d.cargo}</span></div>
      <div className="doc-campo"><span className="et">Servicio:</span><span className="val">{d.servicio}</span></div>
      <div className="doc-campo"><span className="et">Tipo de dieta:</span><span className="val">{d.tipo_dieta}</span></div>

      <div className="doc-subseccion">Tiempos de comida solicitados</div>
      <div className="doc-checks">
        {config.tiemposComida.map((t) => (
          <span className="doc-check" key={t}>
            <span className={"doc-box" + (d.tiempos.includes(t) ? " on" : "")} />
            {t}
          </span>
        ))}
      </div>

      <div className="doc-just-titulo">JUSTIFICACIÓN</div>
      <div className="doc-just-caja">{d.justificacion}</div>

      <p className="doc-atentamente">Atentamente,</p>

      <div className="doc-firmas">
        <div className="doc-firma">
          <div className="linea" /><div className="rol">Firma y sello</div>
          <div className="nombre">{nombre}</div><div className="sub">Solicitante</div>
        </div>
        <div className="doc-firma">
          <div className="linea" /><div className="rol">Firma y sello</div>
          <div className="sub">Personal responsable del servicio solicitante</div>
        </div>
        <div className="doc-firma">
          <div className="linea" /><div className="rol">Firma y sello</div>
          <div className="sub">Recibí conforme<br />Solicitante</div>
        </div>
      </div>

      <div className="doc-pie">{config.pie.texto} · {config.pie.contacto}</div>
    </div>
  );
}

/* ============ piezas ============ */
function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function Aviso({ tono = "alerta", children }) {
  const cls = tono === "error" ? "bg-rose-50 text-rose-700 ring-rose-200" : "bg-amber-50 text-amber-800 ring-amber-200";
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
function Dato({ etiqueta, valor }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{etiqueta}</p>
      <p className="text-sm font-semibold text-[var(--ink)]">{valor}</p>
    </div>
  );
}
function Select({ value, onChange, children }) {
  return <select value={value} onChange={onChange} className={inputCls() + " appearance-none bg-[var(--card)]"}>{children}</select>;
}
function inputCls(error) {
  return [
    "w-full rounded-xl border bg-[var(--card)] px-4 py-3 text-sm text-[var(--ink)]",
    "placeholder:text-[var(--muted)]/60 transition focus:border-[var(--brand)] focus:outline-none",
    error ? "border-rose-300" : "border-[var(--line)]",
  ].join(" ");
}
