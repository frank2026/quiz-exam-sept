const CATEGORY_CLASS = {
  "Present Perfect": "pp",
  "Future Forms": "ff",
  "Vocabulary": "voc",
  "Workplace Roles": "role",
  "Advice & Listening": "adv"
};

let allQuestions = [];
let roundQuestions = [];
let currentIndex = 0;
let score = 0;
let answered = false;
let reviewLog = [];

const startScreen = document.getElementById("startScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const nextBtn = document.getElementById("nextBtn");
const hintBtn = document.getElementById("hintBtn");
const bankNote = document.getElementById("bankNote");

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleOptionsWithCorrectTracking(q) {
  const optionObjs = q.options.map((text, idx) => ({ text, isCorrect: idx === q.correct }));
  const shuffled = shuffle(optionObjs);
  return shuffled;
}

async function loadQuestions() {
  try {
    const res = await fetch("questions.json");
    if (!res.ok) throw new Error("fetch failed");
    allQuestions = await res.json();
    bankNote.textContent = allQuestions.length + "-question bank";
  } catch (e) {
    bankNote.textContent = "Could not load questions.json — serve this folder over http(s), not file://";
    startBtn.disabled = true;
    startBtn.textContent = "Questions not loaded";
  }
}

function startRound() {
  score = 0;
  currentIndex = 0;
  reviewLog = [];
  roundQuestions = shuffle(allQuestions).slice(0, 20).map(q => ({
    ...q,
    shuffledOptions: shuffleOptionsWithCorrectTracking(q)
  }));
  startScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");
  renderQuestion();
}

function renderQuestion() {
  answered = false;
  const q = roundQuestions[currentIndex];
  const total = roundQuestions.length;

  document.getElementById("progressLabel").textContent =
    "Question " + (currentIndex + 1) + " of " + total;
  document.getElementById("progressFill").style.width =
    Math.round(((currentIndex + 1) / total) * 100) + "%";

  const card = document.getElementById("questionCard");
  card.className = "q-card " + (CATEGORY_CLASS[q.category] || "");

  const catTag = document.getElementById("catTag");
  catTag.textContent = q.category;
  catTag.className = "tag tag-" + (CATEGORY_CLASS[q.category] || "");

  document.getElementById("promptText").textContent = q.prompt;

  const optionsList = document.getElementById("optionsList");
  optionsList.innerHTML = "";
  q.shuffledOptions.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt.text;
    btn.addEventListener("click", () => handleAnswer(btn, opt, q));
    optionsList.appendChild(btn);
  });

  const feedback = document.getElementById("feedbackText");
  feedback.classList.add("hidden");
  feedback.textContent = "";
  feedback.className = "feedback hidden";

  const hintText = document.getElementById("hintText");
  hintText.classList.add("hidden");
  hintBtn.classList.remove("hidden");
  hintBtn.textContent = "Show a hint";

  nextBtn.classList.add("hidden");
}

function handleAnswer(clickedBtn, opt, q) {
  if (answered) return;
  answered = true;

  const buttons = document.querySelectorAll(".option-btn");
  buttons.forEach(b => b.disabled = true);

  const correctBtn = Array.from(buttons).find(b =>
    q.shuffledOptions.find(o => o.text === b.textContent && o.isCorrect)
  );
  if (opt.isCorrect) {
    clickedBtn.classList.add("correct");
    score++;
  } else {
    clickedBtn.classList.add("incorrect");
    if (correctBtn) correctBtn.classList.add("correct");
  }

  const feedback = document.getElementById("feedbackText");
  feedback.classList.remove("hidden");
  feedback.classList.add(opt.isCorrect ? "good" : "bad");
  feedback.textContent = (opt.isCorrect ? "Correct. " : "Not quite. ") + q.explanation;

  reviewLog.push({
    prompt: q.prompt,
    correctText: q.options[q.correct],
    wasCorrect: opt.isCorrect,
    explanation: q.explanation
  });

  hintBtn.classList.add("hidden");
  nextBtn.classList.remove("hidden");
  nextBtn.textContent = currentIndex === roundQuestions.length - 1 ? "See results" : "Next question";
}

const CATEGORY_HINTS = {
  "Present Perfect": "Ask yourself: is this about the RESULT/how many times (Simple), or the DURATION/ongoing activity (Continuous)?",
  "Future Forms": "Ask: fixed schedule? confirmed arrangement? personal intention/evidence? or a spontaneous decision/opinion?",
  "Vocabulary": "Try to picture the situation on a call where this phrase would actually be used.",
  "Workplace Roles": "Think about the fixed preposition that always goes with this expression.",
  "Advice & Listening": "Think about the function of the phrase — is it giving advice, checking understanding, or expressing a preference?"
};

hintBtn.addEventListener("click", () => {
  const q = roundQuestions[currentIndex];
  const hintText = document.getElementById("hintText");
  hintText.textContent = "Hint: " + (q.hint || CATEGORY_HINTS[q.category] || "Think it through before choosing.");
  hintText.classList.remove("hidden");
});

nextBtn.addEventListener("click", () => {
  currentIndex++;
  if (currentIndex >= roundQuestions.length) {
    showResults();
  } else {
    renderQuestion();
  }
});

function showResults() {
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  const total = roundQuestions.length;
  document.getElementById("scoreHeadline").textContent = score + " / " + total;

  let msg;
  const pct = score / total;
  if (pct === 1) msg = "Perfect round. You're ready.";
  else if (pct >= 0.8) msg = "Strong round — just review the ones you missed below.";
  else if (pct >= 0.6) msg = "Good progress — a few gaps worth a second look.";
  else msg = "This is exactly why we're practicing tonight. Review the explanations below and try another round.";
  document.getElementById("scoreSub").textContent = msg;

  const reviewList = document.getElementById("reviewList");
  reviewList.innerHTML = "";
  reviewLog.forEach(item => {
    const div = document.createElement("div");
    div.className = "review-item " + (item.wasCorrect ? "right" : "wrong");
    div.innerHTML =
      '<div class="rev-prompt">' + escapeHtml(item.prompt) + '</div>' +
      '<div class="rev-explain">Correct answer: <strong>' + escapeHtml(item.correctText) +
      '</strong> — ' + escapeHtml(item.explanation) + '</div>';
    reviewList.appendChild(div);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

startBtn.addEventListener("click", startRound);
restartBtn.addEventListener("click", () => {
  resultScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
});

loadQuestions();
