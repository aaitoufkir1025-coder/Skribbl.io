

const images = [
  "image1.png",
  "image2.png",
  "image3.png"
];

const answers = [
  "cake",
  "gift",
  "party"
];

const hints = [
  "I wonder why Ali would draw this ?",
  "Is he trying to hint at something?",
  "But what could this mean?"
];

// =======================
// DOM REFERENCES
// =======================

const containerEl = document.getElementById("drawing-container");
const imgEl = document.getElementById("drawing-img");
const inputEl = document.getElementById("answer-input");
const submitBtn = document.getElementById("submit-btn");
const hintEl = document.getElementById("hint");
const msgEl = document.getElementById("message");

const finalScreen = document.getElementById("final-screen");
const finalAnswersEl = document.getElementById("final-answers");

let idx = 0;
let busy = false;
const submittedAnswers = [];

// =======================
// INIT
// =======================

function init() {
  loadIndex(idx);

  submitBtn.addEventListener("click", onSubmit);

  inputEl.addEventListener("keydown", e => {
    if (e.key === "Enter") onSubmit();
  });
}

// =======================
// LOAD IMAGE
// =======================

function loadIndex(i) {
  msgEl.textContent = "";
  inputEl.value = "";
  inputEl.focus();

  containerEl.classList.remove("show");

  hintEl.textContent = hints[i];

  setTimeout(() => {
    imgEl.src = images[i];
    imgEl.alt = `drawing ${i + 1}`;
    containerEl.classList.add("show");
  }, 150);
}

// =======================
// SUBMIT ANSWER
// =======================

function onSubmit() {
  if (busy) return;

  const value = inputEl.value.trim().toLowerCase();

  if (!value) {
    msgEl.textContent = "Please enter an answer";
    return;
  }

  const expected = answers[idx].toLowerCase();

  if (value.includes(expected)) {
    submittedAnswers.push(answers[idx]);
    goNext();
  } else {
    msgEl.textContent = "Try again";
  }
}

// =======================
// NEXT DRAWING
// =======================

function goNext() {
  busy = true;

  containerEl.classList.remove("show");

  setTimeout(() => {
    idx++;

    if (idx >= images.length) {
      showFinal();
    } else {
      loadIndex(idx);
      busy = false;
    }
  }, 400);
}

// =======================
// FINAL SCREEN
// =======================

function showFinal() {

  document
    .querySelectorAll("#stage > :not(.final)")
    .forEach(el => el.style.display = "none");

  finalScreen.style.display = "block";
  finalScreen.setAttribute("aria-hidden", "false");

  finalAnswersEl.innerHTML =
    submittedAnswers.map(a =>
      `<span class="chip">${escapeHtml(a)}</span>`
    ).join(" ");
}

// =======================
// FINAL KEY
// =======================

document.addEventListener("click", e => {
  if (e.target.id === "final-submit") {

    const key =
      document.getElementById("finalKey")
      .value
      .trim()
      .toUpperCase();

    if (key.includes("BIRTHDAY")) {

      finalScreen.innerHTML = `
        <video controls poster="black.jpeg"
          style="width:100%;max-width:500px;border-radius:8px;">
          <source src="vid2.mp4" type="video/mp4">
        </video>
      `;

    } else {
      alert("Hmm... not quite.");
    }
  }
});

// =======================
// SAFE HTML
// =======================

function escapeHtml(str) {
  return str.replace(/[&<>"]/g, tag => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  }[tag]));
}

// =======================
init();