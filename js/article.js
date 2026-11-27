document.addEventListener('DOMContentLoaded', () => {
  // =========================================
  // 1. 側邊選單開合控制 (與全站一致)
  // =========================================
  const menuBtn = document.getElementById('menu-btn');
  const menuDrawer = document.getElementById('menu-drawer');
  const menuBackdrop = document.getElementById('menu-backdrop');
  const menuCloseBtn = document.getElementById('menu-close-btn');

  function setDrawerOpen(open) {
    menuDrawer.classList.toggle('open', open);
    menuDrawer.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
  }

  menuBtn.addEventListener('click', () => setDrawerOpen(true));
  menuBackdrop.addEventListener('click', () => setDrawerOpen(false));
  menuCloseBtn.addEventListener('click', () => setDrawerOpen(false));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setDrawerOpen(false);
    }
  });

  // 共用兩排四組統計數據（電壓具備 100→240 動態，引腳維持靜態 2 - 3）
  const DEFAULT_STATS = [
    { kicker: '種類', prefix: '', start: 0, target: 15, caption: '全世界的插頭種類數量' },
    { kicker: '頻率', prefix: '50 - ', start: 50, target: 60, caption: '常見的交流電頻率' },
    { kicker: '電壓', prefix: '100 - ', start: 100, target: 240, caption: '常見的電壓區間' },
    { kicker: '引腳', staticText: '2 - 3', caption: '每一插頭常見的引腳的數量' }
  ];

  // =========================================
  // 2. 四張文章卡片對應章節資料（左下角卡片 ?id=1 對應章節 2 / 02）
  // =========================================
  const CHAPTERS = {
    '1': {
      chapterLabel: '章節 2',
      number: '02',
      headingLines: ['你知道關於插頭的', '基本知識嗎？'],
      badge: 'PLUG-IN',
      body: '插頭是日常生活中不可或缺的電力連接工具，負責將電器與電源連接，讓電力順利傳輸。然而，不同國家因電力系統與安全規範不同，發展出各式各樣的插頭形狀與規格，從電壓、頻率到引腳數量，都藏著值得了解的小知識。',
      labels: ['電力規格解析', '全球插頭種類', '電壓與頻率'],
      stats: DEFAULT_STATS
    },
    featured: {
      chapterLabel: '章節 1',
      number: '01',
      headingLines: ['精選專題文章', '探索插頭世界'],
      badge: 'PLUG-IN',
      body: '此區為精選文章（大框）專屬分頁模板，後續可直接填入正式章節內容、主題標籤與重點統計數據。',
      labels: ['專題導讀', '用電安全', '各國規範'],
      stats: DEFAULT_STATS
    },
    '2': {
      chapterLabel: '章節 3',
      number: '03',
      headingLines: ['資訊與文章 03', '內容預留區塊'],
      badge: 'PLUG-IN',
      body: '此區為下方中間小框卡片對應之獨立章節模板，後續可直接在此填入正式文章內容。',
      labels: ['電力規格解析', '全球插頭種類', '電壓與頻率'],
      stats: DEFAULT_STATS
    },
    '3': {
      chapterLabel: '章節 4',
      number: '04',
      headingLines: ['資訊與文章 04', '內容預留區塊'],
      badge: 'PLUG-IN',
      body: '此區為下方右側小框卡片對應之獨立章節模板，後續可直接在此填入正式文章內容。',
      labels: ['電力規格解析', '全球插頭種類', '電壓與頻率'],
      stats: DEFAULT_STATS
    }
  };

  // 讀取網址 ?id= 參數並套用對應章節資料（預設顯示章節 2）
  const params = new URLSearchParams(window.location.search);
  const chapterId = params.get('id') || '1';
  const data = CHAPTERS[chapterId] || CHAPTERS['1'];

  const labelEl = document.getElementById('chapter-label');
  const numberEl = document.getElementById('chapter-number');
  const headingEl = document.getElementById('chapter-heading');
  const badgeEl = document.getElementById('chapter-brand-badge');
  const bodyEl = document.getElementById('chapter-body');
  const labelsWrap = document.getElementById('chapter-labels');
  const statsWrap = document.getElementById('chapter-stats');

  document.title = `PLUG IN - ${data.chapterLabel}`;
  if (labelEl) labelEl.textContent = data.chapterLabel;
  if (numberEl) {
    numberEl.textContent = data.number;
    numberEl.setAttribute('aria-label', `章節編號 ${data.number}`);
  }
  if (headingEl) {
    headingEl.innerHTML = data.headingLines.join('<br>');
  }
  if (badgeEl) badgeEl.textContent = data.badge;
  if (bodyEl) bodyEl.textContent = data.body;

  // 渲染 3 顆膠囊標籤並支援點擊切換實心選取態
  if (labelsWrap) {
    const fragment = document.createDocumentFragment();
    data.labels.forEach((text, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = idx === 0 ? 'chapter-pill is-active' : 'chapter-pill';
      btn.textContent = text;
      btn.addEventListener('click', () => {
        labelsWrap.querySelectorAll('.chapter-pill').forEach((el) => {
          el.classList.toggle('is-active', el === btn);
        });
      });
      fragment.appendChild(btn);
    });
    labelsWrap.replaceChildren(fragment);
  }

  // 渲染下方兩排重點統計數據（內嵌 .counter 供 GSAP 執行 Number Counter 動畫；靜態項目如「2 - 3」直接呈現）
  if (statsWrap) {
    const fragment = document.createDocumentFragment();
    data.stats.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'stat-item';
      const valueHtml = item.staticText
        ? item.staticText
        : `${item.prefix}<span class="counter" data-start="${item.start}" data-target="${item.target}">${item.start}</span>`;
      div.innerHTML = `
        <span class="stat-kicker">${item.kicker}</span>
        <strong class="stat-value">${valueHtml}</strong>
        <span class="stat-caption">${item.caption}</span>
      `;
      fragment.appendChild(div);
    });
    statsWrap.replaceChildren(fragment);
  }

  // =========================================
  // 3. GSAP + ScrollTrigger Number Counter 動畫
  //    第一排「0 → 15」與「50 - 50 → 50 - 60」同步開跑；
  //    捲動至第二排時「100 - 100 → 100 - 240」接續開跑
  // =========================================
  const counterEls = document.querySelectorAll('.counter');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    counterEls.forEach((el) => {
      const startVal = parseFloat(el.dataset.start) || 0;
      const targetVal = parseFloat(el.dataset.target);
      // 建立 proxy 物件讓 GSAP 操作數值（15 從 0 起跳、60 從 50 起跳、240 從 100 起跳）
      const counterObj = { val: startVal };

      gsap.to(counterObj, {
        val: targetVal,
        delay: 0.35,            // 滑到觸發後先停頓 0.35 秒再開始跑數
        duration: 1.6,          // 動畫總秒數
        ease: 'power3.out',     // 先快後慢的俐落減速感
        snap: { val: 1 },       // 每次跳動取整數
        scrollTrigger: {
          trigger: el,          // 元素頂部進入視窗 85% 高度時觸發（同排元素高度一致會同步觸發）
          start: 'top 85%',
          once: true            // 僅觸發一次
        },
        onUpdate: () => {
          el.textContent = counterObj.val;
        }
      });
    });
  } else {
    // 若離線未載入 GSAP 或使用者開啟減少動態效果，直接顯示最終數值
    counterEls.forEach((el) => {
      el.textContent = el.dataset.target;
    });
  }
});
