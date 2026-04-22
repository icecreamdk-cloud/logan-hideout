document.addEventListener('DOMContentLoaded', () => {
    // Multiplication Game
    const multiplicationProblem = document.getElementById('multiplication-problem');
    const multiplicationAnswer = document.getElementById('multiplication-answer');
    const multiplicationSubmit = document.getElementById('multiplication-submit');

    let num1, num2, correctAnswer;
    let consecutiveCorrect = 0;

    function generateProblem() {
        num1 = Math.floor(Math.random() * 6) + 4; // 4 to 9
        num2 = Math.floor(Math.random() * 9) + 1; // 1 to 9
        correctAnswer = num1 * num2;
        multiplicationProblem.textContent = `${num1} x ${num2} = ?`;
    }

    function checkAnswer() {
        const userAnswer = parseInt(multiplicationAnswer.value);
        if (userAnswer === correctAnswer) {
            consecutiveCorrect++;
            if (consecutiveCorrect === 3) {
                multiplicationProblem.textContent = 'Pass!';
                consecutiveCorrect = 0;
            } else {
                generateProblem();
            }
        } else {
            consecutiveCorrect = 0;
            multiplicationProblem.textContent = 'Wrong! Try again.';
            setTimeout(generateProblem, 1000);
        }
        multiplicationAnswer.value = '';
    }

    multiplicationSubmit.addEventListener('click', checkAnswer);
    multiplicationAnswer.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            checkAnswer();
        }
    });

    generateProblem();

    // Accordion functionality
    const accordions = document.querySelectorAll('.game-accordion .game-header');

    accordions.forEach(accordion => {
        accordion.addEventListener('click', () => {
            const content = accordion.nextElementSibling;
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        });
    });
});
