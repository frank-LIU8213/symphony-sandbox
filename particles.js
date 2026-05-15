const PARTICLE_COLORS = ['#FF5A5F', '#00A699', '#FC642D', '#FFC857', '#A566C7'];

export function initParticles(bus, container) {
    // Ensure the container is positioned so particles are placed correctly
    if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }

    bus.on('match', (data) => {
        const { tile1, tile2 } = data;
        if (!tile1 || !tile2) return;

        // Burst at each matched tile centre (60 px cell size)
        const positions = [
            { x: tile1.col * 60 + 30, y: tile1.row * 60 + 30 },
            { x: tile2.col * 60 + 30, y: tile2.row * 60 + 30 }
        ];
        positions.forEach(pos => createBurst(pos.x, pos.y, container));
    });

    function createBurst(cx, cy, parent) {
        const count = 24;
        const particles = [];
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
            const size = Math.random() * 6 + 4;
            el.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                left: ${cx}px;
                top: ${cy}px;
                transform: translate(-50%, -50%);
            `;
            parent.appendChild(el);

            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 120 + 60; // px/s
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 0.6 + Math.random() * 0.4; // seconds

            particles.push({ el, vx, vy, life, startTime: performance.now() });
        }

        function animateParticles(now) {
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                const dt = (now - p.startTime) / 1000;
                if (dt >= p.life) {
                    if (p.el.parentNode) p.el.parentNode.removeChild(p.el);
                    particles.splice(i, 1);
                    continue;
                }
                const progress = dt / p.life;
                const x = cx + p.vx * dt;
                const y = cy + p.vy * dt + 200 * dt * dt; // slight gravity
                p.el.style.left = x + 'px';
                p.el.style.top = y + 'px';
                p.el.style.opacity = 1 - progress;
                p.el.style.transform = `translate(-50%, -50%) scale(${1 - progress * 0.5})`;
            }
            if (particles.length > 0) requestAnimationFrame(animateParticles);
        }
        requestAnimationFrame(animateParticles);
    }
}
