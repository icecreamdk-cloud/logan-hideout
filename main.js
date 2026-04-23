document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 --- //
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('game-container');
    const backToMenuBtn = document.getElementById('back-to-menu');
    const gameLinks = document.querySelectorAll('.game-link');
    const gameViews = document.querySelectorAll('.game-view');

    let activeGame = null;
    const keyState = {};

    // --- 키보드 이벤트 리스너 --- //
    window.addEventListener('keydown', e => keyState[e.code] = true);
    window.addEventListener('keyup', e => keyState[e.code] = false);

    // --- 내비게이션 --- //

    function stopAllGames() {
        if (activeGame && gameCleaners[activeGame]) {
            gameCleaners[activeGame]();
        }
    }

    function showGame(gameId) {
        stopAllGames();
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

    // --- 게임 로직 및 상태 관리 --- //

    let consecutiveCorrect = 0;

    // --- 곱셈 게임 --- //
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
                this.feedbackEl.textContent = `정답! (${consecutiveCorrect}/3)`;
                if (consecutiveCorrect >= 3) {
                    this.feedbackEl.textContent = '성공!';
                    consecutiveCorrect = 0;
                }
                setTimeout(() => this.generateProblem(), 500);
            } else {
                consecutiveCorrect = 0;
                this.feedbackEl.textContent = '오답! 다시 시도하세요.';
            }
            this.answerEl.value = '';
        }
    };
    multiplication.submitBtn.addEventListener('click', () => multiplication.checkAnswer());
    multiplication.answerEl.addEventListener('keyup', e => e.key === 'Enter' && multiplication.checkAnswer());

    // --- 영어 단어 퀴즈 --- //
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
                this.feedbackEl.textContent = `정답! (${consecutiveCorrect}/3)`;
                if (consecutiveCorrect >= 3) {
                    this.feedbackEl.textContent = '성공!';
                    consecutiveCorrect = 0;
                }
                setTimeout(() => this.generateProblem(), 500);
            } else {
                consecutiveCorrect = 0;
                this.feedbackEl.textContent = '오답! 다시 시도하세요.';
            }
            this.answerEl.value = '';
        }
    };
    english.submitBtn.addEventListener('click', () => english.checkAnswer());
    english.answerEl.addEventListener('keyup', e => e.key === 'Enter' && english.checkAnswer());

    // --- 한컴 타자 연습 --- //
    const typing = {
        sentenceEl: document.getElementById('typing-sentence'),
        inputEl: document.getElementById('typing-input'),
        startBtn: document.getElementById('typing-start'),
        feedbackEl: document.getElementById('typing-feedback'),
        sentences: ['하늘은 맑고 푸르다', '바람이 시원하게 분다', '나는 학교에 간다'],
        startTime: 0,
        init() { this.start(); },
        start() {
            const sentence = this.sentences[Math.floor(Math.random() * this.sentences.length)];
            this.sentenceEl.textContent = sentence;
            this.inputEl.value = '';
            this.inputEl.focus();
            this.feedbackEl.textContent = '';
            this.startTime = 0;
        },
        checkTyping() {
            if (!this.startTime) this.startTime = Date.now();
            if (this.inputEl.value === this.sentenceEl.textContent) {
                const wpm = Math.round((this.sentenceEl.textContent.length) * 60000 / (Date.now() - this.startTime));
                this.feedbackEl.textContent = `타수: ${wpm}`;
            }
        }
    };
    typing.startBtn.addEventListener('click', () => typing.start());
    typing.inputEl.addEventListener('input', () => typing.checkTyping());

    // --- 캔버스 게임 베이스 --- //
    const canvasGame = {
        ctx: null, gameLoop: null, handler: null, state: { over: false },
        cleanup(canvasId) {
            if (this.gameLoop) clearInterval(this.gameLoop);
            this.gameLoop = null;
            if (this.handler) document.removeEventListener('keydown', this.handler);
            const ctx = document.getElementById(canvasId).getContext('2d');
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    };

    // --- 낙하 네모 --- //
    const fallingSquare = {
        ...canvasGame,
        canvasId: 'falling-square-canvas',
        gameOverMsgId: 'falling-square-game-over',
        player: { x: 50, y: 150, width: 20, height: 20, velocity: 0, gravity: 0.5, jump: -9 },
        obstacles: [], frame: 0,

        init() {
            this.ctx = document.getElementById(this.canvasId).getContext('2d');
            this.gameOverMsg = document.getElementById(this.gameOverMsgId);
            this.handler = e => {
                if (e.code === 'Space') {
                    e.preventDefault();
                    if (this.state.over) this.reset();
                    else if (this.player.y > 0) this.player.velocity = this.player.jump;
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
            this.frame++;
            this.player.velocity += this.player.gravity;
            this.player.y += this.player.velocity;

            if (this.frame % 90 === 0) {
                const gapY = Math.random() * (this.ctx.canvas.height - 150) + 50;
                this.obstacles.push({ x: this.ctx.canvas.width, y: 0, width: 40, height: gapY - 75 });
                this.obstacles.push({ x: this.ctx.canvas.width, y: gapY + 75, width: 40, height: this.ctx.canvas.height });
            }
            this.obstacles.forEach(obs => obs.x -= 2);
            this.obstacles = this.obstacles.filter(obs => obs.x + obs.width > 0);

            const collision = this.player.y > this.ctx.canvas.height - this.player.height || this.player.y < 0 || this.obstacles.some(this.isColliding.bind(this));
            if (collision) this.gameOver();
            this.draw();
        },
        isColliding(obs) {
            return this.player.x < obs.x + obs.width && this.player.x + this.player.width > obs.x && this.player.y < obs.y + obs.height && this.player.y + this.player.height > obs.y;
        },
        draw() {
            this.ctx.fillStyle = '#e9f5ff';
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.fillStyle = '#007bff';
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            this.ctx.fillStyle = '#dc3545';
            this.obstacles.forEach(obs => this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height));
        },
        gameOver() {
            this.state.over = true;
            this.gameOverMsg.classList.remove('hidden');
            clearInterval(this.gameLoop); this.gameLoop = null;
        }
    };

    // --- 너구리 --- //
    const noGuri = {
        ...canvasGame,
        canvasId: 'no-guri-canvas',
        player: { x: 50, y: 280, width: 20, height: 20, velocityY: 0, onGround: true, jump: -12, gravity: 0.6 },
        villains: [], frame: 0,

        init() {
            this.ctx = document.getElementById(this.canvasId).getContext('2d');
            this.handler = e => {
                if (e.code === 'Space' && this.player.onGround) {
                    e.preventDefault();
                    this.player.velocityY = this.player.jump;
                    this.player.onGround = false;
                }
            };
            document.addEventListener('keydown', this.handler);
            this.reset();
        },
        reset() {
            this.player.y = 280; this.player.velocityY = 0; this.player.onGround = true;
            this.villains = []; this.frame = 0;
            if (!this.gameLoop) this.gameLoop = setInterval(() => this.update(), 1000 / 60);
        },
        update() {
            this.frame++;
            this.player.velocityY += this.player.gravity;
            this.player.y += this.player.velocityY;
            if (this.player.y >= 280) {
                this.player.y = 280; this.player.velocityY = 0; this.player.onGround = true;
            }
            if (this.frame % 120 === 0) {
                this.villains.push({ x: this.ctx.canvas.width, y: 280, width: 20, height: 20 });
            }
            this.villains.forEach(v => v.x -= 3);
            this.villains = this.villains.filter(v => v.x + v.width > 0);
            if (this.villains.some(v => this.player.x < v.x + v.width && this.player.x + this.player.width > v.x && this.player.y + this.player.height > v.y)) {
                this.reset();
            }
            this.draw();
        },
        draw() {
            this.ctx.fillStyle = '#e9f5ff';
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.fillStyle = '#28a745';
            this.ctx.beginPath(); this.ctx.arc(this.player.x + 10, this.player.y + 10, 10, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.fillStyle = '#6c757d';
            this.villains.forEach(v => {
                this.ctx.beginPath(); this.ctx.moveTo(v.x + 10, v.y); this.ctx.lineTo(v.x, v.y + 20); this.ctx.lineTo(v.x + 20, v.y + 20); this.ctx.closePath(); this.ctx.fill();
            });
        }
    };

    // --- 1984 비행기 슈팅 게임 --- //
    const shooting1984 = {
        ...canvasGame,
        canvasId: 'shooting-1984-canvas',
        gameOverMsgId: 'shooting-1984-game-over',
        player: null, bullets: [], enemies: [], frame: 0, score: 0,

        init() {
            this.ctx = document.getElementById(this.canvasId).getContext('2d');
            this.gameOverMsg = document.getElementById(this.gameOverMsgId);
            this.handler = e => {
                if (e.code === 'Space' && this.state.over) {
                    e.preventDefault();
                    this.reset();
                }
            };
            document.addEventListener('keydown', this.handler);
            this.reset();
        },
        reset() {
            this.state.over = false;
            this.gameOverMsg.classList.add('hidden');
            this.player = { x: this.ctx.canvas.width / 2 - 15, y: this.ctx.canvas.height - 50, width: 30, height: 30, speed: 5, cooldown: 0 };
            this.bullets = []; this.enemies = []; this.frame = 0; this.score = 0;
            if (!this.gameLoop) this.gameLoop = setInterval(() => this.update(), 1000 / 60);
        },
        update() {
            this.frame++;
            this.handleInput();
            this.updatePlayer();
            this.updateBullets();
            this.updateEnemies();
            this.checkCollisions();
            this.draw();
        },
        handleInput() {
            if (keyState['ArrowLeft'] && this.player.x > 0) this.player.x -= this.player.speed;
            if (keyState['ArrowRight'] && this.player.x < this.ctx.canvas.width - this.player.width) this.player.x += this.player.speed;
            if (keyState['ArrowUp'] && this.player.y > 0) this.player.y -= this.player.speed;
            if (keyState['ArrowDown'] && this.player.y < this.ctx.canvas.height - this.player.height) this.player.y += this.player.speed;
            if (keyState['Space'] && this.player.cooldown <= 0) {
                this.bullets.push({ x: this.player.x + this.player.width / 2 - 2.5, y: this.player.y, width: 5, height: 10, speed: 7 });
                this.player.cooldown = 10; // Cooldown frames
            }
        },
        updatePlayer() {
            if (this.player.cooldown > 0) this.player.cooldown--;
        },
        updateBullets() {
            this.bullets.forEach(b => b.y -= b.speed);
            this.bullets = this.bullets.filter(b => b.y + b.height > 0);
        },
        updateEnemies() {
            if (this.frame % 60 === 0) {
                const x = Math.random() * (this.ctx.canvas.width - 30);
                this.enemies.push({ x: x, y: -30, width: 30, height: 30, speed: 2 });
            }
            this.enemies.forEach(e => e.y += e.speed);
            this.enemies = this.enemies.filter(e => e.y < this.ctx.canvas.height);
        },
        checkCollisions() {
            // Bullets hitting enemies
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    if (this.isColliding(this.bullets[i], this.enemies[j])) {
                        this.enemies.splice(j, 1);
                        this.bullets.splice(i, 1);
                        this.score += 10;
                        break;
                    }
                }
            }
            // Enemies hitting player
            if (this.enemies.some(e => this.isColliding(this.player, e))) {
                this.gameOver();
            }
        },
        isColliding(rect1, rect2) {
            return rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;
        },
        draw() {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            // Player
            this.ctx.fillStyle = '#007bff';
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            // Bullets
            this.ctx.fillStyle = '#fff';
            this.bullets.forEach(b => this.ctx.fillRect(b.x, b.y, b.width, b.height));
            // Enemies
            this.ctx.fillStyle = '#dc3545';
            this.enemies.forEach(e => this.ctx.fillRect(e.x, e.y, e.width, e.height));
            // Score
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px sans-serif';
            this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        },
        gameOver() {
            this.state.over = true;
            this.gameOverMsg.classList.remove('hidden');
            clearInterval(this.gameLoop); this.gameLoop = null;
        }
    };

    // --- 게임 초기화 및 정리 --- //
    const gameInitializers = {
        'multiplication': () => multiplication.init(),
        'english': () => english.init(),
        'typing': () => typing.init(),
        'falling-square': () => fallingSquare.init(),
        'no-guri': () => noGuri.init(),
        'shooting-1984': () => shooting1984.init(),
    };

    const gameCleaners = {
        'falling-square': () => fallingSquare.cleanup(fallingSquare.canvasId),
        'no-guri': () => noGuri.cleanup(noGuri.canvasId),
        'shooting-1984': () => shooting1984.cleanup(shooting1984.canvasId),
    };
});