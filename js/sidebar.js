/**
 * Sidebar Navigation Helpers
 */

document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const navItems = document.querySelectorAll('.sidebar .icon-nav-item');

  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href && currentPath.endsWith(href)) {
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    }
  });
});
