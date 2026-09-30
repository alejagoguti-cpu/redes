/**
 * Kennedy Interactive 60fps HTML5 Canvas Physics Network Engine
 * Features: Physics simulation (springs + repulsion), node dragging, glowing edge particles,
 * dynamic filtering & KaTeX formula calculation slide-over drawer.
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('networkPhysicsCanvas');
  const drawer = document.getElementById('calcDrawer');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Nodes dataset
  const rawNodes = [
    // Central Hub
    { id: "KENNEDY", label: "LOCALIDAD DE KENNEDY", cat: "CORE", radius: 45, color: "#2fd4c8", glow: "#2fd4c8",
      formula: "I_{Kennedy} = \\alpha \\cdot \\left( \\frac{V_{Viv} \\cdot F_{Carga}}{C_{Vial} \\cdot V_{Transf}} \\right) + \\beta \\cdot \\left( \\frac{R_{Org} + (P_{Lluvia} \\cdot \\%S_{Imp})}{A_{Espejo} \\cdot Cap_{Infilt}} \\right)",
      formulaDesc: "Índice de colapso territorial integral de Kennedy. Mide la sobrecarga de flujos de transporte, vivienda y residuos frente a la capacidad biofísica de infiltración y velocidad de transporte.",
      mecanismo: "Superación de la capacidad de soporte socioecológica de la localidad debido a la densificación de papel y la pérdida del 98.6% del sistema hídrico.",
      fuente: "POT Decreto 555; SciELO / Universidad Nacional; U. Jorge Tadeo Lozano.",
      variables: [
        { name: "V_{Viv} \\cdot F_{Carga}", unit: "Viviendas x Camiones/h", source: "Curadurías Urbanas / SDM", limit: "Licencias aprobadas vs ocupación real" },
        { name: "A_{Espejo} \\cdot Cap", unit: "Hectáreas x Infiltración", source: "SDA / EAAB", limit: "Reducción de humedales a 0.2 ha espejo" }
      ]
    },

    // Category Sector Hubs
    { id: "CAT1", label: "EJE 1: Comercial & Industrial", cat: "1", radius: 34, color: "#e89a6c", glow: "#e89a6c",
      formula: "I_{Comercial} = \\frac{F_{Carga} \\cdot Area_{Comercial}}{Cap_{MallaVial Local}}",
      formulaDesc: "Mide la concentración de logística agroalimentaria e industrial frente a la capacidad de las vías de servicio de Kennedy.",
      mecanismo: "Concentración del abastecimiento alimentario de Bogotá en Corabastos y Parque Industrial Carvajal.",
      fuente: "Universidad Jorge Tadeo Lozano: 'Impacto ambiental en Corabastos por residuos orgánicos'.",
      variables: [{ name: "F_{Carga}", unit: "Vehículos Carga / h", source: "Conteos SDM", limit: "Falta clasificación nocturna" }]
    },
    { id: "CAT2", label: "EJE 2: Movilidad & Flujos", cat: "2", radius: 34, color: "#5b8def", glow: "#5b8def",
      formula: "I_{Movilidad} = \\frac{D_{Población} \\cdot T_{ViajeReal}}{Cap_{Infraestructura} \\cdot T_{Teórico15min}}",
      formulaDesc: "Relaciona el hacinamiento demográfico con el exceso de tiempo de desplazamiento en horas pico.",
      mecanismo: "Saturación del corredor masivo de las Américas por pasajeros pendulares provenientes de Bosa, Soacha y Tintal.",
      fuente: "TransMilenio S.A.; Encuesta de Movilidad SDM / DANE.",
      variables: [{ name: "D_{Andén}", unit: "Personas / m² (Crítico > 4)", source: "Torniquetes TransMilenio", limit: "Mide pasajes vendibles" }]
    },
    { id: "CAT3", label: "EJE 3: Basuras & Ambiental", cat: "3", radius: 34, color: "#2fd4c8", glow: "#2fd4c8",
      formula: "I_{Ambiental} = \\frac{Noise_{dB} \\cdot \\%S_{Impermeable} \\cdot Vertimientos}{Area_{Humedales} \\cdot Cap_{Infiltración}}",
      formulaDesc: "Evalúa la presión acústica, impermeabilización y lixiviados sobre la red hídrica de Kennedy.",
      mecanismo: "Fragmentación de humedales por avenidas asfaltadas y vertimiento de materia orgánica no tratada.",
      fuente: "Plan de Manejo Ambiental Humedal El Burro / La Vaca (SDA).",
      variables: [{ name: "%S_{Imp}", unit: "Porcentaje (%) Suelo Cemento", source: "Sentinel-2 (NDVI/NDBI)", limit: "Resolución 10m" }]
    },

    // Sub-elements (Nodes A1-A4)
    { id: "A1", label: "Corabastos y María Paz", cat: "1", radius: 24, color: "#e89a6c", glow: "#e89a6c",
      formula: "I_{Corabastos} = \\frac{F_{Carga} \\cdot R_{Org}}{Cap_{Vial} \\cdot T_{Compostaje}}",
      formulaDesc: "Evalúa las toneladas diarias de lixiviados orgánicos y el flujo de camiones de abastecimiento.",
      mecanismo: "La falta de compostaje en la fuente genera lixiviados que eutrofizan el Humedal La Vaca.",
      fuente: "U. Tadeo Lozano; UAESP.",
      variables: [{ name: "R_{Org}", unit: "Toneladas Lixiviados / Día", source: "UAESP / Monitoreo", limit: "Basura informal no pesada" }]
    },
    { id: "A2", label: "Zona Ind. Carvajal", cat: "1", radius: 24, color: "#e89a6c", glow: "#e89a6c",
      formula: "\\%S_{Imp} = \\frac{Area_{Techada} + Area_{Pavimento}}{Area_{TotalUPZ}} \\times 100",
      formulaDesc: "Porcentaje de suelo impermeabilizado por parques industriales y bodegas.",
      mecanismo: "Eliminación de la absorción de lluvia, multiplicando escorrentía superficial.",
      fuente: "Imágenes Satelitales Copernicus / Sentinel-2.",
      variables: [{ name: "Area_{Techada}", unit: "Metros Cuadrados (m²)", source: "Sentinel-2 NDBI", limit: "Píxel 10m" }]
    },
    { id: "A3", label: "Corredor Calle 13 / AE09", cat: "1", radius: 24, color: "#e89a6c", glow: "#e89a6c",
      formula: "F_{Logístico} = \\frac{V_{Pesado}}{Cap_{Teórica}} \\times Noise_{dB}",
      formulaDesc: "Fricción de carga pesada vinculada al Distrito Aeroportuario Fontibón.",
      mecanismo: "Barrera acústica (>75 dB) y física que aísla el norte residencial de Kennedy.",
      fuente: "POT Decreto 555 (AE09); SDM.",
      variables: [{ name: "Noise_{dB}", unit: "Decibeles continuos (dB_A)", source: "Estaciones SDA", limit: "Medidores distantes" }]
    },
    { id: "A4", label: "Comercio Informal (Patio Bonito)", cat: "1", radius: 24, color: "#e89a6c", glow: "#e89a6c",
      formula: "D_{Informal} = \\frac{Unidades_{Comerciales}}{m^2 \\text{ Espacio Público}}",
      formulaDesc: "Concentración de mercados callejeros y ocupación informal de andenes.",
      mecanismo: "Residuos de comercio ambulante obstruyen el alcantarillado pluvial en aguaceros.",
      fuente: "Revista de Estudios Sociales (Redalyc).",
      variables: [{ name: "Unidades", unit: "Puestos de venta / m²", source: "Censo informal", limit: "Fluctuación horaria" }]
    },

    // Sub-elements (Nodes B1-B4)
    { id: "B1", label: "Banderas (Av. Américas)", cat: "2", radius: 24, color: "#5b8def", glow: "#5b8def",
      formula: "I_{Hacinamiento} = \\frac{Pasajeros_{Esperando}}{Area_{Andén} \\text{ (m²)}}",
      formulaDesc: "Hacinamiento de pasajeros en andén de transferencia masiva.",
      mecanismo: "Densificación de vivienda en Tintal (AE15) colapsa la estación en horas pico (>4 pers/m²).",
      fuente: "TransMilenio S.A.; POT Decreto 555.",
      variables: [{ name: "Pasajeros", unit: "Personas / Hora Pico", source: "Torniquetes TM", limit: "Mide pasajes vendidos" }]
    },
    { id: "B2", label: "Av. Ciudad de Cali", cat: "2", radius: 24, color: "#5b8def", glow: "#5b8def",
      formula: "F_{Fragmentación} = \\frac{V_{Tráfico}}{Distancia_{Humedal}} \\times Noise_{dB}",
      formulaDesc: "Impacto de fricción vial y ruido sobre el Humedal El Burro.",
      mecanismo: "La avenida fraccionó el humedal en dos sectores aislando la avifauna.",
      fuente: "SciELO / Universidad Nacional.",
      variables: [{ name: "Noise", unit: "Decibeles continuos (dB_A)", source: "SDA Monitoreo", limit: "Ruido continuo > 75 dB" }]
    },
    { id: "B3", label: "Av. Boyacá & C. Vargas", cat: "2", radius: 24, color: "#5b8def", glow: "#5b8def",
      formula: "T_{Retraso} = T_{ViajeReal} - T_{Teórico15min}",
      formulaDesc: "Retraso empírico en minutos frente a la promesa de la ciudad de 15 min.",
      mecanismo: "Cuellos de botella por tráfico pesado elevan viajes a más de 60 minutos.",
      fuente: "SDM; Google Traffic GPS.",
      variables: [{ name: "T_{Real}", unit: "Minutos en presa", source: "GPS Flotas / SDM", limit: "Varía por lluvia" }]
    },
    { id: "B4", label: "Embudo Bosa/Soacha", cat: "2", radius: 24, color: "#5b8def", glow: "#5b8def",
      formula: "V_{Flotante} = \\frac{Viajes_{Soacha+Bosa}}{Cap_{CorredorKennedy}}",
      formulaDesc: "Demanda de viajes pendulares extralocales que cruzan por Kennedy.",
      mecanismo: "Municipios dormitorio descargan su población trabajadora sobre la infraestructura de Kennedy.",
      fuente: "Encuesta Origen-Destino SDM / DANE.",
      variables: [{ name: "Viajes", unit: "Personas / Día", source: "Encuesta SDM", limit: "Datos censo 2019" }]
    },

    // Sub-elements (Nodes C1-C3)
    { id: "C1", label: "Humedales (El Burro / La Vaca / Techo)", cat: "3", radius: 24, color: "#2fd4c8", glow: "#2fd4c8",
      formula: "\\%Reducción_{Area} = \\frac{Area_{Histórica} - Area_{Actual}}{Area_{Histórica}} \\times 100",
      formulaDesc: "Pérdida histórica del 98.67% de los humedales de Bogotá por pavimentación.",
      mecanismo: "El Burro se redujo de 54 ha a 18.8 ha legales con solo 0.2 ha de espejo de agua.",
      fuente: "Plan de Manejo Ambiental SDA / EAAB.",
      variables: [{ name: "Area_{Actual}", unit: "Hectáreas (ha)", source: "SDA / EAAB", limit: "Espejo de agua 0.2 ha" }]
    },
    { id: "C2", label: "Ríos Fucha y Tunjuelito", cat: "3", radius: 24, color: "#2fd4c8", glow: "#2fd4c8",
      formula: "BOD_{Carga} = \\text{mg/L de Demanda Bioquímica de Oxígeno}",
      formulaDesc: "Grado de contaminación por vertimientos y pérdida de oxígeno hídrico.",
      mecanismo: "Lixiviados comerciales reducen el oxígeno en agua produciendo gas ácido sulfhídrico.",
      fuente: "EAAB Monitoreo Hídrico.",
      variables: [{ name: "BOD", unit: "mg O₂ / Litro", source: "EAAB", limit: "Muestreo no continuo" }]
    },
    { id: "C3", label: "Escorrentía & Suelo Duro", cat: "3", radius: 24, color: "#2fd4c8", glow: "#2fd4c8",
      formula: "Q_{Escorrentía} = C \\cdot I \\cdot A_{Impermeable}",
      formulaDesc: "Fórmula Racional de Drenaje: caudal de inundación por lluvia sobre suelo pavimentado.",
      mecanismo: "Al superar el 75% de suelo pavimentado, el agua rueda a las calles causando inundaciones.",
      fuente: "IDEAM; Modelo Hidrológico Racional.",
      variables: [{ name: "C", unit: "Coeficiente escorrentía (0.85 asfalto)", source: "Sentinel-2 NDBI", limit: "Resolución 10m" }]
    }
  ];

  // Interconnected links
  const linksData = [
    // Core connections
    { source: "KENNEDY", target: "CAT1" },
    { source: "KENNEDY", target: "CAT2" },
    { source: "KENNEDY", target: "CAT3" },

    // Sector 1 Hub to Sub-nodes
    { source: "CAT1", target: "A1" },
    { source: "CAT1", target: "A2" },
    { source: "CAT1", target: "A3" },
    { source: "CAT1", target: "A4" },

    // Sector 2 Hub to Sub-nodes
    { source: "CAT2", target: "B1" },
    { source: "CAT2", target: "B2" },
    { source: "CAT2", target: "B3" },
    { source: "CAT2", target: "B4" },

    // Sector 3 Hub to Sub-nodes
    { source: "CAT3", target: "C1" },
    { source: "CAT3", target: "C2" },
    { source: "CAT3", target: "C3" },

    // Cross-Sector Systemic Relations (Graph Topology Loops)
    { source: "A1", target: "B1" },
    { source: "A1", target: "C2" },
    { source: "A2", target: "C3" },
    { source: "A3", target: "B4" },
    { source: "B2", target: "C1" },
    { source: "B1", target: "C3" },
    { source: "C1", target: "C3" }
  ];

  let nodes = [];
  let links = [];
  let particles = [];
  let width = 0;
  let height = 0;
  let activeCategory = 'ALL';
  let hoveredNode = null;
  let selectedNode = null;
  let draggedNode = null;

  // Resize canvas dynamically
  function resizeCanvas() {
    const parent = canvas.parentElement;
    width = parent.clientWidth;
    height = parent.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    if (nodes.length === 0) {
      initPhysicsNodes();
    }
  }

  // Initialize nodes with random positions around center
  function initPhysicsNodes() {
    const cx = width / 2;
    const cy = height / 2;

    nodes = rawNodes.map((rn, idx) => {
      let angle = (idx / rawNodes.length) * Math.PI * 2;
      let dist = rn.id === "KENNEDY" ? 0 : rn.id.startsWith("CAT") ? 140 : 260;

      return {
        ...rn,
        x: cx + Math.cos(angle) * dist + (Math.random() - 0.5) * 20,
        y: cy + Math.sin(angle) * dist + (Math.random() - 0.5) * 20,
        vx: 0,
        vy: 0,
        visible: true
      };
    });

    links = linksData.map(l => ({
      sourceNode: nodes.find(n => n.id === l.source),
      targetNode: nodes.find(n => n.id === l.target)
    })).filter(l => l.sourceNode && l.targetNode);

    // Create moving particles along edges
    particles = [];
    for (let i = 0; i < 28; i++) {
      const link = links[Math.floor(Math.random() * links.length)];
      particles.push({
        link,
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.005
      });
    }
  }

  // 60fps Physics Simulation Loop (Springs + Repulsion + Gravity)
  function updatePhysics() {
    const cx = width / 2;
    const cy = height / 2;
    const kSpring = 0.0025;
    const repulsion = 1800;
    const gravity = 0.0004;
    const damping = 0.82;

    // 1. Repulsion between all node pairs
    for (let i = 0; i < nodes.length; i++) {
      if (!nodes[i].visible) continue;
      for (let j = i + 1; j < nodes.length; j++) {
        if (!nodes[j].visible) continue;

        let dx = nodes[j].x - nodes[i].x;
        let dy = nodes[j].y - nodes[i].y;
        let distSq = dx * dx + dy * dy + 1;
        let dist = Math.sqrt(distSq);

        if (dist < 320) {
          let force = (repulsion / distSq);
          let fx = (dx / dist) * force;
          let fy = (dy / dist) * force;

          nodes[i].vx -= fx;
          nodes[i].vy -= fy;
          nodes[j].vx += fx;
          nodes[j].vy += fy;
        }
      }
    }

    // 2. Spring attraction along links
    links.forEach(l => {
      if (!l.sourceNode.visible || !l.targetNode.visible) return;
      let dx = l.targetNode.x - l.sourceNode.x;
      let dy = l.targetNode.y - l.sourceNode.y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 1;
      let targetDist = l.sourceNode.id === "KENNEDY" || l.targetNode.id === "KENNEDY" ? 140 : 100;
      let force = (dist - targetDist) * kSpring;

      let fx = (dx / dist) * force;
      let fy = (dy / dist) * force;

      l.sourceNode.vx += fx;
      l.sourceNode.vy += fy;
      l.targetNode.vx -= fx;
      l.targetNode.vy -= fy;
    });

    // 3. Central gravity & velocity update
    nodes.forEach(n => {
      if (!n.visible) return;
      if (n === draggedNode) return; // Dragged node stays under cursor

      let dx = cx - n.x;
      let dy = cy - n.y;
      n.vx += dx * gravity;
      n.vy += dy * gravity;

      n.vx *= damping;
      n.vy *= damping;

      n.x += n.vx;
      n.y += n.vy;

      // Keep inside boundaries
      n.x = Math.max(n.radius + 10, Math.min(width - n.radius - 10, n.x));
      n.y = Math.max(n.radius + 10, Math.min(height - n.radius - 10, n.y));
    });

    // Update particles progress
    particles.forEach(p => {
      p.progress += p.speed;
      if (p.progress >= 1) p.progress = 0;
    });
  }

  // Draw 60fps Canvas Frame
  function drawFrame() {
    ctx.clearRect(0, 0, width, height);

    // Draw Links
    links.forEach(l => {
      if (!l.sourceNode.visible || !l.targetNode.visible) return;

      const isHighlight = (hoveredNode && (l.sourceNode === hoveredNode || l.targetNode === hoveredNode)) ||
                          (selectedNode && (l.sourceNode === selectedNode || l.targetNode === selectedNode));

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(l.sourceNode.x, l.sourceNode.y);
      ctx.lineTo(l.targetNode.x, l.targetNode.y);

      if (isHighlight) {
        ctx.strokeStyle = l.sourceNode.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = l.sourceNode.color;
        ctx.shadowBlur = 12;
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 6]);
      }
      ctx.stroke();
      ctx.restore();
    });

    // Draw Energy Flow Particles along links
    particles.forEach(p => {
      if (!p.link.sourceNode.visible || !p.link.targetNode.visible) return;
      const x = p.link.sourceNode.x + (p.link.targetNode.x - p.link.sourceNode.x) * p.progress;
      const y = p.link.sourceNode.y + (p.link.targetNode.y - p.link.sourceNode.y) * p.progress;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = p.link.sourceNode.color;
      ctx.shadowColor = p.link.sourceNode.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    });

    // Draw Nodes
    nodes.forEach(n => {
      if (!n.visible) return;

      const isHover = n === hoveredNode;
      const isSel = n === selectedNode;
      const r = isHover || isSel ? n.radius * 1.12 : n.radius;

      ctx.save();
      // Outer Glow
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      let grad = ctx.createRadialGradient(n.x, n.y, r * 0.3, n.x, n.y, r);
      grad.addColorStop(0, '#121824');
      grad.addColorStop(1, '#080c14');
      ctx.fillStyle = grad;
      ctx.lineWidth = isHover || isSel ? 3 : 2;
      ctx.strokeStyle = n.color;
      ctx.shadowColor = n.glow;
      ctx.shadowBlur = isHover || isSel ? 25 : 12;
      ctx.fill();
      ctx.stroke();

      // Node Label Text inside/below
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = `${n.id === "KENNEDY" ? 'bold 11px' : '600 10px'} "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (n.id === "KENNEDY") {
        ctx.fillText("KENNEDY", n.x, n.y - 6);
        ctx.fillStyle = "#2fd4c8";
        ctx.font = '9px "Inter", sans-serif';
        ctx.fillText("CORE HUB", n.x, n.y + 8);
      } else if (n.id.startsWith("CAT")) {
        ctx.fillText(n.id, n.x, n.y - 5);
        ctx.fillStyle = n.color;
        ctx.font = '8.5px "Inter", sans-serif';
        ctx.fillText(`SECTOR ${n.cat}`, n.x, n.y + 7);
      } else {
        ctx.fillText(n.id, n.x, n.y);
      }

      // Outer Label Text below node
      ctx.fillStyle = isHover || isSel ? '#ffffff' : '#cbd5e1';
      ctx.font = `${isHover || isSel ? 'bold 11px' : '500 10.5px'} "Inter", sans-serif`;
      ctx.fillText(n.label, n.x, n.y + r + 14);

      ctx.restore();
    });
  }

  // Animation Frame Loop
  function animate() {
    updatePhysics();
    drawFrame();
    requestAnimationFrame(animate);
  }

  // Mouse & Touch Interactivity (Dragging & Clicking)
  function getNodeAt(mx, my) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      let n = nodes[i];
      if (!n.visible) continue;
      let dx = mx - n.x;
      let dy = my - n.y;
      if (Math.sqrt(dx * dx + dy * dy) <= n.radius + 8) {
        return n;
      }
    }
    return null;
  }

  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX || e.touches[0].clientX) - rect.left,
      y: (e.clientY || e.touches[0].clientY) - rect.top
    };
  }

  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(e);
    if (draggedNode) {
      draggedNode.x = pos.x;
      draggedNode.y = pos.y;
    } else {
      hoveredNode = getNodeAt(pos.x, pos.y);
    }
  });

  canvas.addEventListener('mousedown', (e) => {
    const pos = getMousePos(e);
    const n = getNodeAt(pos.x, pos.y);
    if (n) {
      draggedNode = n;
      selectNode(n);
    }
  });

  window.addEventListener('mouseup', () => {
    draggedNode = null;
  });

  // Touch events for mobile
  canvas.addEventListener('touchstart', (e) => {
    const pos = getMousePos(e);
    const n = getNodeAt(pos.x, pos.y);
    if (n) {
      draggedNode = n;
      selectNode(n);
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    if (draggedNode) {
      const pos = getMousePos(e);
      draggedNode.x = pos.x;
      draggedNode.y = pos.y;
    }
  }, { passive: true });

  canvas.addEventListener('touchend', () => {
    draggedNode = null;
  });

  // Open Slide-over Calculation Drawer
  function selectNode(node) {
    selectedNode = node;
    if (!node || !drawer) return;

    drawer.style.setProperty('--drawer-color', node.color);
    drawer.querySelector('.drawer-title h3').textContent = `NODO ${node.id}: ${node.label}`;
    drawer.querySelector('.drawer-tag').textContent = `SECTOR ${node.cat === 'CORE' ? 'CENTRAL' : node.cat}`;
    drawer.querySelector('.drawer-formula-display').textContent = `$$${node.formula}$$`;
    drawer.querySelector('.drawer-formula-desc').textContent = node.formulaDesc;
    drawer.querySelector('.drawer-mecanismo').textContent = node.mecanismo;
    drawer.querySelector('.drawer-fuente').textContent = node.fuente;

    const varsContainer = drawer.querySelector('.drawer-vars-list');
    varsContainer.innerHTML = node.variables.map(v => `
      <div class="drawer-var-card">
        <div class="drawer-var-head">
          <strong>$${v.name}$</strong>
          <span>${v.unit}</span>
        </div>
        <div class="drawer-var-body">
          Fuente: ${v.source} | <em style="color:#e2e8f0">${v.limit}</em>
        </div>
      </div>
    `).join('');

    drawer.classList.add('open');

    // Render KaTeX Math
    if (window.renderMathInElement) {
      window.renderMathInElement(drawer, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ]
      });
    }
  }

  // Close Drawer
  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', () => {
      drawer.classList.remove('open');
      selectedNode = null;
    });
  }

  // Toolbar Category Filtering
  const filterBtns = document.querySelectorAll('.graph-btn[data-filter]');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-filter');

      nodes.forEach(n => {
        if (activeCategory === 'ALL' || n.cat === 'CORE' || n.cat === activeCategory) {
          n.visible = true;
        } else {
          n.visible = false;
        }
      });
    });
  });

  // Reset Physics Layout
  const resetBtn = document.getElementById('resetPhysicsBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      initPhysicsNodes();
      if (drawer) drawer.classList.remove('open');
      selectedNode = null;
    });
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  animate();
});
