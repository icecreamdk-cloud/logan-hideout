import { keyState } from '../main.js';

export const gravity = {
    canvas: null,
    ctx: null,
    gameOverMsg: null,
    player: { x: 50, y: 150, width: 20, height: 20, velocityY: 0, gravity: 0.5, jump: -8 },
    obstacles: [],
    frame: 0,
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
                this.player.velocityY = this.player.jump;
            }
        };

        this.keyHandler = e => { if (e.code === 'Space') handleJump(e); };
        this.touchHandler = e => handleJump(e);

        document.addEventListener('keydown', this.keyHandler);
        this.canvas.addEventListener('touchstart', this.touchHandler);
    },

    reset() {
        this.state.over = false;
        this.gameOverMsg.classList.add('hidden');
        this.player.y = 150;
        this.player.velocityY = 0;
        this.obstacles = [];
        this.frame = 0;
    },

    update() {
        if (this.state.over) return;
        this.frame++;

        // Player physics
        this.player.velocityY += this.player.gravity;
        this.player.y += this.player.velocityY;

        // Ground and ceiling collision
        if (this.player.y > this.canvas.height - this.player.height || this.player.y < 0) {
            this.gameOver();
        }

        // Generate obstacles
        if (this.frame % 90 === 0) {
            const gapHeight = 120;
            const gapY = Math.random() * (this.canvas.height - gapHeight);
            this.obstacles.push({ x: this.canvas.width, y: 0, width: 40, height: gapY, type: 'top' });
            this.obstacles.push({ x: this.canvas.width, y: gapY + gapHeight, width: 40, height: this.canvas.height - gapY - gapHeight, type: 'bottom' });
        }

        // Move obstacles
        this.obstacles.forEach(o => o.x -= 3);
        this.obstacles = this.obstacles.filter(o => o.x + o.width > 0);

        // Collision with obstacles
        if (this.obstacles.some(o => this.player.x < o.x + o.width && this.player.x + this.player.width > o.x && this.player.y < o.y + o.height && this.player.y + this.player.height > o.y)) {
            this.gameOver();
        }
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