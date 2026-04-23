import { keyState } from '../main.js';

export const shooting = {
    canvas: null,
    ctx: null,
    gameOverMsg: null,
    player: { x: 220, y: 520, width: 40, height: 40, speed: 5 },
    bullets: [],
    enemies: [],
    particles: [],
    frame: 0,
    score: 0,
    state: { over: false },
    keyHandler: null, 
    touchMoveHandler: null, 
    touchEndHandler: null,
    touchStartHandler: null,

    init() {
        this.canvas = document.getElementById('shooting-1984-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameOverMsg = document.getElementById('shooting-1984-game-over');
        this.reset();

        const handleRestart = (e) => {
            e.preventDefault();
            if (this.state.over) {
                this.reset();
            }
        }

        this.keyHandler = (e) => {
             if (e.code === 'Space') handleRestart(e);
        }

        let lastTouch = { x: 0, y: 0 };
        this.touchStartHandler = (e) => {
            handleRestart(e);
            if (e.touches.length > 0) {
                 lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        };
        
        this.touchMoveHandler = (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const newX = touch.clientX - rect.left;
                const newY = touch.clientY - rect.top;

                if (newX > 0 && newX < this.canvas.width) this.player.x = newX - this.player.width / 2;
                if (newY > 0 && newY < this.canvas.height) this.player.y = newY - this.player.height / 2;

                lastTouch = { x: touch.clientX, y: touch.clientY };
            }
        };

        document.addEventListener('keydown', this.keyHandler);
        this.canvas.addEventListener('touchstart', this.touchStartHandler);
        this.canvas.addEventListener('touchmove', this.touchMoveHandler);
    },

    reset() {
        this.state.over = false;
        this.gameOverMsg.classList.add('hidden');
        this.player.x = 220;
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

        // Player movement
        if (keyState['ArrowLeft'] && this.player.x > 0) this.player.x -= this.player.speed;
        if (keyState['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) this.player.x += this.player.speed;
        if (keyState['ArrowUp'] && this.player.y > 0) this.player.y -= this.player.speed;
        if (keyState['ArrowDown'] && this.player.y < this.canvas.height - this.player.height) this.player.y += this.player.speed;

        // Auto-fire bullets
        if (this.frame % 10 === 0) {
            this.bullets.push({ x: this.player.x + this.player.width / 2 - 2.5, y: this.player.y, width: 5, height: 10, speed: 7 });
        }

        // Update bullets
        this.bullets.forEach(b => b.y -= b.speed);
        this.bullets = this.bullets.filter(b => b.y > 0);

        // Generate enemies
        if (this.frame % 60 === 0) {
            const x = Math.random() * (this.canvas.width - 30);
            this.enemies.push({ x: x, y: 0, width: 30, height: 30, speed: 2 });
        }

        // Update enemies
        this.enemies.forEach(e => e.y += e.speed);
        this.enemies = this.enemies.filter(e => e.y < this.canvas.height);
        
        // Collision detection: bullets and enemies
        this.bullets.forEach((b, bi) => {
            this.enemies.forEach((e, ei) => {
                if (b.x < e.x + e.width && b.x + b.width > e.x && b.y < e.y + e.height && b.y + b.height > e.y) {
                    // Hit!
                    this.bullets.splice(bi, 1);
                    this.enemies.splice(ei, 1);
                    this.score += 10;
                    // Create explosion particles
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

        // Collision detection: player and enemies
        if (this.enemies.some(e => this.player.x < e.x + e.width && this.player.x + this.player.width > e.x && this.player.y < e.y + e.height && this.player.y + this.player.height > e.y)) {
            this.gameOver();
        }

        // Update particles
        this.particles.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.life--;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    },

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw player
        this.ctx.fillStyle = '#3498db';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw bullets
        this.ctx.fillStyle = '#f1c40f';
        this.bullets.forEach(b => this.ctx.fillRect(b.x, b.y, b.width, b.height));
        
        // Draw enemies
        this.ctx.fillStyle = '#e74c3c';
        this.enemies.forEach(e => this.ctx.fillRect(e.x, e.y, e.width, e.height));
        
        // Draw particles
        this.particles.forEach(p => {
            this.ctx.fillStyle = `rgba(255, 159, 64, ${p.life / 30})`;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        
        // Draw score
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 25);
    },

    gameOver() {
        this.state.over = true;
        this.gameOverMsg.classList.remove('hidden');
    },

    cleanup() {
        if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
        if (this.touchStartHandler) this.canvas.removeEventListener('touchstart', this.touchStartHandler);
        if (this.touchMoveHandler) this.canvas.removeEventListener('touchmove', this.touchMoveHandler);

        this.keyHandler = null;
        this.touchStartHandler = null;
        this.touchMoveHandler = null;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.gameOverMsg.classList.add('hidden');
    }
};