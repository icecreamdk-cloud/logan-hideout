export const multiplication = {
    problemEl: null,
    answerEl: null,
    submitBtn: null,
    feedbackEl: null,
    num1: 0, num2: 0, consecutiveCorrect: 0,
    enterHandler: null,
    submitHandler: null,

    init() {
        this.problemEl = document.getElementById('multiplication-problem');
        this.answerEl = document.getElementById('multiplication-answer');
        this.submitBtn = document.getElementById('multiplication-submit');
        this.feedbackEl = document.getElementById('multiplication-feedback');

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
        this.num1 = Math.floor(Math.random() * 6) + 4;
        this.num2 = Math.floor(Math.random() * 9) + 1;
        this.problemEl.textContent = `${this.num1} x ${this.num2} = ?`;
        this.answerEl.value = '';
        this.answerEl.focus();
    },

    checkAnswer() {
        const userAnswer = this.answerEl.value.trim();
        if (userAnswer !== '' && parseInt(userAnswer) === this.num1 * this.num2) {
            this.consecutiveCorrect++;
            this.feedbackEl.textContent = `정답! (${this.consecutiveCorrect}번 연속)`;
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