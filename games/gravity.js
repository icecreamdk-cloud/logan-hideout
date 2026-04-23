import { keyState } from '../main.js';

export const gravity = {
    canvas: null,
    ctx: null,
    gameOverMsg: null,
    player: { x: 50, y: 250, width: 20, height: 20, velocityY: 0, jump: -8, gravity: 0.4, onGround: true },
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

        // Player physics
        this.player.velocityY += this.player.gravity;
        this.player.y += this.player.velocityY;

        // Ground collision
        if (this.player.y >= 250) {
            this.player.y = 250;
            this.player.velocityY = 0;
            this.player.onGround = true;
        }

        // Obstacle generation
        if (this.frame % 90 === 0) {
            const height = Math.random() * 100 + 50;
            this.obstacles.push({ x: this.canvas.width, y: 0, width: 30, height: height });
            this.obstacles.push({ x: this.canvas.width, y: height + 100, width: 30, height: this.canvas.height - height - 100 });
        }

        // Obstacle movement
        this.obstacles.forEach(o => o.x -= 3);
        this.obstacles = this.obstacles.filter(o => o.x + o.width > 0);

        // Collision detection
        if (this.obstacles.some(o => this.player.x < o.x + o.width && this.player.x + this.player.width > o.x && this.player.y < o.y + o.height && this.player.y + this.player.height > o.y)) {
            this.gameOver();
        }
    },

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw player
        this.ctx.fillStyle = '#3498db';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw obstacles
        this.ctx.fillStyle = '#c0392b';
        this.obstacles.forEach(o => this.ctx.fillRect(o.x, o.y, o.width, o.height));
    },

    gameOver() {
        this.state.over = true;
        this.gameOverMsg.classList.remove('hidden');
    },

    cleanup() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }
        if (this.touchHandler) {
            this.canvas.removeEventListener('touchstart', this.touchHandler);
            this.touchHandler = null;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.gameOverMsg.classList.add('hidden');
    }
};