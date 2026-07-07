# Dinero Inteligente

Web estática con cuestionario para filtrar promociones bancarias, de apps y de tarjetas.

## Estructura

```
index.html              → portada con el wizard
promos/index.html       → listado completo (se genera solo)
promos/<slug>/index.html→ ficha de cada promoción (se genera sola)
data/promos.json        → ÚNICO archivo que se edita a mano con las promos
assets/js/promos-data.js→ generado automáticamente, no tocar
build/generate.js       → script que genera las subpáginas a partir del JSON
```

## Cómo añadir una promoción nueva

1. Abre `data/promos.json`.
2. Copia un bloque `{ ... }` existente y pégalo, añade una coma.
3. Rellena los campos con los datos de la promo nueva (usa un `slug` único, sin espacios ni tildes).
4. Ejecuta en la terminal, desde la carpeta del proyecto:
   ```
   node build/generate.js
   ```
5. Sube los cambios a GitHub (commit + push).

En la práctica: le pasas la promoción a Claude en el chat y Claude actualiza el JSON, corre el script y te deja los archivos listos para subir.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `dinero-inteligente`).
2. Sube todo el contenido de esta carpeta a ese repositorio (puedes arrastrar los archivos desde la web de GitHub, o usar `git push` si tienes git configurado).
3. En el repositorio, ve a **Settings → Pages**.
4. En "Source", elige la rama `main` y la carpeta `/ (root)`.
5. Guarda. En 1-2 minutos tu web estará en `https://tu-usuario.github.io/dinero-inteligente/`.

Cada vez que subas cambios a `main`, GitHub Pages se actualiza solo en un par de minutos.

## Campos de cada promoción (`data/promos.json`)

| Campo | Qué es |
|---|---|
| `id` | número único |
| `slug` | identificador para la URL, ej. `openbank-cuenta-nomina` |
| `titulo` | título corto de la promo |
| `entidad` | nombre del banco/app |
| `categoria` | `bancaria`, `app`, `tarjeta` u otra que definas (debe coincidir con las opciones del wizard) |
| `tipoTexto` | texto legible de la categoría, ej. "Cuenta bancaria" |
| `recompensa` | texto de la recompensa, ej. "200€" |
| `clienteNuevo` | `true`/`false` — si exige ser cliente nuevo |
| `nominaMinima` | importe mínimo de nómina exigido (0 si no aplica) |
| `importeMinimo` | importe mínimo a ingresar/invertir (0 si no aplica) |
| `region` | `nacional` u otra región |
| `fechaLimite` | fecha límite en formato `YYYY-MM-DD` |
| `resumen` | 1-2 frases explicando la promo |
| `requisitos` | lista de requisitos (array de strings) |
| `comoConseguirla` | pasos para conseguirla |
| `letraPequena` | avisos legales / condiciones |
| `enlace` | URL oficial de la entidad |
