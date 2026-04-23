document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements --- //
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('game-container');
    const backToMenuBtn = document.getElementById('back-to-menu');
    const gameLinks = document.querySelectorAll('.game-link');
    const gameViews = document.querySelectorAll('.game-view');

    let activeGame = null;

    // --- Navigation --- //

    function stopAllGames() {
        if (activeGame && gameCleaners[activeGame]) {
            gameCleaners[activeGame]();
        }
    }

    function showGame(gameId) {
        stopAllGames(); // Clean up previous game
        mainMenu.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        gameViews.forEach(view => view.classList.add('hidden'));
        const gameView = document.getElementById(`${gameId}-game`);
        if (gameView) {
            gameView.classList.remove('hidden');
        }

        activeGame = gameId;
        if (gameInitializers[gameId]) {
            gameInitializers[gameId]();
        }
    }

    function showMainMenu() {
        stopAllGames(); // Clean up current game
        mainMenu.classList.remove('hidden');
        gameContainer.classList.add('hidden');
        activeGame = null;
    }

    gameLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showGame(e.target.dataset.game);
        });
    });

    backToMenuBtn.addEventListener('click', showMainMenu);

    // --- Game Logic & State Management --- //

    let consecutiveCorrect = 0;

    // --- Multiplication Game --- //
    const multiplication = {
        problemEl: document.getElementById('multiplication-problem'),
        answerEl: document.getElementById('multiplication-answer'),
        submitBtn: document.getElementById('multiplication-submit'),
        feedbackEl: document.getElementById('multiplication-feedback'),
        num1: 0, num2: 0,
        init() {
            consecutiveCorrect = 0;
            this.generateProblem();
        },
        generateProblem() {
            this.num1 = Math.floor(Math.random() * 6) + 4;
            this.num2 = Math.floor(Math.random() * 9) + 1;
            this.problemEl.textContent = `${this.num1} x ${this.num2} = ?`;
            this.feedbackEl.textContent = '';
        },
        checkAnswer() {
            if (parseInt(this.answerEl.value) === this.num1 * this.num2) {
                consecutiveCorrect++;
                this.feedbackEl.textContent = `Correct! (${consecutiveCorrect}/3)`;
                if (consecutiveCorrect >= 3) {
                    this.feedbackEl.textContent = 'Pass!';
                    consecutiveCorrect = 0;
                }
                setTimeout(() => this.generateProblem(), 500);
            } else {
                consecutiveCorrect = 0;
                this.feedbackEl.textContent = 'Wrong! Try again.';
            }
            this.answerEl.value = '';
        }
    };
    multiplication.submitBtn.addEventListener('click', () => multiplication.checkAnswer());
    multiplication.answerEl.addEventListener('keyup', e => e.key === 'Enter' && multiplication.checkAnswer());

    // --- English Word Game --- //
    const english = {
        problemEl: document.getElementById('english-problem'),
        answerEl: document.getElementById('english-answer'),
        submitBtn: document.getElementById('english-submit'),
        feedbackEl: document.getElementById('english-feedback'),
        words: { '사과': 'apple', '책': 'book', '의자': 'chair', '물': 'water', '학교': 'school' },
        currentWord: '',
        init() {
            consecutiveCorrect = 0;
            this.generateProblem();
        },
        generateProblem() {
            const keys = Object.keys(this.words);
            this.currentWord = keys[Math.floor(Math.random() * keys.length)];
            this.problemEl.textContent = this.currentWord;
            this.feedbackEl.textContent = '';
        },
        checkAnswer() {
            if (this.answerEl.value.trim().toLowerCase() === this.words[this.currentWord]) {
                consecutiveCorrect++;
                this.feedbackEl.textContent = `Correct! (${consecutiveCorrect}/3)`;
                if (consecutiveCorrect >= 3) {
                    this.feedbackEl.textContent = 'Pass!';
                    consecutiveCorrect = 0;
                }
                setTimeout(() => this.generateProblem(), 500);
            } else {
                consecutiveCorrect = 0;
                this.feedbackEl.textContent = 'Wrong! Try again.';
            }
            this.answerEl.value = '';
        }
    };
    english.submitBtn.addEventListener('click', () => english.checkAnswer());
    english.answerEl.addEventListener('keyup', e => e.key === 'Enter' && english.checkAnswer());

    // --- Korean Typing Game --- //
    const typing = {
        sentenceEl: document.getElementById('typing-sentence'),
        inputEl: document.getElementById('typing-input'),
        startBtn: document.getElementById('typing-start'),
        feedbackEl: document.getElementById('typing-feedback'),
        sentences: ['하늘은 맑고 푸르다', '바람이 시원하게 분다', '나는 학교에 간다'],
        startTime: 0,
        init() {
            this.start();
        },
        start() {
            const sentence = this.sentences[Math.floor(Math.random() * this.sentences.length)];
            this.sentenceEl.textContent = sentence;
            this.inputEl.value = '';
            this.inputEl.focus();
            this.feedbackEl.textContent = '';
            this.startTime = Date.now();
        },
        checkTyping() {
            if (this.inputEl.value === this.sentenceEl.textContent) {
                const wpm = Math.round((this.sentenceEl.textContent.length / 5) / ((Date.now() - this.startTime) / 60000));
                this.feedbackEl.textContent = `WPM: ${wpm}`;
            }
        }
    };
    typing.startBtn.addEventListener('click', () => typing.start());
    typing.inputEl.addEventListener('input', () => typing.checkTyping());


    // --- Falling Square Game --- //
    const fallingSquare = {
        canvas: document.getElementById('falling-square-canvas'),
        gameOverMsg: document.getElementById('falling-square-game-over'),
        ctx: null, gameLoop: null, handler: null,
        state: { over: false },
        player: { x: 50, y: 150, width: 20, height: 20, velocity: 0, gravity: 0.5, jump: -9 },
        obstacles: [], frame: 0,

        init() {
            this.ctx = this.canvas.getContext('2d');
            this.handler = e => {
                if (e.code === 'Space') {
                    e.preventDefault();
                    if (this.state.over) this.reset();
                    else this.player.velocity = this.player.jump;
                }
            };
            document.addEventListener('keydown', this.handler);
            this.reset();
        },

        reset() {
            this.state.over = false;
            this.gameOverMsg.classList.add('hidden');
            this.player.y = 150;
            this.player.velocity = 0;
            this.obstacles = [];
            this.frame = 0;
            if (!this.gameLoop) this.gameLoop = setInterval(() => this.update(), 1000 / 60);
        },

        update() {
            if (this.state.over) return;
            this.draw(); // Draw first
            this.player.velocity += this.player.gravity;
            this.player.y += this.player.velocity;
            this.frame++;

            if (this.frame % 90 === 0) {
                const gapY = Math.random() * (this.canvas.height - 120);
                this.obstacles.push({ x: this.canvas.width, y: 0, width: 40, height: gapY });
                this.obstacles.push({ x: this.canvas.width, y: gapY + 120, width: 40, height: this.canvas.height });
            }
            this.obstacles.forEach(obs => obs.x -= 2);

            const collision = this.player.y > this.canvas.height - this.player.height || 
                              this.player.y < 0 ||
                              this.obstacles.some(this.isColliding.bind(this));
            if (collision) this.gameOver();
        },

        isColliding(obs) {
            return this.player.x < obs.x + obs.width &&
                   this.player.x + this.player.width > obs.x &&
                   this.player.y < obs.y + obs.height &&
                   this.player.y + this.player.height > obs.y;
        },

        draw() {
            this.ctx.fillStyle = '#e9f5ff';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#007bff';
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            this.ctx.fillStyle = '#dc3545';
            this.obstacles.forEach(obs => this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height));
        },

        gameOver() {
            this.state.over = true;
            this.gameOverMsg.classList.remove('hidden');
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        },

        cleanup() {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
            if (this.handler) document.removeEventListener('keydown', this.handler);
        }
    };

    // --- Game Initializers and Cleaners --- //
    const gameInitializers = {
        'multiplication': () => multiplication.init(),
        'english': () => english.init(),
        'typing': () => typing.init(),
        'falling-square': () => fallingSquare.init(),
        // Add other game initializers here
    };

    const gameCleaners = {
        'falling-square': () => fallingSquare.cleanup(),
        // Add other game cleaners here
    };

});