document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menu-btn');
  const menuDrawer = document.getElementById('menu-drawer');
  const menuBackdrop = document.getElementById('menu-backdrop');
  const menuCloseBtn = document.getElementById('menu-close-btn');

  function setDrawerOpen(open) {
    if (!menuDrawer || !menuBtn) return;
    menuDrawer.classList.toggle('open', open);
    menuDrawer.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
  }

  menuBtn?.addEventListener('click', () => setDrawerOpen(true));
  menuBackdrop?.addEventListener('click', () => setDrawerOpen(false));
  menuCloseBtn?.addEventListener('click', () => setDrawerOpen(false));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setDrawerOpen(false);
    }
  });
});
