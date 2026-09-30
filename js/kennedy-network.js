/**
 * Kennedy Topology Network Graph with KaTeX Mathematical Calculation Explanations
 */

document.addEventListener('DOMContentLoaded', () => {
  const stage = document.getElementById('topologyStage');
  const svgCanvas = document.getElementById('topologySvg');
  const centralBtn = document.getElementById('centralKennedyBtn');
  const calcPanel = document.getElementById('calculationPanel');
  const ringAxis = document.querySelector('.main-ring-axis');

  // Comprehensive Dataset with Exact Mathematical Formulas (KaTeX), Variables, Sources & Citations
  const nodesData = [
    // Sector 1: Comercial & Industrial (#e89a6c)
    {
      id: "A1",
      cat: "1",
      label: "Corabastos y María Paz",
      color: "#e89a6c",
      desc: "Gran acopio agroalimentario regional; genera flujos de carga masivos e impacto en lixiviados orgánicos.",
      formula: "I_{Corabastos} = \\frac{F_{Carga} \\cdot R_{Org}}{Cap_{Vial} \\cdot T_{Compostaje}}",
      formulaText: "Relaciona el flujo de camiones de carga pesada ($F_{Carga}$) y las toneladas de residuos orgánicos sin tratar ($R_{Org}$) frente a la capacidad vial de la zona y la tasa de compostaje.",
      variables: [
        { name: "F_{Carga}", unit: "Camiones / Hora", source: "Conteo Secretaría Distrital de Movilidad (SDM)", limit: "Falta desglose por ejes nocturnos" },
        { name: "R_{Org}", unit: "Toneladas Lixiviados / Día", source: "Reportes UAESP / Observación Directa", limit: "Inexactitud por arrojo informal" }
      ],
      mecanismo: "Causa (Abastecimiento masivo) → Condición (Vertimiento no tratado) → Efecto (Eutrofización en Humedal La Vaca y colapso de vías).",
      fuente: "SciELO / Universidad Jorge Tadeo Lozano: 'Impacto ambiental en Corabastos por residuos orgánicos'; Plan de Manejo Ambiental SDA."
    },
    {
      id: "A2",
      cat: "1",
      label: "Zona Ind. Carvajal",
      color: "#e89a6c",
      desc: "Núcleo de manufactura e industria ligera con demanda constante de espacio, energía e impermeabilización.",
      formula: "\\%S_{Impermeable} = \\frac{Area_{Techada} + Area_{Pavimento}}{Area_{TotalUPZ}} \\times 100",
      formulaText: "Mide la proporción de suelo impermeabilizado por naves industriales y parqueaderos de carga.",
      variables: [
        { name: "Area_{Techada}", unit: "Metros Cuadrados (m²)", source: "Satélite Sentinel-2 (Índice NDBI)", limit: "Resolución de píxel de 10m" },
        { name: "%S_{Imp}", unit: "Porcentaje (%) de suelo duro", source: "Imágenes Satelitales Copernicus", limit: "Requiere calibración con catastro" }
      ],
      mecanismo: "Naves industriales eliminan la capacidad de chupar agua del suelo, multiplicando el volumen de escorrentía hacia colectores.",
      fuente: "Repositorio UniAgustiniana: 'Evaluación de asentamientos industriales y residenciales en Kennedy'."
    },
    {
      id: "A3",
      cat: "1",
      label: "Corredor Calle 13 / AE09",
      color: "#e89a6c",
      desc: "Arteria principal de logística regional y transporte pesado occidente (Distrito Aeroportuario).",
      formula: "F_{Logístico} = \\frac{V_{Pesado}}{Cap_{TeóricaCalle13}} \\times \\text{ÍndiceRuido}",
      formulaText: "Pondera el volumen de transporte pesado sobre la capacidad de la vía y el impacto acústico de borde.",
      variables: [
        { name: "V_{Pesado}", unit: "Vehículos Carga / Hora", source: "Estaciones de Monitoreo SDM", limit: "Datos agregados sin clasificación" },
        { name: "ÍndiceRuido", unit: "Decibeles (dB_A)", source: "Monitoreo Secretaría de Ambiente", limit: "Estaciones distantes al corredor" }
      ],
      mecanismo: "Presión logística regional inyecta barreras físicas y sonoras (>75 dB) aislando el borde norte de Kennedy.",
      fuente: "POT Decreto 555 (Actuación Estratégica AE09 Fontibón); Reportes de Tráfico SDM."
    },
    {
      id: "A4",
      cat: "1",
      label: "Comercio Informal (Patio Bonito)",
      color: "#e89a6c",
      desc: "Ocupación de espacio público y densidad comercial no regulada en bordes urbanos.",
      formula: "D_{Informal} = \\frac{Unidades_{Comerciales}}{m^2 \\text{ Espacio Público}}",
      formulaText: "Mide la concentración de vendedores informales por metro cuadrado de andén.",
      variables: [
        { name: "Unidades", unit: "Puestos de venta / m²", source: "Censo Informal / Trabajo de campo", limit: "Alta fluctuación horaria" }
      ],
      mecanismo: "Densidad de mercado espontáneo sobrepasa la capacidad de recolección de basuras, derivando residuos al alcantarillado.",
      fuente: "Revista de Estudios Sociales (Redalyc): 'Gobernanza comunitaria y mercados populares en Bogotá'."
    },

    // Sector 2: Movilidad (#5b8def)
    {
      id: "B1",
      cat: "2",
      label: "Banderas (Av. Américas)",
      color: "#5b8def",
      desc: "Punto neurálgico de intercambio masivo TransMilenio y transporte colectivo.",
      formula: "I_{Hacinamiento} = \\frac{Pasajeros_{Esperando}}{Area_{Andén} \\text{ (m²)}}",
      formulaText: "Evalúa la densidad de personas por metro cuadrado en horas pico (Crítico si es mayor a 4 pers/m²).",
      variables: [
        { name: "Pasajeros", unit: "Personas / Hora Pico", source: "Torniquetes TransMilenio S.A.", limit: "Cuenta pasajes, no el amontonamiento" },
        { name: "Area_{Andén}", unit: "Metros Cuadrados (m²)", source: "Plano Arquitectónico IDU", limit: "Área fija no expandible" }
      ],
      mecanismo: "Alta densidad de vivienda aprobada por el POT (AE15/AE16) converge en una sola estación, sobrepasando su capacidad física.",
      fuente: "TransMilenio S.A.; POT Decreto 555 (AE15 Tintal / AE16 Porvenir)."
    },
    {
      id: "B2",
      cat: "2",
      label: "Av. Ciudad de Cali",
      color: "#5b8def",
      desc: "Eje longitudinal saturado que partió físicamente el Humedal El Burro en dos sectores.",
      formula: "F_{Fragmentación} = \\frac{V_{Tráfico}}{Distancia_{Humedal}} \\times Noise_{dB}",
      formulaText: "Calcula el impacto de fricción vehicular y ruido sobre la franja de reserva ambiental.",
      variables: [
        { name: "Noise_{dB}", unit: "Decibeles continuos (dB_A)", source: "SDA (Estación Humedal El Burro)", limit: "Ruido continuo > 75 dB" }
      ],
      mecanismo: "La vía asfaltada funciona como un muro infranqueable que destruye el corredor biótico de la avifauna migratoria.",
      fuente: "SciELO / Universidad Nacional: 'Imaginarios y transformación de ecosistemas: Humedal El Burro'."
    },
    {
      id: "B3",
      cat: "2",
      label: "Av. Boyacá & C. Vargas",
      color: "#5b8def",
      desc: "Intersección crítica de alta fricción vehicular y embudo de embalse.",
      formula: "T_{Retraso} = T_{ViajeReal} - T_{ViajeTeórico15min}",
      formulaText: "Mide la diferencia entre el tiempo teórico del POT (ciudad de 15 min) y el tiempo empírico en presa.",
      variables: [
        { name: "T_{ViajeReal}", unit: "Minutos de desplazamiento", source: "Datos GPS de Flota / Google Traffic", limit: "Varía según lluvias" }
      ],
      mecanismo: "Mezcla de carga pesada e intermunicipal rompe la meta teórica de proximidad, elevando viajes a >60 min.",
      fuente: "Secretaría Distrital de Movilidad (SDM); Guía Corte II."
    },
    {
      id: "B4",
      cat: "2",
      label: "Embudo Bosa/Soacha",
      color: "#5b8def",
      desc: "Confluencia de viajes pendulares masivos extralocales sobre la malla vial de Kennedy.",
      formula: "V_{Flotante} = \\frac{Viajes_{Soacha+Bosa}}{Cap_{CorredorKennedy}}",
      formulaText: "Proporción de capacidad vial consumida por usuarios que no residen en Kennedy pero cruzan por la localidad.",
      variables: [
        { name: "Viajes", unit: "Personas / Día", source: "Encuesta Origen-Destino SDM / DANE", limit: "Actualización censo 2019" }
      ],
      mecanismo: "Falta de empleo en municipios dormitorio descarga la presión de transporte masivo sobre Kennedy.",
      fuente: "Encuesta de Movilidad Bogotá-Cundinamarca."
    },

    // Sector 3: Ambiental (#2fd4c8)
    {
      id: "C1",
      cat: "3",
      label: "Humedales (El Burro / La Vaca / Techo)",
      color: "#2fd4c8",
      desc: "Cuerpos de agua biodiversos reducidos históricamente en un 98.67% por rellenos y pavimentación.",
      formula: "\\%Reducción_{Area} = \\frac{Area_{Histórica} - Area_{Actual}}{Area_{Histórica}} \\times 100",
      formulaText: "Mide la pérdida del área legal y del espejo de agua (El Burro pasó de 54 ha a 18.8 ha).",
      variables: [
        { name: "Area_{Actual}", unit: "Hectáreas (ha)", source: "Planes de Manejo Ambiental (SDA / EAAB)", limit: "Espejo de agua solo 0.2 ha" }
      ],
      mecanismo: "Construcción de vías y licencias de edificación eliminan la capacidad natural de absorber agua de lluvia.",
      fuente: "Plan de Manejo Ambiental Humedal El Burro (SDA); EAAB."
    },
    {
      id: "C2",
      cat: "3",
      label: "Ríos Fucha y Tunjuelito",
      color: "#2fd4c8",
      desc: "Drenajes principales afectados por vertimiento continuo de lixiviados y basura orgánica.",
      formula: "BOD_{Carga} = \\text{mg/L de Demanda Bioquímica de Oxígeno}",
      formulaText: "Evalúa el grado de eutrofización y pérdida de oxígeno que destruye la vida acuática.",
      variables: [
        { name: "BOD", unit: "mg O₂ / Litro", source: "Piezómetros y monitoreo hídrico EAAB", limit: "Muestreo periódico, no continuo" }
      ],
      mecanismo: "Vertimiento de materia orgánica degrada la autodepuración hídrica generando malos olores (ácido sulfhídrico).",
      fuente: "Empresa de Acueducto y Alcantarillado de Bogotá (EAAB)."
    },
    {
      id: "C3",
      cat: "3",
      label: "Escorrentía & Suelo Duro",
      color: "#2fd4c8",
      desc: "Alta tasa de impermeabilización en zonas como Castilla, Dindalito y Patio Bonito.",
      formula: "Q_{Escorrentía} = C \\cdot I \\cdot A_{Impermeable}",
      formulaText: "Fórmula Racional de Drenaje: Multiplica el coeficiente de escorrentía (C), la intensidad de lluvia (I) y el área pavimentada (A).",
      variables: [
        { name: "C", unit: "Coeficiente de escorrentía (0.85 en asfalto)", source: "Sentinel-2 (NDVI / NDBI)", limit: "Resolución 10m" },
        { name: "I", unit: "mm / Hora de lluvia", source: "Estaciones IDEAM / EAAB", limit: "Varía por aguacero" }
      ],
      mecanismo: "Al superar el 75% de suelo pavimentado, el agua de lluvia rueda directo a las calles generando inundaciones urbanas.",
      fuente: "IDEAM; Modelo Hidrológico Racional."
    }
  ];

  // Interconnection links
  const linksData = [
    { source: "A1", target: "B1", label: "Fricción de movilidad en Av. Américas por camiones de carga" },
    { source: "A1", target: "C2", label: "Vertimiento de lixiviados al Río Fucha y Humedal La Vaca" },
    { source: "A1", target: "A4", label: "Encadenamiento de comercio informal perimetral" },
    { source: "A1", target: "B2", label: "Congestión pesada en Av. Ciudad de Cali" },
    { source: "A2", target: "B3", label: "Flujo logístico e industrial a Av. Boyacá" },
    { source: "A2", target: "C3", label: "Impermeabilización del suelo por naves industriales" },
    { source: "A3", target: "B4", label: "Embudo logístico e intermunicipal en Calle 13" },
    { source: "B2", target: "C1", label: "Fragmentación del Humedal El Burro por calzada vehicular" },
    { source: "B4", target: "C2", label: "Presión antrópica sobre la cuenca del Tunjuelito" },
    { source: "B1", target: "C3", label: "Escorrentía sobre plazoletas y andenes duros" },
    { source: "C1", target: "C3", label: "Pérdida de capacidad de absorción hídrica en suelo duro" },
    { source: "C2", target: "C1", label: "Conexión de la cuenca hidrográfica local" }
  ];

  let activeNodeId = null;

  // Position circular nodes
  function positionNodes() {
    if (!stage) return;
    const stageRect = stage.getBoundingClientRect();
    const centerX = stageRect.width / 2;
    const centerY = stageRect.height / 2;

    const minDim = Math.min(stageRect.width, stageRect.height);
    const isMobile = window.innerWidth <= 640;
    const radius = Math.max(110, Math.min(minDim * 0.38, isMobile ? 120 : 210));

    if (ringAxis) {
      ringAxis.style.setProperty('--ring-size', `${radius * 2}px`);
    }

    const totalNodes = nodesData.length;
    const angleStep = (2 * Math.PI) / totalNodes;

    nodesData.forEach((node, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      let el = document.getElementById(`node-${node.id}`);
      if (!el) {
        el = document.createElement('div');
        el.id = `node-${node.id}`;
        el.className = 'topo-node';
        el.style.setProperty('--node-color', node.color);
        el.style.setProperty('--node-glow', `${node.color}44`);
        el.textContent = node.id;
        stage.appendChild(el);

        const lbl = document.createElement('div');
        lbl.id = `label-${node.id}`;
        lbl.className = 'node-label-outer';
        lbl.textContent = `${node.id}. ${node.label}`;
        stage.appendChild(lbl);

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          selectNode(node.id);
        });
      }

      const nodeHalfSize = el.offsetWidth > 0 ? el.offsetWidth / 2 : 22;
      el.style.left = `${x - nodeHalfSize}px`;
      el.style.top = `${y - nodeHalfSize}px`;

      const lbl = document.getElementById(`label-${node.id}`);
      if (lbl) {
        const lblRadius = radius + (isMobile ? 22 : 32);
        const lx = centerX + lblRadius * Math.cos(angle);
        const ly = centerY + lblRadius * Math.sin(angle);

        lbl.style.left = `${lx}px`;
        lbl.style.top = `${ly}px`;

        if (Math.cos(angle) < -0.1) {
          lbl.style.transform = 'translate(-100%, -50%)';
        } else if (Math.cos(angle) > 0.1) {
          lbl.style.transform = 'translate(0, -50%)';
        } else {
          lbl.style.transform = 'translate(-50%, -100%)';
        }
      }
    });

    drawNetworkLinks();
  }

  // Draw Curved Bezier Arcs
  function drawNetworkLinks() {
    if (!svgCanvas || !stage) return;
    svgCanvas.innerHTML = '';
    const stageRect = stage.getBoundingClientRect();
    const centerX = stageRect.width / 2;
    const centerY = stageRect.height / 2;

    linksData.forEach((link) => {
      const srcEl = document.getElementById(`node-${link.source}`);
      const tgtEl = document.getElementById(`node-${link.target}`);
      if (!srcEl || !tgtEl) return;

      const srcRect = srcEl.getBoundingClientRect();
      const tgtRect = tgtEl.getBoundingClientRect();

      const x1 = srcRect.left + srcRect.width / 2 - stageRect.left;
      const y1 = srcRect.top + srcRect.height / 2 - stageRect.top;
      const x2 = tgtRect.left + tgtRect.width / 2 - stageRect.left;
      const y2 = tgtRect.top + tgtRect.height / 2 - stageRect.top;

      const cx = (x1 + x2) / 2 + (centerX - (x1 + x2) / 2) * 0.55;
      const cy = (y1 + y2) / 2 + (centerY - (y1 + y2) / 2) * 0.55;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
      path.setAttribute('class', 'net-link');
      path.setAttribute('id', `link-${link.source}-${link.target}`);

      const srcNode = nodesData.find(n => n.id === link.source);
      path.setAttribute('stroke', srcNode ? srcNode.color : '#2fd4c8');

      if (activeNodeId) {
        if (link.source === activeNodeId || link.target === activeNodeId) {
          path.classList.add('active');
        } else {
          path.classList.add('dimmed');
        }
      }

      svgCanvas.appendChild(path);
    });
  }

  // Render KaTeX formula & detailed calculation panel
  function renderCalculationPanel(nodeId) {
    if (!calcPanel) return;

    if (!nodeId) {
      // Central Node Kennedy Overview
      calcPanel.style.setProperty('--panel-accent', '#2fd4c8');
      calcPanel.innerHTML = `
        <div class="calc-panel-header">
          <div class="calc-panel-title">
            <i class="fa-solid fa-calculator"></i>
            <h3>FÓRMULA GLOBAL DE COLAPSO SOCIOECOLÓGICO · LOCALIDAD DE KENNEDY</h3>
          </div>
          <span class="calc-panel-tag">Índice Integral (I_{Kennedy})</span>
        </div>

        <div class="calc-grid">
          <div class="calc-box">
            <div class="calc-box-title"><i class="fa-solid fa-square-root-variable"></i> Ecuación de Colapso Territorial</div>
            <div class="formula-display" id="katexFormulaMain">
              $$I_{Kennedy} = \\alpha \\cdot \\left( \\frac{V_{Viv} \\cdot F_{Carga}}{C_{Vial} \\cdot V_{Transf}} \\right) + \\beta \\cdot \\left( \\frac{R_{Org} + (P_{Lluvia} \\cdot \\%S_{Imp})}{A_{Espejo} \\cdot Cap_{Infilt}} \\right)$$
            </div>
            <div class="formula-explanation">
              Un índice $I_{Kennedy} > 1.0$ indica que la acumulación de flujos de carga, población e impermeabilización sobrepasó la capacidad física de soporte infraestructural y ecológica.
            </div>
          </div>

          <div class="calc-box">
            <div class="calc-box-title"><i class="fa-solid fa-list-check"></i> Componentes y Variables del Sistema</div>
            <table class="variables-table">
              <thead>
                <tr>
                  <th>Término</th>
                  <th>Descripción del Factor</th>
                  <th>Fuente / Datos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>V_{Viv} \cdot F_{Carga}</strong></td>
                  <td>Densidad de viviendas por carga logística pesada</td>
                  <td>Curadurías / SDM</td>
                </tr>
                <tr>
                  <td><strong>C_{Vial} \cdot V_{Transf}</strong></td>
                  <td>Capacidad de vías x Velocidad de transferencia</td>
                  <td>IDU / TransMilenio</td>
                </tr>
                <tr>
                  <td><strong>R_{Org} + (P \cdot \%S)</strong></td>
                  <td>Residuos orgánicos + Lluvia sobre suelo duro</td>
                  <td>UAESP / Sentinel-2</td>
                </tr>
                <tr>
                  <td><strong>A_{Espejo} \cdot Cap</strong></td>
                  <td>Área de agua x Tasa de infiltración natural</td>
                  <td>SDA / EAAB</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="causal-source-footer">
          <div class="meta-info-row">
            <strong>Mecanismo Causal:</strong> Fricción entre la densificación urbana de papel (POT) y la pérdida del 98.6% del sistema de humedales en Bogotá.
          </div>
          <div class="meta-info-row">
            <strong>Citas Académicas:</strong> <span class="citation">SciELO / Universidad Nacional (Humedal El Burro); U. Tadeo Lozano (Corabastos); POT Decreto 555.</span>
          </div>
        </div>
      `;
    } else {
      const node = nodesData.find(n => n.id === nodeId);
      if (!node) return;

      calcPanel.style.setProperty('--panel-accent', node.color);

      let varsHtml = node.variables.map(v => `
        <tr>
          <td><strong>${v.name}</strong></td>
          <td>${v.unit}</td>
          <td>${v.source}</td>
          <td><em style="color:#a0aec0">${v.limit}</em></td>
        </tr>
      `).join('');

      calcPanel.innerHTML = `
        <div class="calc-panel-header">
          <div class="calc-panel-title">
            <i class="fa-solid fa-calculator"></i>
            <h3>CÓMO SE CALCULA EL NODO ${node.id}: ${node.label}</h3>
          </div>
          <span class="calc-panel-tag" style="background:${node.color}22; color:${node.color}; border-color:${node.color}">Eje Sectorial ${node.cat}</span>
        </div>

        <div class="calc-grid">
          <div class="calc-box">
            <div class="calc-box-title"><i class="fa-solid fa-square-root-variable"></i> Ecuación Específica del Nodo</div>
            <div class="formula-display" id="katexFormulaNode">
              $$${node.formula}$$
            </div>
            <div class="formula-explanation">
              ${node.formulaText}
            </div>
          </div>

          <div class="calc-box">
            <div class="calc-box-title"><i class="fa-solid fa-database"></i> Variables Observables y Fuentes de Datos</div>
            <table class="variables-table">
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Unidad</th>
                  <th>Fuente Replicable</th>
                  <th>Limitación</th>
                </tr>
              </thead>
              <tbody>
                ${varsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <div class="causal-source-footer">
          <div class="meta-info-row">
            <strong>Mecanismo Causal:</strong> ${node.mecanismo}
          </div>
          <div class="meta-info-row">
            <strong>Justificación Académica & Oficial:</strong> <span class="citation">${node.fuente}</span>
          </div>
        </div>
      `;
    }

    // Render LaTeX Math with KaTeX if available
    if (window.renderMathInElement) {
      window.renderMathInElement(calcPanel, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ]
      });
    }
  }

  // Select Node
  function selectNode(id) {
    if (activeNodeId === id) {
      activeNodeId = null;
    } else {
      activeNodeId = id;
    }

    const connectedLinks = linksData.filter(l => l.source === id || l.target === id);

    nodesData.forEach(n => {
      const el = document.getElementById(`node-${n.id}`);
      if (!el) return;

      if (!activeNodeId) {
        el.classList.remove('active', 'dimmed');
      } else if (n.id === activeNodeId || connectedLinks.some(l => l.source === n.id || l.target === n.id)) {
        el.classList.add('active');
        el.classList.remove('dimmed');
      } else {
        el.classList.remove('active');
        el.classList.add('dimmed');
      }
    });

    renderCalculationPanel(activeNodeId);
    drawNetworkLinks();
  }

  if (centralBtn) {
    centralBtn.addEventListener('click', () => {
      activeNodeId = null;
      selectNode(null);
    });
  }

  window.addEventListener('resize', positionNodes);
  window.addEventListener('orientationchange', positionNodes);
  setTimeout(() => {
    positionNodes();
    renderCalculationPanel(null); // Initial central calculation panel render
  }, 100);
});
