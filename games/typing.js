export const typing = {
    sentenceEl: document.getElementById('typing-sentence'),
    inputEl: document.getElementById('typing-input'),
    feedbackEl: document.getElementById('typing-feedback'),
    sentences: ["하늘이 푸르다.", "강물이 맑다.", "꽃이 아름답다.", "바람이 시원하다.", "햇살이 따뜻하다."],
    startTime: 0,
    inputHandler: null,
    timeoutId: null, // setTimeout을 추적하기 위한 ID

    init() {
        this.feedbackEl.textContent = '';
        this.inputEl.value = '';
        this.inputEl.disabled = false;
        
        this.inputHandler = () => this.checkTyping();
        this.inputEl.addEventListener('input', this.inputHandler);

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
            
            // 새로운 게임 시작을 위한 setTimeout 설정
            this.timeoutId = setTimeout(() => {
                this.init();
            }, 2000); 
        }
    },

    cleanup() {
        if (this.inputHandler) {
            this.inputEl.removeEventListener('input', this.inputHandler);
            this.inputHandler = null;
        }
        // 컴포넌트가 파괴될 때 setTimeout을 클리어
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        this.inputEl.disabled = true;
        this.inputEl.value = '';
        this.feedbackEl.textContent = '';
    }
};