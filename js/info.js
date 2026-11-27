document.addEventListener('DOMContentLoaded', () => {
  // =========================================
  // 1. 側邊選單開合控制 (與全站其他頁面一致)
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

  // =========================================
  // 2. 3-1-0 ～ 3-1-0-3 捲動驅動控制
  //    - 0 ～ 35vh：主標題由畫面正中央平滑上移至距頂 180h (16.11vh) 並固定停駐
  //    - 35 ～ 55vh：主標題到位後停頓緩衝（再往下滑約 2 下才開始進場關鍵字）
  //    - 55vh 起每 35vh（約向下滑動 3 下）依序切換關鍵字：
  //      0: 小知識 → 1: 資訊 → 2: 更多 → 3: ...（... 停駐不向右移出）
  //    - 向上捲動自動完全反向操作
  // =========================================
  const storyTrack = document.getElementById('info-story-track');
  const mainTitle = document.getElementById('info-main-title');
  const keywords = Array.from(document.querySelectorAll('.info-keyword'));
  const dotsKeyword = document.getElementById('info-keyword-dots');
  const introCopy = document.getElementById('info-intro-copy');

  // 將主標題拆成各自獨立的字元 span，讓滑鼠移過每個字時可像鋼琴鍵般獨立向上彈起
  if (mainTitle) {
    const rawText = mainTitle.textContent.trim();
    mainTitle.setAttribute('aria-label', rawText);
    const fragment = document.createDocumentFragment();
    Array.from(rawText).forEach((char) => {
      const span = document.createElement('span');
      span.className = 'title-char';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = char;
      fragment.appendChild(span);
    });
    mainTitle.replaceChildren(fragment);
  }

  // 設計稿基準：180h / 1117h = 0.161145...；字級由 36 級等比縮小至 20 級
  const TITLE_STOP_RATIO = 180 / 1117;
  const TITLE_MIN_SCALE = 20 / 36;
  // 主標題上移行程、到位後停頓（約 2 下）、每段關鍵字切換距離（約 3 下），以及「...」登場後再捲 2 下散開
  const TITLE_SCROLL_VH = 0.35;
  const TITLE_HOLD_VH = 0.20;
  const STAGE_STEP_VH = 0.35;
  const DOTS_SPREAD_HOLD_VH = 0.20;
  // 前一個關鍵字移出與下一個關鍵字移入之間的間隔時間（1 秒）
  const KEYWORD_GAP_MS = 1000;
  // 首次登場自動放大提示：進場就位延遲、慢速縮放（0.7s）與放大停留時間（1.7s，較原本放慢一倍）
  const AUTO_ZOOM_DELAY_MS = 650;
  const AUTO_ZOOM_HOLD_MS = 1700;
  const AUTO_ZOOM_SETTLE_MS = 700;

  let targetStage = -1;
  let shownStage = -1;
  let wantDotsSpread = false;
  let isDotsSpread = false;
  let enterTimer = null;
  let autoZoomStartTimer = null;
  let autoZoomEndTimer = null;
  let autoZoomCleanupTimer = null;
  let lastExitTime = 0;
  let rafId = null;
  const seenStages = new Set(); // 記錄已自動放大過的關鍵字索引，確保各字僅首次自動放大

  // 切換「...」散開至 320% 與下方 45h 引言的顯示狀態（往上滑自動反向收合）
  function applyDotsSpread(spread) {
    if (spread === isDotsSpread) return;
    isDotsSpread = spread;
    if (spread) {
      clearAutoZoom();
    }
    if (dotsKeyword) {
      dotsKeyword.classList.toggle('is-spread', spread);
    }
    if (introCopy) {
      introCopy.classList.toggle('is-visible', spread);
      introCopy.setAttribute('aria-hidden', String(!spread));
    }
  }

  // 清除尚未完成或進行中的首次自動放大計時與狀態
  function clearAutoZoom() {
    if (autoZoomStartTimer !== null) {
      clearTimeout(autoZoomStartTimer);
      autoZoomStartTimer = null;
    }
    if (autoZoomEndTimer !== null) {
      clearTimeout(autoZoomEndTimer);
      autoZoomEndTimer = null;
    }
    if (autoZoomCleanupTimer !== null) {
      clearTimeout(autoZoomCleanupTimer);
      autoZoomCleanupTimer = null;
    }
    keywords.forEach((el) => el.classList.remove('is-auto-zoom', 'is-auto-zoom-slow'));
  }

  // 將指定階段的關鍵字移入畫面中央，其餘依順序待命於左側或右側
  function activateKeyword(stageIdx) {
    clearAutoZoom();
    shownStage = stageIdx;
    keywords.forEach((el, idx) => {
      const isLast = idx === keywords.length - 1; // 「...」為最後一段，永不向右移出
      const isActive = idx === stageIdx;
      const isAfter = !isLast && idx < stageIdx;
      const isBefore = idx > stageIdx;

      el.classList.toggle('is-active', isActive);
      el.classList.toggle('is-after', isAfter);
      el.classList.toggle('is-before', isBefore);
    });

    // 若「...」進場時捲動位置已達散開門檻，直接展開至 320% 並顯示引言（略過首次 1.5 倍自動放大）
    const isLastStage = stageIdx === keywords.length - 1;
    if (isLastStage && wantDotsSpread) {
      seenStages.add(stageIdx);
      applyDotsSpread(true);
      return;
    }

    // 若該關鍵字為首次被呼叫，進場就位後以 0.7s 緩緩放大至 1.5 倍，停留後再以 0.7s 緩緩縮回
    if (!seenStages.has(stageIdx) && keywords[stageIdx]) {
      const targetEl = keywords[stageIdx];
      autoZoomStartTimer = window.setTimeout(() => {
        autoZoomStartTimer = null;
        if (shownStage !== stageIdx || isDotsSpread) return;
        seenStages.add(stageIdx);
        targetEl.classList.add('is-auto-zoom-slow', 'is-auto-zoom');

        autoZoomEndTimer = window.setTimeout(() => {
          autoZoomEndTimer = null;
          targetEl.classList.remove('is-auto-zoom');

          // 待 0.7s 慢速縮回完成後再移除 .is-auto-zoom-slow，讓後續手動 hover 恢復 0.35s 俐落速度
          autoZoomCleanupTimer = window.setTimeout(() => {
            autoZoomCleanupTimer = null;
            targetEl.classList.remove('is-auto-zoom-slow');
          }, AUTO_ZOOM_SETTLE_MS);
        }, AUTO_ZOOM_HOLD_MS);
      }, AUTO_ZOOM_DELAY_MS);
    }
  }

  // 切換關鍵字階段：若目前已有字在場上，先讓其依方向移出並間隔 1s 後再讓下一個字滑入
  function applyKeywordStage(nextStage) {
    if (nextStage === targetStage) return;
    targetStage = nextStage;

    clearAutoZoom();
    if (enterTimer !== null) {
      clearTimeout(enterTimer);
      enterTimer = null;
    }

    // 捲回主標題緩衝區以內：所有關鍵字退回左側
    if (nextStage === -1) {
      if (shownStage !== -1) {
        lastExitTime = performance.now();
      }
      shownStage = -1;
      keywords.forEach((el) => {
        el.classList.remove('is-active', 'is-after');
        el.classList.add('is-before');
      });
      return;
    }

    // 場上目前有字正在顯示：先讓舊字沿正確方向（向下往右、向上往左）移出，間隔 1s 後再移入新字
    if (shownStage !== -1) {
      const prevStage = shownStage;
      const scrollingDown = nextStage > prevStage;
      shownStage = -1;
      lastExitTime = performance.now();

      keywords.forEach((el, idx) => {
        const isLast = idx === keywords.length - 1;
        el.classList.remove('is-active');
        if (idx === prevStage) {
          // 舊字離場：往下捲向右出、往上捲向左退（最後的「...」往上退回左側）
          const exitRight = scrollingDown && !isLast;
          el.classList.toggle('is-after', exitRight);
          el.classList.toggle('is-before', !exitRight);
        } else if (idx === nextStage) {
          // 新字先就位於待命側（往下捲從左進、往上捲從右回）
          const waitOnRight = !scrollingDown && !isLast;
          el.classList.toggle('is-after', waitOnRight);
          el.classList.toggle('is-before', !waitOnRight);
        } else {
          const isAfter = !isLast && idx < nextStage;
          el.classList.toggle('is-after', isAfter);
          el.classList.toggle('is-before', !isAfter);
        }
      });

      enterTimer = window.setTimeout(() => {
        enterTimer = null;
        activateKeyword(targetStage);
      }, KEYWORD_GAP_MS);
      return;
    }

    // 場上目前沒有字（初次進入「小知識」或在 1s 間隔中繼續捲動）：
    // 若剛觸發過舊字離場，補足剩餘的 1s 間隔；否則立即滑入
    const elapsed = lastExitTime ? performance.now() - lastExitTime : KEYWORD_GAP_MS;
    const waitMs = Math.max(0, KEYWORD_GAP_MS - elapsed);

    if (waitMs > 0) {
      enterTimer = window.setTimeout(() => {
        enterTimer = null;
        activateKeyword(targetStage);
      }, waitMs);
    } else {
      activateKeyword(nextStage);
    }
  }

  // 依據目前捲動距離更新主標題垂直位置與關鍵字階段
  function updateScrollScene() {
    rafId = null;
    const vh = window.innerHeight || 1;
    const trackTop = storyTrack.getBoundingClientRect().top;
    // 在本軌道內已往下捲動的像素距離（向下為正）
    const scrolled = Math.max(0, -trackTop);

    // 1. 計算主標題位置與縮放：由畫面正中央 (36 級) 平滑上移至 180h 並等比縮小至 20 級
    const titleScrollDist = vh * TITLE_SCROLL_VH;
    const titleProgress = Math.min(1, Math.max(0, scrolled / titleScrollDist));
    const titleHeight = mainTitle.offsetHeight || 0;
    const startY = (vh - titleHeight) / 2;
    const stopY = vh * TITLE_STOP_RATIO;
    const currentY = startY + (stopY - startY) * titleProgress;
    const currentScale = 1 + (TITLE_MIN_SCALE - 1) * titleProgress;
    mainTitle.style.transform = `translate3d(-50%, ${currentY.toFixed(2)}px, 0) scale(${currentScale.toFixed(4)})`;

    // 2. 主標題到位後再往下滑約 2 下 (TITLE_HOLD_VH) 才開始依序切換 4 個關鍵字（上限為 3「...」）
    const keywordStartDist = vh * (TITLE_SCROLL_VH + TITLE_HOLD_VH);
    const stepDist = vh * STAGE_STEP_VH;
    let nextStage = -1;
    if (scrolled >= keywordStartDist) {
      const rawStage = Math.floor((scrolled - keywordStartDist) / stepDist);
      nextStage = Math.min(keywords.length - 1, Math.max(0, rawStage));
    }

    // 3. 「...」登場後再往下捲約 2 下 (DOTS_SPREAD_HOLD_VH) 自動散開至 320% 並浮現下方 45h 引言
    const lastStageIdx = keywords.length - 1;
    const dotsSpreadDist = keywordStartDist + lastStageIdx * stepDist + vh * DOTS_SPREAD_HOLD_VH;
    wantDotsSpread = nextStage === lastStageIdx && scrolled >= dotsSpreadDist;

    applyKeywordStage(nextStage);

    // 若離開最後一段或捲回散開門檻之前，立刻收合點點與引言；若「...」已在場上且達門檻則自動散開
    if (!wantDotsSpread) {
      applyDotsSpread(false);
    } else if (shownStage === lastStageIdx) {
      applyDotsSpread(true);
    }
  }

  function requestSceneUpdate() {
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(updateScrollScene);
  }

  window.addEventListener('scroll', requestSceneUpdate, { passive: true });
  window.addEventListener('resize', requestSceneUpdate, { passive: true });

  // 初始渲染（含字體載入完成後重算一次高度，確保正中定位準確）
  updateScrollScene();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(requestSceneUpdate);
  }
});
