document.addEventListener('DOMContentLoaded', () => {
  // =========================================
  // 1. 取得頁面元素
  // =========================================
  const originPill = document.getElementById('origin-pill');
  const destPill = document.getElementById('dest-pill');
  const originTrigger = document.getElementById('origin-trigger');
  const destTrigger = document.getElementById('dest-trigger');
  const originDropdown = document.getElementById('origin-dropdown');
  const destDropdown = document.getElementById('dest-dropdown');
  const originText = document.getElementById('origin-text');
  const destText = document.getElementById('dest-text');
  const btnSwap = document.getElementById('btn-swap');
  const searchBtn = document.getElementById('search-btn');

  // 側邊選單元素
  const menuBtn = document.getElementById('menu-btn');
  const menuDrawer = document.getElementById('menu-drawer');
  const menuBackdrop = document.getElementById('menu-backdrop');
  const menuCloseBtn = document.getElementById('menu-close-btn');

  // =========================================
  // 2. 儲存目前選取的國家代碼與顯示名稱
  // =========================================
  let state = {
    origin: { value: '', label: '' },
    dest: { value: '', label: '' }
  };

  // =========================================
  // 3. 同步更新畫面文字、選取樣式與雙向互斥鎖定
  // =========================================
  function syncUI() {
    originText.textContent = state.origin.label || originText.dataset.placeholder;
    destText.textContent = state.dest.label || destText.dataset.placeholder;

    originPill.classList.toggle('has-value', Boolean(state.origin.value));
    destPill.classList.toggle('has-value', Boolean(state.dest.value));

    document.querySelectorAll('#dest-list .option-item').forEach((item) => {
      const isConflict = state.origin.value !== '' && item.dataset.value === state.origin.value;
      item.classList.toggle('disabled', isConflict);
    });

    document.querySelectorAll('#origin-list .option-item').forEach((item) => {
      const isConflict = state.dest.value !== '' && item.dataset.value === state.dest.value;
      item.classList.toggle('disabled', isConflict);
    });
  }

  // =========================================
  // 4. 開啟／關閉下拉選單與側邊選單
  // =========================================
  function closeAllMenus() {
    originDropdown.classList.remove('open');
    destDropdown.classList.remove('open');
    originPill.classList.remove('active');
    destPill.classList.remove('active');
  }

  function toggleMenu(targetDropdown, targetPill) {
    const isAlreadyOpen = targetDropdown.classList.contains('open');
    closeAllMenus();
    if (!isAlreadyOpen) {
      targetDropdown.classList.add('open');
      targetPill.classList.add('active');
    }
  }

  function setDrawerOpen(open) {
    menuDrawer.classList.toggle('open', open);
    menuDrawer.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
  }

  // =========================================
  // 5. 綁定互動事件
  // =========================================
  originTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(originDropdown, originPill);
  });

  destTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(destDropdown, destPill);
  });

  [
    [originTrigger, originDropdown, originPill],
    [destTrigger, destDropdown, destPill]
  ].forEach(([trigger, dropdown, pill]) => {
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMenu(dropdown, pill);
      }
    });
  });

  document.getElementById('origin-list').addEventListener('click', (e) => {
    const item = e.target.closest('.option-item');
    if (!item || item.classList.contains('disabled')) return;

    state.origin = { value: item.dataset.value, label: item.dataset.label };
    syncUI();
    closeAllMenus();
  });

  document.getElementById('dest-list').addEventListener('click', (e) => {
    const item = e.target.closest('.option-item');
    if (!item || item.classList.contains('disabled')) return;

    state.dest = { value: item.dataset.value, label: item.dataset.label };
    syncUI();
    closeAllMenus();
  });

  btnSwap.addEventListener('click', () => {
    [state.origin, state.dest] = [state.dest, state.origin];
    btnSwap.classList.toggle('rotated');
    syncUI();
  });

  searchBtn.addEventListener('click', () => {
    if (!state.origin.value || !state.dest.value) {
      alert('請先選擇出發地與目的地！');
      return;
    }

    const targetUrl = `./search.html?from=${encodeURIComponent(state.origin.value)}&to=${encodeURIComponent(state.dest.value)}`;
    window.location.href = targetUrl;
  });

  menuBtn.addEventListener('click', () => setDrawerOpen(true));
  menuBackdrop.addEventListener('click', () => setDrawerOpen(false));
  menuCloseBtn.addEventListener('click', () => setDrawerOpen(false));

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.input-pill')) {
      closeAllMenus();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllMenus();
      setDrawerOpen(false);
    }
  });

  syncUI();
});
