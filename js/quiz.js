export default class Quiz {
  
  constructor(category, difficulty, numberOfQuestions, playerName) {
    this.category = category;
    this.difficulty = difficulty;
    this.numberOfQuestions = Number(numberOfQuestions) || 10;
    this.playerName = playerName || 'Player';
    this.score = 0;
    this.questions = [];
    this.currentQuestionIndex = 0;
  }
  

  async getQuestions() {
    let url = this.buildApiUrl();
    let response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch questions from API.');
    }
    
    let data = await response.json();
    
    if (data.response_code !== 0) {
      throw new Error('No questions available for this selection. Try different options.');
    }
    
    this.questions = data.results;
    return this.questions;
  }
  

  buildApiUrl() {
    let baseUrl = 'https://opentdb.com/api.php';
    let url = baseUrl + '?amount=' + this.numberOfQuestions;
    
    if (this.category !== '') {
      url += '&category=' + this.category;
    }
    
    if (this.difficulty !== '') {
      url += '&difficulty=' + this.difficulty;
    }
    
    return url;
  }
  
  incrementScore() {
    this.score++;
  }
  
  getCurrentQuestion() {
    if (this.currentQuestionIndex >= 0 && this.currentQuestionIndex < this.questions.length) {
      return this.questions[this.currentQuestionIndex];
    }
    return null;
  }
  
  nextQuestion() {
    this.currentQuestionIndex++;
    return !this.isComplete();
  }
  
  isComplete() {
    return this.currentQuestionIndex >= this.questions.length;
  }
  
  getScorePercentage() {
    if (this.numberOfQuestions === 0) return 0;
    return Math.round((this.score / this.numberOfQuestions) * 100);
  }
  
 
  saveHighScore() {
    let scores = this.getHighScores();
    let newScore = {
      name: this.playerName,
      score: this.score,
      total: this.numberOfQuestions,
      percentage: this.getScorePercentage(),
      difficulty: this.difficulty,
      date: new Date().toLocaleDateString()
    };
    
    scores.push(newScore);

    scores.sort(function(a, b) {
      return b.percentage - a.percentage;
    });
    

    let top10 = scores.slice(0, 10);
    localStorage.setItem('quizHighScores', JSON.stringify(top10));
  }
  
  getHighScores() {
    let stored = localStorage.getItem('quizHighScores');
    if (stored) {
      return JSON.parse(stored);
    } else {
      return [];
    }
  }
  
  isHighScore() {
    let scores = this.getHighScores();
    let currentPercentage = this.getScorePercentage();
    
    if (scores.length < 10) {
      return true;
    }
    
    let lowestScore = scores[scores.length - 1];
    return currentPercentage > lowestScore.percentage;
  }
  

  endQuiz() {
    let percentage = this.getScorePercentage();
    let isNewRecord = this.isHighScore();
    
    if (isNewRecord) {
      this.saveHighScore();
    }
    
    let highScores = this.getHighScores();
    let medals = ['gold', 'silver', 'bronze'];

    let leaderboardHTML = '';
    for (let i = 0; i < highScores.length; i++) {
      let item = highScores[i];
      let rankClass = medals[i] || '';
      leaderboardHTML += `
        <li class="leaderboard-item ${rankClass}">
          <span class="leaderboard-rank">#${i + 1}</span>
          <span class="leaderboard-name">${item.name}</span>
          <span class="leaderboard-score">${item.percentage}%</span>
        </li>
      `;
    }

    return `
      <div class="game-card results-card">
        <h2 class="results-title">Quiz Complete!</h2>
        <p class="results-score-display">${this.score}/${this.numberOfQuestions}</p>
        <p class="results-percentage">${percentage}% Accuracy</p>
        
        ${isNewRecord ? `
          <div class="new-record-badge">
            <i class="fa-solid fa-star"></i> New High Score!
          </div>
        ` : ''}
        
        <div class="leaderboard">
          <h4 class="leaderboard-title">
            <i class="fa-solid fa-trophy"></i> Leaderboard
          </h4>
          <ul class="leaderboard-list">
            ${leaderboardHTML !== '' ? leaderboardHTML : '<li class="leaderboard-item"><span class="leaderboard-name">No scores yet</span></li>'}
          </ul>
        </div>
        
        <div class="action-buttons">
          <button class="btn-restart" id="restartBtn">
            <i class="fa-solid fa-rotate-right"></i> Play Again
          </button>
        </div>
      </div>
    `;
  }
}