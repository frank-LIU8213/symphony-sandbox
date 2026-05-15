export class Board {
    constructor(width, height, tileTypes) {
        this.width = width;
        this.height = height;
        this.tileTypes = tileTypes;
        this.grid = [];

        // Generate a solvable board: each tile type appears an even number of times.
        const totalCells = width * height;
        const pairsPerType = Math.floor(totalCells / (2 * tileTypes));
        const tiles = [];

        for (let t = 1; t <= tileTypes; t++) {
            for (let p = 0; p < pairsPerType; p++) {
                tiles.push(t, t);
            }
        }

        // Fill remaining cells with additional pairs of random types.
        const remaining = totalCells - tiles.length;
        for (let i = 0; i < remaining; i += 2) {
            const type = Math.floor(Math.random() * tileTypes) + 1;
            tiles.push(type, type);
        }

        // Shuffle tile array (Fisher‑Yates).
        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }

        // Fill the grid.
        let idx = 0;
        for (let r = 0; r < height; r++) {
            const row = [];
            for (let c = 0; c < width; c++) {
                const type = tiles[idx++];
                row.push({ row: r, col: c, type });
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
    /**
     * Find a connecting path between start and end with at most two bends.
     * Returns an ordered array of Positions (including start, turn corners, end)
     * or null if no valid path exists.
     */
    static findPath(board, start, end) {
        const t1 = board.getTile(start.row, start.col);
        const t2 = board.getTile(end.row, end.col);
        if (!t1 || !t2 || t1.type !== t2.type) return null;

        // 0-bend (straight line)
        const straightPath = PathFinder._tryStraight(board, start, end);
        if (straightPath) return straightPath;

        // 1-bend (one corner)
        const oneBendPath = PathFinder._tryOneBend(board, start, end);
        if (oneBendPath) return oneBendPath;

        // 2-bend (two corners)
        const twoBendPath = PathFinder._tryTwoBend(board, start, end);
        if (twoBendPath) return twoBendPath;

        return null;
    }

    // ---------- private helpers ----------

    static _tryStraight(board, start, end) {
        if (start.row === end.row) {
            const minC = Math.min(start.col, end.col);
            const maxC = Math.max(start.col, end.col);
            for (let c = minC + 1; c < maxC; c++) {
                if (board.getTile(start.row, c) !== null) return null;
            }
            return [{ row: start.row, col: start.col }, { row: end.row, col: end.col }];
        }
        if (start.col === end.col) {
            const minR = Math.min(start.row, end.row);
            const maxR = Math.max(start.row, end.row);
            for (let r = minR + 1; r < maxR; r++) {
                if (board.getTile(r, start.col) !== null) return null;
            }
            return [{ row: start.row, col: start.col }, { row: end.row, col: end.col }];
        }
        return null;
    }

    static _tryOneBend(board, start, end) {
        // corner (startRow, endCol)
        const corner1 = board.getTile(start.row, end.col);
        if (corner1 === null) {
            if (
                PathFinder._isClearLine(board, start.row, start.col, start.row, end.col) &&
                PathFinder._isClearLine(board, start.row, end.col, end.row, end.col)
            ) {
                return [
                    { row: start.row, col: start.col },
                    { row: start.row, col: end.col },
                    { row: end.row, col: end.col },
                ];
            }
        }

        // corner (endRow, startCol)
        const corner2 = board.getTile(end.row, start.col);
        if (corner2 === null) {
            if (
                PathFinder._isClearLine(board, start.row, start.col, end.row, start.col) &&
                PathFinder._isClearLine(board, end.row, start.col, end.row, end.col)
            ) {
                return [
                    { row: start.row, col: start.col },
                    { row: end.row, col: start.col },
                    { row: end.row, col: end.col },
                ];
            }
        }

        return null;
    }

    static _tryTwoBend(board, start, end) {
        const height = board.height;
        const width = board.width;

        // Scan all rows (horizontal‑vertical‑horizontal configuration)
        for (let r = 0; r < height; r++) {
            const p1 = { row: r, col: start.col };
            const p2 = { row: r, col: end.col };

            if (
                PathFinder._isPassable(board, p1, start, end) &&
                PathFinder._isPassable(board, p2, start, end) &&
                PathFinder._isClearLine(board, start.row, start.col, p1.row, p1.col) &&
                PathFinder._isClearLine(board, p1.row, p1.col, p2.row, p2.col) &&
                PathFinder._isClearLine(board, p2.row, p2.col, end.row, end.col)
            ) {
                return [start, p1, p2, end];
            }
        }

        // Scan all columns (vertical‑horizontal‑vertical configuration)
        for (let c = 0; c < width; c++) {
            const p1 = { row: start.row, col: c };
            const p2 = { row: end.row, col: c };

            if (
                PathFinder._isPassable(board, p1, start, end) &&
                PathFinder._isPassable(board, p2, start, end) &&
                PathFinder._isClearLine(board, start.row, start.col, p1.row, p1.col) &&
                PathFinder._isClearLine(board, p1.row, p1.col, p2.row, p2.col) &&
                PathFinder._isClearLine(board, p2.row, p2.col, end.row, end.col)
            ) {
                return [start, p1, p2, end];
            }
        }

        return null;
    }

    /** Return true if the cell is free (null) or equals start or end tile. */
    static _isPassable(board, pos, start, end) {
        if (pos.row === start.row && pos.col === start.col) return true;
        if (pos.row === end.row && pos.col === end.col) return true;
        return board.getTile(pos.row, pos.col) === null;
    }

    /** Return true if the straight segment between (r1,c1) and (r2,c2) contains no occupied cells (endpoints excluded). */
    static _isClearLine(board, r1, c1, r2, c2) {
        if (r1 === r2) {
            const minC = Math.min(c1, c2);
            const maxC = Math.max(c1, c2);
            for (let c = minC + 1; c < maxC; c++) {
                if (board.getTile(r1, c) !== null) return false;
            }
            return true;
        }
        if (c1 === c2) {
            const minR = Math.min(r1, r2);
            const maxR = Math.max(r1, r2);
            for (let r = minR + 1; r < maxR; r++) {
                if (board.getTile(r, c1) !== null) return false;
            }
            return true;
        }
        return false; // not same row or column
    }
}
