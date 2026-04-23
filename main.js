document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 --- //
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('game-container');
    const backToMenuBtns = document.querySelectorAll('.back-to-menu-btn');
    const gameLinks = document.querySelectorAll('.game-link');
    const gameViews = document.querySelectorAll('.game-view');

    let activeGame = null;
    const keyState = {};

    // --- 이벤트 리스너 --- //
    window.addEventListener('keydown', e => keyState[e.code] = true);
    window.addEventListener('keyup', e => keyState[e.code] = false);

    // --- 내비게이션 --- //
    function stopAllGames() {
        if (activeGame && gameCleaners[activeGame]) {
            gameCleaners[activeGame]();
        }
        activeGame = null;
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
    }

    gameLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showGame(e.target.dataset.game);
        });
    });

    backToMenuBtns.forEach(btn => {
        btn.addEventListener('click', showMainMenu);
    });

    // --- 게임 로직 --- //
    const multiplication = {
        problemEl: document.getElementById('multiplication-problem'),
        answerEl: document.getElementById('multiplication-answer'),
        submitBtn: document.getElementById('multiplication-submit'),
        feedbackEl: document.getElementById('multiplication-feedback'),
        problemAreaEl: document.getElementById('multiplication-problem-area'),
        passMessageEl: document.getElementById('multiplication-pass-message'),
        restartBtn: document.getElementById('multiplication-restart'),
        num1: 0, num2: 0, consecutiveCorrect: 0,

        init() {
            this.consecutiveCorrect = 0;
            this.passMessageEl.classList.add('hidden');
            this.problemAreaEl.classList.remove('hidden');
            this.feedbackEl.textContent = '';
            this.generateProblem();
        },
        generateProblem() {
            this.num1 = Math.floor(Math.random() * 6) + 4;
            this.num2 = Math.floor(Math.random() * 9) + 1;
            this.problemEl.textContent = `${this.num1} x ${this.num2} = ?`;
            this.answerEl.value = '';
            this.answerEl.focus();
        },
        checkAnswer() {
            if (this.answerEl.value !== '' && parseInt(this.answerEl.value) === this.num1 * this.num2) {
                this.consecutiveCorrect++;
                if (this.consecutiveCorrect >= 3) {
                    this.feedbackEl.textContent = '';
                    this.problemAreaEl.classList.add('hidden');
                    this.passMessageEl.classList.remove('hidden');
                } else {
                    this.feedbackEl.textContent = `정답! (${this.consecutiveCorrect}/3)`;
                    this.generateProblem();
                }
            } else {
                this.consecutiveCorrect = 0;
                this.feedbackEl.textContent = '오답! 다시 시도하세요.';
            }
            this.answerEl.value = '';
        }
    };
    multiplication.submitBtn.addEventListener('click', () => multiplication.checkAnswer());
    multiplication.answerEl.addEventListener('keyup', e => e.key === 'Enter' && multiplication.checkAnswer());
    multiplication.restartBtn.addEventListener('click', () => multiplication.init());

    const english = {
        // ... (이전과 동일, 생략)
    };

    const typing = {
        // ... (이전과 동일, 생략)
    };

    // --- 캔버스 게임 베이스 --- //
    const canvasGame = {
        ctx: null, gameLoop: null, keyHandler: null, touchHandler: null, touchMoveHandler: null, touchEndHandler: null, canvas: null,
        cleanup() {
            if (this.gameLoop) clearInterval(this.gameLoop);
            this.gameLoop = null;
            if (this.canvas) {
                if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
                if (this.touchHandler) this.canvas.removeEventListener('touchstart', this.touchHandler);
                if (this.touchMoveHandler) this.canvas.removeEventListener('touchmove', this.touchMoveHandler);
                if (this.touchEndHandler) this.canvas.removeEventListener('touchend', this.touchEndHandler);
            }
            if (this.ctx) this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        }
    };

    const fallingSquare = {
        ...canvasGame,
        // ... (중력 게임 로직, 이전과 동일, 생략)
    };

    const noGuri = {
        ...canvasGame,
        canvasId: 'no-guri-canvas',
        player: { x: 50, y: 280, width: 20, height: 20, velocityY: 0, onGround: true, jump: -12, gravity: 0.6 },
        villains: [], frame: 0, nextSpawnFrame: 0,

        init() {
            this.canvas = document.getElementById(this.canvasId);
            this.ctx = this.canvas.getContext('2d');
            const handleAction = e => {
                e.preventDefault();
                if (this.player.onGround) {
                    this.player.velocityY = this.player.jump;
                    this.player.onGround = false;
                }
            };
            this.keyHandler = e => { if (e.code === 'Space') handleAction(e); };
            this.touchHandler = e => handleAction(e);
            document.addEventListener('keydown', this.keyHandler);
            this.canvas.addEventListener('touchstart', this.touchHandler);
            this.reset();
        },
        reset() {
            this.player.y = 280; this.player.velocityY = 0; this.player.onGround = true;
            this.villains = []; this.frame = 0; this.nextSpawnFrame = 60;
            if (!this.gameLoop) this.gameLoop = setInterval(() => this.update(), 1000 / 60);
        },
        update() {
            this.frame++;
            this.player.velocityY += this.player.gravity;
            this.player.y += this.player.velocityY;
            if (this.player.y >= 280) { this.player.y = 280; this.player.velocityY = 0; this.player.onGround = true; }

            if (this.frame > this.nextSpawnFrame) {
                const speed = Math.random() * 4 + 7; // 7 ~ 11 사이의 속도
                this.villains.push({ x: this.ctx.canvas.width, y: 280, width: 20, height: 20, speed: speed });
                this.nextSpawnFrame = this.frame + Math.floor(Math.random() * 30) + 20; // 20 ~ 50 프레임마다 생성
            }

            this.villains.forEach(v => v.x -= v.speed);
            this.villains = this.villains.filter(v => v.x + v.width > 0);
            if (this.villains.some(v => v.x < this.player.x + this.player.width && v.x + v.width > this.player.x && v.y < this.player.y + this.player.height && v.height + v.y > this.player.y)) {
                this.reset();
            }
            this.draw();
        },
        draw() { /* ... */ }
    };

    const shooting1984 = {
        ...canvasGame,
        canvasId: 'shooting-1984-canvas',
        gameOverMsg: null, player: null, bullets: [], enemies: [], frame: 0, score: 0, touchX: null, state: { over: false },

        init() {
            this.canvas = document.getElementById(this.canvasId);
            this.ctx = this.canvas.getContext('2d');
            this.gameOverMsg = document.getElementById('shooting-1984-game-over');

            this.keyHandler = e => { if (e.code === 'Space' && this.state.over) { e.preventDefault(); this.reset(); } };
            this.touchHandler = e => {
                e.preventDefault();
                if (this.state.over) { this.reset(); return; }
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                this.touchX = touch.clientX - rect.left;
            };
            this.touchMoveHandler = e => {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                this.touchX = touch.clientX - rect.left;
            };

            document.addEventListener('keydown', this.keyHandler);
            this.canvas.addEventListener('touchstart', this.touchHandler, { passive: false });
            this.canvas.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
            this.reset();
        },
        reset() {
            this.state.over = false; this.gameOverMsg.classList.add('hidden');
            this.player = { x: this.canvas.width / 2 - 15, y: this.canvas.height - 60, width: 30, height: 30, speed: 5, cooldown: 0 };
            this.bullets = []; this.enemies = []; this.frame = 0; this.score = 0; this.touchX = null;
            if (!this.gameLoop) this.gameLoop = setInterval(() => this.update(), 1000 / 60);
        },
        update() {
            if (this.state.over) return;
            this.frame++; this.handleInput(); this.updatePlayerAndShoot(); this.updateBullets(); this.updateEnemies(); this.checkCollisions(); this.draw();
        },
        handleInput() {
            // Keyboard
            if (keyState['ArrowLeft'] && this.player.x > 0) this.player.x -= this.player.speed;
            if (keyState['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) this.player.x += this.player.speed;
            if (keyState['ArrowUp'] && this.player.y > 0) this.player.y -= this.player.speed;
            if (keyState['ArrowDown'] && this.player.y < this.canvas.height - this.player.height) this.player.y += this.player.speed;
            
            // Touch
            if (this.touchX !== null) {
                let targetX = this.touchX - this.player.width / 2;
                targetX = Math.max(0, Math.min(this.canvas.width - this.player.width, targetX));
                this.player.x += (targetX - this.player.x) * 0.4; // 부드러운 이동
            }
        },
        updatePlayerAndShoot() { /* ... */ },
        updateBullets() { /* ... */ },
        updateEnemies() { /* ... */ },
        checkCollisions() { /* ... */ },
        draw() { /* ... */ },
        gameOver() { this.state.over = true; this.gameOverMsg.classList.remove('hidden'); clearInterval(this.gameLoop); this.gameLoop = null; }
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
        'falling-square': () => fallingSquare.cleanup(),
        'no-guri': () => noGuri.cleanup(),
        'shooting-1984': () => shooting1984.cleanup(),
    };
});