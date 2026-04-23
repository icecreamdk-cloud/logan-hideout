import { keyState } from '../main.js';

export const shooting = {
    canvas: null,
    ctx: null,
    gameOverMsg: null,
    player: {
        x: 220, y: 520, width: 40, height: 40, speed: 5,
        isDragging: false // 터치 드래그 상태
    },
    bullets: [],
    enemies: [],
    particles: [],
    frame: 0,
    score: 0,
    state: { over: false },

    // 이벤트 핸들러 참조
    keyHandler: null,
    touchStartHandler: null,
    touchMoveHandler: null,
    touchEndHandler: null,

    init() {
        this.canvas = document.getElementById('shooting-1984-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameOverMsg = document.getElementById('shooting-1984-game-over');
        this.reset();

        // --- 이벤트 핸들러 정의 ---
        this.keyHandler = (e) => {
            if (e.code === 'Space' && this.state.over) {
                e.preventDefault();
                this.reset();
            }
        };

        this.touchStartHandler = (e) => {
            e.preventDefault();
            if (this.state.over) {
                this.reset();
                return; 
            }

            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;

            if (touchX > this.player.x && touchX < this.player.x + this.player.width &&
                touchY > this.player.y && touchY < this.player.y + this.player.height) {
                this.player.isDragging = true;
            }
        };

        this.touchMoveHandler = (e) => {
            if (this.player.isDragging) {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                let newX = touch.clientX - rect.left;
                let newY = touch.clientY - rect.top;

                this.player.x = newX - this.player.width / 2;
                this.player.y = newY - this.player.height / 2;

                if (this.player.x < 0) this.player.x = 0;
                if (this.player.x > this.canvas.width - this.player.width) this.player.x = this.canvas.width - this.player.width;
                if (this.player.y < 0) this.player.y = 0;
                if (this.player.y > this.canvas.height - this.player.height) this.player.y = this.canvas.height - this.player.height;
            }
        };

        this.touchEndHandler = (e) => {
            this.player.isDragging = false;
        };

        // --- 이벤트 리스너 등록 ---
        document.addEventListener('keydown', this.keyHandler);
        this.canvas.addEventListener('touchstart', this.touchStartHandler, { passive: false });
        this.canvas.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
        document.addEventListener('touchend', this.touchEndHandler);

    },

    reset() {
        this.state.over = false;
        this.player.isDragging = false;
        this.gameOverMsg.classList.add('hidden');
        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        this.player.y = 520;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.frame = 0;
        this.score = 0;
    },

    update() {
        if (this.state.over) return;
        this.frame++;

        if (!this.player.isDragging) {
            if (keyState['ArrowLeft'] && this.player.x > 0) this.player.x -= this.player.speed;
            if (keyState['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) this.player.x += this.player.speed;
            if (keyState['ArrowUp'] && this.player.y > 0) this.player.y -= this.player.speed;
            if (keyState['ArrowDown'] && this.player.y < this.canvas.height - this.player.height) this.player.y += this.player.speed;
        }

        if (this.frame % 10 === 0) {
            this.bullets.push({ x: this.player.x + this.player.width / 2 - 2.5, y: this.player.y, width: 5, height: 10, speed: 7 });
        }

        this.bullets.forEach(b => b.y -= b.speed);
        this.bullets = this.bullets.filter(b => b.y > 0);

        if (this.frame % 60 === 0) {
            const x = Math.random() * (this.canvas.width - 30);
            this.enemies.push({ x: x, y: 0, width: 30, height: 30, speed: 2 });
        }

        this.enemies.forEach(e => e.y += e.speed);
        this.enemies = this.enemies.filter(e => e.y < this.canvas.height);
        
        this.bullets.forEach((b, bi) => {
            this.enemies.forEach((e, ei) => {
                if (b.x < e.x + e.width && b.x + b.width > e.x && b.y < e.y + e.height && b.y + b.height > e.y) {
                    this.bullets.splice(bi, 1);
                    this.enemies.splice(ei, 1);
                    this.score += 10;
                    for (let i = 0; i < 15; i++) {
                        this.particles.push({
                            x: e.x + e.width / 2, y: e.y + e.height / 2,
                            vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
                            size: Math.random() * 3 + 1, life: 30
                        });
                    }
                }
            });
        });

        if (this.enemies.some(e => this.player.x < e.x + e.width && this.player.x + this.player.width > e.x && this.player.y < e.y + e.height && this.player.y + this.player.height > e.y)) {
            this.gameOver();
        }

        this.particles.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.life--;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    },

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#3498db';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.fillStyle = '#f1c40f';
        this.bullets.forEach(b => this.ctx.fillRect(b.x, b.y, b.width, b.height));
        this.ctx.fillStyle = '#e74c3c';
        this.enemies.forEach(e => this.ctx.fillRect(e.x, e.y, e.width, e.height));
        this.particles.forEach(p => {
            this.ctx.fillStyle = `rgba(255, 159, 64, ${p.life / 30})`;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 25);
    },

    gameOver() {
        this.state.over = true;
        this.player.isDragging = false;
        this.gameOverMsg.classList.remove('hidden');
    },

    cleanup() {
        if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
        if (this.touchStartHandler) this.canvas.removeEventListener('touchstart', this.touchStartHandler);
        if (this.touchMoveHandler) this.canvas.removeEventListener('touchmove', this.touchMoveHandler);
        if (this.touchEndHandler) document.removeEventListener('touchend', this.touchEndHandler);

        this.keyHandler = null;
        this.touchStartHandler = null;
        this.touchMoveHandler = null;
        this.touchEndHandler = null;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.gameOverMsg.classList.add('hidden');
    }
};