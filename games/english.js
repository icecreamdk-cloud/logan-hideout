export const english = {
    problemEl: document.getElementById('english-problem'),
    answerEl: document.getElementById('english-answer'),
    submitBtn: document.getElementById('english-submit'),
    feedbackEl: document.getElementById('english-feedback'),
    words: {
        "사과": "apple", "바나나": "banana", "고양이": "cat", "개": "dog", "집": "house",
        "책": "book", "차": "car", "의자": "chair", "책상": "desk", "컴퓨터": "computer",
        "물": "water", "학교": "school", "학생": "student", "선생님": "teacher", "우유": "milk",
        "빵": "bread", "연필": "pencil", "공책": "notebook", "창문": "window", "문": "door"
    },
    currentWord: '',
    consecutiveCorrect: 0,
    enterHandler: null,
    submitHandler: null,

    init() {
        this.consecutiveCorrect = 0;
        this.feedbackEl.textContent = '';
        this.answerEl.value = '';
        this.generateProblem();

        this.enterHandler = (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        };
        this.submitHandler = () => this.checkAnswer();

        this.answerEl.addEventListener('keyup', this.enterHandler);
        this.submitBtn.addEventListener('click', this.submitHandler);
    },

    generateProblem() {
        const keys = Object.keys(this.words);
        this.currentWord = keys[Math.floor(Math.random() * keys.length)];
        this.problemEl.textContent = this.currentWord;
        this.answerEl.value = '';
        this.answerEl.focus();
    },

    checkAnswer() {
        if (this.answerEl.value.toLowerCase() === this.words[this.currentWord]) {
            this.consecutiveCorrect++;
            this.feedbackEl.textContent = `정답!`;
            this.generateProblem();
        } else {
            this.consecutiveCorrect = 0;
            this.feedbackEl.textContent = '오답! 다시 시도하세요.';
            this.answerEl.value = '';
            this.answerEl.focus();
        }
    },

    cleanup() {
        if (this.enterHandler) {
            this.answerEl.removeEventListener('keyup', this.enterHandler);
        }
        if (this.submitHandler) {
            this.submitBtn.removeEventListener('click', this.submitHandler);
        }
        this.enterHandler = null;
        this.submitHandler = null;
    }
};