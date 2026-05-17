/**
 * FissionVisuals manages the fission section SVG and animations.
 */
class FissionVisuals {
    constructor() {
        this.audio = null;
        this.container = document.getElementById('fission-section');
        this.isAnimating = false;
    }

    /**
     * Renders the SVG and binds interactions.
     * @param {AppConfig} config - Configuration object containing audio engine.
     */
    init(config) {
        this.audio = config?.audio || config;
        
        this.container.innerHTML = `
            <style>
                /* Tech Grid */
                .grid line { stroke: var(--color-primary, #00f0ff); }
                
                /* Animations */
                @keyframes neutronApproach {
                    0% { transform: translate(10px, 50px); }
                    100% { transform: translate(48px, 50px); }
                }
                @keyframes nucleusShake {
                    0%, 100% { transform: translate(50px, 50px) rotate(0deg); }
                    25% { transform: translate(50px, 50px) rotate(-5deg); }
                    50% { transform: translate(50px, 50px) rotate(5deg); }
                    75% { transform: translate(50px, 50px) rotate(-5deg); }
                }
                @keyframes fragmentOut1 {
                    0% { transform: translate(50px, 50px); opacity: 1; }
                    100% { transform: translate(20px, 30px); opacity: 1; }
                }
                @keyframes fragmentOut2 {
                    0% { transform: translate(50px, 50px); opacity: 1; }
                    100% { transform: translate(80px, 70px); opacity: 1; }
                }
                @keyframes neutronRelease {
                    0% { transform: translate(50px, 50px); opacity: 0; }
                    20% { opacity: 1; }
                    100% { transform: translate(20px, 20px); opacity: 0; }
                }
                @keyframes energyBurst {
                    0% { r: 0; opacity: 0; }
                    20% { r: 15; opacity: 0.8; }
                    100% { r: 40; opacity: 0; }
                }
                
                /* Element States */
                .neutron-incoming { animation: neutronApproach 1s ease-in forwards; }
                .nucleus { 
                    transform: translate(50px, 50px); 
                    animation: nucleusShake 0.5s ease-in-out 0.8s forwards; 
                }
                .fragment-1 { 
                    transform: translate(50px, 50px); 
                    animation: fragmentOut1 0.8s ease-out 1.3s forwards; 
                }
                .fragment-2 { 
                    transform: translate(50px, 50px); 
                    animation: fragmentOut2 0.8s ease-out 1.3s forwards; 
                }
                .neutron-released { 
                    transform: translate(50px, 50px); 
                    animation: neutronRelease 1s ease-out 1.3s forwards; 
                }
                .energy-burst { 
                    animation: energyBurst 1.2s ease-out 1.3s forwards; 
                }
                
                .fission-svg { width: 100%; height: 100%; cursor: pointer; }
                .label { transition: opacity 0.3s; }
            </style>
            <svg id="fission-svg" class="fission-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.8"/>
                        <stop offset="100%" stop-color="#00f0ff" stop-opacity="0"/>
                    </radialGradient>
                    <filter id="blur">
                        <feGaussianBlur stdDeviation="1.5"/>
                    </filter>
                </defs>

                <!-- Grid -->
                <g class="grid" opacity="0.1">
                    <line x1="0" y1="25" x2="100" y2="25"/>
                    <line x1="0" y1="50" x2="100" y2="50"/>
                    <line x1="0" y1="75" x2="100" y2="75"/>
                    <line x1="25" y1="0" x2="25" y2="100"/>
                    <line x1="50" y1="0" x2="50" y2="100"/>
                    <line x1="75" y1="0" x2="75" y2="100"/>
                </g>

                <!-- Incoming Neutron -->
                <g class="neutron-incoming">
                    <circle cx="0" cy="0" r="2" fill="#e0e6ed" filter="url(#blur)"/>
                    <circle cx="0" cy="0" r="1" fill="#fff"/>
                </g>

                <!-- Uranium Nucleus -->
                <g class="nucleus">
                    <circle cx="-3" cy="-3" r="2.5" fill="#7000ff"/>
                    <circle cx="3" cy="-3" r="2.5" fill="#00f0ff"/>
                    <circle cx="-3" cy="3" r="2.5" fill="#00f0ff"/>
                    <circle cx="3" cy="3" r="2.5" fill="#7000ff"/>
                    <circle cx="0" cy="0" r="2.5" fill="#e0e6ed"/>
                    <circle cx="-5" cy="0" r="2.5" fill="#7000ff"/>
                    <circle cx="5" cy="0" r="2.5" fill="#00f0ff"/>
                    <circle cx="0" cy="-5" r="2.5" fill="#e0e6ed"/>
                    <circle cx="0" cy="5" r="2.5" fill="#7000ff"/>
                </g>

                <!-- Fission Fragments -->
                <g class="fragment-1" opacity="0">
                    <circle cx="-15" cy="-10" r="3" fill="#7000ff"/>
                    <circle cx="-10" cy="-15" r="3" fill="#00f0ff"/>
                    <circle cx="-20" cy="-5" r="3" fill="#e0e6ed"/>
                </g>
                <g class="fragment-2" opacity="0">
                    <circle cx="15" cy="10" r="3" fill="#00f0ff"/>
                    <circle cx="10" cy="15" r="3" fill="#7000ff"/>
                    <circle cx="20" cy="5" r="3" fill="#e0e6ed"/>
                </g>

                <!-- Released Neutrons -->
                <g class="neutron-released" opacity="0">
                    <circle cx="-25" cy="-20" r="1.5" fill="#fff"/>
                    <circle cx="25" cy="20" r="1.5" fill="#fff"/>
                    <circle cx="0" cy="-30" r="1.5" fill="#fff"/>
                </g>

                <!-- Energy Burst -->
                <circle class="energy-burst" cx="50" cy="50" r="0" fill="url(#glow)" opacity="0"/>
                
                <!-- Labels -->
                <text x="50" y="90" text-anchor="middle" fill="#00f0ff" font-size="3" font-family="monospace" class="label">U-235 Fission</text>
            </svg>
        `;

        if (this.audio) {
            this.audio.play('fission_start');
        }
        console.log('FissionVisuals initialized');

        // Bind click to trigger
        this.container.addEventListener('click', () => this.triggerFission());
    }

    /**
     * Triggers the fission animation sequence.
     */
    triggerFission() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        if (this.audio) {
            this.audio.play('fission_complete');
        }

        const svg = this.container.querySelector('svg');
        // Reset animations by cloning and replacing the SVG
        const newSvg = svg.cloneNode(true);
        svg.parentNode.replaceChild(newSvg, svg);
        
        // Re-bind click event
        this.container.addEventListener('click', () => this.triggerFission());

        // Reset flag after animation completes (~2.5s)
        setTimeout(() => {
            this.isAnimating = false;
        }, 2500);
    }
}

window.FissionVisuals = FissionVisuals;
