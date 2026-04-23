document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 --- //
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('game-container');
    const backToMenuBtns = document.querySelectorAll('.back-to-menu-btn');
    const gameLinks = document.querySelectorAll('.game-link');
    const gameViews = document.querySelectorAll('.game-view');

    const keyState = {};

    // --- 중앙 게임 루프 --- //
    let activeCanvasGame = null;
    let mainGameLoopId = null;

    function mainGameLoop() {
        if (activeCanvasGame && activeCanvasGame.update) {
            activeCanvasGame.update();
        }
        if (activeCanvasGame && activeCanvasGame.draw) {
            activeCanvasGame.draw();
        }
        mainGameLoopId = requestAnimationFrame(mainGameLoop);
    }

    function stopMainGameLoop() {
        if (mainGameLoopId) {
            cancelAnimationFrame(mainGameLoopId);
            mainGameLoopId = null;
        }
        activeCanvasGame = null;
    }

    function startMainGameLoop() {
        if (!mainGameLoopId) {
            mainGameLoop();
        }
    }

    // --- 이벤트 리스너 --- //
    window.addEventListener('keydown', e => keyState[e.code] = true);
    window.addEventListener('keyup', e => keyState[e.code] = false);

    // --- 내비게이션 --- //
    function stopAllGames() {
        stopMainGameLoop();
        // 다른 게임들의 정리 로직 (캔버스 게임이 아닌 경우)
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

        if (canvasGames[gameId]) {
            activeCanvasGame = canvasGames[gameId];
            startMainGameLoop();
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

    // --- 비 캔버스 게임 로직 --- //
    const multiplication = {
        // ... (이전과 동일)
    };
    const english = {
        // ... (이전과 동일)
    };
    const typing = {
        // ... (이전과 동일)
    };

    // --- 캔버스 게임 공통 로직 --- //
    const canvasGameBase = {
        ctx: null, canvas: null, keyHandler: null, touchHandler: null, touchMoveHandler: null, touchEndHandler: null,
        cleanup() {
            if (this.canvas) {
                if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
                if (this.touchHandler) this.canvas.removeEventListener('touchstart', this.touchHandler);
                if (this.touchMoveHandler) this.canvas.removeEventListener('touchmove', this.touchMoveHandler);
                if (this.touchEndHandler) this.canvas.removeEventListener('touchend', this.touchEndHandler);
            }
        }
    };

    // --- 캔버스 게임 구현 --- //
    const fallingSquare = {
        ...canvasGameBase,
        canvasId: 'falling-square-canvas',
        gameOverMsg: null,
        player: { x: 50, y: 250, width: 20, height: 20, velocityY: 0, jump: -8, gravity: 0.4, onGround: true },
        obstacles: [],
        frame: 0,
        state: { over: false },

        init() {
            this.canvas = document.getElementById(this.canvasId);
            this.ctx = this.canvas.getContext('2d');
            this.gameOverMsg = document.getElementById('falling-square-game-over');
            
            const handleAction = (e) => {
                e.preventDefault();
                if (this.state.over) {
                    this.reset();
                } else if (this.player.onGround) {
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
            this.state.over = false;
            this.gameOverMsg.classList.add('hidden');
            this.player.y = 250;
            this.player.velocityY = 0;
            this.player.onGround = true;
            this.obstacles = [];
            this.frame = 0;
        },
        update() {
            if (this.state.over) return;
            this.frame++;
            
            this.player.velocityY += this.player.gravity;
            this.player.y += this.player.velocityY;
            if (this.player.y >= 250) {
                this.player.y = 250;
                this.player.velocityY = 0;
                this.player.onGround = true;
            }

            if (this.frame % 90 === 0) {
                const height = Math.random() * 100 + 50;
                this.obstacles.push({ x: this.canvas.width, y: 0, width: 30, height: height });
                this.obstacles.push({ x: this.canvas.width, y: height + 100, width: 30, height: this.canvas.height - height - 100 });
            }
            this.obstacles.forEach(o => o.x -= 3);
            this.obstacles = this.obstacles.filter(o => o.x + o.width > 0);

            if (this.obstacles.some(o => this.player.x < o.x + o.width && this.player.x + this.player.width > o.x && this.player.y < o.y + o.height && this.player.y + this.player.height > o.y)) {
                this.gameOver();
            }
        },
        draw() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.ctx.canvas.height);
            this.ctx.fillStyle = '#3498db';
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            this.ctx.fillStyle = '#c0392b';
            this.obstacles.forEach(o => this.ctx.fillRect(o.x, o.y, o.width, o.height));
        },
        gameOver() {
            this.state.over = true;
            this.gameOverMsg.classList.remove('hidden');
        }
    };

    const noGuri = {
        ...canvasGameBase,
        canvasId: 'no-guri-canvas',
        player: { x: 50, y: 280, width: 20, height: 20, velocityY: 0, onGround: true, jump: -12, gravity: 0.6 },
        villains: [],
        frame: 0,
        nextSpawnFrame: 0,

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
            this.player.y = 280;
            this.player.velocityY = 0;
            this.player.onGround = true;
            this.villains = [];
            this.frame = 0;
            this.nextSpawnFrame = 60;
        },
        update() {
            this.frame++;
            
            this.player.velocityY += this.player.gravity;
            this.player.y += this.player.velocityY;
            if (this.player.y >= 280) {
                this.player.y = 280;
                this.player.velocityY = 0;
                this.player.onGround = true;
            }

            if (this.frame > this.nextSpawnFrame) {
                const speed = Math.random() * 2 + 3.5;
                this.villains.push({ x: this.ctx.canvas.width, y: 280, width: 20, height: 20, speed: speed });
                this.nextSpawnFrame = this.frame + Math.floor(Math.random() * 60) + 30;
            }

            this.villains.forEach(v => v.x -= v.speed);
            this.villains = this.villains.filter(v => v.x + v.width > 0);

            if (this.villains.some(v => v.x < this.player.x + this.player.width && v.x + v.width > this.player.x && v.y < this.player.y + this.player.height && v.height + v.y > this.player.y)) {
                this.reset();
            }
        },
        draw() {
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.fillStyle = '#2ecc71';
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            this.ctx.fillStyle = '#e74c3c';
            this.villains.forEach(v => this.ctx.fillRect(v.x, v.y, v.width, v.height));
        }
    };

    const shooting1984 = {
        ...canvasGameBase,
        // ... (이전과 동일, init/reset/update/draw/gameOver 메서드 포함)
    };
    
    // --- 게임 초기화 맵 --- //
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

    const canvasGames = {
        'falling-square': fallingSquare,
        'no-guri': noGuri,
        'shooting-1984': shooting1984
    }

    // 초기화
    showMainMenu();
});