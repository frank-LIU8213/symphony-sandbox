/**
 * QuizManager handles the interactive quiz logic.
 */
class QuizManager {
    constructor(audioEngine) {
        this.audio = audioEngine;
        this.container = document.getElementById('quiz-section');
        
        this.questions = [
            {
                id: 'q1',
                question: '核聚变主要发生在哪种天体中？',
                options: ['地球', '太阳', '月球', '火星'],
                correct: 1,
                feedback: '太阳等恒星的核心通过核聚变将氢转化为氦，释放巨大能量。'
            },
            {
                id: 'q2',
                question: '核裂变过程中释放的能量主要来自哪里？',
                options: ['电子跃迁', '原子核分裂', '化学反应', '引力坍缩'],
                correct: 1,
                feedback: '重原子核（如铀-235）分裂成较轻的原子核时，质量亏损转化为巨大能量。'
            },
            {
                id: 'q3',
                question: '以下哪种元素常用作核裂变反应堆的燃料？',
                options: ['氢', '氦', '铀', '碳'],
                correct: 2,
                feedback: '铀-235 是最常用的核裂变燃料，因为它容易发生链式反应。'
            },
            {
                id: 'q4',
                question: '核聚变相比核裂变的主要优势是什么？',
                options: ['技术更成熟', '燃料更丰富且放射性废物少', '更容易控制', '释放能量更少'],
                correct: 1,
                feedback: '聚变燃料（如氘、氚）在海水中储量丰富，且产生的放射性废物远少于裂变。'
            },
            {
                id: 'q5',
                question: '国际热核聚变实验堆（ITER）位于哪个国家？',
                options: ['美国', '中国', '法国', '德国'],
                correct: 2,
                feedback: 'ITER 位于法国南部的卡达拉舍，是目前全球最大的聚变实验项目。'
            }
        ];
        
        this.currentIndex = 0;
        this.score = 0;
        this.total = this.questions.length;
        this.isAnswered = false;
    }

    init(config = {}) {
        this.container.innerHTML = `
            <div id="quiz-ui" style="width: 100%; max-width: 600px; text-align: center;">
                <h2 style="color: var(--color-primary); margin-bottom: 1rem;">Test Your Knowledge</h2>
                <div id="quiz-content"></div>
            </div>
        `;
        this.renderStartScreen();
        console.log('QuizManager initialized');
    }

    renderStartScreen() {
        const content = document.getElementById('quiz-content');
        content.innerHTML = `
            <p style="margin-bottom: 1.5rem; color: var(--color-text); line-height: 1.5;">
                Explore the fascinating world of nuclear physics with this quick quiz. 
                Test your understanding of fusion and fission processes.
            </p>
            <button id="start-quiz" style="
                background: var(--color-primary);
                color: var(--color-bg);
                border: none;
                padding: 0.75rem 1.5rem;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                border-radius: 4px;
                transition: opacity 0.2s, transform 0.1s;
            ">Start Quiz</button>
        `;
        document.getElementById('start-quiz').addEventListener('click', () => this.start());
    }

    start() {
        this.audio.play('fusion_start');
        this.currentIndex = 0;
        this.score = 0;
        this.renderQuestion();
    }

    renderQuestion() {
        const q = this.questions[this.currentIndex];
        const content = document.getElementById('quiz-content');
        this.isAnswered = false;

        content.innerHTML = `
            <div style="margin-bottom: 1rem; color: var(--color-secondary); font-size: 0.9rem; letter-spacing: 0.05em;">
                QUESTION ${this.currentIndex + 1} OF ${this.total}
            </div>
            <h3 style="color: var(--color-text); margin-bottom: 1.5rem; line-height: 1.4; font-weight: 500;">
                ${q.question}
            </h3>
            <div id="options-container" style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${q.options.map((opt, idx) => `
                    <button class="option-btn" data-index="${idx}" style="
                        background: rgba(255,255,255,0.05);
                        color: var(--color-text);
                        border: 1px solid rgba(255,255,255,0.1);
                        padding: 0.75rem;
                        text-align: left;
                        cursor: pointer;
                        border-radius: 4px;
                        transition: all 0.2s;
                        font-size: 0.95rem;
                    ">${opt}</button>
                `).join('')}
            </div>
            <div id="feedback" style="margin-top: 1rem; min-height: 3rem; font-size: 0.95rem; line-height: 1.4;"></div>
            <button id="next-btn" style="
                margin-top: 1rem;
                background: var(--color-secondary);
                color: var(--color-text);
                border: none;
                padding: 0.6rem 1.2rem;
                cursor: pointer;
                border-radius: 4px;
                display: none;
                font-weight: bold;
            ">Next Question</button>
        `;

        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                this.handleAnswer(idx);
            });
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.currentIndex++;
            if (this.currentIndex < this.total) {
                this.renderQuestion();
            } else {
                this.showResults();
            }
        });
    }

    handleAnswer(selectedIndex) {
        if (this.isAnswered) return;
        this.isAnswered = true;

        const q = this.questions[this.currentIndex];
        const isCorrect = selectedIndex === q.correct;
        const feedbackEl = document.getElementById('feedback');
        const nextBtn = document.getElementById('next-btn');
        const options = document.querySelectorAll('.option-btn');

        options.forEach((btn, idx) => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
            if (idx === q.correct) {
                btn.style.background = 'rgba(0, 255, 100, 0.2)';
                btn.style.borderColor = '#00ff64';
                btn.style.opacity = '1';
            } else if (idx === selectedIndex && !isCorrect) {
                btn.style.background = 'rgba(255, 50, 50, 0.2)';
                btn.style.borderColor = '#ff3232';
                btn.style.opacity = '1';
            }
        });

        if (isCorrect) {
            this.score++;
            this.audio.play('correct');
            feedbackEl.innerHTML = `<span style="color: #00ff64; font-weight: bold;">Correct!</span> ${q.feedback}`;
        } else {
            this.audio.play('wrong');
            feedbackEl.innerHTML = `<span style="color: #ff3232; font-weight: bold;">Incorrect.</span> ${q.feedback}`;
        }

        nextBtn.style.display = 'inline-block';
    }

    showResults() {
        this.audio.play('fusion_complete');
        const content = document.getElementById('quiz-content');
        const percentage = Math.round((this.score / this.total) * 100);
        let feedbackMsg = '';
        if (percentage === 100) feedbackMsg = 'Perfect score! You are a nuclear physics expert.';
        else if (percentage >= 80) feedbackMsg = 'Great job! You have a solid understanding.';
        else if (percentage >= 60) feedbackMsg = 'Good effort! Keep exploring nuclear science.';
        else feedbackMsg = 'Keep learning! Nuclear physics is fascinating.';

        content.innerHTML = `
            <div style="text-align: center;">
                <h3 style="color: var(--color-primary); margin-bottom: 1rem;">Quiz Complete</h3>
                <div style="font-size: 3rem; font-weight: bold; color: var(--color-text); margin-bottom: 0.5rem;">
                    ${this.score} / ${this.total}
                </div>
                <p style="color: var(--color-secondary); margin-bottom: 1.5rem; font-size: 1.1rem;">${feedbackMsg}</p>
                <button id="restart-quiz" style="
                    background: var(--color-primary);
                    color: var(--color-bg);
                    border: none;
                    padding: 0.75rem 1.5rem;
                    font-size: 1rem;
                    font-weight: bold;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: opacity 0.2s;
                ">Restart Quiz</button>
            </div>
        `;
        document.getElementById('restart-quiz').addEventListener('click', () => this.start());
    }

    submitAnswer(questionId, answer) {
        // Contract method for external submission if needed
        console.log(`Submitted ${answer} for ${questionId}`);
    }
}

window.QuizManager = QuizManager;
