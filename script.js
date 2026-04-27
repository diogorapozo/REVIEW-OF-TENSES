const presentSimpleMarkers = ["ON MONDAYS", "USUALLY", "EVERY DAY", "SELDOM"];
const presentContMarkers = ["NOW", "AT THE MOMENT", "CURRENTLY", "THESE DAYS"];
const pastSimpleMarkers = ["YESTERDAY", "LAST SATURDAY", "FIRST", "TWO WEEKS AGO"];
const pastContMarkers = ["WHILE", "AT 8 PM YESTERDAY", "ALL DAY YESTERDAY", "THIS TIME LAST YEAR"];
const presentPerfMarkers = ["SINCE 2014", "FOR SIX MONTHS", "TWICE", "SO FAR"];
const pastPerfMarkers = ["AFTER", "BY THE TIME", "UNTIL THEN", "NEVER BEFORE"];

const expressions = [
    ...presentSimpleMarkers, 
    ...presentContMarkers, 
    ...pastSimpleMarkers, 
    ...pastContMarkers, 
    ...presentPerfMarkers, 
    ...pastPerfMarkers
];

const verbs = [
    "DO", "WRITE", "LOSE", "HELP", "WORK", "STUDY", "FIND", "TALK", 
    "HAVE", "SPEND", "ENJOY", "SPEAK", "READ", "DECIDE", "GO", 
    "GET", "TAKE", "COME", "SEE", "PHONE", "BUY", "LEARN", "WATCH", 
    "EAT", "MAKE"
];

let availableExpressions = [...expressions];
let availableVerbs = [...verbs];

const die1 = document.getElementById('die1');
const die2 = document.getElementById('die2');
const rollBtn = document.getElementById('roll-btn');
const speakBtn = document.getElementById('speak-btn');
const tipSection = document.getElementById('tip-section');
const tipBtn = document.getElementById('tip-btn');
const tipContent = document.getElementById('tip-content');
const checkBtns = document.querySelectorAll('.check-btn');
const editBtns = document.querySelectorAll('.edit-btn');
const sendBtn = document.getElementById('send-btn');
const resetBtn = document.getElementById('reset-btn');
const historyList = document.getElementById('history-list');
const studentNameInput = document.getElementById('student-name');
const sentenceInputs = document.querySelectorAll('.sentence-input');
const tenseSelects = document.querySelectorAll('.tense-select');

let rollHistoryArr = [];

document.getElementById('contrast-toggle').addEventListener('click', () => {
    document.body.classList.toggle('high-contrast');
});

speakBtn.addEventListener('click', () => {
    if ('speechSynthesis' in window) {
        const text = `${die1.innerText}. ${die2.innerText}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Text-to-Speech not supported in this browser.");
    }
});

sentenceInputs.forEach(textarea => {
    textarea.addEventListener('input', function() {
        this.style.height = '40px'; 
        let scrollHeight = this.scrollHeight;
        let lines = Math.ceil(scrollHeight / 40);
        this.style.height = (lines * 40) + 'px';
        
        const index = this.getAttribute('data-index');
        localStorage.setItem(`reviewTenses_sentence_${index}`, this.value);
    });
});

function loadStorage() {
    studentNameInput.value = localStorage.getItem('reviewTenses_studentName') || '';
    
    sentenceInputs.forEach((input, index) => {
        input.value = localStorage.getItem(`reviewTenses_sentence_${index}`) || '';
        if(input.value) {
            let lines = Math.ceil(input.scrollHeight / 40);
            input.style.height = (lines * 40) + 'px';
        }
    });

    tenseSelects.forEach((select, index) => {
        select.value = localStorage.getItem(`reviewTenses_tense_${index}`) || '';
    });
}

function updateHistoryUI() {
    historyList.innerHTML = '';
    if (rollHistoryArr.length === 0) {
        historyList.innerHTML = '<li class="empty-history">No rolls yet</li>';
        return;
    }
    
    rollHistoryArr.slice().reverse().forEach(roll => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${roll.expr}</strong> + <strong>${roll.verb}</strong>`;
        historyList.appendChild(li);
    });
}

studentNameInput.addEventListener('input', (e) => localStorage.setItem('reviewTenses_studentName', e.target.value));

tenseSelects.forEach((select, index) => {
    select.addEventListener('change', (e) => localStorage.setItem(`reviewTenses_tense_${index}`, e.target.value));
});

loadStorage();

function generateTip(expression, verb) {
    let tenseHint = "";
    let structure = "";

    if (pastPerfMarkers.includes(expression)) {
        tenseHint = "shows an action completed <em>before</em> another past action. Strongly triggers the <strong>Past Perfect</strong>.";
        structure = "<strong>Structure:</strong> Subject + HAD + V3 (Past Participle). <br><em>Example: She had left before...</em>";
    } else if (pastSimpleMarkers.includes(expression)) {
        tenseHint = "indicates a finished action in a specific time in the past, triggering the <strong>Past Simple</strong>.";
        structure = "<strong>Structure:</strong> Subject + Verb(ed/V2). <br><em>Example: I watched a movie yesterday.</em>";
    } else if (pastContMarkers.includes(expression)) {
        tenseHint = "indicates an ongoing or interrupted action in the past, triggering the <strong>Past Continuous</strong>.";
        structure = "<strong>Structure:</strong> Subject + WAS/WERE + Verb(ing). <br><em>Example: I was eating when...</em>";
    } else if (presentPerfMarkers.includes(expression)) {
        tenseHint = "connects the past to the present (experience or unfinished time), triggering the <strong>Present Perfect</strong>.";
        structure = "<strong>Structure:</strong> Subject + HAVE/HAS + V3 (Past Participle). <br><em>Example: I have lived here since 2014.</em>";
    } else if (presentSimpleMarkers.includes(expression)) {
        tenseHint = "points to a routine, fact, or habit, triggering the <strong>Present Simple</strong>.";
        structure = "<strong>Structure:</strong> Subject + Verb(s/es). <br><em>Example: He plays tennis on Mondays.</em>";
    } else if (presentContMarkers.includes(expression)) {
        tenseHint = "describes an action happening right now or temporarily, triggering the <strong>Present Continuous</strong>.";
        structure = "<strong>Structure:</strong> Subject + AM/IS/ARE + Verb(ing). <br><em>Example: She is studying now.</em>";
    }

    return `<strong>Usage Tip:</strong> The expression <em>"${expression}"</em> ${tenseHint} <br><br>${structure}<br><br><strong>Your Mission:</strong> Conjugate <em>"${verb}"</em> correctly based on this structure!`;
}

rollBtn.addEventListener('click', () => {
    if (availableExpressions.length === 0) availableExpressions = [...expressions];
    if (availableVerbs.length === 0) availableVerbs = [...verbs];

    die1.classList.add('rolling');
    die2.classList.add('rolling');
    tipSection.style.display = 'none';
    tipContent.style.display = 'none';
    rollBtn.disabled = true;
    speakBtn.style.display = 'none';

    let rolls = 0;
    const interval = setInterval(() => {
        die1.innerText = expressions[Math.floor(Math.random() * expressions.length)];
        die2.innerText = verbs[Math.floor(Math.random() * verbs.length)];
        rolls++;

        if (rolls > 15) {
            clearInterval(interval);
            die1.classList.remove('rolling');
            die2.classList.remove('rolling');
            
            const exprIndex = Math.floor(Math.random() * availableExpressions.length);
            const verbIndex = Math.floor(Math.random() * availableVerbs.length);
            
            const finalExpression = availableExpressions[exprIndex];
            const finalVerb = availableVerbs[verbIndex];
            
            availableExpressions.splice(exprIndex, 1);
            availableVerbs.splice(verbIndex, 1);
            
            die1.innerText = finalExpression;
            die2.innerText = finalVerb;
            
            rollHistoryArr.push({ expr: finalExpression, verb: finalVerb });
            if (rollHistoryArr.length > 7) rollHistoryArr.shift();
            updateHistoryUI();

            tipContent.innerHTML = generateTip(finalExpression, finalVerb);
            tipSection.style.display = 'block';
            speakBtn.style.display = 'inline-block';
            rollBtn.disabled = false;
        }
    }, 50);
});

tipBtn.addEventListener('click', () => {
    tipContent.style.display = tipContent.style.display === 'none' ? 'block' : 'none';
});

checkBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
        const lineDiv = e.target.closest('.notebook-line');
        const inputField = lineDiv.querySelector('.sentence-input');
        const selectField = lineDiv.querySelector('.tense-select');
        const feedbackField = lineDiv.querySelector('.feedback');
        const editBtn = lineDiv.querySelector('.edit-btn');
        
        const text = inputField.value.trim();
        const tense = selectField.value;

        if (!text) {
            feedbackField.textContent = "Write something first!";
            feedbackField.className = "feedback error";
            return;
        }
        
        if (!tense) {
            feedbackField.textContent = "Select a tense!";
            feedbackField.className = "feedback error";
            return;
        }

        feedbackField.textContent = "Checking...";
        feedbackField.className = "feedback";

        try {
            const response = await fetch('https://api.languagetoolplus.com/v2/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    text: text,
                    language: 'en-US'
                })
            });

            const data = await response.json();
            
            const criticalErrors = data.matches.filter(match => {
                const ruleId = match.rule.id;
                return !ruleId.includes('PUNCTUATION') && 
                       !ruleId.includes('UPPERCASE') && 
                       !ruleId.includes('COMMA');
            });

            if (criticalErrors.length > 0) {
                feedbackField.textContent = `❌ ${criticalErrors[0].message}`;
                feedbackField.className = "feedback error";
            } else {
                feedbackField.textContent = "✅ Grammar OK!";
                feedbackField.className = "feedback correct";
                
                // Visual feedback & Lock
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                inputField.disabled = true;
                selectField.disabled = true;
                if(!document.body.classList.contains('high-contrast')){
                    inputField.style.backgroundColor = 'rgba(39, 174, 96, 0.1)';
                }
                e.target.style.display = 'none'; // hide check button
                editBtn.style.display = 'inline-block'; // show edit button
            }
        } catch (err) {
            feedbackField.textContent = "⚠️ Check connection.";
            feedbackField.className = "feedback error";
        }
    });
});

editBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const lineDiv = e.target.closest('.notebook-line');
        const inputField = lineDiv.querySelector('.sentence-input');
        const selectField = lineDiv.querySelector('.tense-select');
        const checkBtn = lineDiv.querySelector('.check-btn');
        const feedbackField = lineDiv.querySelector('.feedback');

        inputField.disabled = false;
        selectField.disabled = false;
        inputField.style.backgroundColor = 'transparent';
        e.target.style.display = 'none'; // hide edit
        checkBtn.style.display = 'inline-block';
        feedbackField.textContent = '';
    });
});

sendBtn.addEventListener('click', () => {
    const studentName = studentNameInput.value.trim() || 'Anonymous Student';
    let hasContent = false;
    let bodyText = `Teacher, here are the sentences from ${studentName} for the Review of Tenses activity:%0D%0A%0D%0A`;
    
    sentenceInputs.forEach((input, index) => {
        if(input.value.trim() !== "") {
            hasContent = true;
            const tenseValue = tenseSelects[index].value || "No tense specified";
            bodyText += `${index + 1}. [${tenseValue}] - ${input.value}%0D%0A`;
        }
    });

    if(!hasContent) {
        alert("Please write at least one sentence before sending.");
        return;
    }

    const mailtoLink = `mailto:dirapozo@gmail.com?subject=Review of Tenses - ${studentName}&body=${bodyText}`;
    window.location.href = mailtoLink;
});

resetBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to start over? This will clear all your sentences.")) {
        localStorage.removeItem('reviewTenses_studentName');
        studentNameInput.value = '';
        
        sentenceInputs.forEach((input, index) => {
            localStorage.removeItem(`reviewTenses_sentence_${index}`);
            input.value = '';
            input.style.height = '40px';
            input.disabled = false;
            input.style.backgroundColor = 'transparent';
        });

        tenseSelects.forEach((select, index) => {
            localStorage.removeItem(`reviewTenses_tense_${index}`);
            select.value = '';
            select.disabled = false;
        });

        document.querySelectorAll('.feedback').forEach(feedback => {
            feedback.textContent = '';
            feedback.className = 'feedback';
        });
        
        document.querySelectorAll('.check-btn').forEach(btn => btn.style.display = 'inline-block');
        document.querySelectorAll('.edit-btn').forEach(btn => btn.style.display = 'none');

        rollHistoryArr = [];
        updateHistoryUI();
        
        availableExpressions = [...expressions];
        availableVerbs = [...verbs];

        die1.innerText = "TIME";
        die2.innerText = "VERB";
        tipSection.style.display = 'none';
        tipContent.style.display = 'none';
        speakBtn.style.display = 'none';
    }
});