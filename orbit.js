/**
 * Scene for orbital mechanics visualization.
 */
class OrbitScene {
    constructor() {
        this.svg = null;
        this.audio = null;
        this.container = null;
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.plutoAngle = 0;
        this.kuiperParticles = [];
        this.infoPanel = null;
        this.hoveredObject = null;
        this.listeners = null;
    }

    /**
     * Initialize the Orbit scene.
     * @param {HTMLElement} container - Container element.
     * @param {AudioController} audio - Shared audio controller.
     */
    init(container, audio) {
        this.container = container;
        this.audio = audio;
        
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', '100%');
        this.svg.style.background = 'transparent';
        this.container.appendChild(this.svg);

        this.createDefs();
        this.bgGroup = this.createGroup('bg-group');
        this.kuiperGroup = this.createGroup('kuiper-belt');
        this.orbitGroup = this.createGroup('orbits');
        this.objectsGroup = this.createGroup('objects');
        this.uiGroup = this.createGroup('ui-overlay');

        this.svg.appendChild(this.bgGroup);
        this.svg.appendChild(this.kuiperGroup);
        this.svg.appendChild(this.orbitGroup);
        this.svg.appendChild(this.objectsGroup);
        this.svg.appendChild(this.uiGroup);

        this.generateKuiperBelt();
        this.drawOrbits();
        this.drawSun();
        this.drawPluto();
        this.setupInteraction();
        this.createInfoPanel();
    }

    createDefs() {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', 'sun-glow');
        const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        blur.setAttribute('stdDeviation', '4');
        blur.setAttribute('result', 'coloredBlur');
        filter.appendChild(blur);
        const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        const mergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        mergeNode1.setAttribute('in', 'coloredBlur');
        merge.appendChild(mergeNode1);
        const mergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        mergeNode2.setAttribute('in', 'SourceGraphic');
        merge.appendChild(mergeNode2);
        filter.appendChild(merge);
        defs.appendChild(filter);

        const radialGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        radialGradient.setAttribute('id', 'sun-gradient');
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#fff');
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '40%');
        stop2.setAttribute('stop-color', '#ffdd00');
        const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop3.setAttribute('offset', '100%');
        stop3.setAttribute('stop-color', '#ff6600');
        radialGradient.appendChild(stop1);
        radialGradient.appendChild(stop2);
        radialGradient.appendChild(stop3);
        defs.appendChild(radialGradient);

        this.svg.appendChild(defs);
    }

    createGroup(className) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', className);
        return g;
    }

    generateKuiperBelt() {
        const particleCount = 300;
        const minRadius = 180; 
        const maxRadius = 350;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = minRadius + Math.random() * (maxRadius - minRadius);
            const size = 1 + Math.random() * 2;
            const opacity = 0.3 + Math.random() * 0.5;
            
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('r', size);
            circle.setAttribute('fill', '#88ccff');
            circle.setAttribute('opacity', opacity);
            circle.setAttribute('data-angle', angle);
            circle.setAttribute('data-radius', radius);
            circle.setAttribute('data-speed', (0.0001 + Math.random() * 0.0002) * (Math.random() > 0.5 ? 1 : -1));
            
            this.kuiperParticles.push(circle);
            this.kuiperGroup.appendChild(circle);
        }
    }

    drawOrbits() {
        this.drawOrbitPath(150, '#4488ff', 0.01);
        this.drawOrbitPath(120, '#00f3ff', 0.02, true);
    }

    drawOrbitPath(radius, color, speed, isElliptical = false) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const a = radius;
        const b = isElliptical ? radius * 0.75 : radius;
        const cx = 0;
        const cy = 0;
        
        const d = `M ${cx - a} ${cy} A ${a} ${b} 0 1 0 ${cx + a} ${cy} A ${a} ${b} 0 1 0 ${cx - a} ${cy}`;
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '1');
        path.setAttribute('stroke-dasharray', '4 4');
        path.setAttribute('opacity', '0.4');
        path.setAttribute('data-speed', speed);
        
        this.orbitGroup.appendChild(path);
    }

    drawSun() {
        const sun = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        sun.setAttribute('cx', 0);
        sun.setAttribute('cy', 0);
        sun.setAttribute('r', 25);
        sun.setAttribute('fill', 'url(#sun-gradient)');
        sun.setAttribute('filter', 'url(#sun-glow)');
        sun.setAttribute('class', 'interactive-object');
        sun.setAttribute('data-name', 'Sun');
        sun.setAttribute('data-info', 'The Sun contains 99.86% of the Solar System\'s mass.');
        
        this.objectsGroup.appendChild(sun);
    }

    drawPluto() {
        this.plutoGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.plutoGroup.setAttribute('class', 'interactive-object');
        this.plutoGroup.setAttribute('data-name', 'Pluto');
        this.plutoGroup.setAttribute('data-info', 'Pluto is a dwarf planet in the Kuiper Belt. It has 5 moons and a thin atmosphere.');
        
        const pluto = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pluto.setAttribute('r', 8);
        pluto.setAttribute('fill', '#a0a0a0');
        pluto.setAttribute('stroke', '#00f3ff');
        pluto.setAttribute('stroke-width', '1');
        this.plutoGroup.appendChild(pluto);
        
        const heart = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        heart.setAttribute('d', 'M 0 -3 C -3 -6, -6 -3, -3 0 C 0 3, 0 6, 0 6 C 0 6, 0 3, 3 0 C 6 -3, 3 -6, 0 -3 Z');
        heart.setAttribute('fill', '#c0c0c0');
        heart.setAttribute('opacity', '0.8');
        this.plutoGroup.appendChild(heart);
        
        this.objectsGroup.appendChild(this.plutoGroup);
    }

    setupInteraction() {
        const handleWheel = (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.scale *= delta;
            this.scale = Math.max(0.5, Math.min(5, this.scale));
        };

        const handleMouseDown = (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        };

        const handleMouseMove = (e) => {
            if (this.isDragging) {
                const dx = e.clientX - this.lastMouseX;
                const dy = e.clientY - this.lastMouseY;
                this.offsetX += dx;
                this.offsetY += dy;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        };

        const handleMouseUp = () => {
            this.isDragging = false;
        };

        const handleMouseOver = (e) => {
            if (e.target.classList.contains('interactive-object')) {
                this.hoveredObject = e.target;
                try { if (this.audio && typeof this.audio.play === 'function') this.audio.play('hover', 0.2); } catch (e) {}
                this.showInfo(e.target.getAttribute('data-name'), e.target.getAttribute('data-info'));
            }
        };

        const handleMouseOut = (e) => {
            if (e.target.classList.contains('interactive-object')) {
                this.hoveredObject = null;
                this.hideInfo();
            }
        };

        this.container.addEventListener('wheel', handleWheel, { passive: false });
        this.container.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        this.svg.addEventListener('mouseover', handleMouseOver);
        this.svg.addEventListener('mouseout', handleMouseOut);

        this.listeners = {
            wheel: handleWheel,
            mousedown: handleMouseDown,
            mousemove: handleMouseMove,
            mouseup: handleMouseUp,
            mouseover: handleMouseOver,
            mouseout: handleMouseOut
        };
    }

    createInfoPanel() {
        this.infoPanel = document.createElement('div');
        this.infoPanel.className = 'orbit-info-panel';
        this.infoPanel.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(10, 10, 18, 0.85);
            border: 1px solid var(--accent-color);
            border-radius: 8px;
            padding: 16px;
            color: var(--text-color);
            font-family: var(--font-main);
            max-width: 300px;
            backdrop-filter: blur(10px);
            transform: translateX(120%);
            transition: transform 0.3s ease;
            z-index: 10;
            pointer-events: none;
        `;
        this.container.appendChild(this.infoPanel);
    }

    showInfo(name, info) {
        this.infoPanel.innerHTML = `<h3 style="margin:0 0 8px 0; color:var(--accent-color)">${name}</h3><p style="margin:0; font-size:14px; line-height:1.5">${info}</p>`;
        this.infoPanel.style.transform = 'translateX(0)';
    }

    hideInfo() {
        this.infoPanel.style.transform = 'translateX(120%)';
    }

    /**
     * Update frame.
     * @param {AnimationState} state - Animation state.
     */
    update(state) {
        const delta = state.delta;
        
        this.svg.setAttribute('transform', `translate(${this.offsetX}, ${this.offsetY}) scale(${this.scale})`);

        this.kuiperParticles.forEach(p => {
            const angle = parseFloat(p.getAttribute('data-angle')) + parseFloat(p.getAttribute('data-speed')) * delta * 60;
            const radius = parseFloat(p.getAttribute('data-radius'));
            p.setAttribute('data-angle', angle);
            p.setAttribute('cx', Math.cos(angle) * radius);
            p.setAttribute('cy', Math.sin(angle) * radius);
        });

        this.plutoAngle += 0.005 * delta * 60;
        const plutoX = Math.cos(this.plutoAngle) * 120;
        const plutoY = Math.sin(this.plutoAngle) * 90;
        this.plutoGroup.setAttribute('transform', `translate(${plutoX}, ${plutoY})`);
    }

    /**
     * Cleanup resources.
     */
    destroy() {
        if (this.listeners) {
            this.container.removeEventListener('wheel', this.listeners.wheel);
            this.container.removeEventListener('mousedown', this.listeners.mousedown);
            window.removeEventListener('mousemove', this.listeners.mousemove);
            window.removeEventListener('mouseup', this.listeners.mouseup);
            this.svg.removeEventListener('mouseover', this.listeners.mouseover);
            this.svg.removeEventListener('mouseout', this.listeners.mouseout);
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
