/**
 * FusionVisuals manages the fusion section SVG and animations.
 */
class FusionVisuals {
    constructor(audioEngine) {
        this.audio = audioEngine;
        this.container = document.getElementById('fusion-section');
        this.isAnimating = false;
    }

    /**
     * Renders the SVG and binds interactions.
     * @param {AppConfig} config - Application configuration.
     */
    init(config) {
        this.audio = config?.audio || this.audio;
        
        this.container.innerHTML = `
            <style>
                .fusion-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    font-family: var(--font-main, 'Segoe UI', sans-serif);
                }
                .fusion-svg {
                    width: 80%;
                    max-width: 500px;
                    height: auto;
                    filter: drop-shadow(0 0 15px rgba(0, 240, 255, 0.2));
                }
                .nucleus {
                    fill: #00f0ff;
                    filter: url(#glow);
                    transition: opacity 0.3s;
                }
                .nucleus-2 {
                    fill: #7000ff;
                }
                .energy-particle {
                    fill: #ffffff;
                    opacity: 0;
                }
                .trigger-btn {
                    margin-top: 24px;
                    padding: 12px 24px;
                    background: transparent;
                    border: 2px solid #00f0ff;
                    color: #00f0ff;
                    font-size: 16px;
                    font-weight: 600;
                    letter-spacing: 1px;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                }
                .trigger-btn:hover {
                    background: #00f0ff;
                    color: #0a0e17;
                    box-shadow: 0 0 20px rgba(0, 240, 255, 0.6);
                }
                .trigger-btn:active {
                    transform: scale(0.98);
                }
                
                @keyframes pulse {
                    0%, 100% { r: 4; opacity: 0.8; }
                    50% { r: 5; opacity: 1; }
                }
                @keyframes moveLeft {
                    0% { cx: 20; opacity: 0; }
                    20% { opacity: 1; }
                    100% { cx: 50; opacity: 1; }
                }
                @keyframes moveRight {
                    0% { cx: 80; opacity: 0; }
                    20% { opacity: 1; }
                    100% { cx: 50; opacity: 1; }
                }
                @keyframes merge {
                    0% { r: 0; opacity: 0; }
                    50% { r: 7; opacity: 0.9; }
                    100% { r: 9; opacity: 1; }
                }
                @keyframes burst {
                    0% { transform: scale(0); opacity: 1; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                
                .anim-pulse { animation: pulse 2s infinite ease-in-out; }
                .anim-left { animation: moveLeft 1s ease-out forwards; }
                .anim-right { animation: moveRight 1s ease-out forwards; }
                .anim-merge { animation: merge 0.6s ease-out forwards; }
                .anim-burst { animation: burst 0.8s ease-out forwards; }
            </style>
            <div class="fusion-container">
                <svg class="fusion-svg" viewBox="0 0 100 100">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    <!-- Tech Grid Background -->
                    <rect width="100" height="100" fill="none" stroke="#1a2035" stroke-width="0.5"/>
                    <line x1="0" y1="50" x2="100" y2="50" stroke="#1a2035" stroke-width="0.5"/>
                    <line x1="50" y1="0" x2="50" y2="100" stroke="#1a2035" stroke-width="0.5"/>
                    <circle cx="50" cy="50" r="30" fill="none" stroke="#1a2035" stroke-width="0.5" stroke-dasharray="2 2"/>
                    
                    <!-- Nuclei -->
                    <circle id="nuc1" class="nucleus anim-pulse" cx="20" cy="50" r="4" />
                    <circle id="nuc2" class="nucleus nucleus-2 anim-pulse" cx="80" cy="50" r="4" />
                    
                    <!-- Merged Nucleus -->
                    <circle id="merged" class="nucleus" cx="50" cy="50" r="0" opacity="0" />
                    
                    <!-- Energy Particles -->
                    <g id="particles"></g>
                </svg>
                <button class="trigger-btn" id="trigger-fusion">Initiate Fusion</button>
            </div>
        `;
        
        this.audio.play('fusion_start');
        this.bindEvents();
    }

    bindEvents() {
        const btn = document.getElementById('trigger-fusion');
        if (btn) {
            btn.addEventListener('click', () => this.triggerFusion());
        }
    }

    /**
     * Triggers the fusion animation sequence.
     */
    triggerFusion() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const nuc1 = document.getElementById('nuc1');
        const nuc2 = document.getElementById('nuc2');
        const merged = document.getElementById('merged');
        const particles = document.getElementById('particles');
        
        // Reset classes
        nuc1.classList.remove('anim-pulse', 'anim-left');
        nuc2.classList.remove('anim-pulse', 'anim-right');
        merged.classList.remove('anim-merge');
        particles.innerHTML = '';
        
        // Start animation
        nuc1.classList.add('anim-left');
        nuc2.classList.add('anim-right');
        
        setTimeout(() => {
            nuc1.classList.remove('anim-left');
            nuc2.classList.remove('anim-right');
            nuc1.setAttribute('opacity', '0');
            nuc2.setAttribute('opacity', '0');
            
            merged.classList.add('anim-merge');
            this.audio.play('fusion_complete');
            
            // Create burst particles
            for (let i = 0; i < 16; i++) {
                const angle = (i / 16) * Math.PI * 2;
                const p = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                p.setAttribute('cx', '50');
                p.setAttribute('cy', '50');
                p.setAttribute('r', '2');
                p.setAttribute('class', 'energy-particle anim-burst');
                p.style.transformOrigin = '50px 50px';
                p.style.transform = `rotate(${angle}rad) translateX(25px)`;
                particles.appendChild(p);
            }
            
            // Reset after animation completes
            setTimeout(() => {
                this.isAnimating = false;
                nuc1.setAttribute('opacity', '1');
                nuc2.setAttribute('opacity', '1');
                merged.classList.remove('anim-merge');
                merged.setAttribute('r', '0');
                merged.setAttribute('opacity', '0');
                particles.innerHTML = '';
                nuc1.classList.add('anim-pulse');
                nuc2.classList.add('anim-pulse');
            }, 1200);
            
        }, 1000);
    }
}

window.FusionVisuals = FusionVisuals;
