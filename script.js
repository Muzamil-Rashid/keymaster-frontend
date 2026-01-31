// ================================
// CONFIGURATION (STEP 7 CHANGE)
// ================================
const API_URL = "https://keymaster-8z9h.onrender.com/paragraph"; 
// 🔼 CHANGE THIS ONLY when backend URL changes


// ================================
// FETCH PARAGRAPH FROM BACKEND
// ================================
async function fetchParagraph() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch paragraph");
        }

        const data = await response.json();
        return data.paragraph;

    } catch (error) {
        console.error("Error fetching paragraph:", error);
        return "Unable to load paragraph. Please try again.";
    }
}


// ================================
// DOM ELEMENTS
// ================================
const paragraphEl = document.getElementById("paragraph");
const inputEl = document.getElementById("input");
const restartBtn = document.getElementById("restart");

const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const errorsEl = document.getElementById("errors");
const timeEl = document.getElementById("time");

let startTime = null;
let timerInterval = null;


// ================================
// LOAD PARAGRAPH
// ================================
async function loadParagraph() {
    paragraphEl.innerHTML = "";
    const text = await fetchParagraph();

    text.split("").forEach(char => {
        const span = document.createElement("span");
        span.innerText = char;
        paragraphEl.appendChild(span);
    });
}


// ================================
// START TEST
// ================================
function startTest() {
    clearInterval(timerInterval);

    loadParagraph();
    inputEl.value = "";
    inputEl.disabled = false;
    inputEl.focus();

    startTime = performance.now();
    timerInterval = setInterval(updateTime, 1000);
}


// ================================
// UPDATE TIMER
// ================================
function updateTime() {
    if (!startTime) return;

    const elapsedSeconds = Math.floor(
        (performance.now() - startTime) / 1000
    );
    timeEl.innerText = elapsedSeconds;
}


// ================================
// INPUT HANDLING
// ================================
inputEl.addEventListener("input", () => {
    if (!startTime) return;

    const input = inputEl.value;
    const chars = paragraphEl.querySelectorAll("span");

    let errors = 0;

    chars.forEach((char, index) => {
        if (input[index] == null) {
            char.className = "";
        } else if (input[index] === char.innerText) {
            char.className = "correct";
        } else {
            char.className = "incorrect";
            errors++;
        }
    });

    // ================================
    // WPM CALCULATION (IMPROVED)
    // ================================
    const elapsedMinutes = (performance.now() - startTime) / 60000;
    const wordsTyped = input.trim().length > 0
        ? input.trim().split(/\s+/).length
        : 0;

    const wpm = elapsedMinutes > 0
        ? Math.round(wordsTyped / elapsedMinutes)
        : 0;

    wpmEl.innerText = wpm;

    // ================================
    // ERRORS & ACCURACY
    // ================================
    errorsEl.innerText = errors;

    const accuracy = input.length > 0
        ? Math.max(0, Math.round(((input.length - errors) / input.length) * 100))
        : 100;

    accuracyEl.innerText = accuracy;
});


// ================================
// RESTART TEST
// ================================
restartBtn.addEventListener("click", () => {
    clearInterval(timerInterval);

    timeEl.innerText = 0;
    wpmEl.innerText = 0;
    accuracyEl.innerText = 100;
    errorsEl.innerText = 0;

    startTime = null;
    startTest();
});


// ================================
// INITIAL LOAD
// ================================
inputEl.disabled = true;
loadParagraph();
