
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

        // 점프 동작을 처리하는 함수
        const handleJump = (e) => {
            e.preventDefault(); // 터치 시 확대/스크롤 및 스페이스바 스크롤 방지
            if (this.state.over) {
                this.reset();
            } else {
                // 플레이어가 빠르게 상승 중일 때는 점프를 막아 부드러운 조작감을 만듭니다.
                if (this.player.velocityY > -5) { 
                   this.player.velocityY = this.player.jump;
                }
            }
        };

        this.keyHandler = e => { if (e.code === 'Space') handleJump(e); };
        this.touchHandler = e => handleJump(e);

        // document 전체에 이벤트 리스너를 추가하여 화면 어디를 누르든 반응하도록 합니다.
        document.addEventListener('keydown', this.keyHandler);
        document.addEventListener('touchstart', this.touchHandler, { passive: false }); // preventDefault를 사용하므로 passive: false 설정
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

        // 플레이어 물리
        this.player.velocityY += this.player.gravity;
        this.player.y += this.player.velocityY;

        // 바닥과 천장 충돌 처리 (게임오버 대신 멈춤)
        if (this.player.y > this.canvas.height - this.player.height) {
            this.player.y = this.canvas.height - this.player.height;
            this.player.velocityY = 0;
        }
        if (this.player.y < 0) {
           this.player.y = 0;
           this.player.velocityY = 0;
        }

        // 장애물 생성
        if (this.frame % 90 === 0) {
            const gapHeight = 120;
            const gapY = Math.random() * (this.canvas.height - gapHeight);
            this.obstacles.push({ x: this.canvas.width, y: 0, width: 40, height: gapY, type: 'top' });
            this.obstacles.push({ x: this.canvas.width, y: gapY + gapHeight, width: 40, height: this.canvas.height - gapY - gapHeight, type: 'bottom' });
        }

        // 장애물 이동
        this.obstacles.forEach(o => o.x -= 3);
        this.obstacles = this.obstacles.filter(o => o.x + o.width > 0);

        // 장애물 충돌 감지
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
        // document에 추가했던 이벤트 리스너를 깨끗하게 제거합니다.
        if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
        if (this.touchHandler) document.removeEventListener('touchstart', this.touchHandler);
        this.keyHandler = null;
        this.touchHandler = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.gameOverMsg.classList.add('hidden');
    }
};