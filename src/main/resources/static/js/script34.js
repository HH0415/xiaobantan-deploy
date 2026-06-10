// =========================
// 拼圖圖片
// =========================

const PUZZLE_IMAGES = [
  {
    label: "長源圳古道 — 孟宗竹林",
    url: "https://images.unsplash.com/photo-1767840271961-2653c8f8f3ce?w=400&h=400&fit=crop&auto=format"
  },

  {
    label: "大崙山 — 秋日銀杏",
    url: "https://images.unsplash.com/photo-1763295738975-dc799bcf5035?w=400&h=400&fit=crop&auto=format"
  },

  {
    label: "小半天 — 山城茶園",
    url: "https://images.unsplash.com/photo-1765419102827-af65e01a46a3?w=400&h=400&fit=crop&auto=format"
  }
];

// =========================
// 問答題目
// =========================

const QUIZ_QUESTIONS = [
  {
    q: "小半天地區早期的主要農業產業為何？",
    options: ["水稻與玉米", "孟宗竹林與茶葉", "蘋果與梨子", "香蕉與鳳梨"],
    answer: 1,
    spot: "石馬公園"
  },

  {
    q: "長源圳古道大約全長多少公里？",
    options: ["0.5 公里", "1 公里", "2 公里", "5 公里"],
    answer: 2,
    spot: "長源圳古道"
  },

  {
    q: "大崙山最著名的秋季景觀樹種是？",
    options: ["楓樹", "銀杏", "落羽松", "杉木"],
    answer: 1,
    spot: "大崙山銀杏森林"
  },

  {
    q: "小半天在地茶園的採茶體驗通常在哪個季節最具特色？",
    options: ["春季清明", "夏季端午", "秋季中秋", "冬季霧季"],
    answer: 3,
    spot: "在地茶園"
  },

  {
    q: "本系統使用哪種演算法計算景點最佳遊覽路徑？",
    options: ["A* 演算法", "TSP 旅行推銷員問題", "Dijkstra 最短路徑", "BFS 廣度優先搜尋"],
    answer: 1,
    spot: "系統功能"
  }
];

// =========================
// 全域變數
// =========================

let imgIdx = 0;
let pieces = [];
let moves = 0;
let draggingSlotIdx = null;

let currentQuizIdx = 0;
let quizScore = 0;
let quizAnswered = false;

// =========================
// 頁面切換
// =========================

function switchSection(section) {

  const pSec = document.getElementById('puzzle-section');
  const qSec = document.getElementById('quiz-section');

  const pTab = document.getElementById('tab-puzzle');
  const qTab = document.getElementById('tab-quiz');

  if (section === 'puzzle') {

    pSec.classList.remove('hidden');
    qSec.classList.add('hidden');

    pTab.className =
      "py-4 text-sm border-b-2 border-primary text-primary flex items-center gap-2";

    qTab.className =
      "py-4 text-sm border-b-2 border-transparent text-muted-foreground hover:text-primary flex items-center gap-2";

  } else {

    pSec.classList.add('hidden');
    qSec.classList.remove('hidden');

    qTab.className =
      "py-4 text-sm border-b-2 border-primary text-primary flex items-center gap-2";

    pTab.className =
      "py-4 text-sm border-b-2 border-transparent text-muted-foreground hover:text-primary flex items-center gap-2";

    initQuiz();
  }
}

// =========================
// 初始化拼圖
// =========================

function initPuzzle() {

  const img = PUZZLE_IMAGES[imgIdx];

  document.getElementById('target-img').src = img.url;

  document.getElementById('target-label').innerText = img.label;

  // 圖片選擇器
  const selector = document.getElementById('image-selector');

  selector.innerHTML = '';

  PUZZLE_IMAGES.forEach((p, i) => {

    const btn = document.createElement('button');

    btn.innerText = p.label;

    btn.className =
      `px-4 py-2 rounded-full text-xs transition-all border ${
        imgIdx === i
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-white border-theme-border text-muted-foreground hover:border-primary hover:text-primary"
      }`;

    btn.onclick = () => {
      imgIdx = i;
      resetPuzzle();
    };

    selector.appendChild(btn);
  });

  // 初始化拼圖
  pieces = Array.from({ length: 16 }, (_, i) => i);

  // Shuffle
  for (let i = pieces.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }

  renderGrid();

  lucide.createIcons();
}

// =========================
// 渲染拼圖
// =========================

function renderGrid() {

  const grid = document.getElementById('puzzle-grid');

  grid.innerHTML = '';

  const img = PUZZLE_IMAGES[imgIdx];

  pieces.forEach((pieceIdx, slotIdx) => {

    const div = document.createElement('div');

    div.className =
      "border border-white/60 transition-opacity duration-150 hover:brightness-105 cursor-grab";

    div.style.width = '90px';
    div.style.height = '90px';

    div.style.backgroundImage = `url(${img.url})`;

    div.style.backgroundSize = `360px 360px`;

    const col = pieceIdx % 4;
    const row = Math.floor(pieceIdx / 4);

    div.style.backgroundPosition =
      `-${col * 90}px -${row * 90}px`;

    div.draggable = true;

    div.ondragstart = () => {
      draggingSlotIdx = slotIdx;
      div.style.opacity = '0.3';
    };

    div.ondragend = () => {
      div.style.opacity = '1';
    };

    div.ondragover = (e) => e.preventDefault();

    div.ondrop = () => handleDrop(slotIdx);

    grid.appendChild(div);
  });
}

// =========================
// 拼圖交換
// =========================

function handleDrop(toSlotIdx) {

  if (
    draggingSlotIdx === null ||
    draggingSlotIdx === toSlotIdx
  ) return;

  [pieces[draggingSlotIdx], pieces[toSlotIdx]] =
  [pieces[toSlotIdx], pieces[draggingSlotIdx]];

  moves++;

  document.getElementById('move-count').innerText = moves;

  renderGrid();

  const win = pieces.every((v, i) => v === i);

  if (win) {

    document.getElementById('final-moves').innerText =
      `共 ${moves} 步完成拼圖`;

    document.getElementById('solved-mask')
      .classList.remove('hidden');
  }

  draggingSlotIdx = null;
}

// =========================
// 重置拼圖
// =========================

function resetPuzzle() {

  moves = 0;

  document.getElementById('move-count').innerText = '0';

  document.getElementById('solved-mask')
    .classList.add('hidden');

  initPuzzle();
}

// =========================
// 初始化問答
// =========================

function initQuiz() {

  currentQuizIdx = 0;

  quizScore = 0;

  document.getElementById('quiz-result')
    .classList.add('hidden');

  document.getElementById('quiz-content')
    .classList.remove('hidden');

  showQuestion();
}

// =========================
// 顯示題目
// =========================

function showQuestion() {

  quizAnswered = false;

  document.getElementById('next-btn')
    .classList.add('hidden');

  const q = QUIZ_QUESTIONS[currentQuizIdx];

  document.getElementById('quiz-number').innerText =
    `${currentQuizIdx + 1}/${QUIZ_QUESTIONS.length}`;

  document.getElementById('quiz-spot').innerText =
    `關卡景點：${q.spot}`;

  document.getElementById('quiz-question').innerText =
    q.q;

  // 進度條
  const progressContainer =
    document.getElementById('progress-bars');

  progressContainer.innerHTML = '';

  QUIZ_QUESTIONS.forEach((_, i) => {

    const bar = document.createElement('div');

    bar.className =
      `h-1.5 flex-1 rounded-full transition-colors ${
        i < currentQuizIdx
          ? 'bg-accent'
          : i === currentQuizIdx
          ? 'bg-primary'
          : 'bg-gray-200'
      }`;

    progressContainer.appendChild(bar);
  });

  // 選項
  const optionsContainer =
    document.getElementById('quiz-options');

  optionsContainer.innerHTML = '';

  q.options.forEach((opt, i) => {

    const btn = document.createElement('button');

    btn.className =
      "flex items-center gap-4 p-4 rounded-theme-lg text-left text-sm transition-all bg-white border-2 border-theme-border text-foreground hover:border-primary hover:bg-secondary w-full shadow-sm";

    const letter =
      String.fromCharCode(65 + i);

    btn.innerHTML =
      `<span class="font-['DM_Mono'] text-xs opacity-50 w-4">${letter}</span>
       <span class="flex-1">${opt}</span>`;

    btn.onclick = () =>
      handleSelectAnswer(i, btn);

    optionsContainer.appendChild(btn);
  });
}

// =========================
// 作答
// =========================

function handleSelectAnswer(selectedIdx, clickedBtn) {

  if (quizAnswered) return;

  quizAnswered = true;

  const q = QUIZ_QUESTIONS[currentQuizIdx];

  const buttons =
    document.getElementById('quiz-options').children;

  if (selectedIdx === q.answer) {

    quizScore++;

    clickedBtn.className =
      "flex items-center gap-4 p-4 rounded-theme-lg text-left text-sm bg-secondary border-2 border-accent text-primary w-full shadow-sm font-medium";

  } else {

    clickedBtn.className =
      "flex items-center gap-4 p-4 rounded-theme-lg text-left text-sm bg-red-50 border-2 border-destructive text-destructive w-full shadow-sm";

    buttons[q.answer].className =
      "flex items-center gap-4 p-4 rounded-theme-lg text-left text-sm bg-secondary border-2 border-accent text-primary w-full shadow-sm font-medium";
  }

  for (let i = 0; i < buttons.length; i++) {

    if (i !== selectedIdx && i !== q.answer) {

      buttons[i].classList.add('opacity-40');
    }

    buttons[i].disabled = true;
  }

  document.getElementById('next-btn')
    .classList.remove('hidden');
}

// =========================
// 下一題
// =========================

function nextQuestion() {

  if (currentQuizIdx + 1 >= QUIZ_QUESTIONS.length) {

    showQuizResult();

  } else {

    currentQuizIdx++;

    showQuestion();
  }
}

// =========================
// 顯示結果
// =========================

function showQuizResult() {

  document.getElementById('quiz-content')
    .classList.add('hidden');

  const resultSec =
    document.getElementById('quiz-result');

  resultSec.classList.remove('hidden');

  const total = QUIZ_QUESTIONS.length;

  const pct = quizScore / total;

  document.getElementById('result-grade').innerText =
    pct === 1
      ? '小半天守護者'
      : pct >= 0.8
      ? '在地達人'
      : '探索新手';

  document.getElementById('result-score').innerText =
    `${quizScore} / ${total} 正確答題`;

  document.getElementById('result-progress')
    .style.width = `${pct * 100}%`;
}

// =========================
// 重置問答
// =========================

function resetQuiz() {
  initQuiz();
}

// =========================
// 初始化
// =========================

window.onload = initPuzzle;