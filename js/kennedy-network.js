/**
 * 2nd Network Layout: Interactive Neon Network Ecosystem
 * Features: SVG dynamic lines, cluster radial expansion, orbital satellites & tooltips
 */

document.addEventListener('DOMContentLoaded', () => {
  const centralNode = document.getElementById('centralKennedyNode');
  const svgCanvas = document.getElementById('networkSvgCanvas');
  const tooltipCard = document.getElementById('nodeTooltipCard');

  const clusters = document.querySelectorAll('.cluster-node');
  let isCentralOpen = false;

  const satelliteData = {
    "1": [
      { id: "s1-1", title: "Corabastos y María Paz", icon: "fa-warehouse", desc: "Principal centro de acopio alimentario y logística de gran escala." },
      { id: "s1-2", title: "Zona Industrial Carvajal", icon: "fa-industry", desc: "Concentración manufacturera, de transformación e industria ligera." },
      { id: "s1-3", title: "Corredor Calle 13 / AE09", icon: "fa-road", desc: "Eje de carga pesada e integración metropolitana occidente." },
      { id: "s1-4", title: "Comercio informal (Patio Bonito, Tintal, Bosa)", icon: "fa-shop", desc: "Dinámicas comerciales espontáneas en bordes urbanos." }
    ],
    "2": [
      { id: "s2-1", title: "Banderas (Av. Américas)", icon: "fa-bus", desc: "Nodo multimodal de alta fricción de movilidad y pasajeros." },
      { id: "s2-2", title: "Av. Ciudad de Cali", icon: "fa-route", desc: "Corredor estructurante saturado por alta carga vehicular." },
      { id: "s2-3", title: "Av. Boyacá & Cepeda Vargas", icon: "fa-car", desc: "Intersección crítica con cuellos de botella diarios." },
      { id: "s2-4", title: "Embudo de flujos (Bosa, Soacha, Fontibón)", icon: "fa-arrows-to-dot", desc: "Convergencia masiva de desplazamientos intermunicipales." }
    ],
    "3": [
      { id: "s3-1", title: "Humedales El Burro, La Vaca y Techo", icon: "fa-water", desc: "Ecosistemas estratégicos amenazados por presión urbana." },
      { id: "s3-2", title: "Ríos Fucha y Tunjuelito", icon: "fa-water-ladder", desc: "Cuerpos hídricos principales impactados por vertimientos." },
      { id: "s3-3", title: "Escorrentía en suelo duro (Castilla, Dindalito)", icon: "fa-cloud-showers-heavy", desc: "Impermeabilización crítica y riesgo de inundación." }
    ]
  };

  function getCenterPos(el) {
    const stage = document.getElementById('graphStage').getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - stage.left,
      y: rect.top + rect.height / 2 - stage.top
    };
  }

  function drawConnection(id, startPos, endPos, color, isActive = false) {
    let path = document.getElementById(id);
    if (!path) {
      path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('id', id);
      path.setAttribute('class', 'connection-line');
      svgCanvas.appendChild(path);
    }

    const dx = endPos.x - startPos.x;
    const dy = endPos.y - startPos.y;
    const cx1 = startPos.x + dx * 0.4;
    const cy1 = startPos.y;
    const cx2 = startPos.x + dx * 0.6;
    const cy2 = endPos.y;

    const d = `M ${startPos.x} ${startPos.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${endPos.x} ${endPos.y}`;
    path.setAttribute('d', d);
    path.setAttribute('stroke', color);
    if (isActive) {
      path.classList.add('active');
    } else {
      path.classList.remove('active');
    }
  }

  function removeConnection(id) {
    const path = document.getElementById(id);
    if (path) path.remove();
  }

  function updateConnections() {
    if (!isCentralOpen || !centralNode) return;
    const cPos = getCenterPos(centralNode);

    clusters.forEach(cluster => {
      if (cluster.classList.contains('visible')) {
        const clusterId = cluster.getAttribute('data-cluster');
        const clPos = getCenterPos(cluster);
        const color = getComputedStyle(cluster).getPropertyValue('--cluster-color').trim() || '#2fd4c8';
        drawConnection(`line-central-${clusterId}`, cPos, clPos, color, cluster.classList.contains('active'));

        if (cluster.classList.contains('active')) {
          const satellites = document.querySelectorAll(`.satellite-node[data-parent="${clusterId}"]`);
          satellites.forEach(sat => {
            const satPos = getCenterPos(sat);
            drawConnection(`line-sat-${sat.id}`, clPos, satPos, color, true);
          });
        }
      }
    });
  }

  if (centralNode) {
    centralNode.addEventListener('click', () => {
      isCentralOpen = !isCentralOpen;

      if (isCentralOpen) {
        centralNode.classList.add('active');
        clusters.forEach((cluster, idx) => {
          setTimeout(() => {
            cluster.classList.add('visible', 'floating');
            updateConnections();
          }, idx * 180);
        });
      } else {
        centralNode.classList.remove('active');
        clusters.forEach(cluster => {
          cluster.classList.remove('visible', 'active');
          const clusterId = cluster.getAttribute('data-cluster');
          removeConnection(`line-central-${clusterId}`);
          removeSatellites(clusterId);
        });
        hideTooltip();
      }
    });
  }

  clusters.forEach(cluster => {
    cluster.addEventListener('click', (e) => {
      e.stopPropagation();
      const clusterId = cluster.getAttribute('data-cluster');
      const isActive = cluster.classList.contains('active');

      if (isActive) {
        cluster.classList.remove('active');
        removeSatellites(clusterId);
        hideTooltip();
      } else {
        cluster.classList.add('active');
        spawnSatellites(cluster, clusterId);
      }
      setTimeout(updateConnections, 50);
    });
  });

  function spawnSatellites(clusterEl, clusterId) {
    removeSatellites(clusterId);
    const items = satelliteData[clusterId] || [];
    const clPos = getCenterPos(clusterEl);
    const stage = document.getElementById('graphStage');
    const color = getComputedStyle(clusterEl).getPropertyValue('--cluster-color').trim() || '#2fd4c8';

    const radius = 135;
    let baseAngle = 0;
    if (clusterId === "1") baseAngle = -45;
    if (clusterId === "2") baseAngle = 225;
    if (clusterId === "3") baseAngle = 90;

    const totalAngle = 140;
    const stepAngle = items.length > 1 ? totalAngle / (items.length - 1) : 0;
    const startAngle = baseAngle - totalAngle / 2;

    items.forEach((item, index) => {
      const sat = document.createElement('div');
      sat.className = 'satellite-node floating';
      sat.id = item.id;
      sat.setAttribute('data-parent', clusterId);
      sat.style.setProperty('--parent-color', color);

      const angle = (startAngle + index * stepAngle) * (Math.PI / 180);
      const x = clPos.x + radius * Math.cos(angle) - 47.5;
      const y = clPos.y + radius * Math.sin(angle) - 47.5;

      sat.style.left = `${x}px`;
      sat.style.top = `${y}px`;

      sat.innerHTML = `
        <i class="fa-solid ${item.icon}"></i>
        <span>${item.title}</span>
      `;

      sat.addEventListener('mouseenter', () => showTooltip(item, color));
      sat.addEventListener('mouseleave', () => hideTooltip());
      sat.addEventListener('click', (e) => {
        e.stopPropagation();
        if (item.id === "s1-1") {
          openSubnetworkModal();
        } else {
          showTooltip(item, color);
        }
      });

      stage.appendChild(sat);

      setTimeout(() => {
        sat.classList.add('visible');
        updateConnections();
      }, index * 100);
    });
  }

  function removeSatellites(clusterId) {
    const satellites = document.querySelectorAll(`.satellite-node[data-parent="${clusterId}"]`);
    satellites.forEach(sat => {
      removeConnection(`line-sat-${sat.id}`);
      sat.classList.remove('visible');
      setTimeout(() => sat.remove(), 300);
    });
  }

  function showTooltip(item, color) {
    if (!tooltipCard) return;
    tooltipCard.style.setProperty('--tt-color', color);
    tooltipCard.querySelector('.tt-header i').className = `fa-solid ${item.icon}`;
    tooltipCard.querySelector('.tt-title').textContent = item.title;
    tooltipCard.querySelector('.tt-desc').textContent = item.desc;
    tooltipCard.classList.add('active');
  }

  function hideTooltip() {
    if (tooltipCard) tooltipCard.classList.remove('active');
  }

  // --- CORABASTOS SUBNETWORK MODAL LOGIC ---
  const subnetworkModal = document.getElementById('subnetworkModal');
  const closeSubnetworkBtn = document.getElementById('closeSubnetworkBtn');
  const subnetworkSvgCanvas = document.getElementById('subnetworkSvgCanvas');

  function openSubnetworkModal() {
    if (!subnetworkModal) return;
    subnetworkModal.classList.add('active');
    setTimeout(drawSubnetworkConnections, 100);
  }

  function closeSubnetworkModal() {
    if (subnetworkModal) subnetworkModal.classList.remove('active');
  }

  if (closeSubnetworkBtn) {
    closeSubnetworkBtn.addEventListener('click', closeSubnetworkModal);
  }

  if (subnetworkModal) {
    subnetworkModal.addEventListener('click', (e) => {
      if (e.target === subnetworkModal) closeSubnetworkModal();
    });
  }

  function getSubNodePos(el) {
    const stage = document.getElementById('subnetworkStage').getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left - stage.left,
      right: rect.right - stage.left,
      top: rect.top - stage.top,
      bottom: rect.bottom - stage.top,
      x: rect.left + rect.width / 2 - stage.left,
      y: rect.top + rect.height / 2 - stage.top
    };
  }

  function drawSubnetworkConnections() {
    if (!subnetworkSvgCanvas || !subnetworkModal.classList.contains('active')) return;
    subnetworkSvgCanvas.innerHTML = '';

    // Add marker arrow definition once
    let defs = subnetworkSvgCanvas.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = `
        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#2fd4c8" />
        </marker>
      `;
      subnetworkSvgCanvas.appendChild(defs);
    }

    const connections = [
      // 1. Agricultores -> 3 transport options
      { from: 'sn-agricultores', to: 'sn-acopiadores', type: 'fork-right' },
      { from: 'sn-agricultores', to: 'sn-contrata-transporte', type: 'straight-h' },
      { from: 'sn-agricultores', to: 'sn-transporte-propio', type: 'fork-right' },

      // 2. 3 transport options -> Mayoristas Corabastos
      { from: 'sn-acopiadores', to: 'sn-mayoristas-corabastos', type: 'join-right' },
      { from: 'sn-contrata-transporte', to: 'sn-mayoristas-corabastos', type: 'straight-h' },
      { from: 'sn-transporte-propio', to: 'sn-mayoristas-corabastos', type: 'join-right' },

      // 3. Mayoristas Corabastos -> Consumidores (línea vertical descendente izquierda)
      { from: 'sn-mayoristas-corabastos', to: 'sn-consumidores', type: 'corabastos-to-consumidores' },

      // 4. Mayoristas Corabastos -> Bus de Canales (línea descendente hacia el centro)
      { from: 'sn-mayoristas-corabastos', to: 'sn-tiendas', type: 'corabastos-to-channel-bus' },
      { from: 'sn-mayoristas-corabastos', to: 'sn-supermercados', type: 'corabastos-to-channel-bus' },
      { from: 'sn-mayoristas-corabastos', to: 'sn-plazas', type: 'corabastos-to-channel-bus' },
      { from: 'sn-mayoristas-corabastos', to: 'sn-institucionales', type: 'corabastos-to-channel-bus' },
      { from: 'sn-mayoristas-corabastos', to: 'sn-agroalimentarias', type: 'corabastos-to-channel-bus' },

      // 5. Mayoristas Corabastos -> Otros Mayoristas Corabastos (línea vertical descendente derecha)
      { from: 'sn-mayoristas-corabastos', to: 'sn-otros-mayoristas', type: 'corabastos-to-otros' },

      // 6. Otros Mayoristas -> Plazas, Agroalimentarias
      { from: 'sn-otros-mayoristas', to: 'sn-plazas', type: 'otros-to-channel' },
      { from: 'sn-otros-mayoristas', to: 'sn-agroalimentarias', type: 'otros-to-channel' },

      // 7. Otros Mayoristas -> Consumidores (línea inferior envolvente)
      { from: 'sn-otros-mayoristas', to: 'sn-consumidores', type: 'bottom-loop' },

      // 8. Canales -> Consumidores
      { from: 'sn-tiendas', to: 'sn-consumidores', type: 'channels-to-consumidores' },
      { from: 'sn-supermercados', to: 'sn-consumidores', type: 'channels-to-consumidores' },
      { from: 'sn-plazas', to: 'sn-consumidores', type: 'channels-to-consumidores' },
      { from: 'sn-institucionales', to: 'sn-consumidores', type: 'channels-to-consumidores' },
      { from: 'sn-agroalimentarias', to: 'sn-consumidores', type: 'channels-to-consumidores' }
    ];

    // Helper to draw clean orthogonal SVG path
    function createPath(dStr, color = '#2fd4c8', hasArrow = false) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', dStr);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', '1.5');
      if (hasArrow) path.setAttribute('marker-end', 'url(#arrow)');
      subnetworkSvgCanvas.appendChild(path);
    }

    const pAgri = getSubNodePos(document.getElementById('sn-agricultores'));
    const pAcop = getSubNodePos(document.getElementById('sn-acopiadores'));
    const pCont = getSubNodePos(document.getElementById('sn-contrata-transporte'));
    const pProp = getSubNodePos(document.getElementById('sn-transporte-propio'));
    const pCora = getSubNodePos(document.getElementById('sn-mayoristas-corabastos'));
    const pOtros = getSubNodePos(document.getElementById('sn-otros-mayoristas'));
    const pCons = getSubNodePos(document.getElementById('sn-consumidores'));

    const channels = ['sn-tiendas', 'sn-supermercados', 'sn-plazas', 'sn-institucionales', 'sn-agroalimentarias'];

    // 1. Agricultores (Left) -> 3 Transports (Center-Top)
    const forkX1 = pAgri.right + 25;
    createPath(`M ${pAgri.right} ${pAgri.y} H ${forkX1}`);
    createPath(`M ${forkX1} ${pAcop.y} V ${pProp.y}`);
    createPath(`M ${forkX1} ${pAcop.y} H ${pAcop.left}`);
    createPath(`M ${forkX1} ${pCont.y} H ${pCont.left}`);
    createPath(`M ${forkX1} ${pProp.y} H ${pProp.left}`);

    // 2. 3 Transports (Center-Top) -> Mayoristas Corabastos (Right-Top)
    const joinX2 = pCora.left - 30;
    createPath(`M ${pAcop.right} ${pAcop.y} H ${joinX2}`);
    createPath(`M ${pCont.right} ${pCont.y} H ${joinX2}`);
    createPath(`M ${pProp.right} ${pProp.y} H ${joinX2}`);
    createPath(`M ${joinX2} ${pAcop.y} V ${pProp.y}`);
    createPath(`M ${joinX2} ${pCora.y} H ${pCora.left}`);

    // 3. Mayoristas Corabastos (Top-Right) drop lines:
    // Drop A: To Consumidores (left vertical drop)
    const dropLeftX = pCora.left + 25;
    createPath(`M ${dropLeftX} ${pCora.bottom} V ${pCons.top - 15} H ${pCons.x} V ${pCons.top}`);

    // Drop B: To Channel Bus (center vertical drop into channel right side)
    const dropCenterX = pCora.left + (pCora.right - pCora.left) * 0.55;
    const channelBusRightX = getSubNodePos(document.getElementById(channels[0])).right + 25;
    createPath(`M ${dropCenterX} ${pCora.bottom} V ${pOtros.top - 40} H ${channelBusRightX}`);
    channels.forEach(chId => {
      const pCh = getSubNodePos(document.getElementById(chId));
      createPath(`M ${channelBusRightX} ${pCh.y} H ${pCh.right}`);
    });

    // Drop C: To Otros Mayoristas Corabastos (right vertical drop)
    const dropRightX = pCora.right - 30;
    createPath(`M ${dropRightX} ${pCora.bottom} V ${pOtros.top}`);

    // 4. Canales (Left side) -> Consumidores (Right side)
    const channelBusLeftX = getSubNodePos(document.getElementById(channels[0])).left - 25;
    const topChanY = getSubNodePos(document.getElementById(channels[0])).y;
    const botChanY = getSubNodePos(document.getElementById(channels[channels.length - 1])).y;

    createPath(`M ${channelBusLeftX} ${topChanY} V ${botChanY}`);
    channels.forEach(chId => {
      const pCh = getSubNodePos(document.getElementById(chId));
      createPath(`M ${pCh.left} ${pCh.y} H ${channelBusLeftX}`);
    });
    createPath(`M ${channelBusLeftX} ${pCons.y} H ${pCons.right}`);

    // 5. Otros Mayoristas Corabastos (Left side) -> Plazas, Agroalimentarias
    const pPlaza = getSubNodePos(document.getElementById('sn-plazas'));
    const pAgro = getSubNodePos(document.getElementById('sn-agroalimentarias'));
    createPath(`M ${pOtros.left} ${pOtros.y} H ${pPlaza.right + 25} V ${pPlaza.y} H ${pPlaza.right}`);
    createPath(`M ${pOtros.left} ${pOtros.y} H ${pAgro.right + 25} V ${pAgro.y} H ${pAgro.right}`);

    // 6. Otros Mayoristas Corabastos (Bottom) -> Consumidores (Bottom) loop
    const loopBottomY = pOtros.bottom + 25;
    createPath(`M ${pOtros.x} ${pOtros.bottom} V ${loopBottomY} H ${pCons.x} V ${pCons.bottom}`);
  }

  window.addEventListener('resize', () => {
    updateConnections();
    drawSubnetworkConnections();
  });
});
