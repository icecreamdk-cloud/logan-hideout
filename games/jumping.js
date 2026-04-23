import { keyState } from '../main.js';

export const jumping = {
    canvas: null,
    ctx: null,
    player: {
        x: 50, y: 280, width: 20, height: 20, 
        velocityY: 0, onGround: true, 
        jumpForce: 350, // 점프 힘 50% 감소 (700 -> 350)
        gravity: 1000   // 중력 가속도 50% 감소 (2000 -> 1000)
    },
    villains: [],
    spawnTimer: 0,
    nextSpawnTime: 0,
    
    keyHandler: null,
    touchHandler: null,

    init() {
        this.canvas = document.getElementById('no-guri-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.reset();

        const handleAction = e => {
            e.preventDefault();
            if (this.player.onGround) {
                this.player.velocityY = -this.player.jumpForce;
                this.player.onGround = false;
            }
        };
        
        this.keyHandler = e => { if (e.code === 'Space') handleAction(e); };
        this.touchHandler = e => handleAction(e);

        document.addEventListener('keydown', this.keyHandler);
        this.canvas.addEventListener('touchstart', this.touchHandler, { passive: false });
    },

    reset() {
        this.player.y = 280;
        this.player.velocityY = 0;
        this.player.onGround = true;
        this.villains = [];
        this.spawnTimer = 0;
        this.nextSpawnTime = 1; 
    },

    update(deltaTime) {
        this.player.velocityY += this.player.gravity * deltaTime;
        this.player.y += this.player.velocityY * deltaTime;

        if (this.player.y >= 280) {
            this.player.y = 280;
            this.player.velocityY = 0;
            this.player.onGround = true;
        }

        this.spawnTimer += deltaTime;
        if (this.spawnTimer > this.nextSpawnTime) {
            // 장애물 속도 50% 감소 (200-300 -> 100-150)
            const speed = (Math.random() * 50 + 100);
            this.villains.push({ x: this.canvas.width, y: 280, width: 20, height: 20, speed: speed });
            this.spawnTimer = 0;
            // 장애물 생성 주기는 그대로 유지하여 난이도 급락 방지
            this.nextSpawnTime = Math.random() * 0.8 + 0.5; 
        }

        this.villains.forEach(v => v.x -= v.speed * deltaTime);
        this.villains = this.villains.filter(v => v.x + v.width > 0);

        if (this.villains.some(v => v.x < this.player.x + this.player.width && v.x + v.width > this.player.x && v.y < this.player.y + this.player.height && v.height + v.y > this.player.y)) {
            this.reset();
        }
    },

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.fillStyle = '#e74c3c';
        this.villains.forEach(v => this.ctx.fillRect(v.x, v.y, v.width, v.height));
    },

    cleanup() {
        if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
        if (this.touchHandler) this.canvas.removeEventListener('touchstart', this.touchHandler);
        this.keyHandler = null;
        this.touchHandler = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};