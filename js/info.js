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
  const storyStage = document.getElementById('info-story-stage');
  const mainTitle = document.getElementById('info-main-title');
  const keywords = Array.from(document.querySelectorAll('.info-keyword'));
  const dotsKeyword = document.getElementById('info-keyword-dots');
  const introCopy = document.getElementById('info-intro-copy');
  const whiteOrb = document.getElementById('info-white-orb');
  const boardReveal = document.getElementById('info-board-reveal');

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
  // 主標題上移行程、到位後停頓（約 2 下）、每段關鍵字切換距離（約 3 下），
  // 以及「...」登場後每捲 2 下依序觸發：點點散開 → 白圈入左下角 → 置中下移 90h → 右上角 1/4 圓 → 擴散刷屏揭露框架
  const TITLE_SCROLL_VH = 0.35;
  const TITLE_HOLD_VH = 0.20;
  const STAGE_STEP_VH = 0.35;
  const DOTS_SPREAD_HOLD_VH = 0.20;
  const ORB_PEEK_HOLD_VH = 0.20;
  const ORB_CENTER_HOLD_VH = 0.20;
  const ORB_TOPRIGHT_HOLD_VH = 0.20;
  const ORB_WIPE_HOLD_VH = 0.20;
  // 白圈直徑 360h（半徑 180h）與置中下移 90h 之設計稿比例
  const ORB_RADIUS_RATIO = 180 / 1117;
  const ORB_CENTER_OFFSET_RATIO = 90 / 1117;
  // 前一個關鍵字移出與下一個關鍵字移入之間的間隔時間（1 秒）
  const KEYWORD_GAP_MS = 1000;
  // 首次登場自動放大提示：進場就位延遲、慢速縮放（0.7s）與放大停留時間（1.7s，較原本放慢一倍）
  const AUTO_ZOOM_DELAY_MS = 650;
  const AUTO_ZOOM_HOLD_MS = 1700;
  const AUTO_ZOOM_SETTLE_MS = 700;
  // 刷屏延遲：白圈擴散與文章框架圓形刷屏之間的時間差（形成明顯白色波紋刷屏感）
  const WIPE_REVEAL_DELAY_MS = 260;
  const WIPE_COLLAPSE_DELAY_MS = 240;

  let targetStage = -1;
  let shownStage = -1;
  let wantDotsSpread = false;
  let isDotsSpread = false;
  let orbStage = 0; // 0: 左上畫面外, 1: 左下 1/4 圓, 2: 置中下移 90h, 3: 右上 1/4 圓, 4: 擴散全螢幕＋刷屏揭露框架
  let orbAnimRaf = null;
  let boardWipeTimer = null;
  let orbPos = { x: 0, y: 0, opacity: 0, scale: 1 };
  let enterTimer = null;
  let autoZoomStartTimer = null;
  let autoZoomEndTimer = null;
  let autoZoomCleanupTimer = null;
  let lastExitTime = 0;
  let rafId = null;
  const seenStages = new Set(); // 記錄已自動放大過的關鍵字索引，確保各字僅首次自動放大
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // 計算白圈自右上角 (100vw, 0) 擴散至完整覆蓋整個螢幕所需的縮放倍率
  function getOrbFullScale() {
    const vw = window.innerWidth || 1;
    const vh = window.innerHeight || 1;
    const r = Math.max(1, vh * ORB_RADIUS_RATIO);
    return Math.hypot(vw, vh) / r + 1.5;
  }

  // 計算白圈五階段的響應式圓心座標與縮放倍率（單位 px）
  function getOrbAnchor(stage) {
    const vw = window.innerWidth || 1;
    const vh = window.innerHeight || 1;
    const r = vh * ORB_RADIUS_RATIO;
    if (stage === 0) {
      // 起點設於畫面左方中上位置之外，準備沿弧線滑入左下角
      return { x: -r - 24, y: vh * 0.35, opacity: 0, scale: 1 };
    }
    if (stage === 1) {
      // 左下角露出右上 1/4 圓
      return { x: 0, y: vh, opacity: 1, scale: 1 };
    }
    if (stage === 2) {
      // 水平置中、垂直置中再下移 90h
      return { x: vw * 0.5, y: vh * (0.5 + ORB_CENTER_OFFSET_RATIO), opacity: 1, scale: 1 };
    }
    if (stage === 3) {
      // 右上角僅露出左下 1/4 圓
      return { x: vw, y: 0, opacity: 1, scale: 1 };
    }
    // 階段 4：自右上角等比擴散至覆蓋全螢幕
    return { x: vw, y: 0, opacity: 1, scale: getOrbFullScale() };
  }

  // 直接套用白圈圓心座標、透明度與縮放倍率（純 GPU translate3d + scale）
  function renderOrb(x, y, opacity, scale = 1) {
    orbPos = { x, y, opacity, scale };
    if (!whiteOrb) return;
    const r = (window.innerHeight || 1) * ORB_RADIUS_RATIO;
    whiteOrb.style.transform = `translate3d(${(x - r).toFixed(2)}px, ${(y - r).toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
    whiteOrb.style.opacity = opacity.toFixed(3);
  }

  // 設定文章框架刷屏揭露層狀態
  function setBoardRevealed(revealed) {
    if (!boardReveal) return;
    boardReveal.classList.toggle('is-revealed', revealed);
    boardReveal.setAttribute('aria-hidden', String(!revealed));
  }

  // 執行白圈由當前座標／縮放平滑過渡至指定階段
  function animateOrbTo(prevStage, nextStage) {
    if (orbAnimRaf !== null) {
      cancelAnimationFrame(orbAnimRaf);
      orbAnimRaf = null;
    }

    const start = { ...orbPos };
    const isEntryArc = (prevStage === 0 && nextStage === 1) || (prevStage === 1 && nextStage === 0);
    const isLowerArc = (prevStage === 1 && nextStage === 2) || (prevStage === 2 && nextStage === 1);
    const isTopRightArc = (prevStage === 2 && nextStage === 3) || (prevStage === 3 && nextStage === 2);
    const isWipeScale = (prevStage === 3 && nextStage === 4) || (prevStage === 4 && nextStage === 3);
    const duration = isWipeScale ? 660 : (isEntryArc ? 820 : 880);
    const startTime = performance.now();

    function step(now) {
      const u = Math.min(1, (now - startTime) / duration);
      // 進場、弧線與擴散皆採流暢曲線；退回畫面外採 ease-in
      let t;
      if (nextStage === 0) {
        t = u * u * u;
      } else if (nextStage === 4) {
        // 擴散白屏：快速加速掃過全螢幕
        t = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      } else {
        t = 1 - Math.pow(1 - u, 3);
      }

      const vw = window.innerWidth || 1;
      const vh = window.innerHeight || 1;
      const r = vh * ORB_RADIUS_RATIO;
      const target = getOrbAnchor(nextStage);

      let x;
      let y;
      if (isWipeScale) {
        x = start.x + (target.x - start.x) * t;
        y = start.y + (target.y - start.y) * t;
      } else {
        let ctrlX;
        let ctrlY;
        if (isEntryArc) {
          // 0↔1：由左方中上 (-r-24, 35vh) 順弧線下滑至左下角 (0, 100vh)
          ctrlX = -r * 0.45;
          ctrlY = vh * 0.82;
        } else if (isLowerArc) {
          // 1↔2：由左下角 (0, 100vh) 貼底向右劃出下弧線再揚起至置中下移 90h
          ctrlX = vw * 0.42;
          ctrlY = vh * 1.12;
        } else if (isTopRightArc) {
          // 2↔3：延續往右上方順滑揚起的弧線，抵達右上角 (100vw, 0) 僅露左下 1/4 圓
          ctrlX = vw * 0.78;
          ctrlY = vh * 0.42;
        } else {
          ctrlX = vw * 0.5;
          ctrlY = vh * 0.95;
        }
        const inv = 1 - t;
        x = inv * inv * start.x + 2 * inv * t * ctrlX + t * t * target.x;
        y = inv * inv * start.y + 2 * inv * t * ctrlY + t * t * target.y;
      }

      const opacity = start.opacity + (target.opacity - start.opacity) * t;
      const scale = start.scale + (target.scale - start.scale) * t;
      renderOrb(x, y, opacity, scale);

      if (u < 1) {
        orbAnimRaf = window.requestAnimationFrame(step);
      } else {
        orbAnimRaf = null;
        renderOrb(target.x, target.y, target.opacity, target.scale);
      }
    }

    orbAnimRaf = window.requestAnimationFrame(step);
  }

  // 依階段執行白圈與刷屏轉場：
  // 3 → 4：白圈先擴散全螢幕，260ms 後文章框架隨圓形刷屏跟進揭露（形成白波刷屏感）
  // 4 → 3：文章框架先反向收束，240ms 後白圈同步縮回右上角 1/4 圓
  function applyOrbStage(nextOrbStage, immediate = false) {
    if (!whiteOrb) return;
    if (!immediate && nextOrbStage === orbStage) return;

    const prevOrbStage = orbStage;
    orbStage = nextOrbStage;

    if (boardWipeTimer !== null) {
      clearTimeout(boardWipeTimer);
      boardWipeTimer = null;
    }

    if (storyStage) {
      storyStage.classList.toggle('is-orb-centered', nextOrbStage >= 2);
    }

    const end = getOrbAnchor(nextOrbStage);
    if (immediate || prefersReducedMotion.matches) {
      if (orbAnimRaf !== null) {
        cancelAnimationFrame(orbAnimRaf);
        orbAnimRaf = null;
      }
      renderOrb(end.x, end.y, end.opacity, end.scale);
      setBoardRevealed(nextOrbStage === 4);
      return;
    }

    if (nextOrbStage === 4) {
      // 正向刷屏：白圈立刻擴散掃屏，260ms 後新框架緊跟其後圓形刷入
      animateOrbTo(prevOrbStage, 4);
      boardWipeTimer = window.setTimeout(() => {
        boardWipeTimer = null;
        if (orbStage === 4) {
          setBoardRevealed(true);
        }
      }, WIPE_REVEAL_DELAY_MS);
    } else if (prevOrbStage === 4 && nextOrbStage === 3) {
      // 反向刷屏：先將文章框架往右上收束露出白幕，240ms 後白圈縮回右上角 1/4 圓
      setBoardRevealed(false);
      boardWipeTimer = window.setTimeout(() => {
        boardWipeTimer = null;
        if (orbStage === 3) {
          animateOrbTo(4, 3);
        }
      }, WIPE_COLLAPSE_DELAY_MS);
    } else {
      setBoardRevealed(false);
      animateOrbTo(prevOrbStage, nextOrbStage);
    }
  }

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

    // 4. 點點散開後每再滑動 2 下依序觸發：
    //    左下角 1/4 圓 → 下弧線置中下移 90h → 右上角 1/4 圓 → 擴散全螢幕＋刷屏揭露文章框架
    const orbPeekDist = dotsSpreadDist + vh * ORB_PEEK_HOLD_VH;
    const orbCenterDist = orbPeekDist + vh * ORB_CENTER_HOLD_VH;
    const orbTopRightDist = orbCenterDist + vh * ORB_TOPRIGHT_HOLD_VH;
    const orbWipeDist = orbTopRightDist + vh * ORB_WIPE_HOLD_VH;
    let nextOrbStage = 0;
    if (scrolled >= orbWipeDist) {
      nextOrbStage = 4;
    } else if (scrolled >= orbTopRightDist) {
      nextOrbStage = 3;
    } else if (scrolled >= orbCenterDist) {
      nextOrbStage = 2;
    } else if (scrolled >= orbPeekDist) {
      nextOrbStage = 1;
    }
    applyOrbStage(nextOrbStage);
  }

  function requestSceneUpdate() {
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(updateScrollScene);
  }

  window.addEventListener('scroll', requestSceneUpdate, { passive: true });
  window.addEventListener('resize', () => {
    if (orbAnimRaf === null) {
      const anchor = getOrbAnchor(orbStage);
      renderOrb(anchor.x, anchor.y, anchor.opacity, anchor.scale);
    }
    requestSceneUpdate();
  }, { passive: true });

  // 初始渲染（先將白圈靜態定位於左側畫面外，避免初次進頁閃現）
  applyOrbStage(0, true);
  updateScrollScene();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(requestSceneUpdate);
  }
});
