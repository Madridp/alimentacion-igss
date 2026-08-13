# Solicitud de alimentación IGSS (vista previa + imprimir)

App en **Next.js** lista para **Vercel**. El personal escribe su **IBM**, se
autocompletan sus datos, completa la solicitud y obtiene una **vista previa del
documento oficial del IGSS** para **imprimir** o **guardar como PDF** desde el navegador.

- No usa base de datos ni login (100% estático).
- El botón "Imprimir / Guardar PDF" abre el cuadro de impresión del navegador;
  ahí se puede imprimir o elegir "Guardar como PDF".

## 1. Lista de empleados

Está en **`public/empleados.csv`** (ya cargada con los 40 empleados del LISTADO).
Formato:

```
ibm,nombre,cargo,servicio
33499,Joel Abdías Sis García,,
34811,Rubenia Virginia Monroy Lopez,,
```

**Agregar más empleados:** abre el CSV en Excel, agrega filas `IBM,NOMBRE,,`,
guarda como **CSV UTF-8** y súbelo al repositorio (Vercel redespliega solo).
`cargo` y `servicio` son opcionales: si los llenas, se autocompletan en el
formulario y en el documento.

## 2. Probar local

```bash
npm install
npm run dev
```

Abre http://localhost:3000 y escribe un IBM (p. ej. `34811`).

## 3. Desplegar en Vercel

Sube a GitHub → import en Vercel → **Deploy**. Sin variables de entorno.

## Personalizar

- Institución, título del documento, tiempos de comida, tipos de dieta, pie:
  `src/lib/config.js`.
- Colores de marca y estilos del documento oficial: `src/app/globals.css`
  (variables `--brand...` y bloque `DOCUMENTO OFICIAL`).
- Logo: `public/logo-igss.png`.

## Estructura

```
public/empleados.csv        → lista de empleados (IBM, nombre, cargo, servicio)
public/logo-igss.png        → logo
src/lib/config.js           → textos y opciones [EDITAR]
src/lib/empleados.js        → carga el CSV y busca por IBM
src/app/globals.css         → marca + estilos del documento + reglas de impresión
src/app/formulario-personal/page.js → formulario + vista previa + imprimir
```

## Notas

- **Impresión limpia:** en el cuadro de impresión, en "Más ajustes" se puede
  desactivar "Encabezados y pies de página" (para que no salga la fecha/URL del navegador).
- **Nombre del archivo al guardar PDF:** se sugiere automáticamente
  `Solicitud_Personal_<Nombre>`.

---

Desarrollado para TECNO INFO · WhatsApp +502 5316 0294
