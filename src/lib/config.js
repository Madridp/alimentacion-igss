// =============================================================
//  CONFIGURACION EDITABLE  ->  cambia solo lo marcado con [EDITAR]
// =============================================================

export const config = {
  institucion: {
    nombre: "Instituto Guatemalteco de Seguridad Social",
    siglas: "IGSS",
    tituloDocumento: "Solicitud de tiempos de alimentación para personal",
    etiquetaCodigo: "IBM",
  },

  // Tiempos de comida (casillas del documento). Se pueden marcar varios.
  tiemposComida: ["Desayuno", "Almuerzo", "Cena", "Refacción nocturna"],

  // Tipo de dieta
  tiposDieta: ["Libre", "Blanda", "Hiposódica (sin sal)", "Diabética", "Hipograsa", "Líquida"],

  // Servicios que el solicitante puede elegir (selector del formulario)
  servicios: [
    "Emergencia",
    "Hospitalización",
    "Servicios Varios Piloto",
    "Servicios Varios Agentes",
    "Servicios Varios Camareros",
  ],

  pie: {
    texto: "Sistema desarrollado por TECNO INFO",
    contacto: "WhatsApp +502 5316 0294",
  },
};
