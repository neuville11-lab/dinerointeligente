(function () {
  const TOTAL_STEPS = 3;
  const answers = { categoria: null, clienteNuevo: null, nomina: null };
  let currentStep = 0;

  const nominaMap = { "0": 0, "800": 1000, "1500": 2000 };

  function investmentBadge(importeMinimo) {
    if (!importeMinimo || importeMinimo === 0) return { text: "Sin inversión", cls: "badge-sin" };
    if (importeMinimo <= 100) return { text: "Hasta 100€", cls: "badge-baja" };
    if (importeMinimo <= 1000) return { text: "100€–1.000€", cls: "badge-media" };
    return { text: "Más de 1.000€", cls: "badge-alta" };
  }

  const grid = document.getElementById("promoGrid");
  const matchNum = document.getElementById("matchNum");
  const matchCounter = document.getElementById("matchCounter");
  const resultsCount = document.getElementById("resultsCount");
  const btnBack = document.getElementById("btnBack");
  const btnReset = document.getElementById("btnReset");

  function matchesPromo(promo) {
    if (answers.categoria && answers.categoria !== "cualquiera" && promo.categoria !== answers.categoria) {
      return false;
    }
    if (answers.clienteNuevo === "no" && promo.clienteNuevo === true) {
      return false;
    }
    if (answers.nomina !== null) {
      const disponible = nominaMap[answers.nomina];
      if (promo.nominaMinima > disponible) return false;
    }
    return true;
  }

  function formatDate(iso) {
    if (!iso) return "Vigente";
    const d = new Date(iso);
    return "Hasta " + d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  }

  function renderGrid() {
    const filtered = PROMOS.filter(matchesPromo);

    matchNum.textContent = filtered.length;
    matchCounter.classList.toggle("has-matches", filtered.length > 0);
    resultsCount.textContent = filtered.length === 1 ? "1 resultado" : filtered.length + " resultados";

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="emoji">🔍</div>
          <p>No hay promociones que encajen con estas respuestas ahora mismo.<br>Prueba a cambiar alguna condición o vuelve a "Cualquiera".</p>
        </div>`;
      return;
    }

    grid.innerHTML = filtered.map(promoCardHTML).join("");
  }

  function promoCardHTML(p) {
    const badge = investmentBadge(p.importeMinimo);
    const logoHTML = p.logo
      ? `<img class="entity-logo" src="assets/logos/${p.logo}" alt="${p.entidad}">`
      : `<span class="entidad">${p.entidad}</span>`;
    return `
      <a class="promo-card" href="promos/${p.slug}/index.html">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
          <span class="cat-tag">${p.tipoTexto}</span>
          <span class="invest-badge ${badge.cls}">${badge.text}</span>
        </div>
        ${logoHTML}
        <h3>${p.titulo}</h3>
        <span class="deadline">${formatDate(p.fechaLimite)}</span>
        <span class="reward mono">${p.recompensa}</span>
      </a>`;
  }

  function showStep(i) {
    for (let s = 0; s < TOTAL_STEPS; s++) {
      const el = document.getElementById("step-" + s);
      if (el) el.style.display = s === i ? "block" : "none";
    }
    document.querySelectorAll(".step-dots span").forEach((dot, idx) => {
      dot.classList.toggle("active", idx === i);
    });
    btnBack.style.display = i === 0 ? "none" : "inline-flex";
  }

  function selectOption(btn) {
    const group = btn.closest(".option-grid");
    const question = group.getAttribute("data-question");
    group.querySelectorAll(".option-btn").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    answers[question] = btn.getAttribute("data-value");
    renderGrid();

    if (currentStep < TOTAL_STEPS - 1) {
      setTimeout(() => {
        currentStep++;
        showStep(currentStep);
      }, 220);
    } else {
      setTimeout(() => {
        document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "start" });
      }, 250);
    }
  }

  document.querySelectorAll(".option-btn").forEach((btn) => {
    btn.addEventListener("click", () => selectOption(btn));
  });

  btnBack.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  });

  btnReset.addEventListener("click", () => {
    Object.keys(answers).forEach((k) => (answers[k] = null));
    document.querySelectorAll(".option-btn").forEach((b) => b.classList.remove("selected"));
    currentStep = 0;
    showStep(0);
    renderGrid();
    document.getElementById("wizard").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  showStep(0);
  renderGrid();
})();
