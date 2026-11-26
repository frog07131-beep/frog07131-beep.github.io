document.addEventListener('DOMContentLoaded', () => {
  // =========================================
  // 1. 插頭完整資料庫 (A–O，文字與規格完全對應 Figma 1-2 / 1-3)
  // =========================================
  const DEFAULT_PIN_INFO = [
    '引腳數-2',
    '引腳中心距- 12.7毫米',
    '引腳寬度- 1.5毫米',
    '引腳高度- 6.3-7.9 毫米',
    '引腳長度- 15.875-18.23毫米'
  ].join('\n');

  const PLUG_DATA = {
    A: {
      id: 'A',
      serial: 'NEMA 1-15',
      desc: '臺灣主要插頭，適配美墨及臺日等多國',
      countries: '美國、墨西哥、加拿大、臺灣、日本等',
      voltage: '100-127V',
      current: '15A',
      pins: DEFAULT_PIN_INFO,
      socket: 'Type-B',
      appearance: '兩根平行的扁平金屬腳',
      safety: '無接地設計。美規插頭通常有「極性」之分（一寬一窄，寬為零線）。使用時需注意電壓（110-120V），避免將電器誤插。',
      photo: './img/plug-3d-A.png'
    },
    B: {
      id: 'B',
      serial: 'NEMA 5-15',
      desc: '臺灣主要插頭，適配美墨及臺日等多國',
      countries: '美國、墨西哥、加拿大、臺灣、日本等',
      voltage: '100-127V',
      current: '15A',
      pins: [
        '引腳數-3／兩片扁腳尺寸同 A 型',
        '引腳中心距- 12.7毫米',
        '引腳寬度- 1.5毫米',
        '引腳高度- 6.3-7.9 毫米',
        '引腳長度- 15.875-18.23毫米'
      ].join('\n'),
      socket: '無',
      appearance: '兩根平行扁腳，加上柱狀的接地腳',
      safety: '具備標準接地保護。其插頭可以插入 Type-B 的插座中。若電器本身帶有 Type-B 插頭，請勿硬塞進 Type A 插座，需使用轉接頭。',
      photo: './img/plug-3d-B.png'
    },
    C: {
      id: 'C',
      serial: 'CEE 7/16',
      desc: '最通用插頭，適用全歐洲（除英倫三島）多國',
      countries: '歐洲、韓國、中國、印度、巴西、泰國',
      voltage: '220–240 V',
      current: '2.5A',
      pins: DEFAULT_PIN_INFO,
      socket: 'Type-C、E、F',
      appearance: '兩根圓柱腳，本體多為扁平菱形',
      safety: '全球最通用的規格。最大安全電流僅 2.5A，僅限手機充電器、雙層絕緣小家電使用，絕對不可用於吹風機或微波爐等高功率設備。',
      photo: './img/plug-3d-C.png'
    },
    D: {
      id: 'D',
      serial: 'BS 546',
      desc: '印度次大陸等多國通用插頭',
      countries: '印度',
      voltage: '220–240 V',
      current: '約 5–6 A',
      pins: DEFAULT_PIN_INFO,
      socket: '無',
      appearance: '三根圓柱腳呈三角形排列，上方接地腳較粗',
      safety: '屬於舊英式標準，與 Type-M 外觀雷同但互不相容，購買轉接頭時極易混淆，需特別核對實體大小。',
      photo: './img/plug-3d-D.png'
    },
    E: {
      id: 'E',
      serial: 'CEE 7/5',
      desc: '法國標準插頭，適用許多前法屬殖民地',
      countries: '法國、波蘭、捷克等前法國殖民地',
      voltage: '220–240 V',
      current: '16A',
      pins: DEFAULT_PIN_INFO,
      socket: 'Type-E（E/F 混合插頭可兩用）',
      appearance: '兩圓柱腳，上有一孔，用來接凸出的接地柱',
      safety: '需依賴插座上的接地柱才能完成接地。現代電器多配備「CEE 7/7」混合插頭，可同時相容 Type E 與 Type F。',
      photo: './img/plug-3d-E.png'
    },
    F: {
      id: 'F',
      serial: 'CEE 7/4',
      desc: '北歐主要插頭規格，無極性設計',
      countries: '德國、西班牙、瑞典、韓國',
      voltage: '220–240 V',
      current: '16A',
      pins: DEFAULT_PIN_INFO,
      socket: 'Type-F（E/F 混合插頭可兩用）',
      appearance: '兩圓柱腳，上下兩側帶有金屬接地片',
      safety: '依靠側邊彈片接地。若將 Type E/F 插頭硬插進無對應接地設計的相容插座（如丹麥 Type K），電器雖能運作但將失去接地保護。',
      photo: './img/plug-3d-F.png'
    },
    G: {
      id: 'G',
      serial: 'BS 1363',
      desc: '世界上最安全的插頭，英國國協區域部分使用',
      countries: '英國、新加坡、馬來西亞等多國',
      voltage: '220–250 V',
      current: '13A',
      pins: DEFAULT_PIN_INFO,
      socket: '無',
      appearance: '三根粗的矩形扁腳呈「品」字排列',
      safety: '全球安全標準最高的設計。插頭內部強制內建保險絲（通常為 3A 或 13A），且插座配有安全防護門，需由較長的接地腳推開機關，火/零線孔才會開啟。',
      photo: './img/plug-3d-G.png'
    },
    H: {
      id: 'H',
      serial: 'SI 32',
      desc: '單一國家插頭規格，極具地域性',
      countries: '以色列、巴勒斯坦地區',
      voltage: '220–240V',
      current: '16A',
      pins: DEFAULT_PIN_INFO,
      socket: 'Type - C',
      appearance: '三根腳呈倒三角排列',
      safety: '特有規格。但其現代插座孔洞經過特殊設計（呈中心圓外擴扁槽狀），可直接完美相容無接地的 Type C 插頭。',
      photo: './img/plug-3d-H.png'
    },
    I: {
      id: 'I',
      serial: 'NZS 3112',
      desc: '被美國放棄的選項',
      countries: '澳洲、紐西蘭、中國',
      voltage: '220–240V',
      current: '10A',
      pins: DEFAULT_PIN_INFO,
      socket: '無',
      appearance: '兩八字型扁腳，多數有一垂直接地腳',
      safety: '中澳插座安裝方向相反（中國接地朝上，紐澳朝下）。在阿根廷使用時需注意，其火線與零線的接線極性與中澳完全相反，舊式精密設備需謹慎。',
      photo: './img/plug-3d-I.png'
    },
    J: {
      id: 'J',
      serial: 'SEV 1011',
      desc: '瑞士限定：緊湊的六角形三圓腳',
      countries: '瑞士',
      voltage: '220–240V',
      current: '10A',
      pins: DEFAULT_PIN_INFO,
      socket: 'Type - C',
      appearance: '三根圓腳，中間的接地腳稍微偏移',
      safety: '外觀與 Type-N 極度相似，但接地腳的偏移距離不同，互不相容。Type-C 插頭可安全插入 Type J 插座，但粗圓腳的歐規 Type-E/F 無法插入。',
      photo: './img/plug-3d-J.png'
    },
    K: {
      id: 'K',
      serial: 'DS 60884-2-D1',
      desc: '北歐主要插頭規格，無極性設計',
      countries: '丹麥、格陵蘭、法羅群島',
      voltage: '220–240V',
      current: '16A',
      pins: DEFAULT_PIN_INFO,
      socket: 'Type - C',
      appearance: '兩根圓腳，加上一半圓形接地腳',
      safety: '若將帶有接地的歐規 Type E/F 插頭插入這個笑臉插座，可以通電，但半圓形接地孔會空接，導致高功率電器失去接地保護。',
      photo: './img/plug-3d-K.png'
    },
    L: {
      id: 'L',
      serial: 'CEI 23-16/VII',
      desc: '義大利主要插頭規格，一字型無極性設計',
      countries: '義大利',
      voltage: '220–240V',
      current: '10 A／16 A',
      pins: DEFAULT_PIN_INFO,
      socket: 'Type - C',
      appearance: '三根圓腳呈「一」字型直線排列',
      safety: '分為 10A 與 16A 兩種版本，兩者的腳互不相容。Type-C 可插入 10A 版本的插座。現代義大利已大量普及能同時相容 Type-L 與 Type-F 的「Bipasso」萬用插座。',
      photo: './img/plug-3d-L.png'
    },
    M: {
      id: 'M',
      serial: 'BS 546',
      desc: '南非主要插頭規格',
      countries: '印度、南非',
      voltage: '220–240V',
      current: '15A',
      pins: DEFAULT_PIN_INFO,
      socket: '無',
      appearance: '與 D 型一樣的佈局，但更粗大也更寬',
      safety: '專為大功率設計（最高 15A）。絕對無法與看起來相似的 Type-D 混用，強行硬塞會損壞牆面插座。',
      photo: './img/plug-3d-M.png'
    },
    N: {
      id: 'N',
      serial: 'IEC 60906-1',
      desc: '巴西南非的新規格',
      countries: '巴西、南非',
      voltage: '127 V 或 220 V；230 V',
      current: '10 A／20 A',
      pins: DEFAULT_PIN_INFO,
      socket: 'Type - C',
      appearance: '三圓腳呈扁平三角形，接地腳近中心',
      safety: '分為 10A 與 20A 兩版（20A 腳位較粗）。Type-C 可相容 10A 插座。巴西是少數全國同時存在 127V 與 220V 電網的國家，插入 Type-N 插座前必須先確認當地牆壁電壓。',
      photo: './img/plug-3d-N.png'
    },
    O: {
      id: 'O',
      serial: 'TIS 166-2549',
      desc: '泰國專屬三圓腳',
      countries: '泰國',
      voltage: '220–240 V',
      current: '16 A',
      pins: DEFAULT_PIN_INFO,
      socket: 'Type - C',
      appearance: '三根同等圓腳，下半部帶有絕緣套',
      safety: '泰國特有規格。其插座設計可以完美且安全地插入 Type-C 插頭。泰國牆面多為能同時插入 Type A、B、C、O 的多孔複合插座。',
      photo: './img/plug-3d-O.png'
    }
  };

  // 1-2 各規格篩選對應的卡片順序 (對應 Figma 1-2-1 ～ 1-2-6)
  const SPEC_GROUPS = {
    all: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'],
    mainland: ['C', 'E', 'F', 'H', 'I', 'J', 'K'],
    us: ['A', 'B'],
    uk: ['G'],
    'old-uk': ['D', 'M']
  };

  const PAGE_SIZE = 10; // ALL 第一頁 A-J (10張)，第二頁 K-O (5張)

  // =========================================
  // 2. DOM 元素參照
  // =========================================
  const views = {
    map: document.getElementById('view-map'),
    gallery: document.getElementById('view-gallery'),
    detail: document.getElementById('view-detail')
  };

  // 頂部與側邊選單
  const menuBtn = document.getElementById('menu-btn');
  const menuDrawer = document.getElementById('menu-drawer');
  const menuBackdrop = document.getElementById('menu-backdrop');
  const menuCloseBtn = document.getElementById('menu-close-btn');

  // 1-1 地圖控制
  const mapStage = document.getElementById('map-stage');
  const mapOverlayGroup = document.getElementById('map-overlay-group');
  const regionButtons = document.querySelectorAll('.region-btn');
  const regionLayers = document.querySelectorAll('.map-region-layer');
  const mapToGalleryBtn = document.getElementById('map-to-gallery-btn');

  // 1-2 圖鑑控制
  const specTabs = document.querySelectorAll('.spec-tab');
  const specSlidingPill = document.getElementById('spec-sliding-pill');
  const galleryCardGrid = document.getElementById('gallery-card-grid');
  const galleryPrevBtn = document.getElementById('gallery-prev-btn');
  const galleryPrevLabel = document.getElementById('gallery-prev-label');
  const galleryNextBtn = document.getElementById('gallery-next-btn');

  // 1-3 詳細頁控制
  const detailLetterImg = document.getElementById('detail-letter-img');
  const detailSerial = document.getElementById('detail-serial');
  const detailDesc = document.getElementById('detail-desc');
  const detailDiagramImg = document.getElementById('detail-diagram-img');
  const detailPhotoImg = document.getElementById('detail-photo-img');
  const detailCountries = document.getElementById('detail-countries');
  const detailVoltage = document.getElementById('detail-voltage');
  const detailCurrent = document.getElementById('detail-current');
  const detailPins = document.getElementById('detail-pins');
  const detailSocket = document.getElementById('detail-socket');
  const detailAppearance = document.getElementById('detail-appearance');
  const detailSafety = document.getElementById('detail-safety');
  const detailBackBtn = document.getElementById('detail-back-btn');

  const accordionSpecs = document.getElementById('accordion-specs');
  const accordionSafety = document.getElementById('accordion-safety');
  const toggleSpecsBtn = document.getElementById('toggle-specs-btn');
  const toggleSafetyBtn = document.getElementById('toggle-safety-btn');
  const dropdownSpecs = document.getElementById('dropdown-specs');
  const dropdownSafety = document.getElementById('dropdown-safety');

  // =========================================
  // 3. 應用程式狀態
  // =========================================
  const state = {
    view: 'map',          // 'map' | 'gallery' | 'detail'
    activeRegion: null,   // 單選：null | 'usa' | 'mainland' | 'uk' | 'old-uk'
    spec: 'all',          // 'all' | 'mainland' | 'us' | 'uk' | 'old-uk'
    page: 1,              // 1 (A-J) | 2 (K-O)
    plugType: 'F'         // 'A'..'O'
  };

  // =========================================
  // 4. URL 與視圖切換
  // =========================================
  function readStateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const specParam = params.get('spec');
    const pageParam = Number(params.get('page'));
    const typeParam = (params.get('type') || '').toUpperCase();

    state.spec = SPEC_GROUPS[specParam] ? specParam : 'all';
    state.page = pageParam === 2 && state.spec === 'all' ? 2 : 1;
    state.plugType = PLUG_DATA[typeParam] ? typeParam : 'F';

    if (viewParam === 'gallery' || viewParam === 'detail' || viewParam === 'map') {
      state.view = viewParam;
    } else if (PLUG_DATA[typeParam]) {
      state.view = 'detail';
    } else {
      state.view = 'map';
    }
  }

  function pushUrlState(replace = false) {
    const params = new URLSearchParams();
    params.set('view', state.view);
    if (state.view === 'gallery') {
      params.set('spec', state.spec);
      if (state.spec === 'all') {
        params.set('page', String(state.page));
      }
    } else if (state.view === 'detail') {
      params.set('type', state.plugType);
    }

    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    try {
      if (replace) {
        window.history.replaceState({ ...state }, '', nextUrl);
      } else {
        window.history.pushState({ ...state }, '', nextUrl);
      }
    } catch (_) {
      // 避免部分瀏覽器在 file:// 本機協定下拋出 SecurityError 中斷視圖切換
    }
  }

  function switchView(nextView, options = {}) {
    const viewChanged = state.view !== nextView;
    state.view = nextView;
    if (options.spec && SPEC_GROUPS[options.spec]) {
      state.spec = options.spec;
    }
    if (typeof options.page === 'number') {
      state.page = options.page;
    }
    if (options.type && PLUG_DATA[options.type]) {
      state.plugType = options.type;
    }

    document.body.dataset.view = state.view;
    Object.entries(views).forEach(([key, el]) => {
      el.classList.toggle('is-active', key === state.view);
    });

    if (state.view === 'gallery') {
      renderGallery(viewChanged);
    } else if (state.view === 'detail') {
      renderDetail(state.plugType);
    }

    if (!options.skipHistory) {
      pushUrlState(Boolean(options.replaceHistory));
    }

    if (viewChanged) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  // =========================================
  // 5. 1-1-1 / 1-1-2 國家規格單選切換與滑鼠微幅視差
  // =========================================
  const parallax = {
    curX: 0,
    curY: 0,
    targetX: 0,
    targetY: 0,
    rafId: null
  };

  // 地圖橘色點點隨滑鼠微幅位移的 MAX 上限（px），避免偏離白底圓點過遠
  const MAX_PARALLAX_X = 2.5;
  const MAX_PARALLAX_Y = 2;
  const MAX_PARALLAX_DIST = 2.5;

  function stepParallax() {
    parallax.curX += (parallax.targetX - parallax.curX) * 0.14;
    parallax.curY += (parallax.targetY - parallax.curY) * 0.14;

    const dx = Math.abs(parallax.targetX - parallax.curX);
    const dy = Math.abs(parallax.targetY - parallax.curY);

    mapOverlayGroup.style.transform = `translate3d(${parallax.curX.toFixed(2)}px, ${parallax.curY.toFixed(2)}px, 0)`;

    if (dx > 0.05 || dy > 0.05) {
      parallax.rafId = requestAnimationFrame(stepParallax);
    } else {
      parallax.curX = parallax.targetX;
      parallax.curY = parallax.targetY;
      mapOverlayGroup.style.transform = `translate3d(${parallax.curX}px, ${parallax.curY}px, 0)`;
      parallax.rafId = null;
    }
  }

  function setParallaxTarget(x, y, instant = false) {
    parallax.targetX = x;
    parallax.targetY = y;
    if (instant) {
      if (parallax.rafId) {
        cancelAnimationFrame(parallax.rafId);
        parallax.rafId = null;
      }
      parallax.curX = x;
      parallax.curY = y;
      mapOverlayGroup.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      return;
    }
    if (!parallax.rafId) {
      parallax.rafId = requestAnimationFrame(stepParallax);
    }
  }

  function syncMapRegions() {
    regionButtons.forEach((btn) => {
      const isActive = btn.dataset.region === state.activeRegion;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-checked', String(isActive));
    });

    regionLayers.forEach((layer) => {
      const isVisible = layer.dataset.regionLayer === state.activeRegion;
      layer.classList.toggle('is-visible', isVisible);
    });

    // 切換時平滑歸回正中對齊白底（避免 instant 瞬間跳回造成抽幀感）
    setParallaxTarget(0, 0, false);
  }

  regionButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const region = btn.dataset.region;
      // 單選邏輯：點擊未選項目直接切換；再次點擊已選項目則取消回到純白地圖
      state.activeRegion = state.activeRegion === region ? null : region;
      syncMapRegions();
    });
  });

  views.map.addEventListener('mousemove', (e) => {
    if (state.view !== 'map' || !state.activeRegion) return;
    const rect = mapStage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const normX = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width - 0.5) * 2));
    const normY = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height - 0.5) * 2));
    let offsetX = normX * MAX_PARALLAX_X;
    let offsetY = normY * MAX_PARALLAX_Y;

    // 限制總位移半徑不超過 MAX_PARALLAX_DIST，避免移到角落時疊加超出上限
    const dist = Math.hypot(offsetX, offsetY);
    if (dist > MAX_PARALLAX_DIST) {
      const scale = MAX_PARALLAX_DIST / dist;
      offsetX *= scale;
      offsetY *= scale;
    }

    setParallaxTarget(offsetX, offsetY);
  });

  views.map.addEventListener('mouseleave', () => {
    setParallaxTarget(0, 0);
  });

  mapToGalleryBtn.addEventListener('click', () => {
    // 若已單選某規格，前往圖鑑時直接對應開啟該規格；未選則開 ALL
    let targetSpec = 'all';
    if (state.activeRegion) {
      targetSpec = state.activeRegion === 'usa' ? 'us' : state.activeRegion;
    }
    switchView('gallery', { spec: targetSpec, page: 1 });
  });

  // =========================================
  // 6. 1-2-1 ～ 1-2-6 插頭圖鑑 (Sliding Pill + Slide-to-Confirm 卡片)
  // =========================================
  let pillInitialized = false;

  function updateSlidingPill(immediate = false) {
    const activeTab = document.querySelector('.spec-tab.is-active');
    if (!activeTab || !specSlidingPill) return;

    const useInstant = immediate || !pillInitialized;
    specSlidingPill.classList.toggle('no-transition', useInstant);
    specSlidingPill.style.width = `${activeTab.offsetWidth}px`;
    specSlidingPill.style.transform = `translateX(${activeTab.offsetLeft}px)`;

    if (useInstant) {
      // 強制 reflow 後再恢復動畫，確保初次進入不閃跳
      void specSlidingPill.offsetWidth;
      specSlidingPill.classList.remove('no-transition');
      pillInitialized = true;
    }
  }

  // 預先建立並快取 15 張卡片 DOM，避免切換規格時重複銷毀重建 innerHTML 與重新解碼大量 PNG
  const cardNodeCache = new Map();

  function getPlugCardElement(typeKey) {
    if (cardNodeCache.has(typeKey)) {
      return cardNodeCache.get(typeKey);
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'plug-card';
    btn.dataset.plugType = typeKey;
    btn.setAttribute('aria-label', `查看 TYPE-${typeKey} 插頭詳細介紹`);
    btn.innerHTML = `
      <span class="plug-card-icon-wrap">
        <img src="./img/plug-type-${typeKey}.png" alt="TYPE-${typeKey} 插頭圖示" class="plug-card-icon" decoding="async">
      </span>
      <span class="plug-card-gray-bar" aria-hidden="true"></span>
      <span class="plug-card-type-prefix" aria-hidden="true">
        <span class="plug-card-type-word">
          <img src="./img/letter-T.png" alt="" decoding="async">
          <img src="./img/letter-Y.png" alt="" decoding="async">
          <img src="./img/letter-P.png" alt="" decoding="async">
          <img src="./img/letter-E.png" alt="" decoding="async">
        </span>
        <span class="plug-card-type-dash"></span>
      </span>
      <img src="./img/letter-${typeKey}.png" alt="${typeKey}" class="plug-card-letter" decoding="async">
    `;
    cardNodeCache.set(typeKey, btn);
    return btn;
  }

  function renderGallery(viewChanged = false) {
    specTabs.forEach((tab) => {
      const isActive = tab.dataset.spec === state.spec;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    // 跨頁切入圖鑑時直接定位至目前規格，避免視窗縮放後返回出現滑動閃跳；同頁切換則滑動過渡
    if (viewChanged) {
      requestAnimationFrame(() => updateSlidingPill(true));
    } else {
      updateSlidingPill(false);
    }

    const fullList = SPEC_GROUPS[state.spec] || SPEC_GROUPS.all;
    const totalPages = Math.max(1, Math.ceil(fullList.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = 1;

    const start = (state.page - 1) * PAGE_SIZE;
    const pageItems = fullList.slice(start, start + PAGE_SIZE);

    const fragment = document.createDocumentFragment();
    pageItems.forEach((typeKey) => {
      fragment.appendChild(getPlugCardElement(typeKey));
    });
    galleryCardGrid.replaceChildren(fragment);

    // 左下按鈕：ALL 第 2 頁回第 1 頁顯示 PREV，其餘回地圖頁顯示 BACK（與 quiz.js 一致）
    const isSubPage = state.spec === 'all' && state.page > 1;
    if (galleryPrevLabel) {
      galleryPrevLabel.textContent = isSubPage ? 'PREV' : 'BACK';
    }
    galleryPrevBtn.setAttribute('aria-label', isSubPage ? '上一頁' : '返回插座世界地圖');

    // 控制右下角下一頁按鈕顯示（僅 ALL 第一頁有下一頁 K-O）
    galleryNextBtn.classList.toggle('is-hidden', state.page >= totalPages);
  }

  window.addEventListener('resize', () => {
    if (state.view === 'gallery') {
      updateSlidingPill(true);
    }
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (state.view === 'gallery') {
        updateSlidingPill(true);
      }
    });
  }

  specTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      switchView('gallery', { spec: tab.dataset.spec, page: 1 });
    });
  });

  galleryCardGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.plug-card');
    if (!card) return;
    const plugType = card.dataset.plugType;
    if (!PLUG_DATA[plugType]) return;
    switchView('detail', { type: plugType });
  });

  galleryPrevBtn.addEventListener('click', () => {
    if (state.spec === 'all' && state.page > 1) {
      switchView('gallery', { spec: 'all', page: 1 });
    } else {
      switchView('map');
    }
  });

  galleryNextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil((SPEC_GROUPS[state.spec] || []).length / PAGE_SIZE);
    if (state.page < totalPages) {
      switchView('gallery', { spec: state.spec, page: state.page + 1 });
    }
  });

  // =========================================
  // 7. 1-3 插頭詳細頁渲染與 Drop-down Menu 展開／收回
  // =========================================
  function setAccordionState(accordionEl, btnEl, menuEl, isOpen, label) {
    accordionEl.classList.toggle('is-open', isOpen);
    btnEl.setAttribute('aria-expanded', String(isOpen));
    btnEl.setAttribute('aria-label', `${isOpen ? '收回' : '展開'}${label}`);
    menuEl.setAttribute('aria-hidden', String(!isOpen));
  }

  function renderDetail(typeKey) {
    const data = PLUG_DATA[typeKey] || PLUG_DATA.F;

    detailLetterImg.src = `./img/letter-${data.id}.png`;
    detailLetterImg.alt = data.id;
    detailSerial.textContent = data.serial;
    detailDesc.textContent = data.desc;

    detailDiagramImg.src = `./img/plug-type-${data.id}.png`;
    detailDiagramImg.alt = `TYPE-${data.id} 平面規格圖`;

    // 載入 A–O 各型號專屬 3D 插圖（保留平面規格圖 fallback 以防圖片載入失敗）
    const diagramFallback = `./img/plug-type-${data.id}.png`;
    detailPhotoImg.onerror = () => {
      detailPhotoImg.onerror = null;
      detailPhotoImg.src = diagramFallback;
    };
    detailPhotoImg.dataset.plugType = data.id;
    detailPhotoImg.src = data.photo || `./img/plug-3d-${data.id}.png`;
    detailPhotoImg.alt = `TYPE-${data.id} 實體示意圖`;

    detailCountries.textContent = data.countries;
    detailVoltage.textContent = data.voltage;
    detailCurrent.textContent = data.current;
    detailPins.textContent = data.pins;

    detailSocket.textContent = data.socket;
    detailAppearance.textContent = data.appearance;
    detailSafety.textContent = data.safety;

    // 進入 1-3 頁面時預設收回，點擊 button-turn on (+) 展開、按 button-turn off (×) 收回
    setAccordionState(accordionSpecs, toggleSpecsBtn, dropdownSpecs, false, '技術規格');
    setAccordionState(accordionSafety, toggleSafetyBtn, dropdownSafety, false, '安全指引與補充');
  }

  toggleSpecsBtn.addEventListener('click', () => {
    const nextOpen = !accordionSpecs.classList.contains('is-open');
    setAccordionState(accordionSpecs, toggleSpecsBtn, dropdownSpecs, nextOpen, '技術規格');
  });

  toggleSafetyBtn.addEventListener('click', () => {
    const nextOpen = !accordionSafety.classList.contains('is-open');
    setAccordionState(accordionSafety, toggleSafetyBtn, dropdownSafety, nextOpen, '安全指引與補充');
  });

  detailBackBtn.addEventListener('click', () => {
    switchView('gallery', { spec: state.spec, page: state.page });
  });

  // =========================================
  // 8. 頂部導覽與側邊選單互動
  // =========================================
  function setDrawerOpen(open) {
    menuDrawer.classList.toggle('open', open);
    menuDrawer.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
  }

  menuBtn.addEventListener('click', () => setDrawerOpen(true));
  menuBackdrop.addEventListener('click', () => setDrawerOpen(false));
  menuCloseBtn.addEventListener('click', () => setDrawerOpen(false));

  document.querySelectorAll('[data-nav-view]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = link.dataset.navView;
      setDrawerOpen(false);
      if (targetView === 'gallery') {
        switchView('gallery', { spec: 'all', page: 1 });
      } else {
        switchView('map');
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setDrawerOpen(false);
    }
  });

  window.addEventListener('popstate', () => {
    readStateFromUrl();
    switchView(state.view, { skipHistory: true });
  });

  // =========================================
  // 9. 初始化畫面與預解碼大尺寸地圖圖層
  // =========================================
  document.querySelectorAll('.map-stage img').forEach((img) => {
    if (typeof img.decode === 'function') {
      img.decode().catch(() => {});
    }
  });

  readStateFromUrl();
  syncMapRegions();
  switchView(state.view, { replaceHistory: true });
});
