/**
 * Scene for interactive Pluto visualization.
 */
class PlutoScene {
    /**
     * Initialize the Pluto scene.
     * @param {HTMLElement} container - Container element.
     * @param {AudioController} audio - Shared audio controller.
     */
    init(container, audio) {
        this.container = container;
        this.audio = audio;
        this.rotation = 0;
        this.targetRotation = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.dragSensitivity = 0.5;
        this.autoRotateSpeed = 0.15;
        this.mouseX = 0;
        this.mouseY = 0;

        this._createDOM();
        this._setupEvents();
        this._playAmbient();
    }

    /**
     * Update frame.
     * @param {AnimationState} state - Animation state.
     */
    update(state) {
        if (!this.isDragging) {
            this.targetRotation += this.autoRotateSpeed * state.delta;
        }
        
        // Smooth interpolation
        const diff = this.targetRotation - this.rotation;
        this.rotation += diff * 0.05;

        this._updateVisuals();
    }

    /**
     * Cleanup resources.
     */
    destroy() {
        this.container.innerHTML = '';
        this.container.removeEventListener('mousedown', this._onMouseDown);
        this.container.removeEventListener('mousemove', this._onMouseMove);
        this.container.removeEventListener('mouseup', this._onMouseUp);
        this.container.removeEventListener('mouseleave', this._onMouseUp);
        this.container.removeEventListener('touchstart', this._onTouchStart);
        this.container.removeEventListener('touchmove', this._onTouchMove);
        this.container.removeEventListener('touchend', this._onTouchEnd);
    }

    _createDOM() {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("viewBox", "0 0 800 600");
        svg.style.position = "absolute";
        svg.style.top = "0";
        svg.style.left = "0";
        svg.style.pointerEvents = "none";
        this.svg = svg;

        // Inject styles for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
            @keyframes pulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.5; } }
            @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
            .star { animation: twinkle 3s infinite ease-in-out; }
            .atmosphere { animation: pulse 4s infinite ease-in-out; }
            .scan-line { animation: scan 8s linear infinite; }
        `;
        svg.appendChild(style);

        const defs = document.createElementNS(svgNS, "defs");
        
        // Pluto gradient
        const plutoGrad = document.createElementNS(svgNS, "radialGradient");
        plutoGrad.setAttribute("id", "pluto-grad");
        plutoGrad.setAttribute("cx", "30%");
        plutoGrad.setAttribute("cy", "30%");
        plutoGrad.setAttribute("r", "70%");
        const stop1 = document.createElementNS(svgNS, "stop");
        stop1.setAttribute("offset", "0%");
        stop1.setAttribute("stop-color", "#8a7a6a");
        const stop2 = document.createElementNS(svgNS, "stop");
        stop2.setAttribute("offset", "100%");
        stop2.setAttribute("stop-color", "#3a2a1a");
        plutoGrad.appendChild(stop1);
        plutoGrad.appendChild(stop2);
        defs.appendChild(plutoGrad);

        // Atmosphere glow filter
        const glowFilter = document.createElementNS(svgNS, "filter");
        glowFilter.setAttribute("id", "atmos-glow");
        const feGaussian = document.createElementNS(svgNS, "feGaussianBlur");
        feGaussian.setAttribute("stdDeviation", "15");
        feGaussian.setAttribute("result", "blur");
        const feMerge = document.createElementNS(svgNS, "feMerge");
        const feMergeNode1 = document.createElementNS(svgNS, "feMergeNode");
        feMergeNode1.setAttribute("in", "blur");
        const feMergeNode2 = document.createElementNS(svgNS, "feMergeNode");
        feMergeNode2.setAttribute("in", "SourceGraphic");
        feMerge.appendChild(feMergeNode1);
        feMerge.appendChild(feMergeNode2);
        glowFilter.appendChild(feGaussian);
        glowFilter.appendChild(feMerge);
        defs.appendChild(glowFilter);

        svg.appendChild(defs);

        // Background stars
        const starsGroup = document.createElementNS(svgNS, "g");
        starsGroup.setAttribute("class", "stars");
        for (let i = 0; i < 120; i++) {
            const star = document.createElementNS(svgNS, "circle");
            star.setAttribute("cx", Math.random() * 800);
            star.setAttribute("cy", Math.random() * 600);
            star.setAttribute("r", Math.random() * 1.5 + 0.5);
            star.setAttribute("fill", "#ffffff");
            star.setAttribute("opacity", Math.random() * 0.8 + 0.2);
            star.setAttribute("class", "star");
            star.style.animationDelay = `${Math.random() * 3}s`;
            starsGroup.appendChild(star);
        }
        svg.appendChild(starsGroup);

        // Pluto group (rotates)
        this.plutoGroup = document.createElementNS(svgNS, "g");
        this.plutoGroup.setAttribute("transform", "translate(400, 300)");
        
        const plutoCircle = document.createElementNS(svgNS, "circle");
        plutoCircle.setAttribute("r", "120");
        plutoCircle.setAttribute("fill", "url(#pluto-grad)");
        plutoCircle.setAttribute("stroke", "#5a4a3a");
        plutoCircle.setAttribute("stroke-width", "2");
        
        this.plutoGroup.appendChild(plutoCircle);

        // Heart shape (Tombaugh Regio)
        const heartPath = `M 380 280 C 380 250, 340 230, 310 250 C 280 270, 280 310, 310 330 C 340 350, 380 330, 380 280 Z`;
        const heart = document.createElementNS(svgNS, "path");
        heart.setAttribute("d", heartPath);
        heart.setAttribute("fill", "#a89888");
        heart.setAttribute("opacity", "0.6");
        heart.setAttribute("class", "pluto-heart");
        this.plutoGroup.appendChild(heart);
        
        // Craters
        const craters = [
            { cx: 250, cy: 200, r: 20 },
            { cx: 450, cy: 350, r: 30 },
            { cx: 300, cy: 400, r: 15 },
            { cx: 500, cy: 220, r: 25 },
            { cx: 350, cy: 180, r: 10 },
        ];

        craters.forEach(c => {
            const crater = document.createElementNS(svgNS, "circle");
            crater.setAttribute("cx", c.cx);
            crater.setAttribute("cy", c.cy);
            crater.setAttribute("r", c.r);
            crater.setAttribute("fill", "#2a1a0a");
            crater.setAttribute("opacity", "0.4");
            this.plutoGroup.appendChild(crater);
        });

        svg.appendChild(this.plutoGroup);

        this.plutoGroup.addEventListener('click', () => {
            this.showPopup("Pluto Fact", "Pluto has a heart-shaped glacier called Tombaugh Regio.");
        });

        // Atmosphere glow
        const atmos = document.createElementNS(svgNS, "circle");
        atmos.setAttribute("cx", "400");
        atmos.setAttribute("cy", "300");
        atmos.setAttribute("r", "130");
        atmos.setAttribute("fill", "none");
        atmos.setAttribute("stroke", "#00f3ff");
        atmos.setAttribute("stroke-width", "4");
        atmos.setAttribute("filter", "url(#atmos-glow)");
        atmos.setAttribute("opacity", "0.3");
        atmos.setAttribute("class", "atmosphere");
        svg.appendChild(atmos);

        // Scan line effect
        const scanLine = document.createElementNS(svgNS, "rect");
        scanLine.setAttribute("x", "0");
        scanLine.setAttribute("y", "0");
        scanLine.setAttribute("width", "800");
        scanLine.setAttribute("height", "2");
        scanLine.setAttribute("fill", "#00f3ff");
        scanLine.setAttribute("opacity", "0.1");
        scanLine.setAttribute("class", "scan-line");
        svg.appendChild(scanLine);

        // HUD Elements
        const hudGroup = document.createElementNS(svgNS, "g");
        hudGroup.setAttribute("class", "hud");
        
        const hudText1 = document.createElementNS(svgNS, "text");
        hudText1.setAttribute("x", "40");
        hudText1.setAttribute("y", "60");
        hudText1.setAttribute("fill", "#00f3ff");
        hudText1.setAttribute("font-family", "monospace");
        hudText1.setAttribute("font-size", "14");
        hudText1.textContent = "OBJECT: PLUTO";
        hudGroup.appendChild(hudText1);

        const hudText2 = document.createElementNS(svgNS, "text");
        hudText2.setAttribute("x", "40");
        hudText2.setAttribute("y", "80");
        hudText2.setAttribute("fill", "#00f3ff");
        hudText2.setAttribute("font-family", "monospace");
        hudText2.setAttribute("font-size", "12");
        hudText2.textContent = "DIAMETER: 2,376 KM";
        hudGroup.appendChild(hudText2);

        const hudText3 = document.createElementNS(svgNS, "text");
        hudText3.setAttribute("x", "40");
        hudText3.setAttribute("y", "100");
        hudText3.setAttribute("fill", "#00f3ff");
        hudText3.setAttribute("font-family", "monospace");
        hudText3.setAttribute("font-size", "12");
        hudText3.textContent = "TEMP: -230°C";
        hudGroup.appendChild(hudText3);

        const hudText4 = document.createElementNS(svgNS, "text");
        hudText4.setAttribute("x", "760");
        hudText4.setAttribute("y", "540");
        hudText4.setAttribute("fill", "#00f3ff");
        hudText4.setAttribute("font-family", "monospace");
        hudText4.setAttribute("font-size", "12");
        hudText4.setAttribute("text-anchor", "end");
        hudText4.textContent = "ROTATION: 6.39 DAYS";
        hudGroup.appendChild(hudText4);

        const hudText5 = document.createElementNS(svgNS, "text");
        hudText5.setAttribute("x", "760");
        hudText5.setAttribute("y", "560");
        hudText5.setAttribute("fill", "#00f3ff");
        hudText5.setAttribute("font-family", "monospace");
        hudText5.setAttribute("font-size", "12");
        hudText5.setAttribute("text-anchor", "end");
        hudText5.textContent = "DISTANCE: 5.9B KM";
        hudGroup.appendChild(hudText5);

        // Crosshair
        const crosshair = document.createElementNS(svgNS, "path");
        crosshair.setAttribute("d", "M 400 150 L 400 170 M 400 430 L 400 450 M 250 300 L 270 300 M 530 300 L 550 300");
        crosshair.setAttribute("stroke", "#00f3ff");
        crosshair.setAttribute("stroke-width", "1");
        crosshair.setAttribute("opacity", "0.5");
        hudGroup.appendChild(crosshair);

        svg.appendChild(hudGroup);
        this.container.appendChild(svg);
    }

    _setupEvents() {
        this._onMouseDown = (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.container.style.cursor = 'grabbing';
        };
        this._onMouseMove = (e) => {
            this.mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
            this.mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
            
            if (!this.isDragging) return;
            const dx = e.clientX - this.lastMouseX;
            this.targetRotation += dx * this.dragSensitivity * 0.01;
            this.lastMouseX = e.clientX;
        };
        this._onMouseUp = () => {
            this.isDragging = false;
            this.container.style.cursor = 'grab';
        };
        this._onTouchStart = (e) => {
            this.isDragging = true;
            this.lastMouseX = e.touches[0].clientX;
        };
        this._onTouchMove = (e) => {
            if (!this.isDragging) return;
            const dx = e.touches[0].clientX - this.lastMouseX;
            this.targetRotation += dx * this.dragSensitivity * 0.01;
            this.lastMouseX = e.touches[0].clientX;
        };
        this._onTouchEnd = () => {
            this.isDragging = false;
        };

        this.container.addEventListener('mousedown', this._onMouseDown);
        this.container.addEventListener('mousemove', this._onMouseMove);
        this.container.addEventListener('mouseup', this._onMouseUp);
        this.container.addEventListener('mouseleave', this._onMouseUp);
        this.container.addEventListener('touchstart', this._onTouchStart);
        this.container.addEventListener('touchmove', this._onTouchMove);
        this.container.addEventListener('touchend', this._onTouchEnd);
        this.container.style.cursor = 'grab';
    }

    _updateVisuals() {
        if (this.plutoGroup) {
            this.plutoGroup.setAttribute("transform", `translate(400, 300) rotate(${this.rotation})`);
        }
        
        // Parallax stars
        const stars = this.svg.querySelector('.stars');
        if (stars && this.mouseX !== undefined) {
            stars.setAttribute("transform", `translate(${this.mouseX}, ${this.mouseY})`);
        }
    }

    _playAmbient() {
        if (this.audio) {
            this.audio.play('ambient_space', 0.3);
        }
    }

    showPopup(title, text) {
        if (!this.popupEl) {
            this.popupEl = document.createElement('div');
            this.popupEl.style.cssText = `
                position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
                background: rgba(10, 10, 18, 0.9); border: 1px solid #00f3ff; padding: 12px 20px;
                border-radius: 8px; color: #e0e0e0; font-family: var(--font-main);
                opacity: 0; transition: opacity 0.3s ease; pointer-events: none; z-index: 10;
            `;
            this.container.appendChild(this.popupEl);
        }
        this.popupEl.innerHTML = `<strong>${title}</strong><br>${text}`;
        this.popupEl.style.opacity = '1';
        clearTimeout(this.popupTimeout);
        this.popupTimeout = setTimeout(() => { this.popupEl.style.opacity = '0'; }, 3000);
    }
}
