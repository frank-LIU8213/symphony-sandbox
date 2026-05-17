document.addEventListener('DOMContentLoaded', () => {
    const audio = new AudioEngine();
    audio.init();

    const config = { audio };

    const fusion = new FusionVisuals(audio);
    fusion.init();

    const fission = new FissionVisuals(audio);
    fission.init();

    const quiz = new QuizManager(audio);
    quiz.init();

    // Volume Control
    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            audio.setVolume(parseFloat(e.target.value));
        });
    }

    // Mute Toggle
    const muteToggle = document.getElementById('mute-toggle');
    if (muteToggle) {
        muteToggle.addEventListener('click', () => {
            audio.toggle(!audio.enabled);
            muteToggle.textContent = audio.enabled ? 'Mute' : 'Unmute';
        });
    }

    // Override QuizManager to load questions and submit to API
    QuizManager.prototype.start = function() {
        this.audio.play('fusion_start');
        this.container.innerHTML = '<div id="quiz-ui"><h2>Test Your Knowledge</h2><div id="quiz-questions"></div><div id="quiz-feedback"></div></div>';
        
        fetch('/api/quiz/questions')
            .then(res => res.json())
            .then(questions => {
                const questionsContainer = document.getElementById('quiz-questions');
                questions.forEach(q => {
                    const qDiv = document.createElement('div');
                    qDiv.className = 'quiz-question';
                    qDiv.innerHTML = `
                        <p>${q.question}</p>
                        <div class="quiz-options">
                            ${q.options.map(opt => `
                                <button onclick="window.quizManager.submitAnswer('${q.id}', '${opt}')">${opt}</button>
                            `).join('')}
                        </div>
                    `;
                    questionsContainer.appendChild(qDiv);
                });
            })
            .catch(err => {
                console.error("Failed to load questions", err);
                this.renderFallbackQuestions();
            });
    };

    QuizManager.prototype.renderFallbackQuestions = function() {
        const questions = [
            { id: 'q1', question: 'What process powers the sun?', options: ['Fission', 'Fusion', 'Decay', 'Combustion'] },
            { id: 'q2', question: 'What element is commonly split in nuclear fission?', options: ['Hydrogen', 'Carbon', 'Uranium', 'Oxygen'] },
            { id: 'q3', question: 'What is released in large amounts during nuclear reactions?', options: ['Sound', 'Light', 'Energy', 'Magnetism'] }
        ];
        const questionsContainer = document.getElementById('quiz-questions');
        questions.forEach(q => {
            const qDiv = document.createElement('div');
            qDiv.className = 'quiz-question';
            qDiv.innerHTML = `
                <p>${q.question}</p>
                <div class="quiz-options">
                    ${q.options.map(opt => `
                        <button onclick="window.quizManager.submitAnswer('${q.id}', '${opt}')">${opt}</button>
                    `).join('')}
                </div>
            `;
            questionsContainer.appendChild(qDiv);
        });
    };

    QuizManager.prototype.submitAnswer = function(questionId, answer) {
        fetch('/api/quiz/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionId, answer })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const feedbackEl = document.getElementById('quiz-feedback');
                feedbackEl.textContent = data.result.feedback;
                if (data.result.score === 1) {
                    this.audio.play('correct');
                } else {
                    this.audio.play('wrong');
                }
            }
        });
    };

    // Expose quizManager to window for onclick handlers
    window.quizManager = quiz;

    // Add trigger buttons to fusion and fission sections
    const fusionTrigger = document.createElement('button');
    fusionTrigger.textContent = 'Trigger Fusion';
    fusionTrigger.onclick = () => fusion.triggerFusion();
    document.getElementById('fusion-section').appendChild(fusionTrigger);

    const fissionTrigger = document.createElement('button');
    fissionTrigger.textContent = 'Trigger Fission';
    fissionTrigger.onclick = () => fission.triggerFission();
    document.getElementById('fission-section').appendChild(fissionTrigger);
});
