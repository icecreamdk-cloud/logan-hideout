document.addEventListener('DOMContentLoaded', () => {
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('game-container');
    const backToMenuBtn = document.getElementById('back-to-menu');
    const gameLinks = document.querySelectorAll('.game-link');
    const gameViews = document.querySelectorAll('.game-view');

    let activeGame = null;

    // --- Navigation --- //
    function stopAllGames() {
        if (fallingSquare.gameLoop) fallingSquare.stop();
        if (noGuri.gameLoop) noGuri.stop();
        if (plusMinus.timerInterval) plusMinus.stop();
    }

    function showGame(gameId) {
        stopAllGames();
        mainMenu.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        gameViews.forEach(view => view.classList.add('hidden'));
        document.getElementById(`${gameId}-game`).classList.remove('hidden');
        activeGame = gameId;
        if (gameInitializers[gameId]) {
            gameInitializers[gameId]();
        }
    }

    function showMainMenu() {
        stopAllGames();
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

    // --- Game Logic --- //

    let consecutiveCorrect = 0;

    // --- Multiplication Game --- //
    const multiplication = {
        problemEl: document.getElementById('multiplication-problem'),
        answerEl: document.getElementById('multiplication-answer'),
        submitBtn: document.getElementById('multiplication-submit'),
        feedbackEl: document.getElementById('multiplication-feedback'),
        num1: 0, num2: 0,
        generateProblem() {
            this.num1 = Math.floor(Math.random() * 6) + 4;
            this.num2 = Math.floor(Math.random() * 9) + 1;
            this.problemEl.textContent = `${this.num1} x ${this.num2} = ?`;
            this.feedbackEl.textContent = '';
        },
        checkAnswer() {
            const userAnswer = parseInt(this.answerEl.value);
            if (userAnswer === this.num1 * this.num2) {
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
        generateProblem() {
            const keys = Object.keys(this.words);
            this.currentWord = keys[Math.floor(Math.random() * keys.length)];
            this.problemEl.textContent = this.currentWord;
            this.feedbackEl.textContent = '';
        },
        checkAnswer() {
            const userAnswer = this.answerEl.value.trim().toLowerCase();
            if (userAnswer === this.words[this.currentWord]) {
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
        start() {
            const sentence = this.sentences[Math.floor(Math.random() * this.sentences.length)];
            this.sentenceEl.textContent = sentence;
            this.inputEl.value = '';
            this.inputEl.focus();
            this.feedbackEl.textContent = '';
            this.startTime = Date.now();
        },
        checkTyping() {
            const typed = this.inputEl.value;
            const original = this.sentenceEl.textContent;
            if (typed === original) {
                const endTime = Date.now();
                const timeTaken = (endTime - this.startTime) / 1000;
                const wpm = Math.round((original.length / 5) / (timeTaken / 60));
                this.feedbackEl.textContent = `WPM: ${wpm}`;
            }
        }
    };
    typing.startBtn.addEventListener('click', () => typing.start());
    typing.inputEl.addEventListener('input', () => typing.checkTyping());

    // --- +/- Game --- //
    const plusMinus = {
        problemEl: document.getElementById('plus-minus-problem'),
        answerEl: document.getElementById('plus-minus-answer'),
        submitBtn: document.getElementById('plus-minus-submit'),
        feedbackEl: document.getElementById('plus-minus-feedback'),
        timerBar: document.getElementById('timer-bar'),
        correctAnswer: 0,
        timerInterval: null,
        stop() {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        },
        generateProblem() {
            this.stop();
            const isPlus = Math.random() > 0.5;
            let num1 = Math.floor(Math.random() * 20) + 1;
            let num2 = Math.floor(Math.random() * 20) + 1;
            if (!isPlus && num1 < num2) [num1, num2] = [num2, num1];
            this.correctAnswer = isPlus ? num1 + num2 : num1 - num2;
            this.problemEl.textContent = `${num1} ${isPlus ? '+' : '-'} ${num2} = ?`;
            this.feedbackEl.textContent = '';
            this.answerEl.value = '';
            this.resetTimer();
        },
        checkAnswer() {
            this.stop();
            const userAnswer = parseInt(this.answerEl.value);
            if (userAnswer === this.correctAnswer) {
                consecutiveCorrect++;
                this.feedbackEl.textContent = `Correct! (${consecutiveCorrect}/3)`;
                if (consecutiveCorrect >= 3) {
                    this.feedbackEl.textContent = 'Pass!';
                    consecutiveCorrect = 0;
                }
                setTimeout(() => this.generateProblem(), 1000);
            } else {
                consecutiveCorrect = 0;
                this.feedbackEl.textContent = 'Wrong! Try again.';
                setTimeout(() => this.generateProblem(), 1000);
            }
        },
        resetTimer() {
            let timeLeft = 5;
            this.timerBar.style.width = '100%';
            this.timerInterval = setInterval(() => {
                timeLeft -= 0.1;
                this.timerBar.style.width = `${(timeLeft / 5) * 100}%`;
                if (timeLeft <= 0) {
                    this.stop();
                    this.feedbackEl.textContent = 'Time up!';
                    consecutiveCorrect = 0;
                    setTimeout(() => this.generateProblem(), 1000);
                }
            }, 100);
        }
    };
    plusMinus.submitBtn.addEventListener('click', () => plusMinus.checkAnswer());
    plusMinus.answerEl.addEventListener('keyup', e => e.key === 'Enter' && plusMinus.checkAnswer());

    // --- Canvas Games Base --- //
    const canvasGame = {
        ctx: null, gameLoop: null, frame: 0, handler: null,
        stop() {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
            if (this.handler) {
                document.removeEventListener('keydown', this.handler);
                this.handler = null;
            }
        },
        startLoop() {
            this.gameLoop = setInterval(() => {
                this.update();
                this.draw();
            }, 1000 / 60);
        }
    };

    // --- Falling Square --- //
    const fallingSquare = {
        ...canvasGame,
        canvas: document.getElementById('falling-square-canvas'),
        player: { x: 50, y: 150, width: 20, height: 20, velocity: 0, gravity: 0.5, jump: -8 },
        obstacles: [],
        init() {
            this.stop();
            this.ctx = this.canvas.getContext('2d');
            this.handler = e => {
                if (e.code === 'Space') {
                    e.preventDefault();
                    this.player.velocity = this.player.jump;
                }
            };
            document.addEventListener('keydown', this.handler);
            this.reset();
            this.startLoop();
        },
        reset() {
            this.player.y = 150;
            this.player.velocity = 0;
            this.obstacles = [];
            this.frame = 0;
        },
        update() {
            this.player.velocity += this.player.gravity;
            this.player.y += this.player.velocity;
            this.frame++;
            if (this.frame % 90 === 0) {
                const gapHeight = 120;
                const gapY = Math.random() * (this.canvas.height - gapHeight);
                this.obstacles.push({ x: this.canvas.width, y: 0, width: 40, height: gapY });
                this.obstacles.push({ x: this.canvas.width, y: gapY + gapHeight, width: 40, height: this.canvas.height });
            }
            this.obstacles.forEach(obs => obs.x -= 2);
            const collision = this.player.y > this.canvas.height - this.player.height || this.obstacles.some(obs => 
                this.player.x < obs.x + obs.width &&
                this.player.x + this.player.width > obs.x &&
                this.player.y < obs.y + obs.height &&
                this.player.y + this.player.height > obs.y);
            if (collision) this.reset();
        },
        draw() {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#03dac6';
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            this.ctx.fillStyle = '#cf6679';
            this.obstacles.forEach(obs => this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height));
        }
    };

    // --- NO-Guri --- //
    const noGuri = {
        ...canvasGame,
        canvas: document.getElementById('no-guri-canvas'),
        player: { x: 50, y: 280, width: 20, height: 20, velocityY: 0, onGround: true, jump: -12, gravity: 0.6 },
        villains: [],
        init() {
            this.stop();
            this.ctx = this.canvas.getContext('2d');
            this.handler = e => {
                if (e.code === 'Space' && this.player.onGround) {
                    e.preventDefault();
                    this.player.velocityY = this.player.jump;
                }
            };
            document.addEventListener('keydown', this.handler);
            this.reset();
            this.startLoop();
        },
        reset() {
            this.player.y = 280;
            this.player.velocityY = 0;
            this.villains = [];
            this.frame = 0;
        },
        update() {
            this.player.velocityY += this.player.gravity;
            this.player.y += this.player.velocityY;
            this.player.onGround = false;
            if (this.player.y >= 280) {
                this.player.y = 280;
                this.player.velocityY = 0;
                this.player.onGround = true;
            }
            this.frame++;
            if (this.frame % 120 === 0) {
                this.villains.push({ x: this.canvas.width, y: 280, width: 20, height: 20 });
            }
            this.villains.forEach(v => v.x -= 3);
            if (this.villains.some(v => this.player.x < v.x + v.width && this.player.x + this.player.width > v.x && this.player.y < v.y + v.height && this.player.y + this.player.height > v.y)) {
                this.reset();
            }
        },
        draw() {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#03dac6';
            this.ctx.beginPath(); this.ctx.arc(this.player.x + 10, this.player.y + 10, 10, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.fillStyle = '#cf6679';
            this.villains.forEach(v => {
                this.ctx.beginPath(); this.ctx.moveTo(v.x + 10, v.y); this.ctx.lineTo(v.x, v.y + 20); this.ctx.lineTo(v.x + 20, v.y + 20); this.ctx.closePath(); this.ctx.fill();
            });
        }
    };
    
    const gameInitializers = {
        'multiplication': () => { consecutiveCorrect = 0; multiplication.generateProblem(); },
        'english': () => { consecutiveCorrect = 0; english.generateProblem(); },
        'typing': () => typing.start(),
        'plus-minus': () => { consecutiveCorrect = 0; plusMinus.generateProblem(); },
        'falling-square': () => fallingSquare.init(),
        'no-guri': () => noGuri.init(),
    };

});
