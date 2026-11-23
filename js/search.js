document.addEventListener('DOMContentLoaded', () => {
  // =========================================
  // 1. 國家與插頭資料庫 (對應 index.html 的 5 個國家)
  // =========================================
  const PLUG_ASSETS = {
    A: './img/plug-type-A.png',
    B: './img/plug-type-B.png',
    C: './img/plug-type-C.png',
    G: './img/plug-type-G.png',
    I: './img/plug-type-I.png'
  };

  const COUNTRIES = {
    TW: {
      code: 'TW',
      name: '臺灣',
      voltage: '110V',
      voltageNum: 110,
      freq: '60Hz',
      plugs: {
        threePin: 'B',
        twoPin: 'A'
      },
      socketTypes: ['A', 'B'],
      notes: '臺灣主要使用 110V / 60Hz，常見雙扁腳 Type-A 與三孔接地 Type-B 插座。'
    },
    JP: {
      code: 'JP',
      name: '日本',
      voltage: '100V',
      voltageNum: 100,
      freq: '50/60Hz',
      plugs: {
        threePin: 'A',
        twoPin: 'A'
      },
      socketTypes: ['A'],
      notes: '日本電壓為 100V（東日本 50Hz、西日本 60Hz），牆面插座多為無接地的兩孔 Type-A，三孔插頭通常需 3 轉 2 轉接頭。'
    },
    US: {
      code: 'US',
      name: '美國',
      voltage: '120V',
      voltageNum: 120,
      freq: '60Hz',
      plugs: {
        threePin: 'B',
        twoPin: 'A'
      },
      socketTypes: ['A', 'B'],
      notes: '美國電壓為 120V / 60Hz，與臺灣同為美規 Type-A / Type-B 插座，一般電器皆可直接插入使用。'
    },
    CN: {
      code: 'CN',
      name: '中國',
      voltage: '220V',
      voltageNum: 220,
      freq: '50Hz',
      plugs: {
        threePin: 'I',
        twoPin: 'A'
      },
      socketTypes: ['A', 'C', 'I'],
      notes: '中國為 220V / 50Hz，牆面常見「兩孔扁腳 Type-A」與「八字三孔 Type-I」複合插座；美規三孔 Type-B 無法插入 Type-I 插座。'
    },
    UK: {
      code: 'UK',
      name: '英國',
      voltage: '230V',
      voltageNum: 230,
      freq: '50Hz',
      plugs: {
        threePin: 'G',
        twoPin: 'G'
      },
      socketTypes: ['G'],
      notes: '英國全面使用品字形三方腳 Type-G（230V / 50Hz），且插座通常附有獨立實體開關；所有其他規格插頭皆須轉接頭。'
    }
  };

  // =========================================
  // 2. DOM 元素參照
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
  const resultsContainer = document.getElementById('results-container');

  // 選單與彈窗元素
  const menuBtn = document.getElementById('menu-btn');
  const menuDrawer = document.getElementById('menu-drawer');
  const menuBackdrop = document.getElementById('menu-backdrop');
  const menuCloseBtn = document.getElementById('menu-close-btn');

  const detailModal = document.getElementById('detail-modal');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalBadge = document.getElementById('modal-badge');
  const modalTitle = document.getElementById('modal-title');
  const modalSpecs = document.getElementById('modal-specs');
  const modalTipsList = document.getElementById('modal-tips-list');

  // =========================================
  // 3. 讀取 URL 參數並初始化狀態（預設 TW -> CN 以對應 2-2-1 設計稿）
  // =========================================
  const params = new URLSearchParams(window.location.search);
  const rawFrom = (params.get('from') || '').toUpperCase();
  const rawTo = (params.get('to') || '').toUpperCase();
  const initialFrom = COUNTRIES[rawFrom] ? rawFrom : 'TW';
  let initialTo = COUNTRIES[rawTo] ? rawTo : 'CN';
  if (initialFrom === initialTo) {
    initialTo = initialFrom === 'CN' ? 'TW' : 'CN';
  }

  let state = {
    origin: initialFrom,
    dest: initialTo
  };

  let currentCards = [];

  // =========================================
  // 4. 計算插頭與電壓比對結果
  // =========================================
  function getVoltageTag(fromCountry, toCountry) {
    const diff = toCountry.voltageNum - fromCountry.voltageNum;
    if (diff >= 50) {
      return { text: '高電壓注意', isWarning: true };
    }
    if (diff <= -50) {
      return { text: '低電壓注意', isWarning: true };
    }
    return { text: '電壓相近', isWarning: false };
  }

  function isPlugCompatible(plugType, destSockets) {
    if (destSockets.includes(plugType)) return true;
    // Type-A 二孔扁腳可相容插入 Type-B 三孔美規插座
    if (plugType === 'A' && destSockets.includes('B')) return true;
    return false;
  }

  function buildComparisonCards(fromCode, toCode) {
    const from = COUNTRIES[fromCode];
    const to = COUNTRIES[toCode];
    const voltageTag = getVoltageTag(from, to);

    const slots = [
      {
        pinTag: '三孔',
        fromPlug: from.plugs.threePin,
        toPlug: to.plugs.threePin
      }
    ];

    // 若出發地有獨立二孔規格（與三孔不同，如 TW/US/CN 的 Type-A），補上第二張比對卡
    if (from.plugs.twoPin !== from.plugs.threePin) {
      slots.push({
        pinTag: '二孔',
        fromPlug: from.plugs.twoPin,
        toPlug: to.plugs.twoPin
      });
    } else if (from.code === 'JP') {
      // 日本主要為二孔 Type-A，補充說明與目的地插座比對
      slots[0].pinTag = '二孔';
    }

    return slots.map((slot) => {
      const compatible = isPlugCompatible(slot.fromPlug, to.socketTypes);
      const needsAdapter = !compatible;
      const voltageDiff = to.voltageNum - from.voltageNum;

      const tips = [];
      if (needsAdapter) {
        tips.push(`出發地「TYPE - ${slot.fromPlug}」插頭無法直接插入目的地「TYPE - ${slot.toPlug}」插座，務必攜帶對應轉接頭。`);
      } else {
        tips.push(`出發地「TYPE - ${slot.fromPlug}」插頭可直接插入目的地「TYPE - ${slot.toPlug}」插座，無需額外轉接頭。`);
      }

      if (voltageDiff >= 50) {
        tips.push(`目的地電壓較高（${from.voltage} → ${to.voltage}）：手機、筆電等標示「100–240V」的 3C 充電器可直接安心使用；單一電壓（僅 110V）的吹風機、電棒捲或快煮壺不可直接插上，需使用變壓器。`);
      } else if (voltageDiff <= -50) {
        tips.push(`目的地電壓較低（${from.voltage} → ${to.voltage}）：支援 100–240V 的裝置可正常使用，但純高壓電器可能因電壓不足無法啟動或功率大幅減弱。`);
      } else {
        tips.push(`兩地電壓接近（${from.voltage} → ${to.voltage}），大多數日常電器皆可正常運作。`);
      }

      if (from.freq !== to.freq) {
        tips.push(`頻率由 ${from.freq} 變為 ${to.freq}：一般充電器與現代家電不受影響，僅少數馬達或計時類電器可能有轉速差異。`);
      }

      tips.push(to.notes);

      return {
        needsAdapter,
        pinTag: slot.pinTag,
        voltageTag,
        fromName: from.name,
        toName: to.name,
        fromPlug: slot.fromPlug,
        toPlug: slot.toPlug,
        fromVoltage: from.voltage,
        toVoltage: to.voltage,
        fromFreq: from.freq,
        toFreq: to.freq,
        actionTitle: needsAdapter ? '需要轉接頭' : '可直接使用',
        actionSubtitle: needsAdapter
          ? '請自備或購買轉接頭'
          : (voltageTag.isWarning ? '無需轉接頭，留意電器電壓' : '插頭與電壓皆相容'),
        tips
      };
    });
  }

  // =========================================
  // 5. 渲染卡片 DOM (精準對應 Figma 588:1151 / 588:1152)
  // =========================================
  function renderLettersHTML(needsAdapter) {
    const letters = needsAdapter
      ? [
          { src: './img/letter-T.png', alt: 'T' },
          { src: './img/letter-R.png', alt: 'R' },
          { src: './img/letter-U.png', alt: 'U' },
          { src: './img/letter-E.png', alt: 'E' }
        ]
      : [
          { src: './img/letter-F.png', alt: 'F' },
          { src: './img/letter-A.png', alt: 'A' },
          { src: './img/letter-I.png', alt: 'I' },
          { src: './img/letter-L.png', alt: 'L' },
          { src: './img/letter-E.png', alt: 'E' }
        ];

    return letters
      .map((item) => `<img src="${item.src}" alt="${item.alt}" class="result-letter-img">`)
      .join('');
  }

  function renderResults() {
    currentCards = buildComparisonCards(state.origin, state.dest);

    resultsContainer.innerHTML = currentCards
      .map((card, index) => `
        <article class="result-card ${card.needsAdapter ? 'is-true' : 'is-faile'}">
          <div class="result-badge" aria-label="${card.needsAdapter ? '需要轉接頭' : '不需要轉接頭'}">
            <div class="result-letters">
              ${renderLettersHTML(card.needsAdapter)}
            </div>
            <div class="result-label">${card.needsAdapter ? '需要' : '不需要'}</div>
          </div>

          <div class="result-content">
            <div class="card-body-left">
              <div class="plug-compare">
                <div class="plug-item">
                  <div class="plug-icon-wrap">
                    <img src="${PLUG_ASSETS[card.fromPlug]}" alt="TYPE - ${card.fromPlug} 插頭" class="plug-icon">
                  </div>
                  <div class="plug-meta">
                    <span class="plug-country">${card.fromName}</span>
                    <span class="plug-type">TYPE - ${card.fromPlug}</span>
                  </div>
                </div>

                <img src="./img/arrow-right.svg" alt="對應至" class="arrow-right-icon">

                <div class="plug-item">
                  <div class="plug-icon-wrap">
                    <img src="${PLUG_ASSETS[card.toPlug]}" alt="TYPE - ${card.toPlug} 插頭" class="plug-icon">
                  </div>
                  <div class="plug-meta">
                    <span class="plug-country">${card.toName}</span>
                    <span class="plug-type">TYPE - ${card.toPlug}</span>
                  </div>
                </div>
              </div>

              <div class="spec-group">
                <div class="spec-tags">
                  <span class="tag-pill tag-outline">${card.pinTag}</span>
                  <span class="tag-pill tag-filled ${card.voltageTag.isWarning ? '' : 'tag-safe'}">${card.voltageTag.text}</span>
                </div>

                <div class="spec-row">
                  <span class="spec-val">${card.fromVoltage}</span>
                  <img src="./img/arrow-right.svg" alt="至" class="arrow-right-icon">
                  <span class="spec-val">${card.toVoltage}</span>
                </div>

                <div class="spec-row">
                  <span class="spec-val">${card.fromFreq}</span>
                  <img src="./img/arrow-right.svg" alt="至" class="arrow-right-icon">
                  <span class="spec-val">${card.toFreq}</span>
                </div>
              </div>
            </div>

            <div class="card-body-right">
              <div class="card-divider" aria-hidden="true"></div>
              <div class="card-action-area">
                <div class="action-title ${card.needsAdapter ? 'is-required' : 'is-direct'}">${card.actionTitle}</div>
                <div class="action-subtitle">${card.actionSubtitle}</div>
                <button type="button" class="btn-more" data-card-index="${index}">了解更多</button>
              </div>
            </div>
          </div>
        </article>
      `)
      .join('');
  }

  // =========================================
  // 6. 同步下拉選單與互斥狀態
  // =========================================
  function syncUI() {
    originText.textContent = COUNTRIES[state.origin].name;
    destText.textContent = COUNTRIES[state.dest].name;

    document.querySelectorAll('#dest-list .option-item').forEach((item) => {
      item.classList.toggle('disabled', item.dataset.value === state.origin);
    });

    document.querySelectorAll('#origin-list .option-item').forEach((item) => {
      item.classList.toggle('disabled', item.dataset.value === state.dest);
    });
  }

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

  function updateUrlParams() {
    const nextUrl = `${window.location.pathname}?from=${encodeURIComponent(state.origin)}&to=${encodeURIComponent(state.dest)}`;
    try {
      window.history.replaceState(null, '', nextUrl);
    } catch (_) {
      // 避免部分瀏覽器在 file:// 本機協定下拋出 SecurityError
    }
  }

  // =========================================
  // 7. 互動事件綁定
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
    state.origin = item.dataset.value;
    syncUI();
    closeAllMenus();
  });

  document.getElementById('dest-list').addEventListener('click', (e) => {
    const item = e.target.closest('.option-item');
    if (!item || item.classList.contains('disabled')) return;
    state.dest = item.dataset.value;
    syncUI();
    closeAllMenus();
  });

  btnSwap.addEventListener('click', () => {
    [state.origin, state.dest] = [state.dest, state.origin];
    btnSwap.classList.toggle('rotated');
    syncUI();
    updateUrlParams();
    renderResults();
  });

  searchBtn.addEventListener('click', () => {
    if (state.origin === state.dest) {
      alert('出發地與目的地不能相同！');
      return;
    }
    closeAllMenus();
    updateUrlParams();
    renderResults();
  });

  // 點擊「了解更多」開啟詳細說明彈窗
  resultsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-more');
    if (!btn) return;
    const card = currentCards[Number(btn.dataset.cardIndex)];
    if (!card) return;

    modalBadge.textContent = card.actionTitle;
    modalTitle.textContent = `${card.fromName} → ${card.toName}（${card.pinTag}）`;
    modalSpecs.innerHTML = `
      <div><strong>插頭規格</strong>TYPE - ${card.fromPlug} → TYPE - ${card.toPlug}</div>
      <div><strong>電壓比較</strong>${card.fromVoltage} → ${card.toVoltage}（${card.voltageTag.text}）</div>
      <div><strong>頻率比較</strong>${card.fromFreq} → ${card.toFreq}</div>
      <div><strong>轉接建議</strong>${card.needsAdapter ? '需準備轉接頭' : '可直接插入使用'}</div>
    `;
    modalTipsList.innerHTML = card.tips.map((tip) => `<li>${tip}</li>`).join('');
    detailModal.classList.add('open');
    detailModal.setAttribute('aria-hidden', 'false');
  });

  function closeModal() {
    detailModal.classList.remove('open');
    detailModal.setAttribute('aria-hidden', 'true');
  }

  modalBackdrop.addEventListener('click', closeModal);
  modalCloseBtn.addEventListener('click', closeModal);

  // 側邊選單開關
  function setDrawerOpen(open) {
    menuDrawer.classList.toggle('open', open);
    menuDrawer.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
  }

  menuBtn.addEventListener('click', () => setDrawerOpen(true));
  menuBackdrop.addEventListener('click', () => setDrawerOpen(false));
  menuCloseBtn.addEventListener('click', () => setDrawerOpen(false));

  // 點擊外部與 ESC 鍵關閉下拉選單 / 彈窗 / 側邊欄
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.input-pill')) {
      closeAllMenus();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllMenus();
      closeModal();
      setDrawerOpen(false);
    }
  });

  // 初始同步與渲染
  syncUI();
  renderResults();
});
