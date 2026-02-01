// ================================
// CONFIGURATION & STATE
// ================================
const API_URL = "https://keymaster-8z9h.onrender.com/paragraph"; 

let timerValue = 60; 
let timeLeft = timerValue;
let timerInterval = null;
let testStarted = false;

// DOM Elements
const paragraphEl = document.getElementById("paragraph");
const inputEl = document.getElementById("input");
const restartBtn = document.getElementById("restart");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const timeEl = document.getElementById("time");
const loadingMsg = document.getElementById("loading-msg");
const modal = document.getElementById("result-modal");

// Timer Buttons Setup
document.querySelectorAll(".time-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        if (!testStarted) {
            document.querySelectorAll(".time-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            timerValue = parseInt(btn.dataset.time);
            timeLeft = timerValue;
            timeEl.innerText = timeLeft;
        }
    });
});

// ================================
// CORE FUNCTIONS
// ================================
async function loadParagraph() {
    loadingMsg.style.display = "block";
    paragraphEl.innerHTML = "Fetching...";
    inputEl.disabled = true;

    try {
        const response = await fetch(`${API_URL}?t=${new Date().getTime()}`);
        const data = await response.json();
        
        paragraphEl.innerHTML = "";
        data.paragraph.split("").forEach(char => {
            const span = document.createElement("span");
            span.innerText = char;
            paragraphEl.appendChild(span);
        });

        loadingMsg.style.display = "none";
        inputEl.disabled = false;
        inputEl.focus();
    } catch (e) {
        loadingMsg.innerText = "Error: Check internet or server status.";
    }
}

function startTimer() {
    testStarted = true;
    timerInterval = setInterval(() => {
        timeLeft--;
        timeEl.innerText = timeLeft;
        if (timeLeft <= 0) endTest();
    }, 1000);
}

inputEl.addEventListener("input", () => {
    if (!testStarted && inputEl.value.length > 0) startTimer();

    const inputVal = inputEl.value;
    const charSpans = paragraphEl.querySelectorAll("span");
    let errors = 0;

    charSpans.forEach((span, index) => {
        const char = inputVal[index];
        if (char == null) {
            span.className = "";
        } else if (char === span.innerText) {
            span.className = "correct";
        } else {
            span.className = "incorrect";
            errors++;
        }
    });

    // Stats Calculation
    const timeSpent = timerValue - timeLeft;
    if (timeSpent > 0) {
        const wpm = Math.round((inputVal.length / 5) / (timeSpent / 60));
        wpmEl.innerText = wpm;
        const acc = inputVal.length > 0 ? Math.round(((inputVal.length - errors) / inputVal.length) * 100) : 100;
        accuracyEl.innerText = acc;
    }
});

function endTest() {
    clearInterval(timerInterval);
    inputEl.disabled = true;
    document.getElementById("final-wpm").innerText = wpmEl.innerText;
    document.getElementById("final-accuracy").innerText = accuracyEl.innerText;
    modal.style.display = "flex";
}

function closeModal() {
    modal.style.display = "none";
    startTest();
}

function startTest() {
    clearInterval(timerInterval);
    testStarted = false;
    timeLeft = timerValue;
    timeEl.innerText = timeLeft;
    wpmEl.innerText = "0";
    accuracyEl.innerText = "100";
    inputEl.value = "";
    modal.style.display = "none";
    loadParagraph();
}

restartBtn.addEventListener("click", startTest);
window.onload = startTest;
