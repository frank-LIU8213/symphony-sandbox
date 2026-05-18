/**
 * Scene for mission timeline visualization.
 * Implements SceneInterface for interactive scroll-based timeline.
 */
class TimelineScene {
    /**
     * Initialize the Timeline scene.
     * @param {HTMLElement} container - Container element.
     * @param {AudioController} audio - Shared audio controller.
     */
    init(container, audio) {
        this.container = container;
        this.audio = audio;
        this.progress = 0;
        this.svgNS = "http://www.w3.org/2000/svg";
        
        // Create SVG container
        this.svg = document.createElementNS(this.svgNS, "svg");
        this.svg.setAttribute("width", "100%");
        this.svg.setAttribute("height", "100%");
        this.svg.setAttribute("viewBox", "0 0 800 1200");
        this.svg.style.overflow = "visible";
        this.container.appendChild(this.svg);

        // Define glow filter
        const defs = document.createElementNS(this.svgNS, "defs");
        const filter = document.createElementNS(this.svgNS, "filter");
        filter.setAttribute("id", "glow");
        const feGaussianBlur = document.createElementNS(this.svgNS, "feGaussianBlur");
        feGaussianBlur.setAttribute("stdDeviation", "4");
        feGaussianBlur.setAttribute("result", "coloredBlur");
        const feMerge = document.createElementNS(this.svgNS, "feMerge");
        const feMergeNode1 = document.createElementNS(this.svgNS, "feMergeNode");
        feMergeNode1.setAttribute("in", "coloredBlur");
        const feMergeNode2 = document.createElementNS(this.svgNS, "feMergeNode");
        feMergeNode2.setAttribute("in", "SourceGraphic");
        feMerge.appendChild(feMergeNode1);
        feMerge.appendChild(feMergeNode2);
        filter.appendChild(feGaussianBlur);
        filter.appendChild(feMerge);
        defs.appendChild(filter);
        this.svg.appendChild(defs);

        // Background grid pattern
        const pattern = document.createElementNS(this.svgNS, "pattern");
        pattern.setAttribute("id", "grid");
        pattern.setAttribute("width", "40");
        pattern.setAttribute("height", "40");
        pattern.setAttribute("patternUnits", "userSpaceOnUse");
        const gridPath = document.createElementNS(this.svgNS, "path");
        gridPath.setAttribute("d", "M 40 0 L 0 0 0 40");
        gridPath.setAttribute("fill", "none");
        gridPath.setAttribute("stroke", "#1e293b");
        gridPath.setAttribute("stroke-width", "0.5");
        pattern.appendChild(gridPath);
        defs.appendChild(pattern);
        
        const bgRect = document.createElementNS(this.svgNS, "rect");
        bgRect.setAttribute("width", "100%");
        bgRect.setAttribute("height", "100%");
        bgRect.setAttribute("fill", "url(#grid)");
        this.svg.appendChild(bgRect);

        // Main timeline line
        this.line = document.createElementNS(this.svgNS, "line");
        this.line.setAttribute("x1", "400");
        this.line.setAttribute("y1", "100");
        this.line.setAttribute("x2", "400");
        this.line.setAttribute("y2", "1100");
        this.line.setAttribute("stroke", "#334155");
        this.line.setAttribute("stroke-width", "4");
        this.line.setAttribute("stroke-dasharray", "8,8");
        this.svg.appendChild(this.line);

        // Animated progress line
        this.progressLine = document.createElementNS(this.svgNS, "line");
        this.progressLine.setAttribute("x1", "400");
        this.progressLine.setAttribute("y1", "100");
        this.progressLine.setAttribute("x2", "400");
        this.progressLine.setAttribute("y2", "100");
        this.progressLine.setAttribute("stroke", "#00f3ff");
        this.progressLine.setAttribute("stroke-width", "4");
        this.progressLine.setAttribute("filter", "url(#glow)");
        this.svg.appendChild(this.progressLine);

        // Events data
        this.events = [
            { year: "2006", month: "Jan", day: "19", title: "LAUNCH", desc: "New Horizons launches from Cape Canaveral.", y: 150 },
            { year: "2007", month: "Feb", day: "28", title: "EARTH FLYBY", desc: "Gravity assist from Earth boosts speed.", y: 350 },
            { year: "2007", month: "Jun", day: "28", title: "JUPITER FLYBY", desc: "Gravity assist from Jupiter. Instruments calibrated.", y: 550 },
            { year: "2015", month: "Jul", day: "14", title: "PLUTO FLYBY", desc: "Closest approach: 12,500 km. Historic images.", y: 750 },
            { year: "2019", month: "Jan", day: "1", title: "ARROKOTH", desc: "Flyby of Ultima Thule, farthest object ever visited.", y: 950 }
        ];

        this.nodes = [];
        this.connectors = [];

        this.events.forEach((evt, i) => {
            // Connector line
            const conn = document.createElementNS(this.svgNS, "line");
            conn.setAttribute("x1", "400");
            conn.setAttribute("y1", evt.y);
            conn.setAttribute("x2", "430");
            conn.setAttribute("y2", evt.y);
            conn.setAttribute("stroke", "#475569");
            conn.setAttribute("stroke-width", "2");
            this.svg.appendChild(conn);
            this.connectors.push(conn);

            // Node
            const circle = document.createElementNS(this.svgNS, "circle");
            circle.setAttribute("cx", "400");
            circle.setAttribute("cy", evt.y);
            circle.setAttribute("r", "8");
            circle.setAttribute("fill", "#0a0a12");
            circle.setAttribute("stroke", "#334155");
            circle.setAttribute("stroke-width", "2");
            this.svg.appendChild(circle);
            this.nodes.push(circle);

            // Year
            const yearText = this.createText(evt.year, 320, evt.y - 20, "16px", "#64748b");
            this.svg.appendChild(yearText);

            // Title
            const titleText = this.createText(evt.title, 430, evt.y - 10, "18px", "#e0e0e0", "bold");
            this.svg.appendChild(titleText);

            // Description
            const descText = this.createText(evt.desc, 430, evt.y + 15, "14px", "#94a3b8");
            this.svg.appendChild(descText);

            // Month/Day
            const dateText = this.createText(`${evt.month} ${evt.day}`, 320, evt.y + 15, "14px", "#64748b");
            this.svg.appendChild(dateText);
        });

        // Scroll listener
        this.handleScroll = () => {
            const rect = this.container.getBoundingClientRect();
            const viewHeight = window.innerHeight;
            const start = rect.top;
            const end = rect.bottom;
            const total = end - start;
            
            if (start < viewHeight && end > 0) {
                this.progress = Math.min(1, Math.max(0, (viewHeight - start) / total));
            }
        };

        window.addEventListener("scroll", this.handleScroll);
        this.handleScroll(); // Initial state
    }

    createText(content, x, y, size, fill, weight = "normal") {
        const text = document.createElementNS(this.svgNS, "text");
        text.setAttribute("x", x);
        text.setAttribute("y", y);
        text.setAttribute("font-size", size);
        text.setAttribute("fill", fill);
        text.setAttribute("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif");
        text.setAttribute("font-weight", weight);
        text.textContent = content;
        return text;
    }

    /**
     * Update frame.
     * @param {AnimationState} state - Animation state.
     */
    update(state) {
        const totalHeight = 1000;
        const currentY = 100 + (totalHeight * this.progress);
        this.progressLine.setAttribute("y2", currentY);

        let activeIndex = -1;
        this.events.forEach((evt, i) => {
            const nodeProgress = (evt.y - 100) / totalHeight;
            const node = this.nodes[i];
            const conn = this.connectors[i];
            
            if (this.progress >= nodeProgress) {
                node.setAttribute("fill", "#00f3ff");
                node.setAttribute("stroke", "#00f3ff");
                conn.setAttribute("stroke", "#00f3ff");
                activeIndex = i;
                if (!node._played) {
                    node._played = true;
                    this.audio.play("tick", 0.2);
                }
            } else {
                node.setAttribute("fill", "#0a0a12");
                node.setAttribute("stroke", "#334155");
                conn.setAttribute("stroke", "#475569");
                node._played = false;
            }
        });

        // Pulse active node
        if (activeIndex >= 0) {
            const pulse = 1 + 0.2 * Math.sin(state.time / 200);
            this.nodes[activeIndex].setAttribute("r", 8 * pulse);
        }
    }

    /**
     * Cleanup resources.
     */
    destroy() {
        window.removeEventListener("scroll", this.handleScroll);
        if (this.container.contains(this.svg)) {
            this.container.removeChild(this.svg);
        }
    }
}
