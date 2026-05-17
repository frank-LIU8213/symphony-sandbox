document.addEventListener('DOMContentLoaded', () => {
    const audio = new AudioEngine();
    audio.init();
    const fusion = new FusionVisuals(audio);
    fusion.init();
    const fission = new FissionVisuals(audio);
    fission.init();
    const quiz = new QuizManager(audio);
    quiz.init();
});