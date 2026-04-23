import { multiplication } from './games/multiplication.js';
import { english } from './games/english.js';
import { typing } from './games/typing.js';
import { gravity } from './games/gravity.js';
import { jumping } from './games/jumping.js';
import { shooting } from './games/shooting.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 --- //
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('game-container');
    const backToMenuBtns = document.querySelectorAll('.back-to-menu-btn');
    const gameLinks = document.querySelectorAll('.game-link');
    const gameViews = document.querySelectorAll('.game-view');

    // --- 상태 관리 --- //
    export const keyState = {}; // 키보드 상태 (슈팅 게임 등에서 사용)
    let activeGame = null;       // 현재 활성화된 게임 객체
    let mainGameLoopId = null;   // requestAnimationFrame ID

    // --- 게임 맵 --- //
    const games = {
        'multiplication': multiplication,
        'english': english,
        'typing': typing,
        'falling-square': gravity, // HTML의 data-game 속성과 매칭
        'no-guri': jumping,
        'shooting-1984': shooting
    };

    // --- 중앙 게임 루프 --- //
    function mainGameLoop() {
        if (activeGame && activeGame.update) {
            activeGame.update();
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
            mainGameLoop();
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

        // UI 전환
        mainMenu.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        gameViews.forEach(view => view.classList.add('hidden'));
        const gameView = document.getElementById(`${gameId}-game`);
        if (gameView) {
            gameView.classList.remove('hidden');
        }

        // 새 게임 시작
        activeGame = games[gameId];
        if (activeGame) {
            activeGame.init();
            // 캔버스 게임인 경우에만 메인 루프 시작
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