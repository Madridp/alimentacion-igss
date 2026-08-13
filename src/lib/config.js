// =============================================================
//  CONFIGURACION EDITABLE  ->  cambia solo lo marcado con [EDITAR]
// =============================================================

export const config = {
  institucion: {
    nombre: "Instituto Guatemalteco de Seguridad Social",
    siglas: "IGSS",
    subtitulo: "Solicitud de alimentación para personal",
    etiquetaCodigo: "IBM", // así se llama el código de empleado en el IGSS
  },

  // Opciones que el personal SÍ elige en el formulario
  tiemposComida: ["Desayuno", "Almuerzo", "Cena", "Refacción"],
  turnos: ["Matutino", "Vespertino", "Nocturno", "Mixto"],
  tiposMenu: ["Normal", "Vegetariano", "Sin sal", "Diabético", "Blando", "Otro"],

  // Pie del formulario y del PDF
  pie: {
    texto: "Sistema desarrollado por TECNO INFO",
    contacto: "WhatsApp +502 5316 0294",
  },
};

// ---- Colores de marca (se usan en el PDF) ----
// Si los cambias, actualiza también --brand / --brand-dark / --brand-accent
// en src/app/globals.css para que la web y el PDF combinen.
export const marca = {
  brand: "#15594A",
  brandDark: "#0E3E33",
  accent: "#E4A33B",
  ink: "#17211D",
  muted: "#5C6B64",
  line: "#E6E3D9",
  surfaceSoft: "#F4F6F3",
};
