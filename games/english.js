export const english = {
    problemEl: null,
    answerEl: null,
    submitBtn: null,
    feedbackEl: null,
    words: {
        "사과": "apple", "바나나": "banana", "고양이": "cat", "개": "dog", "집": "house",
        "책": "book", "차": "car", "의자": "chair", "책상": "desk", "컴퓨터": "computer",
        "물": "water", "학교": "school", "학생": "student", "선생님": "teacher", "우유": "milk",
        "빵": "bread", "연필": "pencil", "공책": "notebook", "창문": "window", "문": "door",
        "사랑": "love", "친구": "friend", "가족": "family", "행복": "happiness", "슬픔": "sadness",
        "음악": "music", "영화": "movie", "운동": "exercise", "음식": "food", "커피": "coffee",
        "공부": "study", "일": "work", "시간": "time", "돈": "money", "꿈": "dream",
        "날씨": "weather", "봄": "spring", "여름": "summer", "가을": "autumn", "겨울": "winter",
        "하늘": "sky", "바다": "sea", "산": "mountain", "강": "river", "나무": "tree",
        "꽃": "flower", "태양": "sun", "달": "moon", "별": "star"
    },
    currentWord: '',
    consecutiveCorrect: 0,
    enterHandler: null,
    submitHandler: null,

    init() {
        this.problemEl = document.getElementById('english-problem');
        this.answerEl = document.getElementById('english-answer');
        this.submitBtn = document.getElementById('english-submit');
        this.feedbackEl = document.getElementById('english-feedback');

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
        if (this.answerEl.value.trim().toLowerCase() === this.words[this.currentWord]) {
            this.consecutiveCorrect++;
            this.feedbackEl.textContent = `정답! (${this.consecutiveCorrect}번 연속)`;
            this.generateProblem();
        } else {
            this.consecutiveCorrect = 0;
            this.feedbackEl.textContent = '';
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