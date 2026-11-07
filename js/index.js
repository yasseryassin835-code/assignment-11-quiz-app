import Quiz from './quiz.js';
import { Question } from './question.js';


const quizOptionsForm = document.getElementById('quizOptions');
const playerNameInput = document.getElementById('playerName');
const categoryInput = document.getElementById('categoryMenu');
const difficultyOptions = document.getElementById('difficultyOptions');
const questionsNumber = document.getElementById('questionsNumber');
const startQuizBtn = document.getElementById('startQuiz');
const questionsContainer = document.getElementById('questionsContainer');

let currentQuiz = null;


function showLoading() {
    questionsContainer.innerHTML = `
        <div class="loading-overlay" style="display: flex;">
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading Questions...</p>
        </div>
    `;
}


function hideLoading() {
    const loadingOverlay = questionsContainer.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}


function showError(message) {
    questionsContainer.innerHTML = `
        <div class="game-card error-card">
            <div class="error-icon">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 class="error-title">Oops! Something went wrong</h3>
            <p class="error-message">${message}</p>
            <button class="btn-play retry-btn" id="retryBtn">
                <i class="fa-solid fa-rotate-right"></i> Try Again
            </button>
        </div>
    `;
    
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
        retryBtn.addEventListener('click', function() {
            resetToStart();
        });
    }
}


function validateForm() {
    const value = questionsNumber.value.trim();
    
    if (value === '') {
        return { isValid: false, error: 'Please enter the number of questions.' };
    }
    
    const num = Number(value);
    
    if (num < 1) {
        return { isValid: false, error: 'Number of questions must be at least 1.' };
    }
    
    if (num > 50) {
        return { isValid: false, error: 'Number of questions cannot exceed 50.' };
    }
    
    return { isValid: true, error: null };
}


function showFormError(message) {
    const existingError = quizOptionsForm.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
    errorDiv.style.transition = 'opacity 0.4s ease';

    quizOptionsForm.insertBefore(errorDiv, startQuizBtn);

    setTimeout(function() {
        errorDiv.style.opacity = '0';
        setTimeout(function() {
            errorDiv.remove();
        }, 400);
    }, 3000);
}


function resetToStart() {
    questionsContainer.innerHTML = '';
    quizOptionsForm.reset();
    quizOptionsForm.classList.remove('hidden');
    currentQuiz = null;
}

async function startQuiz() {
    const validation = validateForm();
    
    if (!validation.isValid) {
        showFormError(validation.error);
        return;
    }

    const playerName = playerNameInput.value.trim() || 'Player';
    const category = categoryInput.value;
    const difficulty = difficultyOptions.value;
    const numberOfQuestions = questionsNumber.value;


    currentQuiz = new Quiz(category, difficulty, numberOfQuestions, playerName);

    quizOptionsForm.classList.add('hidden');
    showLoading();

    try {
        await currentQuiz.getQuestions();
        hideLoading();

        if (currentQuiz.questions && currentQuiz.questions.length > 0) {
            const firstQuestion = new Question(currentQuiz, currentQuiz.questions[0], 0, currentQuiz.questions.length);
            firstQuestion.render();
        } else {
            showError('No questions found for this selection.');
        }
    } catch (err) {
        hideLoading();
        showError(err.message || 'Failed to load questions.');
    }
}


startQuizBtn.addEventListener('click', function(e) {
    e.preventDefault();
    startQuiz();
});

questionsNumber.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        startQuiz();
    }
});