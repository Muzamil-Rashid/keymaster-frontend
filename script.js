// ================================
// CONFIGURATION
// ================================
const API_URL = "https://keymaster-8z9h.onrender.com/paragraph"; 

// ================================
// DOM ELEMENTS
// ================================
const paragraphEl = document.getElementById("paragraph");
const inputEl = document.getElementById("input");
const restartBtn = document.getElementById("restart");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const timeEl = document.getElementById("time");
const loadingMsg = document.getElementById("loading-msg");
const modal = document.getElementById("result-modal");
const finalWpm = document.getElementById("final-wpm");
const finalAccuracy = document.getElementById("final-accuracy");

// Timer Buttons
const timeBtns = document.querySelectorAll(".time-btn");

let timerValue = 60; // Default 1 minute
let timeLeft = timerValue;
let timerInterval = null;
let testStarted = false;

// ================================
// TIMER SELECTION LOGIC
// ================================
timeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        if (!testStarted) {
            timeBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            timerValue = parseInt(btn.dataset.time);
            timeLeft = timerValue;
            timeEl.innerText = timeLeft;
        }
    });
});

// ================================
// FETCH & LOAD PARAGRAPH
// ================================
async function loadParagraph() {
    loadingMsg.style.display = "block"; // Show loading message
    paragraphEl.innerHTML = "";
    
    try {
        const response = await fetch(`${API_URL}?t=${new Date().getTime()}`);
        if (!response.ok) throw new Error("Server Error");
        const data = await response.json();
        
        loadingMsg.style.display = "none"; // Hide message once loaded
        
        data.paragraph.split("").forEach(char => {
            const span = document.createElement("span");
            span.innerText = char;
            paragraphEl.appendChild(span);
        });
        
        inputEl.disabled = false;
        inputEl.focus();
    } catch (error) {
        loadingMsg.innerText = "Error connecting to server. Try again.";
    }
}

// ================================
// START TEST
// ================================
function startTest() {
    clearInterval(timerInterval);
    testStarted = false;
    timeLeft = timerValue;
    timeEl.innerText = timeLeft;
    wpmEl.innerText = 0;
    accuracyEl.innerText = 100;
    inputEl.value = "";
    inputEl.disabled = true;
    modal.style.display = "none";
    
    loadParagraph();
}

// ================================
// TIMER COUNTDOWN
// ================================
function startTimer() {
    testStarted = true;
    timerInterval = setInterval(() => {
        timeLeft--;
        timeEl.innerText = timeLeft;
        
        if (timeLeft <= 0) {
            endTest();
        }
    }, 1000);
}

// ================================
// INPUT HANDLING
// ================================
inputEl.addEventListener("input", () => {
    if (!testStarted && inputEl.value.length > 0) {
        startTimer();
    }

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

    // Calculate Stats
    const timeSpent = timerValue - timeLeft;
    if (timeSpent > 0) {
        const wordsTyped = input.trim().length / 5;
        const wpm = Math.round(wordsTyped / (timeSpent / 60));
        wpmEl.innerText = wpm;
        
        const accuracy = input.length > 0 
            ? Math.max(0, Math.round(((input.length - errors) / input.length) * 100)) 
            : 100;
        accuracyEl.innerText = accuracy;
    }
});

// ================================
// END TEST & POPUP
// ================================
function endTest() {
    clearInterval(timerInterval);
    inputEl.disabled = true;
    
    // Show Modal with results
    finalWpm.innerText = wpmEl.innerText;
    finalAccuracy.innerText = accuracyEl.innerText;
    modal.style.display = "flex";
}

function closeModal() {
    modal.style.display = "none";
    startTest();
}

restartBtn.addEventListener("click", startTest);

// Initial Load
startTest();
