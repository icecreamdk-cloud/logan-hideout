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
        num1: 0, num2: 0, consecutiveCorrect: 0,

        init() {
            this.consecutiveCorrect = 0;
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
                this.feedbackEl.textContent = `정답! (${this.consecutiveCorrect}번 연속)`;
                this.generateProblem();
            } else {
                this.consecutiveCorrect = 0;
                this.feedbackEl.textContent = '오답! 다시 시도하세요.';
            }
            this.answerEl.value = '';
        }
    };
    multiplication.submitBtn.addEventListener('click', () => multiplication.checkAnswer());
    multiplication.answerEl.addEventListener('keyup', e => e.key === 'Enter' && multiplication.checkAnswer());

    const english = {
        problemEl: document.getElementById('english-problem'),
        answerEl: document.getElementById('english-answer'),
        submitBtn: document.getElementById('english-submit'),
        feedbackEl: document.getElementById('english-feedback'),
        words: { 
            "사과": "apple", "바나나": "banana", "고양이": "cat", "개": "dog", "집": "house", 
            "책": "book", "차": "car", "의자": "chair", "책상": "desk", "컴퓨터": "computer",
            "물": "water", "학교": "school", "학생": "student", "선생님": "teacher", "우유": "milk",
            "빵": "bread", "연필": "pencil", "공책": "notebook", "창문": "window", "문": "door"
        },
        currentWord: '',
        consecutiveCorrect: 0,

        init() {
            this.consecutiveCorrect = 0;
            this.feedbackEl.textContent = '';
            this.generateProblem();
        },
        generateProblem() {
            const keys = Object.keys(this.words);
            this.currentWord = keys[Math.floor(Math.random() * keys.length)];
            this.problemEl.textContent = this.currentWord;
            this.answerEl.value = '';
            this.answerEl.focus();
        },
        checkAnswer() {
            if (this.answerEl.value.toLowerCase() === this.words[this.currentWord]) {
                this.consecutiveCorrect++;
                this.feedbackEl.textContent = `정답!`;
                this.generateProblem();
            } else {
                this.consecutiveCorrect = 0;
                this.feedbackEl.textContent = '오답! 다시 시도하세요.';
            }
            this.answerEl.value = '';
        }
    };
    english.submitBtn.addEventListener('click', () => english.checkAnswer());
    english.answerEl.addEventListener('keyup', e => e.key === 'Enter' && english.checkAnswer());

    const typing = {
        sentenceEl: document.getElementById('typing-sentence'),
        inputEl: document.getElementById('typing-input'),
        feedbackEl: document.getElementById('typing-feedback'),
        sentences: ["하늘이 푸르다.", "강물이 맑다.", "꽃이 아름답다.", "바람이 시원하다.", "햇살이 따뜻하다."],
        startTime: 0,

        init() {
            this.feedbackEl.textContent = '';
            this.inputEl.value = '';
            this.inputEl.disabled = false;
            this.inputEl.oninput = () => this.checkTyping();
            const sentence = this.sentences[Math.floor(Math.random() * this.sentences.length)];
            this.sentenceEl.textContent = sentence;
            this.inputEl.focus();
            this.startTime = Date.now();
        },
        checkTyping() {
            const sentence = this.sentenceEl.textContent;
            const typed = this.inputEl.value;
            if (sentence.startsWith(typed)) {
                 this.feedbackEl.textContent = '';
            } else {
                 this.feedbackEl.textContent = '오타! 다시 입력하세요.';
            }
            if (sentence === typed) {
                const endTime = Date.now();
                const time = (endTime - this.startTime) / 1000;
                const wpm = Math.round((typed.length / 5) * (60 / time));
                this.feedbackEl.textContent = `성공! 속도: 약 ${wpm} WPM`;
                this.inputEl.disabled = true;
                setTimeout(() => this.init(), 2000); 
            }
        }
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
        canvasId: 'falling-square-canvas',
        gameOverMsg: null,
        gravityPlayer: { x: 50, y: 250, width: 20, height: 20, velocityY: 0, jump: -8, gravity: 0.4, onGround: true },
        gravityObstacles: [],
        gravityFrame: 0,
        gravityState: { over: false },

        init() {
            this.canvas = document.getElementById(this.canvasId);
            this.ctx = this.canvas.getContext('2d');
            this.gameOverMsg = document.getElementById('falling-square-game-over');
            
            const handleAction = (e) => {
                e.preventDefault();
                if (this.gravityState.over) {
                    this.reset();
                } else if (this.gravityPlayer.onGround) {
                    this.gravityPlayer.velocityY = this.gravityPlayer.jump;
                    this.gravityPlayer.onGround = false;
                }
            };

            this.keyHandler = e => { if (e.code === 'Space') handleAction(e); };
            this.touchHandler = e => handleAction(e);

            document.addEventListener('keydown', this.keyHandler);
            this.canvas.addEventListener('touchstart', this.touchHandler);
            this.reset();
        },
        reset() {
            this.gravityState.over = false;
            this.gameOverMsg.classList.add('hidden');
            this.gravityPlayer.y = 250;
            this.gravityPlayer.velocityY = 0;
            this.gravityPlayer.onGround = true;
            this.gravityObstacles = [];
            this.gravityFrame = 0;
            if (!this.gameLoop) {
                this.gameLoop = setInterval(() => this.update(), 1000 / 60);
            }
        },
        update() {
            if (this.gravityState.over) return;
            this.gravityFrame++;
            
            this.gravityPlayer.velocityY += this.gravityPlayer.gravity;
            this.gravityPlayer.y += this.gravityPlayer.velocityY;
            if (this.gravityPlayer.y >= 250) {
                this.gravityPlayer.y = 250;
                this.gravityPlayer.velocityY = 0;
                this.gravityPlayer.onGround = true;
            }

            if (this.gravityFrame % 90 === 0) {
                const height = Math.random() * 100 + 50;
                this.gravityObstacles.push({ x: this.canvas.width, y: 0, width: 30, height: height });
                this.gravityObstacles.push({ x: this.canvas.width, y: height + 100, width: 30, height: this.canvas.height - height - 100 });
            }
            this.gravityObstacles.forEach(o => o.x -= 3);
            this.gravityObstacles = this.gravityObstacles.filter(o => o.x + o.width > 0);

            if (this.gravityObstacles.some(o => this.gravityPlayer.x < o.x + o.width && this.gravityPlayer.x + this.gravityPlayer.width > o.x && this.gravityPlayer.y < o.y + o.height && this.gravityPlayer.y + this.gravityPlayer.height > o.y)) {
                this.gameOver();
            }

            this.draw();
        },
        draw() {
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.fillStyle = '#3498db';
            this.ctx.fillRect(this.gravityPlayer.x, this.gravityPlayer.y, this.gravityPlayer.width, this.gravityPlayer.height);
            this.ctx.fillStyle = '#c0392b';
            this.gravityObstacles.forEach(o => this.ctx.fillRect(o.x, o.y, o.width, o.height));
        },
        gameOver() {
            this.gravityState.over = true;
            this.gameOverMsg.classList.remove('hidden');
        }
    };

    const noGuri = {
        ...canvasGame,
        canvasId: 'no-guri-canvas',
        jumpingPlayer: { x: 50, y: 280, width: 20, height: 20, velocityY: 0, onGround: true, jump: -12, gravity: 0.6 },
        jumpingVillains: [],
        jumpingFrame: 0,
        jumpingNextSpawnFrame: 0,

        init() {
            this.canvas = document.getElementById(this.canvasId);
            this.ctx = this.canvas.getContext('2d');
            
            const handleAction = e => {
                e.preventDefault();
                if (this.jumpingPlayer.onGround) {
                    this.jumpingPlayer.velocityY = this.jumpingPlayer.jump;
                    this.jumpingPlayer.onGround = false;
                }
            };
            this.keyHandler = e => { if (e.code === 'Space') handleAction(e); };
            this.touchHandler = e => handleAction(e);
            
            document.addEventListener('keydown', this.keyHandler);
            this.canvas.addEventListener('touchstart', this.touchHandler);
            this.reset();
        },
        reset() {
            this.jumpingPlayer.y = 280;
            this.jumpingPlayer.velocityY = 0;
            this.jumpingPlayer.onGround = true;
            this.jumpingVillains = [];
            this.jumpingFrame = 0;
            this.jumpingNextSpawnFrame = 60;
            if (!this.gameLoop) {
                this.gameLoop = setInterval(() => this.update(), 1000 / 60);
            }
        },
        update() {
            this.jumpingFrame++;
            
            this.jumpingPlayer.velocityY += this.jumpingPlayer.gravity;
            this.jumpingPlayer.y += this.jumpingPlayer.velocityY;
            if (this.jumpingPlayer.y >= 280) {
                this.jumpingPlayer.y = 280;
                this.jumpingPlayer.velocityY = 0;
                this.jumpingPlayer.onGround = true;
            }

            if (this.jumpingFrame > this.jumpingNextSpawnFrame) {
                const speed = Math.random() * 2 + 3.5;
                this.jumpingVillains.push({ x: this.ctx.canvas.width, y: 280, width: 20, height: 20, speed: speed });
                this.jumpingNextSpawnFrame = this.jumpingFrame + Math.floor(Math.random() * 60) + 30;
            }

            this.jumpingVillains.forEach(v => v.x -= v.speed);
            this.jumpingVillains = this.jumpingVillains.filter(v => v.x + v.width > 0);

            if (this.jumpingVillains.some(v => v.x < this.jumpingPlayer.x + this.jumpingPlayer.width && v.x + v.width > this.jumpingPlayer.x && v.y < this.jumpingPlayer.y + this.jumpingPlayer.height && v.height + v.y > this.jumpingPlayer.y)) {
                this.reset();
            }

            this.draw();
        },
        draw() {
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.fillStyle = '#2ecc71';
            this.ctx.fillRect(this.jumpingPlayer.x, this.jumpingPlayer.y, this.jumpingPlayer.width, this.jumpingPlayer.height);
            this.ctx.fillStyle = '#e74c3c';
            this.jumpingVillains.forEach(v => this.ctx.fillRect(v.x, v.y, v.width, v.height));
        }
    };

    const shooting1984 = {
        ...canvasGame,
        canvasId: 'shooting-1984-canvas',
        gameOverMsg: null,
        player: null,
        bullets: [],
        enemies: [],
        frame: 0,
        score: 0,
        touchX: null,
        state: { over: false },

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
            this.state.over = false;
            this.gameOverMsg.classList.add('hidden');
            this.player = { x: this.canvas.width / 2 - 15, y: this.canvas.height - 60, width: 30, height: 30, speed: 5, cooldown: 0 };
            this.bullets = [];
            this.enemies = [];
            this.frame = 0;
            this.score = 0;
            this.touchX = null;
            if (!this.gameLoop) {
                this.gameLoop = setInterval(() => this.update(), 1000 / 60);
            }
        },
        update() {
            if (this.state.over) return;
            this.frame++;
            this.handleInput();
            this.updatePlayerAndShoot();
            this.updateBullets();
            this.updateEnemies();
            this.checkCollisions();
            this.draw();
        },
        handleInput() {
            if (keyState['ArrowLeft'] && this.player.x > 0) this.player.x -= this.player.speed;
            if (keyState['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) this.player.x += this.player.speed;
            
            if (this.touchX !== null) {
                let targetX = this.touchX - this.player.width / 2;
                targetX = Math.max(0, Math.min(this.canvas.width - this.player.width, targetX));
                this.player.x += (targetX - this.player.x) * 0.4; 
            }
        },
        updatePlayerAndShoot() {
            this.player.cooldown--;
            if (this.player.cooldown <= 0) {
                this.bullets.push({ x: this.player.x + this.player.width / 2 - 2.5, y: this.player.y, width: 5, height: 15, speed: 7 });
                this.player.cooldown = 20;
            }
        },
        updateBullets() {
            this.bullets.forEach(b => b.y -= b.speed);
            this.bullets = this.bullets.filter(b => b.y + b.height > 0);
        },
        updateEnemies() {
            if (this.frame % 40 === 0) {
                this.enemies.push({ x: Math.random() * (this.canvas.width - 30), y: -30, width: 30, height: 30, speed: Math.random() * 2 + 2 });
            }
            this.enemies.forEach(e => e.y += e.speed);
            this.enemies = this.enemies.filter(e => e.y < this.canvas.height);
        },
        checkCollisions() {
            this.bullets.forEach((b, bi) => {
                this.enemies.forEach((e, ei) => {
                    if (b.x < e.x + e.width && b.x + b.width > e.x && b.y < e.y + e.height && b.y + b.height > e.y) {
                        this.bullets.splice(bi, 1);
                        this.enemies.splice(ei, 1);
                        this.score += 10;
                    }
                });
            });
            if (this.enemies.some(e => e.x < this.player.x + this.player.width && e.x + e.width > this.player.x && e.y < this.player.y + this.player.height && e.y + e.height > this.player.y)) {
                this.gameOver();
            }
        },
        draw() {
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.fillStyle = '#00f';
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            this.ctx.fillStyle = '#ff0';
            this.bullets.forEach(b => this.ctx.fillRect(b.x, b.y, b.width, b.height));
            this.ctx.fillStyle = '#f00';
            this.enemies.forEach(e => this.ctx.fillRect(e.x, e.y, e.width, e.height));
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px Arial';
            this.ctx.fillText(`Score: ${this.score}`, 10, 25);
        },
        gameOver() {
            this.state.over = true;
            this.gameOverMsg.classList.remove('hidden');
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
        'falling-square': () => fallingSquare.cleanup(),
        'no-guri': () => noGuri.cleanup(),
        'shooting-1984': () => shooting1984.cleanup(),
    };

    // 초기화
    showMainMenu();
});