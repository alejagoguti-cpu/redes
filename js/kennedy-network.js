/**
 * First Network Layout: Interactive Kennedy Network Diagram Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const centralNode = document.getElementById('centralNodeKennedy');
  const connector = document.getElementById('centralConnector');
  const categoriesGrid = document.getElementById('categoriesGrid');
  const categoryCards = document.querySelectorAll('.category-card');

  let isCentralExpanded = false;

  // 1. Click Central Node "LOCALIDAD DE KENNEDY"
  if (centralNode) {
    centralNode.addEventListener('click', () => {
      isCentralExpanded = !isCentralExpanded;

      if (isCentralExpanded) {
        centralNode.classList.add('active');
        if (connector) connector.classList.add('visible');
        if (categoriesGrid) categoriesGrid.classList.add('visible');

        // Automatically expand all 3 categories when central node opens
        categoryCards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add('expanded');
          }, 150 + index * 100);
        });
      } else {
        centralNode.classList.remove('active');
        if (connector) connector.classList.remove('visible');
        if (categoriesGrid) categoriesGrid.classList.remove('visible');

        // Collapse sub-items
        categoryCards.forEach(card => card.classList.remove('expanded'));
      }
    });
  }

  // 2. Click Category Header to toggle individual category items
  categoryCards.forEach(card => {
    const header = card.querySelector('.category-header');
    if (header) {
      header.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.toggle('expanded');
      });
    }
  });
});
