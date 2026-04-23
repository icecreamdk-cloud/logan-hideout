export const gravity = {
    canvas: null,
    ctx: null,
    gameOverMsg: null,
    player: {
        x: 50, y: 150, width: 20, height: 20,
        velocityY: 0,
        jumpForce: 225, // 점프 힘 50% 감소 (450 -> 225)
        gravity: 700    // 중력 가속도 50% 감소 (1400 -> 700)
    },
    obstacles: [],
    obstacleSpeed: 90, // 장애물 이동 속도 50% 감소 (180 -> 90)
    spawnTimer: 0,
    nextSpawnTime: 1.5, 
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

        this.player.velocityY += this.player.gravity * deltaTime;
        this.player.y += this.player.velocityY * deltaTime;

        if (this.player.y > this.canvas.height - this.player.height || this.player.y < 0) {
            this.gameOver();
        }

        if (this.obstacles.some(o => this.player.x < o.x + o.width && this.player.x + this.player.width > o.x && this.player.y < o.y + o.height && this.player.y + this.player.height > o.y)) {
            this.gameOver();
        }

        this.spawnTimer += deltaTime;
        if (this.spawnTimer > this.nextSpawnTime) {
            const gapHeight = 120;
            const gapY = Math.random() * (this.canvas.height - gapHeight);
            this.obstacles.push({ x: this.canvas.width, y: 0, width: 40, height: gapY });
            this.obstacles.push({ x: this.canvas.width, y: gapY + gapHeight, width: 40, height: this.canvas.height - gapY - gapHeight });
            
            this.spawnTimer = 0;
            // 장애물 생성 주기를 2.5초로 늘려 난이도를 완화합니다.
            this.nextSpawnTime = 2.5; 
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