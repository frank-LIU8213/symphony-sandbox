export class Board {
    constructor(width, height, tileTypes) {
        this.width = width;
        this.height = height;
        this.tileTypes = tileTypes;
        this.grid = [];
        for (let r = 0; r < height; r++) {
            const row = [];
            for (let c = 0; c < width; c++) {
                row.push(null);
            }
            this.grid.push(row);
        }
    }

    getTile(row, col) {
        if (row < 0 || row >= this.height || col < 0 || col >= this.width) return null;
        return this.grid[row][col];
    }

    remove(row, col) {
        if (this.grid[row] && this.grid[row][col]) {
            this.grid[row][col] = null;
        }
    }

    isCleared() {
        for (let r = 0; r < this.height; r++) {
            for (let c = 0; c < this.width; c++) {
                if (this.grid[r][c] !== null) return false;
            }
        }
        return true;
    }
}

export class PathFinder {
    static findPath(board, start, end) {
        // Basic direct-line check for the stub; full algorithm to be implemented.
        const t1 = board.getTile(start.row, start.col);
        const t2 = board.getTile(end.row, end.col);
        if (!t1 || !t2 || t1.type !== t2.type) return null;

        if (start.row === end.row) {
            let minC = Math.min(start.col, end.col);
            let maxC = Math.max(start.col, end.col);
            for (let c = minC + 1; c < maxC; c++) {
                if (board.getTile(start.row, c) !== null) return null;
            }
            return [{row: start.row, col: start.col}, {row: end.row, col: end.col}];
        } else if (start.col === end.col) {
            let minR = Math.min(start.row, end.row);
            let maxR = Math.max(start.row, end.row);
            for (let r = minR + 1; r < maxR; r++) {
                if (board.getTile(r, start.col) !== null) return null;
            }
            return [{row: start.row, col: start.col}, {row: end.row, col: end.col}];
        }
        // TODO: implement full 0/1/2-bend pathfinding
        return null;
    }
}
