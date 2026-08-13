# Solicitud de alimentación IGSS (IBM → PDF)

App en **Next.js** lista para desplegar en **Vercel**. Es **100% estática**: no usa
base de datos ni login. El personal escribe su **IBM**, el sistema autocompleta sus
datos desde un catálogo y **genera un vale de alimentación en PDF** que se descarga.

- El empleado escribe su **IBM** → se autocompletan **nombre, departamento y puesto**.
- Solo elige: **tiempo de comida, fecha, turno, cantidad y tipo de menú** (y observaciones opcional).
- Al presionar **Generar vale en PDF**, se descarga el comprobante con marca, folio y firmas.
- No se guarda nada en ningún servidor. El PDF es el resultado.

---

## 1. La lista de empleados (IGSS)

El catálogo vive en **`public/empleados.csv`** y ya viene cargado con los 40
empleados de la hoja LISTADO del IGSS (IBM y nombre completo). El formato es:

```
ibm,nombre,departamento,puesto
33499,JOEL ABDÍAS SIS GARCÍA,,
1004282,AYLWIN OBED LEMUS LEMUS,,
```

**Agregar más empleados después (es lo que pediste):**
1. Abre `public/empleados.csv` en Excel (o cualquier editor de texto).
2. Agrega una fila nueva por empleado: `IBM,NOMBRE,,`  (deja las dos comas del final).
3. Guarda como **CSV UTF-8 (delimitado por comas)** con el mismo nombre.
4. Sube el archivo al repositorio → Vercel redespliega solo. Listo.

- `departamento` y `puesto` son **opcionales**: si algún día los llenas, aparecen
  automáticamente en la tarjeta del empleado y en el PDF. Si los dejas vacíos, no se muestran.
- El **IBM** se compara como texto, así que respeta ceros a la izquierda si los hubiera.
- Si un nombre llevara coma, enciérralo entre comillas: `"LOPEZ, ANA"`.

## 2. Probar en tu computadora

```bash
npm install
npm run dev
```

Abre http://localhost:3000 y escribe un IBM del CSV (por ejemplo `1042`).

## 3. Desplegar en Vercel

1. Sube el proyecto a un repositorio de GitHub.
2. En https://vercel.com → **Add New → Project** → importa el repositorio.
3. **Deploy**. No necesitas variables de entorno ni configurar nada más.

Tu formulario quedará en `https://tu-dominio.vercel.app/formulario-personal`.

Para **actualizar la lista de empleados** después: edita `public/empleados.csv`
en el repositorio y Vercel vuelve a desplegar automáticamente.

---

## Personalizar (por institución o cliente)

- **Nombre de la institución, etiqueta del código (IBM), tiempos de comida, turnos, tipos de menú, pie:**
  edita `src/lib/config.js` (todo marcado con `[EDITAR]`).
- **Colores de marca:** cambia `--brand`, `--brand-dark`, `--brand-accent` en
  `src/app/globals.css` (web) **y** el objeto `marca` en `src/lib/config.js` (PDF),
  para que web y PDF combinen. Ejemplo Tecnoinfo: `#862CA8 / #220A30 / #C04FE6`.
- **Textos y diseño del PDF:** `src/lib/comprobante.js`.

## Estructura

```
alimentacion-personal/
├─ public/empleados.csv            → tu lista de empleados (IBM, nombre, depto, puesto)
├─ src/
│  ├─ lib/config.js                → textos, opciones y colores de marca [EDITAR]
│  ├─ lib/empleados.js             → carga el CSV y busca por IBM
│  ├─ lib/comprobante.js           → genera el PDF del vale
│  ├─ fonts/                       → fuentes locales (sin CDN)
│  └─ app/
│     ├─ globals.css               → colores de marca (web)
│     ├─ layout.js
│     ├─ page.js                   → redirige a /formulario-personal
│     └─ formulario-personal/page.js → formulario (IBM → autocompletar → PDF)
└─ package.json
```

## Notas

- **¿Lista muy grande o que cambia a diario?** Puedes conectar el catálogo a Supabase
  en lugar del CSV; hay instrucciones al final de `src/lib/empleados.js`. El resto no cambia.
- **Agregar el logo de la institución al PDF:** se puede incrustar en `comprobante.js`
  (avísame y lo dejo listo, solo necesito el archivo del logo).
- El **IBM** se valida contra el catálogo: si no existe, no deja generar el vale.

---

Desarrollado para TECNO INFO · WhatsApp +502 5316 0294
