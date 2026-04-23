import { keyState } from '../main.js';

export const jumping = {
    canvas: null,
    ctx: null,
    player: { x: 50, y: 280, width: 20, height: 20, velocityY: 0, onGround: true, jump: -12, gravity: 0.6 },
    villains: [],
    frame: 0,
    nextSpawnFrame: 0,
    keyHandler: null,
    touchHandler: null,

    init() {
        this.canvas = document.getElementById('no-guri-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.reset();

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
        
        // Player physics
        this.player.velocityY += this.player.gravity;
        this.player.y += this.player.velocityY;

        // Ground collision
        if (this.player.y >= 280) {
            this.player.y = 280;
            this.player.velocityY = 0;
            this.player.onGround = true;
        }

        // Villain generation
        if (this.frame > this.nextSpawnFrame) {
            const speed = Math.random() * 2 + 3.5;
            this.villains.push({ x: this.canvas.width, y: 280, width: 20, height: 20, speed: speed });
            this.nextSpawnFrame = this.frame + Math.floor(Math.random() * 60) + 30;
        }

        // Villain movement
        this.villains.forEach(v => v.x -= v.speed);
        this.villains = this.villains.filter(v => v.x + v.width > 0);

        // Collision detection
        if (this.villains.some(v => v.x < this.player.x + this.player.width && v.x + v.width > this.player.x && v.y < this.player.y + this.player.height && v.height + v.y > this.player.y)) {
            this.reset(); // Game over, so reset
        }
    },

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw player
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw villains
        this.ctx.fillStyle = '#e74c3c';
        this.villains.forEach(v => this.ctx.fillRect(v.x, v.y, v.width, v.height));
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
    }
};