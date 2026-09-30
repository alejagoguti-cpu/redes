/**
 * Red de Relaciones del Modelo Propio · Localidad de Kennedy
 * Sistema Socioecológico-Técnico Complejo de 3 Capas Interconectadas (N1 a N12)
 * 60fps HTML5 Canvas Physics Engine (Sin nodo central de Kennedy)
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('networkPhysicsCanvas');
  const drawer = document.getElementById('calcDrawer');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Exact 12 Nodes [N1] to [N12] organized in 3 Interconnected Layers (Sin nodo central)
  const rawNodes = [
    // CAPA 1: Centralidades Comerciales, Logísticas e Industriales (Presión / Entradas - #e89a6c)
    {
      id: "N1",
      code: "[N1]",
      label: "Corabastos y Centralidad Mayorista (María Paz)",
      layer: "1",
      layerName: "Capa 1: Comercio & Logística",
      role: "Hub de Influencia (Grado Saliente Alto)",
      radius: 34,
      color: "#e89a6c",
      glow: "#e89a6c",
      desc: "Punto de concentración alimentario regional que genera flujos masivos de transporte pesado y toneladas diarias de residuos orgánicos.",
      potDeficiente: "Clasificación de uso del suelo (Comercial / Zona de Abastecimiento). Ignora las tasas reales de lixiviados y carga logística.",
      modeloPropio: "Tasa de Generación y Vertimiento de Carga Orgánica/Industrial No Tratada.",
      queMide: "Mide las toneladas reales de residuos y lixiviados que llegan a la cuenca hídrica desde Corabastos.",
      mecanismo: "Inyecta camiones pesados deteriorando la malla vial local (N8) y filtra lixiviados acelerando la eutrofización en Humedal La Vaca (N10)."
    },
    {
      id: "N2",
      code: "[N2]",
      label: "Zona Industrial de Carvajal (Bodegaje & Manufactura)",
      layer: "1",
      layerName: "Capa 1: Comercio & Logística",
      role: "Nodo de Entrada de Carga Industrial",
      radius: 28,
      color: "#e89a6c",
      glow: "#e89a6c",
      desc: "Polígono de pequeñas y grandes industrias (plásticos, metalmecánica) con alta demanda de almacenamiento y transporte de insumos.",
      potDeficiente: "Zonificación industrial plana en mapa.",
      modeloPropio: "Índice de Demanda Logística e Impermeabilización por Naves Industriales.",
      queMide: "Mide el consumo de suelo por pavimentación industrial y generación de transporte de insumos.",
      mecanismo: "Descarga tráfico pesado sobre la Av. Ciudad de Cali (N6) y pavimenta suelo de absorción."
    },
    {
      id: "N3",
      code: "[N3]",
      label: "Corredor de Carga Calle 13 / AE09 (Distrito Aeroportuario)",
      layer: "1",
      layerName: "Capa 1: Comercio & Logística",
      role: "Nodo de Entrada Metropolitana",
      radius: 28,
      color: "#e89a6c",
      glow: "#e89a6c",
      desc: "Arteria de articulación metropolitana que inyecta transporte pesado de carga hacia el norte de la localidad.",
      potDeficiente: "Eje de transporte metropolitano sin medición de fricción residencial.",
      modeloPropio: "Índice de Fricción Logística e Inyección de Carga Pesada Extralocal.",
      queMide: "Mide el volumen de camiones regionales sobre la barrera residencial de Calle 13.",
      mecanismo: "Inyecta congestión de carga hacia la red primaria de Kennedy (N6)."
    },
    {
      id: "N4",
      code: "[N4]",
      label: "Comercio Popular e Informal (Patio Bonito / Tintal / Kennedy Central)",
      layer: "1",
      layerName: "Capa 1: Comercio & Logística",
      role: "Nodo de Abastecimiento Popular",
      radius: 26,
      color: "#e89a6c",
      glow: "#e89a6c",
      desc: "Redes de comercio en espacio público que sostienen el abastecimiento vecinal directo.",
      potDeficiente: "Infracción o uso no permitido del suelo.",
      modeloPropio: "Densidad de Comercio Popular y Generación de Residuos Urbanos en Fuente.",
      queMide: "Mide la ocupación de andenes y la basura comercial no recolectada por la norma.",
      mecanismo: "Sobrecarga la malla vial de barrio (N8) con desechos comerciales."
    },

    // CAPA 2: Redes de Movilidad e Infraestructura Física (Fricción / Flujos - #f59e0b / #5b8def)
    {
      id: "N5",
      code: "[N5]",
      label: "Estación Banderas (Nodo de Transferencia Av. de las Américas)",
      layer: "2",
      layerName: "Capa 2: Movilidad & Flujos",
      role: "Hub de Vulnerabilidad (Grado Entrante Alto)",
      radius: 34,
      color: "#f59e0b",
      glow: "#f59e0b",
      desc: "Embudo de transporte masivo donde converge la población residente y flotante en horas pico.",
      potDeficiente: "Distancia plana de 500 m a estaciones (Proximidad teórica de 15 minutos).",
      modeloPropio: "Índice de Hacinamiento en Andén (pers/m²) y Tiempo Real de Viaje (>60 min).",
      queMide: "Mide las filas de más de 4 pers/m² y sobretiempos causados por el embudo de Bosa y Soacha.",
      mecanismo: "Recibe el flujo masivo de Soacha/Bosa (N7) y el colapso de andenes ralentiza la malla vial de barrio (N8)."
    },
    {
      id: "N6",
      code: "[N6]",
      label: "Corredor Arterial Av. Ciudad de Cali",
      layer: "2",
      layerName: "Capa 2: Movilidad & Flujos",
      role: "Hub de Influencia & Nodo Puente Intercapa",
      radius: 34,
      color: "#f59e0b",
      glow: "#f59e0b",
      desc: "Eje longitudinal de alta velocidad y carga que atraviesa y fracciona físicamente el territorio.",
      potDeficiente: "Vía arterial de transporte público y particular.",
      modeloPropio: "Índice de Presión Sonora (>75 dB) y Coeficiente de Fragmentación Ecológica.",
      queMide: "Mide el ruido continuo y la barrera física que aisló en dos al Humedal El Burro.",
      mecanismo: "Transmite ruido (>75 dB) y escorrentía con hidrocarburos al Humedal El Burro (N9)."
    },
    {
      id: "N7",
      code: "[N7]",
      label: "Flujos Pendulares Extralocales (Soacha y Bosa → Kennedy)",
      layer: "2",
      layerName: "Capa 2: Movilidad & Flujos",
      role: "Nodo de Presión Flotante Metodológico",
      radius: 28,
      color: "#f59e0b",
      glow: "#f59e0b",
      desc: "Cientos de miles de viajes diarios de paso que ingresan a Kennedy buscando acceso al centro de Bogotá.",
      potDeficiente: "Cien por ciento invisibilizado en el POT por límites administrativos de UPZ.",
      modeloPropio: "Tasa de Inyección de Pasajeros Flotantes Extralocales sobre la Infraestructura de Kennedy.",
      queMide: "Mide el volumen de personas no residentes que consumen la capacidad de transporte local.",
      mecanismo: "Empuja oleadas de viajeros embudándose en la Estación Banderas (N5)."
    },
    {
      id: "N8",
      code: "[N8]",
      label: "Malla Vial Local y Conectores de Barrio",
      layer: "2",
      layerName: "Capa 2: Movilidad & Flujos",
      role: "Nodo Receptor de Fricción Vial",
      radius: 26,
      color: "#f59e0b",
      glow: "#f59e0b",
      desc: "Vías de escala residencial sobrecargadas por el desvío de tráfico pesado y particular.",
      potDeficiente: "Vías locales de servicio barrial.",
      modeloPropio: "Índice de Deterioro de Pavimento y Fricción Vial Residencial.",
      queMide: "Mide el daño en calles de barrio por camiones desviados de Corabastos.",
      mecanismo: "Recibe el desvío de camiones de Corabastos (N1) e inhibe la velocidad de alimentadores a Banderas (N5)."
    },

    // CAPA 3: Ecosistema, Agua y Metabolismo Territorial (Capacidad de Soporte - #2fd4c8)
    {
      id: "N9",
      code: "[N9]",
      label: "Humedal El Burro (Fraccionado en dos por la Av. Cali)",
      layer: "3",
      layerName: "Capa 3: Ecosistema & Agua",
      role: "Hub de Vulnerabilidad (Grado Entrante Alto)",
      radius: 34,
      color: "#2fd4c8",
      glow: "#2fd4c8",
      desc: "Reserva ecológica reducida históricamente a 18.8 ha (con solo 0.2 ha de espejo de agua) dividida por el asfalto.",
      potDeficiente: "Área de Parque Ecológico Distrital delimitada en plano en hectáreas.",
      modeloPropio: "Porcentaje de Infiltración Biofísica Efectiva y Presión Sonora en Borde.",
      queMide: "Mide el aislamiento de la avifauna y el ruido de buses constante (>75 dB).",
      mecanismo: "Sufre la presión de ruido/escorrentía de la Av. Cali (N6) y la falta de infiltración por suelo duro (N12)."
    },
    {
      id: "N10",
      code: "[N10]",
      label: "Humedal La Vaca (Impactado por Lixiviados / Vertimientos)",
      layer: "3",
      layerName: "Capa 3: Ecosistema & Agua",
      role: "Hub de Vulnerabilidad Hídrico-Sanitaria",
      radius: 32,
      color: "#2fd4c8",
      glow: "#2fd4c8",
      desc: "Ecosistema en la zona de influencia directa de Corabastos afectado por basura y carga contaminante.",
      potDeficiente: "Polígono de conservación hídrica estático.",
      modeloPropio: "Tasa de Vertimiento de Carga Orgánica y Nivel de Eutrofización en Agua.",
      queMide: "Mide los lixiviados y la pérdida de oxígeno que producen malos olores (ácido sulfhídrico).",
      mecanismo: "Recibe basuras y lixiviados directos de Corabastos (N1) dañando su capacidad depuradora."
    },
    {
      id: "N11",
      code: "[N11]",
      label: "Humedal Techo y Matriz Hídrica Fucha-Tunjuelito",
      layer: "3",
      layerName: "Capa 3: Ecosistema & Agua",
      role: "Nodo Receptáculo de Cuenca Hidrográfica",
      radius: 28,
      color: "#2fd4c8",
      glow: "#2fd4c8",
      desc: "Canales y cuencas receptoras de la escorrentía pluvial urbana de toda la localidad.",
      potDeficiente: "Canales de drenaje de concreto aislados.",
      modeloPropio: "Índice de Saturación de Caudal Pluvial y Carga Pollutante de Cuenca Media.",
      queMide: "Mide el volumen de agua sucia que descarga al Río Bogotá por sobrecarga urbana.",
      mecanismo: "Recibe el caudal de escorrentía no infiltrado del suelo pavimentado (N12)."
    },
    {
      id: "N12",
      code: "[N12]",
      label: "Suelo Impermeabilizado y Cemento (Castilla / Tintal / Patio Bonito)",
      layer: "3",
      layerName: "Capa 3: Ecosistema & Agua",
      role: "Nodo Puente / Articulador Intercapa (Cero Infiltración)",
      radius: 34,
      color: "#2fd4c8",
      glow: "#2fd4c8",
      desc: "Superficie pavimentada masiva que anula la capacidad de infiltración del terreno como 'ciudad esponja'.",
      potDeficiente: "Superficie urbana construible autorizada por licencias.",
      modeloPropio: "Porcentaje (%) de Suelo Impermeable (NDBI) y Coeficiente de Escorrentía Pluvial.",
      queMide: "Mide el cemento que impide que el agua de lluvia se hunda, provocando inundaciones de calle.",
      mecanismo: "Anula la infiltración (Causal -) hacia N9, N10 y N11, disparando encharcamientos e inundaciones."
    }
  ];

  // Direct Connections Matrix (Enlances Principales con Tipos)
  const linksData = [
    { source: "N1", target: "N8", type: "Flujo de Carga", label: "N1 -> N8: Corabastos inyecta camiones a calles residenciales de María Paz" },
    { source: "N1", target: "N10", type: "Causal + (Lixiviados)", label: "N1 -> N10: Desperdicios sin tratar filtran contaminantes al Humedal La Vaca" },
    { source: "N7", target: "N5", type: "Flujo Pasajeros", label: "N7 -> N5: Demanda pendular de Soacha/Bosa sobrecarga andenes de Banderas" },
    { source: "N6", target: "N9", type: "Causal + (Ruido >75dB)", label: "N6 -> N9: Av. Cali transmite vibración y ruido asustando la avifauna de El Burro" },
    { source: "N12", target: "N9", type: "Causal - (Cero Infiltración)", label: "N12 -> N9: Suelo pavimentado impide infiltración en Humedal El Burro" },
    { source: "N12", target: "N10", type: "Causal - (Cero Infiltración)", label: "N12 -> N10: Suelo pavimentado impide infiltración en Humedal La Vaca" },
    { source: "N12", target: "N11", type: "Causal - (Cero Infiltración)", label: "N12 -> N11: Suelo duro anula infiltración y dispara inundaciones pluviales" },
    { source: "N5", target: "N8", type: "Retroalimentación +", label: "N5 -> N8: Colapso en Banderas ralentiza alimentadores paralizando la movilidad local" },
    { source: "N2", target: "N6", type: "Flujo Industrial", label: "N2 -> N6: Zona Industrial Carvajal inyecta tráfico pesado a Av. Cali" },
    { source: "N3", target: "N6", type: "Carga Metropolitana", label: "N3 -> N6: Carga de Calle 13 / AE09 descarga hacia el corredor de Av. Cali" },
    { source: "N4", target: "N8", type: "Residuos Urbanos", label: "N4 -> N8: Comercio informal sobrecarga espacio público y calles de barrio" },
    { source: "N8", target: "N5", type: "Saturación Local", label: "N8 -> N5: Alimentadores de barrio convergen embudándose en Banderas" }
  ];

  let nodes = [];
  let links = [];
  let particles = [];
  let width = 0;
  let height = 0;
  let activeFilter = 'ALL';
  let hoveredNode = null;
  let selectedNode = null;
  let draggedNode = null;

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

  function initPhysicsNodes() {
    const cx = width / 2;

    nodes = rawNodes.map((rn) => {
      let layerY = height * 0.25;
      if (rn.layer === "2") layerY = height * 0.5;
      if (rn.layer === "3") layerY = height * 0.75;

      return {
        ...rn,
        x: cx + (Math.random() - 0.5) * (width * 0.7),
        y: layerY + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        visible: true
      };
    });

    links = linksData.map(l => ({
      ...l,
      sourceNode: nodes.find(n => n.id === l.source),
      targetNode: nodes.find(n => n.id === l.target)
    })).filter(l => l.sourceNode && l.targetNode);

    particles = [];
    for (let i = 0; i < 35; i++) {
      const link = links[Math.floor(Math.random() * links.length)];
      particles.push({
        link,
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.004
      });
    }
  }

  function updatePhysics() {
    const repulsion = 2200;
    const kSpring = 0.003;
    const damping = 0.82;

    for (let i = 0; i < nodes.length; i++) {
      if (!nodes[i].visible) continue;
      for (let j = i + 1; j < nodes.length; j++) {
        if (!nodes[j].visible) continue;

        let dx = nodes[j].x - nodes[i].x;
        let dy = nodes[j].y - nodes[i].y;
        let distSq = dx * dx + dy * dy + 1;
        let dist = Math.sqrt(distSq);

        if (dist < 280) {
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

    links.forEach(l => {
      if (!l.sourceNode.visible || !l.targetNode.visible) return;
      let dx = l.targetNode.x - l.sourceNode.x;
      let dy = l.targetNode.y - l.sourceNode.y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 1;
      let targetDist = 130;
      let force = (dist - targetDist) * kSpring;

      let fx = (dx / dist) * force;
      let fy = (dy / dist) * force;

      l.sourceNode.vx += fx;
      l.sourceNode.vy += fy;
      l.targetNode.vx -= fx;
      l.targetNode.vy -= fy;
    });

    nodes.forEach(n => {
      if (!n.visible) return;
      if (n === draggedNode) return;

      let targetY = height * 0.25;
      if (n.layer === "2") targetY = height * 0.5;
      if (n.layer === "3") targetY = height * 0.75;

      n.vy += (targetY - n.y) * 0.01;

      n.vx *= damping;
      n.vy *= damping;

      n.x += n.vx;
      n.y += n.vy;

      n.x = Math.max(n.radius + 10, Math.min(width - n.radius - 10, n.x));
      n.y = Math.max(n.radius + 10, Math.min(height - n.radius - 10, n.y));
    });

    particles.forEach(p => {
      p.progress += p.speed;
      if (p.progress >= 1) p.progress = 0;
    });
  }

  function drawFrame() {
    ctx.clearRect(0, 0, width, height);

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
        ctx.lineWidth = 3.5;
        ctx.shadowColor = l.sourceNode.color;
        ctx.shadowBlur = 14;
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 5]);
      }
      ctx.stroke();

      const dx = l.targetNode.x - l.sourceNode.x;
      const dy = l.targetNode.y - l.sourceNode.y;
      const angle = Math.atan2(dy, dx);
      const arrowDist = l.targetNode.radius + 6;
      const ax = l.targetNode.x - arrowDist * Math.cos(angle);
      const ay = l.targetNode.y - arrowDist * Math.sin(angle);

      ctx.beginPath();
      ctx.fillStyle = isHighlight ? l.sourceNode.color : '#8a96a8';
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - 10 * Math.cos(angle - Math.PI / 7), ay - 10 * Math.sin(angle - Math.PI / 7));
      ctx.lineTo(ax - 10 * Math.cos(angle + Math.PI / 7), ay - 10 * Math.sin(angle + Math.PI / 7));
      ctx.fill();

      ctx.restore();
    });

    particles.forEach(p => {
      if (!p.link.sourceNode.visible || !p.link.targetNode.visible) return;
      const x = p.link.sourceNode.x + (p.link.targetNode.x - p.link.sourceNode.x) * p.progress;
      const y = p.link.sourceNode.y + (p.link.targetNode.y - p.link.sourceNode.y) * p.progress;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = p.link.sourceNode.color;
      ctx.shadowColor = p.link.sourceNode.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    });

    nodes.forEach(n => {
      if (!n.visible) return;

      const isHover = n === hoveredNode;
      const isSel = n === selectedNode;
      const r = isHover || isSel ? n.radius * 1.14 : n.radius;

      ctx.save();
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      let grad = ctx.createRadialGradient(n.x, n.y, r * 0.3, n.x, n.y, r);
      grad.addColorStop(0, '#141c2b');
      grad.addColorStop(1, '#090e18');
      ctx.fillStyle = grad;
      ctx.lineWidth = isHover || isSel ? 3.5 : 2;
      ctx.strokeStyle = n.color;
      ctx.shadowColor = n.glow;
      ctx.shadowBlur = isHover || isSel ? 28 : 14;
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.id, n.x, n.y);

      ctx.fillStyle = isHover || isSel ? '#ffffff' : '#cbd5e1';
      ctx.font = `${isHover || isSel ? 'bold 11px' : '500 10.5px'} "Inter", sans-serif`;
      ctx.fillText(n.label, n.x, n.y + r + 15);

      ctx.restore();
    });
  }

  function animate() {
    updatePhysics();
    drawFrame();
    requestAnimationFrame(animate);
  }

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

  function selectNode(node) {
    selectedNode = node;
    if (!node || !drawer) return;

    drawer.style.setProperty('--drawer-color', node.color);
    drawer.querySelector('.drawer-title h3').textContent = `${node.code} ${node.label}`;
    drawer.querySelector('.drawer-tag').textContent = `${node.layerName.toUpperCase()} · ${node.role}`;
    drawer.querySelector('.drawer-desc').textContent = node.desc;

    const compContainer = drawer.querySelector('.comparison-box');
    compContainer.innerHTML = `
      <div class="comp-row">
        <span class="comp-label">Indicador Plano del POT (Deficiente)</span>
        <div class="comp-val-pot">${node.potDeficiente}</div>
      </div>
      <div class="comp-row">
        <span class="comp-label">Indicador Propuesto por Modelo Propio</span>
        <div class="comp-val-propio">${node.modeloPropio}</div>
      </div>
      <div class="comp-row" style="margin-top:4px;">
        <span class="comp-label">¿Qué mide en Kennedy que el POT ignora?</span>
        <div style="font-size:11.5px; color:#cbd5e1; line-height:1.4">${node.queMide}</div>
      </div>
    `;

    const connectedLinks = links.filter(l => l.sourceNode === node || l.targetNode === node);
    const relsContainer = drawer.querySelector('.relations-list');
    relsContainer.innerHTML = connectedLinks.map(l => `
      <div class="rel-item">
        <strong>${l.type}</strong>: ${l.label}
      </div>
    `).join('');

    drawer.querySelector('.drawer-mecanismo').textContent = node.mecanismo;

    drawer.classList.add('open');
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', () => {
      drawer.classList.remove('open');
      selectedNode = null;
    });
  }

  const filterBtns = document.querySelectorAll('.graph-btn[data-filter]');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter');

      nodes.forEach(n => {
        if (activeFilter === 'ALL') {
          n.visible = true;
        } else if (activeFilter === 'HUBS') {
          n.visible = (n.id === 'N1' || n.id === 'N6' || n.id === 'N9' || n.id === 'N10' || n.id === 'N5' || n.id === 'N12');
        } else {
          n.visible = (n.layer === activeFilter);
        }
      });
    });
  });

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
