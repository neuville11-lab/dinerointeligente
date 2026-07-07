// build/generate.js
// Lee data/promos.json y genera:
//  - assets/js/promos-data.js  (para el wizard de la portada)
//  - promos/<slug>/index.html  (una subpágina por promoción)
//  - promos/index.html         (listado completo)
//
// Uso: node build/generate.js

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA_PATH = path.join(ROOT, "data", "promos.json");
const PROMOS_DIR = path.join(ROOT, "promos");
const JS_OUT = path.join(ROOT, "assets", "js", "promos-data.js");

const promos = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));

function formatDate(iso) {
  if (!iso) return "Vigente (sin fecha de caducidad conocida)";
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
}

function investmentBadge(importeMinimo) {
  if (!importeMinimo || importeMinimo === 0) return { text: "Sin inversión", cls: "badge-sin" };
  if (importeMinimo <= 100) return { text: "Hasta 100€", cls: "badge-baja" };
  if (importeMinimo <= 1000) return { text: "100€–1.000€", cls: "badge-media" };
  return { text: "Más de 1.000€", cls: "badge-alta" };
}

// ---------- 1. assets/js/promos-data.js ----------
const jsContent =
  "// Generado automáticamente por build/generate.js — no editar a mano.\n" +
  "const PROMOS = " + JSON.stringify(promos, null, 2) + ";\n";
fs.writeFileSync(JS_OUT, jsContent, "utf8");
console.log("✔ assets/js/promos-data.js generado (" + promos.length + " promociones)");

// ---------- 2. subpágina por promoción ----------
function promoPageHTML(p) {
  const requisitosHTML = p.requisitos.map((r) => `<li>${r}</li>`).join("\n          ");

  const puntosClaveHTML = (p.puntosClave || [])
    .map((pt) => `<li>${pt}</li>`)
    .join("\n          ");

  const pasosHTML = (p.pasos || [])
    .map((paso, i) => `<li><span class="paso-num">${i + 1}</span><span>${paso}</span></li>`)
    .join("\n          ");

  const tramosSectionHTML = (p.tramos && p.tramos.length)
    ? `
      <h2>Cuánto puedes ganar según lo que inviertas</h2>
      <div class="tramos-table">
        ${p.tramos.map((t) => `
        <div class="tramo-row">
          <span class="tramo-rango">${t.desde}€${t.hasta ? " – " + t.hasta + "€" : "+"}</span>
          <span class="tramo-flecha">→</span>
          <span class="tramo-recompensa mono">${t.recompensa}</span>
        </div>`).join("")}
      </div>`
    : "";

  const badge = investmentBadge(p.importeMinimo);

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${p.titulo} — ${p.entidad} | Dinero Inteligente</title>
<meta name="description" content="${p.resumen}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../assets/css/style.css">
</head>
<body>

<header class="site-header">
  <div class="wrap">
    <a href="../../index.html" class="logo"><span class="dot"></span>Dinero Inteligente</a>
    <nav class="nav-links">
      <a href="../../index.html#wizard">Encuentra tu promo</a>
      <a href="../index.html">Todas las promociones</a>
    </nav>
  </div>
</header>

<section class="promo-hero">
  <div class="wrap">
    <div class="breadcrumb"><a href="../../index.html">Inicio</a> / <a href="../index.html">Promociones</a> / ${p.entidad}</div>
    <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
      <span class="cat-tag">${p.tipoTexto}</span>
      <span class="invest-badge ${badge.cls}">${badge.text}</span>
      <span class="cat-tag" style="opacity:0.7;">${p.fechaLimite ? "Hasta " + formatDate(p.fechaLimite) : formatDate(p.fechaLimite)}</span>
    </div>
    <h1>${p.titulo}</h1>
    ${p.logo
      ? `<img class="entity-logo-hero" src="../../assets/logos/${p.logo}" alt="${p.entidad}">`
      : `<div class="entidad-name">${p.entidad}</div>`}
    <div class="reward-box">
      <span class="amount">${p.recompensa}</span>
      <span class="caption">recompensa estimada</span>
    </div>
  </div>
</section>

<section class="promo-body">
  <div class="wrap">
    <div>
      <h2>En resumen</h2>
      <ul class="puntos-clave-list">
          ${puntosClaveHTML}
      </ul>

      <h2>Requisitos</h2>
      <ul class="requisitos-list">
          ${requisitosHTML}
      </ul>

      <h2>Cómo conseguirla</h2>
      <ol class="pasos-list">
          ${pasosHTML}
      </ol>
      ${tramosSectionHTML}
    </div>

    <aside class="side-card">
      <div class="row"><span class="k">Entidad</span><span class="v">${p.entidad}</span></div>
      <div class="row"><span class="k">Categoría</span><span class="v">${p.tipoTexto}</span></div>
      <div class="row"><span class="k">Inversión necesaria</span><span class="v">${badge.text}</span></div>
      <div class="row"><span class="k">Ganancia máxima</span><span class="v">${p.recompensa}</span></div>
      <a class="btn btn-accent" href="${p.enlace}" target="_blank" rel="noopener noreferrer">Ir a ${p.entidad} →</a>
      <p class="legal-note">${p.letraPequena}</p>
    </aside>
  </div>
</section>

<footer class="site-footer">
  <div class="wrap">
    <span>© 2026 Dinero Inteligente</span>
    <span>Las condiciones pueden cambiar. Verifica siempre en la web oficial antes de contratar.</span>
  </div>
</footer>

</body>
</html>
`;
}

let generated = 0;
promos.forEach((p) => {
  const dir = path.join(PROMOS_DIR, p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), promoPageHTML(p), "utf8");
  generated++;
});
console.log("✔ " + generated + " subpáginas generadas en /promos/<slug>/index.html");

// ---------- 3. promos/index.html (listado completo) ----------
function cardHTML(p) {
  const badge = investmentBadge(p.importeMinimo);
  const logoHTML = p.logo
    ? `<img class="entity-logo" src="../assets/logos/${p.logo}" alt="${p.entidad}">`
    : `<span class="entidad">${p.entidad}</span>`;
  return `      <a class="promo-card" href="${p.slug}/index.html">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
          <span class="cat-tag">${p.tipoTexto}</span>
          <span class="invest-badge ${badge.cls}">${badge.text}</span>
        </div>
        ${logoHTML}
        <h3>${p.titulo}</h3>
        <span class="deadline">${p.fechaLimite ? "Hasta " + formatDate(p.fechaLimite) : formatDate(p.fechaLimite)}</span>
        <span class="reward mono">${p.recompensa}</span>
      </a>`;
}

const listHTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Todas las promociones | Dinero Inteligente</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>

<header class="site-header">
  <div class="wrap">
    <a href="../index.html" class="logo"><span class="dot"></span>Dinero Inteligente</a>
    <nav class="nav-links">
      <a href="../index.html#wizard">Encuentra tu promo</a>
      <a href="index.html">Todas las promociones</a>
    </nav>
  </div>
</header>

<section class="hero" style="padding-bottom: 8px;">
  <div class="wrap">
    <h1 style="font-size: 34px;">Todas las promociones vigentes</h1>
    <p class="lead">${promos.length} promociones activas ahora mismo. Actualizado a mano según van saliendo.</p>
  </div>
</section>

<section class="results">
  <div class="wrap">
    <div class="promo-grid">
${promos.map(cardHTML).join("\n")}
    </div>
  </div>
</section>

<footer class="site-footer">
  <div class="wrap">
    <span>© 2026 Dinero Inteligente</span>
    <span>Las condiciones pueden cambiar. Verifica siempre en la web oficial antes de contratar.</span>
  </div>
</footer>

</body>
</html>
`;

fs.writeFileSync(path.join(PROMOS_DIR, "index.html"), listHTML, "utf8");
console.log("✔ promos/index.html generado");
