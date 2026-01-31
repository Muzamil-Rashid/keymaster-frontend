// ================================
// CONFIGURATION
// ================================
const API_URL = "https://keymaster-8z9h.onrender.com/paragraph"; 

// ================================
// FETCH PARAGRAPH FROM BACKEND
// ================================
async function fetchParagraph() {
    try {
        // Cache busting ke liye timestamp add kiya hai taaki naya data hi aaye
        const response = await fetch(`${API_URL}?t=${new Date().getTime()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Server Response Error: ${response.status}`);
            throw new Error("Server se connection nahi ho pa raha");
        }

        const data = await response.json();
        
        // Backend se 'paragraph' key check karna
        if (data && data.paragraph) {
            return data.paragraph;
        } else {
            throw new Error("Invalid data format from server");
        }

    } catch (error) {
        console.error("Fetch error details:", error);
        return "Error: Backend se data nahi mila. Please check if Render is active.";
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
// LOAD PARAGRAPH (Split into Spans)
// ================================
async function loadParagraph() {
    paragraphEl.innerHTML = "Loading paragraph..."; // Loading text
    const text = await fetchParagraph();
    
    paragraphEl.innerHTML = ""; // Clear loading text
    
    // String ko characters mein tod kar spans banana
    text.split("").forEach(char => {
        const span = document.createElement("span");
        span.innerText = char;
        paragraphEl.appendChild(span);
    });
    
    // UI reset after load
    inputEl.value = "";
    inputEl.disabled = false;
    inputEl.focus();
}

// ================================
// START & RESTART TEST
// ================================
function startTest() {
    clearInterval(timerInterval);
    startTime = null;
    timeEl.innerText = 0;
    wpmEl.innerText = 0;
    accuracyEl.innerText = 100;
    errorsEl.innerText = 0;
    
    loadParagraph();
}

// ================================
// UPDATE TIMER
// ================================
function updateTime() {
    if (!startTime) return;
    const elapsedSeconds = Math.floor((performance.now() - startTime) / 1000);
    timeEl.innerText = elapsedSeconds;
}

// ================================
// INPUT HANDLING
// ================================
inputEl.addEventListener("input", () => {
    // Pehla character type hote hi timer start
    if (!startTime && inputEl.value.length > 0) {
        startTime = performance.now();
        timerInterval = setInterval(updateTime, 1000);
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

    // WPM & Accuracy Calculations
    if (startTime) {
        const elapsedMinutes = (performance.now() - startTime) / 60000;
        const wordsTyped = input.trim().length / 5; // Standard WPM calculation
        const wpm = elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0;
        wpmEl.innerText = wpm;

        errorsEl.innerText = errors;
        const accuracy = input.length > 0 
            ? Math.max(0, Math.round(((input.length - errors) / input.length) * 100)) 
            : 100;
        accuracyEl.innerText = accuracy;
    }
});

restartBtn.addEventListener("click", startTest);

// Initial State
inputEl.disabled = true;
loadParagraph();
