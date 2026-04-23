import { multiplication } from './games/multiplication.js';
import { english } from './games/english.js';
import { typing } from './games/typing.js';
import { gravity } from './games/gravity.js';
import { jumping } from './games/jumping.js';
import { shooting } from './games/shooting.js';

// --- 상태 관리 (모듈 레벨) --- //
export const keyState = {}; // 키보드 상태 (전역으로 export)

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 --- //
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('game-container');
    const backToMenuBtns = document.querySelectorAll('.back-to-menu-btn');
    const gameLinks = document.querySelectorAll('.game-link');
    const gameViews = document.querySelectorAll('.game-view');

    // --- 상태 관리 (DOM 로드 후) --- //
    let activeGame = null;       // 현재 활성화된 게임 객체
    let mainGameLoopId = null;   // requestAnimationFrame ID
    let lastTime = 0;            // DeltaTime 계산을 위한 마지막 시간 저장

    // --- 게임 맵 --- //
    const games = {
        'multiplication': multiplication,
        'english': english,
        'typing': typing,
        'falling-square': gravity,
        'no-guri': jumping,
        'shooting-1984': shooting
    };

    // --- 중앙 게임 루프 (DeltaTime 적용) --- //
    function mainGameLoop(timestamp) {
        if (lastTime === 0) {
            lastTime = timestamp;
        }
        // 프레임 간의 시간 차이를 계산 (초 단위)
        const deltaTime = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        if (activeGame && activeGame.update) {
            // 모든 게임의 update 함수에 deltaTime을 전달합니다.
            activeGame.update(deltaTime);
        }
        if (activeGame && activeGame.draw) {
            activeGame.draw();
        }
        mainGameLoopId = requestAnimationFrame(mainGameLoop);
    }

    function stopMainGameLoop() {
        if (mainGameLoopId) {
            cancelAnimationFrame(mainGameLoopId);
            mainGameLoopId = null;
        }
    }

    function startMainGameLoop() {
        if (!mainGameLoopId) {
            lastTime = 0; // 루프를 시작할 때 lastTime을 초기화합니다.
            mainGameLoopId = requestAnimationFrame(mainGameLoop);
        }
    }

    // --- 내비게이션 및 게임 관리 --- //
    function cleanupCurrentGame() {
        stopMainGameLoop();
        if (activeGame && activeGame.cleanup) {
            activeGame.cleanup();
        }
        activeGame = null;
    }

    function showGame(gameId) {
        cleanupCurrentGame(); // 이전 게임 정리

        mainMenu.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        gameViews.forEach(view => view.classList.add('hidden'));
        const gameView = document.getElementById(`${gameId}-game`);
        if (gameView) {
            gameView.classList.remove('hidden');
        }

        activeGame = games[gameId];
        if (activeGame) {
            activeGame.init();
            if (activeGame.update && activeGame.draw) {
                startMainGameLoop();
            }
        }
    }

    function showMainMenu() {
        cleanupCurrentGame();
        mainMenu.classList.remove('hidden');
        gameContainer.classList.add('hidden');
    }

    // --- 이벤트 리스너 설정 --- //
    window.addEventListener('keydown', e => keyState[e.code] = true);
    window.addEventListener('keyup', e => keyState[e.code] = false);

    gameLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const gameId = e.target.dataset.game;
            showGame(gameId);
        });
    });

    backToMenuBtns.forEach(btn => {
        btn.addEventListener('click', showMainMenu);
    });

    // --- 초기화 --- //
    showMainMenu();
});