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
        showTooltip(item, color);
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

  window.addEventListener('resize', updateConnections);
});
