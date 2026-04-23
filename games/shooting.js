import { keyState } from '../main.js';

export const shooting = {
    canvas: null,
    ctx: null,
    gameOverMsg: null,

    // --- 게임 객체 및 상태 ---
    player: { x: 220, y: 520, width: 40, height: 40, speed: 300 }, // 속도: 픽셀/초
    bullets: [],
    enemies: [],
    particles: [],
    score: 0,
    state: { over: false },

    // --- 타이머 ---
    fireTimer: 0,
    spawnTimer: 0,

    // --- 이벤트 핸들러 참조 ---
    keyHandler: null,
    touchStartHandler: null,
    touchMoveHandler: null,

    init() {
        this.canvas = document.getElementById('shooting-1984-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameOverMsg = document.getElementById('shooting-1984-game-over');
        
        // --- 이벤트 핸들러 정의 ---
        const handleRestart = (e) => {
            if (this.state.over) {
                e.preventDefault();
                this.reset();
            }
        };
        
        const movePlayerTo = (touch) => {
            const rect = this.canvas.getBoundingClientRect();
            let newX = touch.clientX - rect.left - (this.player.width / 2);
            let newY = touch.clientY - rect.top - (this.player.height / 2);
            
            // 캔버스 경계 내에 플레이어 위치를 제한합니다.
            this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, newX));
            this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, newY));
        };

        this.keyHandler = (e) => { if (e.code === 'Space') handleRestart(e); };

        this.touchStartHandler = (e) => {
            e.preventDefault();
            handleRestart(e);
            if (!this.state.over) {
                movePlayerTo(e.touches[0]);
            }
        };

        this.touchMoveHandler = (e) => {
            e.preventDefault();
            if (!this.state.over) {
                movePlayerTo(e.touches[0]);
            }
        };

        // --- 리스너 등록 ---
        document.addEventListener('keydown', this.keyHandler);
        this.canvas.addEventListener('touchstart', this.touchStartHandler, { passive: false });
        this.canvas.addEventListener('touchmove', this.touchMoveHandler, { passive: false });

        this.reset();
    },

    reset() {
        this.state.over = false;
        this.gameOverMsg.classList.add('hidden');
        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        this.player.y = 520;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.score = 0;
        this.fireTimer = 0;
        this.spawnTimer = 0;
    },

    update(deltaTime) {
        if (this.state.over) return;

        // --- 키보드 입력 처리 ---
        const moveDistance = this.player.speed * deltaTime;
        if (keyState['ArrowLeft'] && this.player.x > 0) this.player.x -= moveDistance;
        if (keyState['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) this.player.x += moveDistance;
        if (keyState['ArrowUp'] && this.player.y > 0) this.player.y -= moveDistance;
        if (keyState['ArrowDown'] && this.player.y < this.canvas.height - this.player.height) this.player.y += moveDistance;

        // --- 자동 발사 (시간 기반) ---
        this.fireTimer += deltaTime;
        if (this.fireTimer > 0.15) { // 0.15초마다 발사
            this.fireTimer = 0;
            this.bullets.push({ x: this.player.x + this.player.width / 2 - 2.5, y: this.player.y, width: 5, height: 10, speed: 450 });
        }

        // --- 객체 위치 업데이트 (deltaTime 적용) ---
        this.bullets.forEach(b => b.y -= b.speed * deltaTime);
        this.enemies.forEach(e => e.y += e.speed * deltaTime);
        this.particles.forEach(p => { p.x += p.vx * deltaTime; p.y += p.vy * deltaTime; p.life -= deltaTime; });

        // --- 적 생성 (시간 기반) ---
        this.spawnTimer += deltaTime;
        if (this.spawnTimer > 1.0) { // 1초마다 생성
            this.spawnTimer = 0;
            const x = Math.random() * (this.canvas.width - 30);
            this.enemies.push({ x: x, y: -30, width: 30, height: 30, speed: 120 });
        }

        // --- 객체 필터링 ---
        this.bullets = this.bullets.filter(b => b.y + b.height > 0);
        this.enemies = this.enemies.filter(e => e.y < this.canvas.height);
        this.particles = this.particles.filter(p => p.life > 0);

        // --- 충돌 감지 ---
        // 총알과 적
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const b = this.bullets[i];
                const e = this.enemies[j];
                if (b && e && b.x < e.x + e.width && b.x + b.width > e.x && b.y < e.y + e.height && b.y + b.height > e.y) {
                    this.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    this.score += 10;
                    for (let k = 0; k < 15; k++) {
                        this.particles.push({ x: e.x + e.width / 2, y: e.y + e.height / 2, vx: (Math.random() - 0.5) * 200, vy: (Math.random() - 0.5) * 200, size: Math.random() * 3 + 1, life: 0.5 });
                    }
                    break; 
                }
            }
        }

        // 플레이어와 적
        if (this.enemies.some(e => this.player.x < e.x + e.width && this.player.x + this.player.width > e.x && this.player.y < e.y + e.height && this.player.y + this.player.height > e.y)) {
            this.gameOver();
        }
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
            this.ctx.fillStyle = `rgba(255, 159, 64, ${Math.max(0, p.life * 2)})`;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        });
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