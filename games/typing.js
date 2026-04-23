export const typing = {
    sentenceEl: document.getElementById('typing-sentence'),
    inputEl: document.getElementById('typing-input'),
    feedbackEl: document.getElementById('typing-feedback'),
    sentences: ["하늘이 푸르다.", "강물이 맑다.", "꽃이 아름답다.", "바람이 시원하다.", "햇살이 따뜻하다.",
    "인생은 아름다워라.", "오늘도 좋은 하루 되세요.", "나는 대한민국의 개발자다.", "이것은 멋진 타자 연습 게임입니다.", "코딩은 즐거워, 때로는 힘들지만.",
    "세상에서 가장 좋은 프로그래밍 언어는 무엇일까요?", "자바스크립트로 웹 개발을 시작해보세요.", "파이썬은 데이터 분석에 강력한 도구입니다.", "인공지능의 미래는 밝습니다.", "함께 성장하는 개발자가 됩시다.",
    "포기하지 않으면 실패는 없다.", "꾸준함이 실력이다.", "노력은 배신하지 않는다.", "실패는 성공의 어머니다.", "하면 된다, Just do it!",
    "도전 없이는 성장도 없다.", "미래를 예측하는 가장 좋은 방법은 미래를 창조하는 것이다.", "배움에는 끝이 없다.", "최고의 복수는 엄청난 성공이다.", "인생은 한 번뿐, 후회 없이 살자."],
    startTime: 0,
    inputHandler: null,
    keydownHandler: null, // 스페이스바 문제를 해결하기 위한 핸들러
    timeoutId: null,

    init() {
        this.feedbackEl.textContent = '';
        this.inputEl.value = '';
        this.inputEl.disabled = false;
        
        this.inputHandler = () => this.checkTyping();
        // keydown 이벤트를 textarea에 직접 연결하여 이벤트 전파를 막습니다.
        this.keydownHandler = (e) => {
            // 다른 전역 리스너가 스페이스바를 막지 못하도록 이벤트 전파를 중단합니다.
            if (e.code === 'Space') {
                e.stopPropagation();
            }
        };
        
        this.inputEl.addEventListener('input', this.inputHandler);
        this.inputEl.addEventListener('keydown', this.keydownHandler);

        const sentence = this.sentences[Math.floor(Math.random() * this.sentences.length)];
        this.sentenceEl.textContent = sentence;
        this.inputEl.focus();
        this.startTime = Date.now();
    },

    checkTyping() {
        const sentence = this.sentenceEl.textContent;
        const typed = this.inputEl.value;

        if (sentence.startsWith(typed)) {
             this.feedbackEl.textContent = '';
        } else {
             this.feedbackEl.textContent = '오타! 다시 입력하세요.';
        }

        if (sentence === typed) {
            const endTime = Date.now();
            const time = (endTime - this.startTime) / 1000;
            const wpm = Math.round((typed.length / 5) * (60 / time));
            this.feedbackEl.textContent = `성공! 속도: 약 ${wpm} WPM`;
            this.inputEl.disabled = true;
            
            this.timeoutId = setTimeout(() => this.init(), 2000);
        }
    },

    cleanup() {
        if (this.inputHandler) {
            this.inputEl.removeEventListener('input', this.inputHandler);
            this.inputHandler = null;
        }
        if (this.keydownHandler) {
            this.inputEl.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        this.inputEl.disabled = true;
        this.inputEl.value = '';
        this.feedbackEl.textContent = '';
    }
};