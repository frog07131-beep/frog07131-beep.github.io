document.addEventListener('DOMContentLoaded', () => {
  // =========================================
  // 1. 7 題小測驗題庫 (完全對應 Figma 4-2 關卡 1 ～ 關卡 7)
  // =========================================
  const QUESTIONS = [
    {
      id: 1,
      question: '如果要去英國旅行，請問當地是哪一型轉接頭？',
      kind: 'image',
      correct: 'B',
      options: [
        { key: 'A', label: 'TYPE-I', img: './img/plug-type-I.png' },
        { key: 'B', label: 'TYPE-G', img: './img/plug-type-G.png' },
        { key: 'C', label: 'TYPE-F', img: './img/plug-type-F.png' }
      ],
      explanation: '英國標準為品字形三方腳 Type-G（BS 1363），內建保險絲且具高安全防護設計。'
    },
    {
      id: 2,
      question: '請問義大利的插座是哪一型的？',
      kind: 'image',
      correct: 'A',
      options: [
        { key: 'A', label: 'TYPE-L', img: './img/plug-type-L.png' },
        { key: 'B', label: 'TYPE-J', img: './img/plug-type-J.png' },
        { key: 'C', label: 'TYPE-G', img: './img/plug-type-G.png' }
      ],
      explanation: '義大利主要使用三根圓腳呈「一」字型直線排列的 Type-L（CEI 23-16/VII）。'
    },
    {
      id: 3,
      question: '請問澳洲用的是哪一類型的插頭？',
      kind: 'image',
      correct: 'A',
      options: [
        { key: 'A', label: 'TYPE-I', img: './img/plug-type-I.png' },
        { key: 'B', label: 'TYPE-L', img: './img/plug-type-L.png' },
        { key: 'C', label: 'TYPE-G', img: './img/plug-type-G.png' }
      ],
      explanation: '澳洲與紐西蘭使用八字型扁腳搭配垂直接地腳的 Type-I（NZS 3112）。'
    },
    {
      id: 4,
      question: 'Type-F 又稱 Schuko，下面哪個國家也使用這一類型的插座？',
      kind: 'text',
      questionImg: './img/plug-type-F.png',
      correct: 'A',
      options: [
        { key: 'A', label: '韓國' },
        { key: 'B', label: '英國' },
        { key: 'C', label: '日本' }
      ],
      explanation: 'Type-F（Schuko / CEE 7/4）除德國、西班牙、瑞典等歐洲國家外，韓國亦廣泛使用。'
    },
    {
      id: 5,
      question: '把插腳較細的 Type-C 插進長得很像的 Type-E/F 插座使用，最容易發生什麼危險？',
      kind: 'text',
      correct: 'A',
      options: [
        { key: 'A', label: '接觸不良、鬆動發熱甚至起火' },
        { key: 'B', label: '電壓自動升高兩倍' },
        { key: 'C', label: '插座卡死完全無法拔出' }
      ],
      explanation: 'Type-C 插腳直徑（4.0mm）較 Type-E/F（4.8mm）細，且僅限低電流（2.5A），高功率或鬆動使用極易過熱危險。'
    },
    {
      id: 6,
      question: '印度的插座有 Type-D 或 Type-M，兩者外觀相同但無法互相使用，請問差別在哪裡？',
      kind: 'text',
      correct: 'A',
      options: [
        { key: 'A', label: '插腳粗細與尺寸大小不同' },
        { key: 'B', label: '分別為圓腳與扁平腳設計' },
        { key: 'C', label: '適用電壓不同（110V 與 220V）' }
      ],
      explanation: 'Type-D（5–6A）與 Type-M（15A）雖同為舊英式三角圓柱佈局，但 Type-M 明顯更粗大更寬，完全互不相容。'
    },
    {
      id: 7,
      question: '請問臺灣常見的插座是哪二型？',
      kind: 'text',
      correct: 'A',
      options: [
        { key: 'A', label: 'TYPE-A、B' },
        { key: 'B', label: 'TYPE-A、C' },
        { key: 'C', label: 'TYPE-B、F' }
      ],
      explanation: '臺灣主要使用無接地雙扁腳 Type-A 與附圓形接地腳的三孔 Type-B 插座。'
    }
  ];

  // =========================================
  // 2. DOM 元素參照
  // =========================================
  const stages = {
    intro: document.getElementById('stage-intro'),
    question: document.getElementById('stage-question'),
    loading: document.getElementById('stage-loading'),
    result: document.getElementById('stage-result')
  };

  // 側邊選單
  const menuBtn = document.getElementById('menu-btn');
  const menuDrawer = document.getElementById('menu-drawer');
  const menuBackdrop = document.getElementById('menu-backdrop');
  const menuCloseBtn = document.getElementById('menu-close-btn');

  // 4-1 說明頁
  const btnStartQuiz = document.getElementById('btn-start-quiz');

  // 4-2 關卡頁
  const questionIndexNum = document.getElementById('question-index-num');
  const questionProgress = document.getElementById('question-progress');
  const questionText = document.getElementById('question-text');
  const questionVisual = document.getElementById('question-visual');
  const questionVisualImg = document.getElementById('question-visual-img');
  const optionsRow = document.getElementById('options-row');
  const quizHint = document.getElementById('quiz-hint');
  const btnPrev = document.getElementById('btn-prev');
  const btnPrevLabel = document.getElementById('btn-prev-label');
  const btnNext = document.getElementById('btn-next');
  const btnNextLabel = document.getElementById('btn-next-label');
  const quizFeedback = document.getElementById('quiz-feedback');
  const feedbackVerdict = document.getElementById('feedback-verdict');
  const feedbackAnswer = document.getElementById('feedback-answer');
  const feedbackExplain = document.getElementById('feedback-explain');

  // 4-3 加載中
  const loadingBarFill = document.getElementById('loading-bar-fill');
  const loadingPercent = document.getElementById('loading-percent');

  // 結算頁
  const resultScorePill = document.getElementById('result-score-pill');
  const resultGradeLetters = document.getElementById('result-grade-letters');
  const resultSubhead = document.getElementById('result-subhead');
  const resultDetail = document.getElementById('result-detail');
  let detailCards = [];
  const resultDots = document.getElementById('result-dots');
  const btnPlayAgain = document.getElementById('btn-playagain');

  // =========================================
  // 3. 測驗狀態
  // =========================================
  const state = {
    currentIndex: 0,
    answers: new Array(QUESTIONS.length).fill(null),
    loadingTimer: null
  };

  // =========================================
  // 4. 階段切換控制 (4-1 / 4-2 / 4-3 / 結算)
  // =========================================
  function showStage(stageName) {
    document.body.dataset.stage = stageName;
    Object.entries(stages).forEach(([key, el]) => {
      el.classList.toggle('is-active', key === stageName);
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  let hintTimer = null;
  let nudgeTimer = null;

  function showHint(message) {
    quizHint.textContent = message;
    quizHint.classList.add('is-visible');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(clearHint, 2500);
  }

  function clearHint() {
    clearTimeout(hintTimer);
    quizHint.textContent = '';
    quizHint.classList.remove('is-visible');
  }

  // 還沒選答案時 NEXT 變淡
  function updateNextLock() {
    const locked = !state.answers[state.currentIndex];
    btnNext.classList.toggle('is-locked', locked);
    btnNext.setAttribute('aria-disabled', String(locked));
  }

  // 沒選就按 NEXT：選項晃一下
  function nudgeOptions() {
    optionsRow.classList.remove('needs-answer');
    void optionsRow.offsetWidth; // 重新觸發動畫
    optionsRow.classList.add('needs-answer');
    clearTimeout(nudgeTimer);
    nudgeTimer = setTimeout(() => optionsRow.classList.remove('needs-answer'), 700);
  }

  // 選完答案：鎖住選項、標出正確答案，並在右下顯示解析
  function optionLabel(q, key) {
    const opt = q.options.find((o) => o.key === key);
    return opt ? `${key}・${opt.label}` : key;
  }

  let revealTimer = null; // 保留給 renderQuestion / hideAnswerResult 清除用

  const CHECK_SVG = '<svg class="answer-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12.5l5 5L19.5 7" pathLength="1"/></svg>';

  // animate = true：剛作答且答對時，正確選項右上角的勾勾會一筆畫出來
  function showAnswerResult(index, animate = false) {
    const q = QUESTIONS[index];
    const chosenKey = state.answers[index];
    const isCorrect = chosenKey === q.correct;

    clearTimeout(revealTimer);
    optionsRow.classList.add('is-answered');
    optionsRow.querySelectorAll('.option-card').forEach((btn) => {
      const key = btn.dataset.optionKey;
      const isAnswer = key === q.correct;
      btn.classList.toggle('is-selected', isAnswer);
      if (isAnswer && !btn.querySelector('.answer-check')) {
        btn.insertAdjacentHTML('beforeend', CHECK_SVG);
      }
      btn.classList.toggle('draw-check', isAnswer && animate && isCorrect);
      btn.classList.toggle('is-wrong', key === chosenKey && !isCorrect);
      btn.setAttribute('aria-checked', String(key === chosenKey));
      btn.setAttribute('aria-disabled', 'true');
    });

    feedbackVerdict.textContent = isCorrect ? '✓ 答對' : '✕ 答錯';
    feedbackVerdict.classList.toggle('is-wrong', !isCorrect);
    feedbackAnswer.textContent = `正確答案　${optionLabel(q, q.correct)}`;
    feedbackExplain.textContent = q.explanation;
    quizFeedback.classList.add('is-visible');
  }

  function hideAnswerResult() {
    clearTimeout(revealTimer);
    optionsRow.classList.remove('is-answered');
    quizFeedback.classList.remove('is-visible');
  }

  // =========================================
  // 5. 4-2 關卡渲染
  // =========================================
  function renderQuestion(index) {
    const q = QUESTIONS[index];
    const selectedKey = state.answers[index];

    clearHint();
    questionIndexNum.textContent = String(q.id);
    questionProgress.textContent = `${q.id} / ${QUESTIONS.length}`;
    questionText.textContent = q.question;

    if (q.questionImg) {
      questionVisualImg.src = q.questionImg;
      questionVisual.hidden = false;
    } else {
      questionVisual.hidden = true;
    }

    optionsRow.innerHTML = q.options
      .map((opt) => {
        const isSelected = selectedKey === opt.key;
        const isImage = q.kind === 'image';
        return `
          <button
            type="button"
            class="option-card ${isImage ? 'is-image-option' : ''} ${isSelected ? 'is-selected' : ''}"
            data-option-key="${opt.key}"
            role="radio"
            aria-checked="${isSelected}"
          >
            <div class="option-head">
              <span class="option-letter">${opt.key}</span>
              <span class="option-underline" aria-hidden="true"></span>
              ${isImage ? `<span class="option-sublabel">${opt.label}</span>` : ''}
            </div>
            ${
              isImage
                ? `<div class="option-plug-wrap"><img src="${opt.img}" alt="選項 ${opt.key} ${opt.label}" class="option-plug-img"></div>`
                : `<span class="option-text">${opt.label}</span>`
            }
          </button>
        `;
      })
      .join('');

    // 第一題顯示 BACK（回 4-1），其餘顯示 PREV；最後一題顯示 END（進 4-3）
    btnPrevLabel.textContent = index === 0 ? 'BACK' : 'PREV';
    btnPrev.setAttribute('aria-label', index === 0 ? '返回測驗說明頁' : '回到上一題');

    const isLast = index === QUESTIONS.length - 1;
    btnNextLabel.textContent = isLast ? 'END' : 'NEXT';
    btnNext.setAttribute('aria-label', isLast ? '完成測驗並查看結果' : '前往下一題');
    updateNextLock();

    // 回到已作答的題目時，直接顯示當時的對錯與解析（不再閃框）
    clearTimeout(revealTimer);
    if (selectedKey) {
      showAnswerResult(index);
    } else {
      hideAnswerResult();
    }
  }

  // =========================================
  // 6. 4-3 加載動畫與 4-4 等級結算
  // =========================================
  function startLoadingAndFinish() {
    if (state.loadingTimer) {
      clearInterval(state.loadingTimer);
    }

    showStage('loading');
    let progress = 0;
    loadingBarFill.style.width = '0%';
    loadingPercent.textContent = '0%';

    state.loadingTimer = setInterval(() => {
      progress = Math.min(100, progress + Math.floor(Math.random() * 14) + 8);
      loadingBarFill.style.width = `${progress}%`;
      loadingPercent.textContent = `${progress}%`;

      if (progress >= 100) {
        clearInterval(state.loadingTimer);
        state.loadingTimer = null;
        setTimeout(renderResult, 320);
      }
    }, 140);
  }

  function buildGradeVisual(grade) {
    // 優先使用專案現有的幾何字母圖檔（G/O/D、F/A/I/L）；PASS 以相容幾何字體呈現
    if (grade === 'GOOD') {
      return ['G', 'O', 'O', 'D']
        .map((ch) => `<img src="./img/letter-${ch}.png" alt="${ch}">`)
        .join('');
    }
    if (grade === 'FAIL') {
      return ['F', 'A', 'I', 'L']
        .map((ch) => `<img src="./img/letter-${ch}.png" alt="${ch}">`)
        .join('');
    }
    return '<span>PASS</span>';
  }

  function renderResult() {
    let score = 0;
    QUESTIONS.forEach((q, idx) => {
      if (state.answers[idx] === q.correct) {
        score += 1;
      }
    });

    let grade = 'FAIL';
    let subhead = '還差一點點！建議先逛逛插頭圖鑑熟悉各國規格，再回來挑戰一次。';
    if (score >= 6) {
      grade = 'GOOD';
      subhead = '太厲害了！你對各國插座規格與用電安全瞭若指掌，放心展開國際旅程吧！';
    } else if (score >= 3) {
      grade = 'PASS';
      subhead = '表現不錯！你已掌握基本用電安全觀念，出國前再複習幾題易混淆規格會更萬無一失。';
    }

    resultScorePill.textContent = `答對 ${score} / ${QUESTIONS.length} 題`;
    resultGradeLetters.innerHTML = buildGradeVisual(grade);
    resultSubhead.textContent = subhead;

    // 每一題做成一張解析卡片，圈圈只負責切換
    detailCards = QUESTIONS.map((q, idx) => {
      const userKey = state.answers[idx];
      const isCorrect = userKey === q.correct;
      const answerTile = (key, role) => {
        const opt = q.options.find((o) => o.key === key);
        const label = role === 'mine' ? '你選' : '正確';
        if (!opt) return `<div class="tip-tile is-${role}"><span class="tip-tile-label">${label}</span><span class="tip-tile-name">未作答</span></div>`;
        const visual = opt.img ? `<img src="${opt.img}" alt="" class="tip-tile-img">` : '';
        return `
          <div class="tip-tile is-${role}">
            <span class="tip-tile-label">${label}</span>
            ${visual}
            <span class="tip-tile-name">${key}・${opt.label}</span>
          </div>`;
      };
      const tiles = isCorrect
        ? answerTile(userKey, 'right')
        : answerTile(userKey, 'mine') + '<span class="tip-arrow" aria-hidden="true">→</span>' + answerTile(q.correct, 'right');
      const questionImg = q.questionImg ? `<img src="${q.questionImg}" alt="" class="tip-q-img">` : '';
      return `
        <div class="detail-card ${isCorrect ? 'is-correct' : 'is-wrong'}">
          <div class="detail-text">
            <div class="dot-tip-title">第 ${q.id} 題　<b>${isCorrect ? '✓ 答對' : '✕ 答錯'}</b></div>
            <div class="dot-tip-q">${questionImg}<span>${q.question}</span></div>
            <p class="dot-tip-explain">${q.explanation}</p>
          </div>
          <div class="tip-tiles">${tiles}</div>
        </div>`;
    });

    // 7 個圈圈：答對實心、答錯空心
    resultDots.innerHTML = QUESTIONS.map((q, idx) => {
      const isCorrect = state.answers[idx] === q.correct;
      return `
        <button type="button" class="result-dot ${isCorrect ? 'is-correct' : 'is-wrong'}"
          data-index="${idx}" aria-label="第 ${q.id} 題，${isCorrect ? '答對' : '答錯'}" aria-controls="result-detail">
          <span class="dot-num">${q.id}</span>
        </button>
      `;
    }).join('');

    // 預設先顯示第一題答錯的；全對就顯示第 1 題
    const firstWrong = QUESTIONS.findIndex((q, idx) => state.answers[idx] !== q.correct);
    showDetail(firstWrong === -1 ? 0 : firstWrong);

    showStage('result');
  }

  function resetQuiz() {
    if (state.loadingTimer) {
      clearInterval(state.loadingTimer);
      state.loadingTimer = null;
    }
    state.currentIndex = 0;
    state.answers = new Array(QUESTIONS.length).fill(null);
    showStage('intro');
  }

  // =========================================
  // 7. 互動事件綁定
  // =========================================
  btnStartQuiz.addEventListener('click', () => {
    state.currentIndex = 0;
    renderQuestion(0);
    showStage('question');
  });

  optionsRow.addEventListener('click', (e) => {
    const card = e.target.closest('.option-card');
    if (!card) return;
    // 每題只能作答一次，選了就鎖住
    if (state.answers[state.currentIndex]) return;
    const chosenKey = card.dataset.optionKey;
    state.answers[state.currentIndex] = chosenKey;
    clearHint();

    optionsRow.classList.remove('needs-answer');
    showAnswerResult(state.currentIndex, true);
    updateNextLock();
  });

  btnPrev.addEventListener('click', () => {
    if (state.currentIndex === 0) {
      showStage('intro');
    } else {
      state.currentIndex -= 1;
      renderQuestion(state.currentIndex);
    }
  });

  btnNext.addEventListener('click', () => {
    if (!state.answers[state.currentIndex]) {
      showHint('先選一個答案');
      nudgeOptions();
      return;
    }

    if (state.currentIndex < QUESTIONS.length - 1) {
      state.currentIndex += 1;
      renderQuestion(state.currentIndex);
    } else {
      startLoadingAndFinish();
    }
  });

  btnPlayAgain.addEventListener('click', resetQuiz);

  // 滑過、鍵盤移到、或點一下圈圈（手機），下方解析卡片就換成那一題
  function showDetail(idx) {
    if (!detailCards[idx]) return;
    resultDetail.innerHTML = detailCards[idx];
    resultDots.querySelectorAll('.result-dot').forEach((d) => {
      const active = Number(d.dataset.index) === idx;
      d.classList.toggle('is-active', active);
      d.setAttribute('aria-pressed', String(active));
    });
  }

  ['mouseover', 'focusin', 'click'].forEach((type) => {
    resultDots.addEventListener(type, (e) => {
      const dot = e.target.closest('.result-dot');
      if (dot && !dot.classList.contains('is-active')) showDetail(Number(dot.dataset.index));
    });
  });

  // 側邊選單開關
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

  // 支援網址參數直接預覽特定階段（例如 ?stage=loading 或 ?q=4）
  const params = new URLSearchParams(window.location.search);
  const stageParam = params.get('stage');
  const qParam = Number(params.get('q'));
  if (stageParam === 'loading') {
    startLoadingAndFinish();
  } else if (Number.isInteger(qParam) && qParam >= 1 && qParam <= QUESTIONS.length) {
    state.currentIndex = qParam - 1;
    renderQuestion(state.currentIndex);
    showStage('question');
  } else {
    showStage('intro');
  }
});
