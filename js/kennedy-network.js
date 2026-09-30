/**
 * Kennedy Topology Network Graph (Ultra-Responsive Circular Interconnected Graph)
 */

document.addEventListener('DOMContentLoaded', () => {
  const stage = document.getElementById('topologyStage');
  const svgCanvas = document.getElementById('topologySvg');
  const centralBtn = document.getElementById('centralKennedyBtn');
  const detailsBox = document.getElementById('relationDetailsBox');
  const ringAxis = document.querySelector('.main-ring-axis');

  // Nodes dataset
  const nodesData = [
    // Sector 1: Comercial & Industrial (#e89a6c)
    { id: "A1", cat: "1", label: "Corabastos y María Paz", color: "#e89a6c", desc: "Gran acopio alimentario; genera flujos de carga masivos e impacto en residuos orgánicos." },
    { id: "A2", cat: "1", label: "Zona Ind. Carvajal", color: "#e89a6c", desc: "Núcleo de manufactura e industria ligera con demanda energética y vehicular constante." },
    { id: "A3", cat: "1", label: "Corredor Calle 13", color: "#e89a6c", desc: "Arteria principal de logística regional y transporte pesado occidente." },
    { id: "A4", cat: "1", label: "Comercio Informal (Patio Bonito)", color: "#e89a6c", desc: "Ocupación de espacio público y densidad comercial no regulada." },

    // Sector 2: Movilidad (#5b8def)
    { id: "B1", cat: "2", label: "Banderas (Av. Américas)", color: "#5b8def", desc: "Punto negrálgico de intercambio masivo TransMilenio y transporte colectivo." },
    { id: "B2", cat: "2", label: "Av. Ciudad de Cali", color: "#5b8def", desc: "Eje longitudinal saturado por integración vehicular intermunicipal." },
    { id: "B3", cat: "2", label: "Av. Boyacá & C. Vargas", color: "#5b8def", desc: "Intersección de alta fricción vehicular y embudo de embalse." },
    { id: "B4", cat: "2", label: "Embudo Bosa/Soacha", color: "#5b8def", desc: "Confluencia de viajes pendulares masivos hacia el centro de la ciudad." },

    // Sector 3: Ambiental (#2fd4c8)
    { id: "C1", cat: "3", label: "Humedales (El Burro / La Vaca / Techo)", color: "#2fd4c8", desc: "Cuerpos de agua biodiversos fragmentados por construcciones y vertimientos." },
    { id: "C2", cat: "3", label: "Ríos Fucha y Tunjuelito", color: "#2fd4c8", desc: "Drenajes principales urbanos afectados por carga contaminante e industrial." },
    { id: "C3", cat: "3", label: "Escorrentía & Suelo Duro", color: "#2fd4c8", desc: "Alta tasa de impermeabilización en zonas como Castilla y Dindalito." }
  ];

  // Interconnection links
  const linksData = [
    { source: "A1", target: "B1", type: "directa", label: "Fricción de movilidad en Av. Américas" },
    { source: "A1", target: "C2", type: "directa", label: "Vertimientos al Río Fucha" },
    { source: "A1", target: "A4", type: "directa", label: "Encadenamiento comercio informal" },
    { source: "A1", target: "B2", type: "indirecta", label: "Congestión pesada en Av. Cali" },
    { source: "A2", target: "B3", type: "directa", label: "Flujo logístico a Av. Boyacá" },
    { source: "A2", target: "C3", type: "directa", label: "Impermeabilización por naves industriales" },
    { source: "A3", target: "B4", type: "directa", label: "Embudo logístico e intermunicipal" },
    { source: "B2", target: "C1", type: "directa", label: "Fragmentación del Humedal El Burro" },
    { source: "B4", target: "C2", type: "indirecta", label: "Presión sobre cuenca Tunjuelito" },
    { source: "B1", target: "C3", type: "indirecta", label: "Escorrentía en plazoletas duras" },
    { source: "C1", target: "C3", type: "directa", label: "Pérdida de capacidad de absorción" },
    { source: "C2", target: "C1", type: "indirecta", label: "Conexión cuenca hidrográfica" }
  ];

  let activeNodeId = null;

  // Calculate dynamic responsive circular positions
  function positionNodes() {
    if (!stage) return;
    const stageRect = stage.getBoundingClientRect();
    const centerX = stageRect.width / 2;
    const centerY = stageRect.height / 2;

    // DYNAMIC RADIUS BASED ON SCREEN WIDTH/HEIGHT
    const minDim = Math.min(stageRect.width, stageRect.height);
    const isMobile = window.innerWidth <= 640;
    
    // Clamp radius so nodes never overflow stage boundaries
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

      // Create or update Node Element
      let el = document.getElementById(`node-${node.id}`);
      if (!el) {
        el = document.createElement('div');
        el.id = `node-${node.id}`;
        el.className = 'topo-node';
        el.style.setProperty('--node-color', node.color);
        el.style.setProperty('--node-glow', `${node.color}44`);
        el.textContent = node.id;
        stage.appendChild(el);

        // Label Element
        const lbl = document.createElement('div');
        lbl.id = `label-${node.id}`;
        lbl.className = 'node-label-outer';
        lbl.textContent = `${node.id}. ${node.label}`;
        stage.appendChild(lbl);

        // Node click event
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          selectNode(node.id);
        });
      }

      const nodeHalfSize = el.offsetWidth > 0 ? el.offsetWidth / 2 : 22;
      el.style.left = `${x - nodeHalfSize}px`;
      el.style.top = `${y - nodeHalfSize}px`;

      // Position Label Outer
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

  // Draw Curved Bezier Arcs Across interior of circle
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

      // Arc curves toward circle center
      const cx = (x1 + x2) / 2 + (centerX - (x1 + x2) / 2) * 0.55;
      const cy = (y1 + y2) / 2 + (centerY - (y1 + y2) / 2) * 0.55;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
      path.setAttribute('class', 'net-link');
      path.setAttribute('id', `link-${link.source}-${link.target}`);

      const srcNode = nodesData.find(n => n.id === link.source);
      path.setAttribute('stroke', srcNode ? srcNode.color : '#2fd4c8');

      // Highlight logic
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

  // Select Node & Highlight Links
  function selectNode(id) {
    if (activeNodeId === id) {
      activeNodeId = null;
    } else {
      activeNodeId = id;
    }

    const nodeInfo = nodesData.find(n => n.id === id);
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

    if (activeNodeId && nodeInfo) {
      const relTexts = connectedLinks.map(l => {
        const otherId = l.source === id ? l.target : l.source;
        const otherNode = nodesData.find(n => n.id === otherId);
        return `<strong style="color:${otherNode ? otherNode.color : '#fff'}">${otherId} (${otherNode ? otherNode.label : ''})</strong>: ${l.label}`;
      }).join('<br>• ');

      detailsBox.innerHTML = `
        <h4 style="color:${nodeInfo.color}"><i class="fa-solid fa-circle-nodes"></i> NODO ${nodeInfo.id}: ${nodeInfo.label}</h4>
        <p><strong>Descripción:</strong> ${nodeInfo.desc}</p>
        <div style="margin-top:8px; padding-top:8px; border-top:1px dashed rgba(255,255,255,0.1);">
          <strong style="color:#2fd4c8">Relaciones en la Red (${connectedLinks.length}):</strong><br>
          • ${relTexts || 'Sin relaciones directas'}
        </div>
      `;
    } else {
      detailsBox.innerHTML = `
        <h4><i class="fa-solid fa-diagram-project"></i> Matriz de Relaciones Topológicas de Kennedy</h4>
        <p>Haz clic en cualquier nodo perimetral (A1 a C3) para ver sus interconexiones complejas y relaciones de impacto directo/indirecto en la red urbana.</p>
      `;
    }

    drawNetworkLinks();
  }

  if (centralBtn) {
    centralBtn.addEventListener('click', () => {
      activeNodeId = null;
      selectNode(null);
    });
  }

  // Handle window resize and orientation change dynamically
  window.addEventListener('resize', positionNodes);
  window.addEventListener('orientationchange', positionNodes);
  setTimeout(positionNodes, 100);
});
