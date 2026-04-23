export const gravity = {
    canvas: null,
    ctx: null,
    gameOverMsg: null,
    player: {
        x: 50, y: 150, width: 20, height: 20,
        velocityY: 0,
        jumpForce: 450, // 점프 힘 (픽셀/초)
        gravity: 1400   // 중력 가속도 (픽셀/초^2)
    },
    obstacles: [],
    obstacleSpeed: 180, // 장애물 이동 속도 (픽셀/초)
    spawnTimer: 0,
    nextSpawnTime: 1.5, // 첫 장애물은 1.5초 후 등장
    state: { over: false },

    keyHandler: null,
    touchHandler: null,

    init() {
        this.canvas = document.getElementById('falling-square-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameOverMsg = document.getElementById('falling-square-game-over');
        this.reset();

        const handleJump = (e) => {
            e.preventDefault();
            if (this.state.over) {
                this.reset();
            } else {
                this.player.velocityY = -this.player.jumpForce;
            }
        };

        this.keyHandler = e => { if (e.code === 'Space') handleJump(e); };
        this.touchHandler = e => handleJump(e);

        // canvas에 이벤트 리스너를 다시 연결합니다.
        document.addEventListener('keydown', this.keyHandler);
        this.canvas.addEventListener('touchstart', this.touchHandler, { passive: false });
    },

    reset() {
        this.state.over = false;
        this.gameOverMsg.classList.add('hidden');
        this.player.y = 150;
        this.player.velocityY = 0;
        this.obstacles = [];
        this.spawnTimer = 0;
        this.nextSpawnTime = 1.5;
    },

    update(deltaTime) {
        if (this.state.over) return;

        // --- 플레이어 물리 (deltaTime 적용) ---
        this.player.velocityY += this.player.gravity * deltaTime;
        this.player.y += this.player.velocityY * deltaTime;

        // --- 충돌 감지 ---
        // 바닥/천장 충돌 시 게임오버
        if (this.player.y > this.canvas.height - this.player.height || this.player.y < 0) {
            this.gameOver();
        }

        // 장애물 충돌
        if (this.obstacles.some(o => this.player.x < o.x + o.width && this.player.x + this.player.width > o.x && this.player.y < o.y + o.height && this.player.y + this.player.height > o.y)) {
            this.gameOver();
        }

        // --- 장애물 관리 (deltaTime 적용) ---
        this.spawnTimer += deltaTime;
        if (this.spawnTimer > this.nextSpawnTime) {
            const gapHeight = 120;
            const gapY = Math.random() * (this.canvas.height - gapHeight);
            this.obstacles.push({ x: this.canvas.width, y: 0, width: 40, height: gapY });
            this.obstacles.push({ x: this.canvas.width, y: gapY + gapHeight, width: 40, height: this.canvas.height - gapY - gapHeight });
            
            this.spawnTimer = 0;
            this.nextSpawnTime = 1.5; // 장애물은 1.5초마다 생성
        }

        this.obstacles.forEach(o => o.x -= this.obstacleSpeed * deltaTime);
        this.obstacles = this.obstacles.filter(o => o.x + o.width > 0);
    },

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#3498db';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.fillStyle = '#c0392b';
        this.obstacles.forEach(o => this.ctx.fillRect(o.x, o.y, o.width, o.height));
    },

    gameOver() {
        this.state.over = true;
        this.gameOverMsg.classList.remove('hidden');
    },

    cleanup() {
        if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
        if (this.touchHandler) this.canvas.removeEventListener('touchstart', this.touchHandler);
        this.keyHandler = null;
        this.touchHandler = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.gameOverMsg.classList.add('hidden');
    }
};