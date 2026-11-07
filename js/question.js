export class Question {
    constructor(quizInstance, questionData, questionIndex, totalQuestions) {
        this.quiz = quizInstance;
        this.category = questionData.category;
        this.difficulty = questionData.difficulty;
        this.question = this.decodeHTML(questionData.question);
        this.correctAnswer = this.decodeHTML(questionData.correct_answer);
        
    
        this.incorrectAnswers = questionData.incorrect_answers.map(ans => this.decodeHTML(ans));

        this.answers = [...this.incorrectAnswers, this.correctAnswer];
        this.answers.sort(() => Math.random() - 0.5);
        
        this.questionIndex = questionIndex;
        this.totalQuestions = totalQuestions;
        
        this.timer = 15;
        this.timerInterval = null;
        this.isAnswered = false;
    }


    decodeHTML(html) {
        let txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }

    render() {
        let container = document.getElementById('questionsContainer');
        let progressPercent = ((this.questionIndex + 1) / this.totalQuestions) * 100;
        
   
        let answersHTML = '';
        for (let i = 0; i < this.answers.length; i++) {
            answersHTML += `
                <button class="answer-btn" data-answer="${this.answers[i]}" data-index="${i + 1}">
                    <span class="answer-key">${i + 1}</span>
                    <span class="answer-text">${this.answers[i]}</span>
                </button>
            `;
        }

        container.innerHTML = `
            <div class="game-card question-card">
              <div class="xp-bar-container">
                <div class="xp-bar-header">
                  <span class="xp-label"><i class="fa-solid fa-bolt"></i> Progress</span>
                  <span class="xp-value">Question ${this.questionIndex + 1}/${this.totalQuestions}</span>
                </div>
                <div class="xp-bar">
                  <div class="xp-bar-fill" style="width: ${progressPercent}%"></div>
                </div>
              </div>

              <div class="stats-row">
                <div class="stat-badge category">
                  <i class="fa-solid fa-bookmark"></i>
                  <span>${this.category}</span>
                </div>
                <div class="stat-badge difficulty ${this.difficulty}">
                  <i class="fa-solid fa-face-smile"></i>
                  <span>${this.difficulty}</span>
                </div>
                <div class="stat-badge timer" id="timerBadge">
                  <i class="fa-solid fa-stopwatch"></i>
                  <span class="timer-value">${this.timer}</span>s
                </div>
                <div class="stat-badge counter">
                  <i class="fa-solid fa-gamepad"></i>
                  <span>${this.questionIndex + 1}/${this.totalQuestions}</span>
                </div>
              </div>

              <h2 class="question-text">${this.question}</h2>

              <div class="answers-grid">
                ${answersHTML}
              </div>

              <p class="keyboard-hint">
                <i class="fa-regular fa-keyboard"></i> Press 1-${this.answers.length} to select
              </p>

              <div class="score-panel">
                <div class="score-item">
                  <div class="score-item-label">Score</div>
                  <div class="score-item-value">${this.quiz.score}</div>
                </div>
              </div>
            </div>
        `;

        this.setupEventListeners();
        this.startTimer();
    }


    setupEventListeners() {
        let answerButtons = document.querySelectorAll('.answer-btn');
        
        answerButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.isAnswered) return;
                let selectedAnswer = e.currentTarget.getAttribute('data-answer');
                this.checkAnswer(selectedAnswer);
            });
        });

        this.keyHandler = (e) => {
            if (this.isAnswered) return;
            let keyNum = parseInt(e.key);
            if (keyNum >= 1 && keyNum <= this.answers.length) {
                let targetBtn = document.querySelector(`.answer-btn[data-index="${keyNum}"]`);
                if (targetBtn) {
                    let selectedAnswer = targetBtn.getAttribute('data-answer');
                    this.checkAnswer(selectedAnswer);
                }
            }
        };
        window.addEventListener('keydown', this.keyHandler);
    }

    removeKeyboardListener() {
        if (this.keyHandler) {
            window.removeEventListener('keydown', this.keyHandler);
        }
    }


    startTimer() {
        let timerValueEl = document.querySelector('.timer-value');
        let timerBadge = document.getElementById('timerBadge');

        this.timerInterval = setInterval(() => {
            this.timer--;
            if (timerValueEl) {
                timerValueEl.textContent = this.timer;
            }

            if (this.timer <= 5 && timerBadge) {
                timerBadge.classList.add('warning');
            }

            if (this.timer <= 0) {
                clearInterval(this.timerInterval);
                if (!this.isAnswered) {
                    this.checkAnswer(null); 
                }
            }
        }, 1000);
    }


    checkAnswer(selectedAnswer) {
        if (this.isAnswered) return;
        this.isAnswered = true;
        clearInterval(this.timerInterval);
        this.removeKeyboardListener();

        let answerButtons = document.querySelectorAll('.answer-btn');
        let isCorrect = false;

        answerButtons.forEach(btn => {
            let btnAnswer = btn.getAttribute('data-answer');
            btn.classList.add('disabled');

            if (btnAnswer === this.correctAnswer) {
                btn.classList.remove('disabled');
                btn.classList.add('correct-reveal');
            }

            if (btnAnswer === selectedAnswer) {
                if (selectedAnswer === this.correctAnswer) {
                    btn.classList.add('correct');
                    isCorrect = true;
                } else {
                    btn.classList.add('wrong');
                }
            }
        });

        if (isCorrect) {
            this.quiz.score++;
        }

      
        setTimeout(() => {
            this.quiz.currentQuestionIndex++;
            if (this.quiz.currentQuestionIndex < this.quiz.questions.length) {
                let nextQ = new Question(
                    this.quiz,
                    this.quiz.questions[this.quiz.currentQuestionIndex],
                    this.quiz.currentQuestionIndex,
                    this.totalQuestions
                );
                nextQ.render();
            } else {
                this.renderResults();
            }
        }, 1500);
    }


    renderResults() {
        let container = document.getElementById('questionsContainer');
        let percentage = Math.round((this.quiz.score / this.totalQuestions) * 100);
        
        container.innerHTML = `
            <div class="game-card results-card">
              <h2 class="results-title">Quiz Complete!</h2>
              <p class="results-score-display">${this.quiz.score}/${this.totalQuestions}</p>
              <p class="results-percentage">${percentage}% Accuracy</p>
              
              ${percentage >= 80 ? `
                <div class="new-record-badge">
                  <i class="fa-solid fa-star"></i> Outstanding Performance!
                </div>
              ` : ''}

              <div class="action-buttons mt-4">
                <button class="btn-play" id="playAgainBtn">
                  <i class="fa-solid fa-rotate-right"></i> Play Again
                </button>
              </div>
            </div>
        `;

        document.getElementById('playAgainBtn').addEventListener('click', function() {
            let quizOptionsForm = document.getElementById('quizOptions');
            container.innerHTML = '';
            quizOptionsForm.reset();
            quizOptionsForm.classList.remove('hidden');
        });
    }
}