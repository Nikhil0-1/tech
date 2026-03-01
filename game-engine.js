// EDUTUG INDIA - Core Game Engine

const MOCK_QUESTIONS = [
    { q: "If 3x + 5 = 20, what is the value of x?", opts: ["x = 3", "x = 5", "x = 15", "x = 10"], ans: 1 },
    { q: "What is the square root of 144?", opts: ["10", "12", "14", "16"], ans: 1 },
    { q: "Which planet is known as the Red Planet?", opts: ["Venus", "Mars", "Jupiter", "Saturn"], ans: 1 },
    { q: "What is 15% of 200?", opts: ["20", "30", "40", "50"], ans: 1 },
    { q: "Find the value of 5³", opts: ["15", "25", "125", "625"], ans: 2 },
    { q: "What is the capital of India?", opts: ["Mumbai", "New Delhi", "Kolkata", "Chennai"], ans: 1 },
    { q: "Solve: 8 + 2 × 5", opts: ["50", "18", "15", "20"], ans: 1 },
    { q: "Which is the largest mammal?", opts: ["Elephant", "Blue Whale", "Giraffe", "Shark"], ans: 1 },
    { q: "Who wrote the National Anthem of India?", opts: ["Premchand", "Rabindranath Tagore", "Bankim Chandra", "Sarojini Naidu"], ans: 1 },
    { q: "What is the boiling point of water?", opts: ["50°C", "90°C", "100°C", "120°C"], ans: 2 }
];

class GameEngine {
    constructor() {
        this.db = window.edutugDb;
        this.sessionId = new URLSearchParams(window.location.search).get('session') || 'demo_session';
        this.score1 = 0;
        this.score2 = 0;
        this.ropePosition = 0; // -50 to 50
        this.timer = 15;
        this.timerInterval = null;
        this.currentCorrectOptionIndex = 1;
        this.gameActive = true;
        this.questionActive = false;
        this.questionIndex = 0;

        this.elements = {
            score1: document.getElementById('score1'),
            score2: document.getElementById('score2'),
            rope: document.getElementById('rope'),
            timer: document.getElementById('timer'),
            questionText: document.getElementById('questionText'),
            winnerOverlay: document.getElementById('winnerOverlay'),
            winnerText: document.getElementById('winnerText'),
            t1Btns: [
                document.getElementById('t1opt1'),
                document.getElementById('t1opt2'),
                document.getElementById('t1opt3'),
                document.getElementById('t1opt4')
            ],
            t2Btns: [
                document.getElementById('t2opt1'),
                document.getElementById('t2opt2'),
                document.getElementById('t2opt3'),
                document.getElementById('t2opt4')
            ]
        };

        this.init();
    }

    init() {
        console.log("Game Engine Started for session:", this.sessionId);
        this.setupKeyboardControls();
        this.loadQuestion();
        this.listenToFirebase();
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameActive || !this.questionActive) return;
            const key = e.key.toLowerCase();
            // Team 1: q, w, e, r
            if (key === 'q') this.submitAnswer(1, 0);
            if (key === 'w') this.submitAnswer(1, 1);
            if (key === 'e') this.submitAnswer(1, 2);
            if (key === 'r') this.submitAnswer(1, 3);

            // Team 2: 7, 8, 9, 0
            if (key === '7') this.submitAnswer(2, 0);
            if (key === '8') this.submitAnswer(2, 1);
            if (key === '9') this.submitAnswer(2, 2);
            if (key === '0') this.submitAnswer(2, 3);
        });
    }

    loadQuestion() {
        if (!this.gameActive) return;
        if (this.questionIndex >= MOCK_QUESTIONS.length) {
            this.questionIndex = 0; // cycle back
        }

        const qData = MOCK_QUESTIONS[this.questionIndex];
        this.elements.questionText.innerText = qData.q;

        this.elements.t1Btns.forEach((btn, idx) => {
            btn.innerText = qData.opts[idx];
            btn.className = 'game-btn t1-btn';
        });

        this.elements.t2Btns.forEach((btn, idx) => {
            btn.innerText = qData.opts[idx];
            btn.className = 'game-btn t2-btn';
        });

        this.currentCorrectOptionIndex = qData.ans;
        this.questionActive = true;

        this.timer = 15;
        this.elements.timer.innerText = this.timer;
        clearInterval(this.timerInterval);
        this.startTimer();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.gameActive || !this.questionActive) return;

            this.timer--;
            this.elements.timer.innerText = this.timer;

            if (this.timer <= 0) {
                this.handleTimeout();
            }
        }, 1000);
    }

    handleTimeout() {
        clearInterval(this.timerInterval);
        this.questionActive = false;

        // Show correct answer to both teams
        this.elements.t1Btns[this.currentCorrectOptionIndex].classList.add('correct');
        this.elements.t2Btns[this.currentCorrectOptionIndex].classList.add('correct');

        setTimeout(() => {
            if (this.gameActive) {
                this.questionIndex++;
                this.loadQuestion();
            }
        }, 1500);
    }

    submitAnswer(teamId, optionIndex) {
        if (!this.gameActive || !this.questionActive) return;
        this.questionActive = false;
        clearInterval(this.timerInterval);

        const isCorrect = (optionIndex === this.currentCorrectOptionIndex);

        // Highlight logic
        const t1Btn = this.elements.t1Btns[optionIndex];
        const t2Btn = this.elements.t2Btns[optionIndex];

        if (teamId === 1) {
            t1Btn.classList.add(isCorrect ? 'correct' : 'wrong');
        } else {
            t2Btn.classList.add(isCorrect ? 'correct' : 'wrong');
        }

        // Always show the correct option for both
        this.elements.t1Btns[this.currentCorrectOptionIndex].classList.add('correct');
        this.elements.t2Btns[this.currentCorrectOptionIndex].classList.add('correct');

        // Update Scores and Rope locally
        if (isCorrect) {
            if (teamId === 1) {
                this.score1 += 10;
                this.ropePosition -= 15; // Move left
            } else {
                this.score2 += 10;
                this.ropePosition += 15; // Move right
            }
        } else {
            // Penalty: Opponent gains small push
            if (teamId === 1) {
                this.score1 = Math.max(0, this.score1 - 5);
                this.ropePosition += 5; // Move right
            } else {
                this.score2 = Math.max(0, this.score2 - 5);
                this.ropePosition -= 5; // Move left
            }
        }

        this.updateUI();
        this.syncToFirebase();
        this.checkWinCondition();

        if (this.gameActive) {
            setTimeout(() => {
                this.questionIndex++;
                this.loadQuestion();
            }, 1500);
        }
    }

    updateUI() {
        this.elements.score1.innerText = this.score1;
        this.elements.score2.innerText = this.score2;

        let limitedPos = Math.max(-45, Math.min(45, this.ropePosition));
        this.elements.rope.style.transform = `translate(calc(-50% + ${limitedPos}%), -50%)`;
    }

    checkWinCondition() {
        if (this.ropePosition <= -40) {
            this.endGame(1);
        } else if (this.ropePosition >= 40) {
            this.endGame(2);
        }
    }

    endGame(winningTeam) {
        this.gameActive = false;
        this.questionActive = false;
        clearInterval(this.timerInterval);
        this.elements.winnerOverlay.classList.add('active');

        if (winningTeam === 1) {
            this.elements.winnerText.innerText = "Team 1 Wins the Tug!";
        } else if (winningTeam === 2) {
            this.elements.winnerText.innerText = "Team 2 Wins the Tug!";
        } else {
            this.elements.winnerText.innerText = "It's a Draw!";
        }

        if (this.db) {
            this.db.ref(`sessions/${this.sessionId}`).update({
                winner: winningTeam,
                status: 'completed'
            });
        }
    }

    syncToFirebase() {
        if (!this.db) {
            return;
        }
        this.db.ref(`sessions/${this.sessionId}`).set({
            team1_score: this.score1,
            team2_score: this.score2,
            rope_position: this.ropePosition,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    }

    listenToFirebase() {
        if (!this.db) return;
        this.db.ref(`sessions/${this.sessionId}`).on('value', (snapshot) => {
            const data = snapshot.val();
        });
    }
}

let engine;
document.addEventListener('DOMContentLoaded', () => {
    engine = new GameEngine();
});

function submitAnswer(teamId, optionIndex) {
    if (engine) engine.submitAnswer(teamId, optionIndex);
}
