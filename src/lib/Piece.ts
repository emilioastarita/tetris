import Game from '@/lib/Game';
import { PieceNames } from '@/lib/pieceDefinitions';

export default class Piece {
    get fixed(): boolean {
        return this._fixed;
    }

    set fixed(value: boolean) {
        this._fixed = value;
    }
    private y: number;
    private tileH: number = 0;
    private tileW: number = 0;
    private _fixed: boolean = false;
    private game: Game;
    private x: number;
    private ctx: CanvasRenderingContext2D;
    private ctxPiece: CanvasRenderingContext2D;

    constructor(
        game: Game,
        private name: PieceNames,
        public color: string,
        private tiles: { x: number; y: number }[],
    ) {
        this.game = game;
        this.x = this.game.width / 2;
        this.y = 0;
        if (!this.game.canvasContext) {
            throw new Error(`No canvas context`);
        }
        this.ctx = this.game.canvasContext;
        if (!this.game.canvasContextPiece) {
            throw new Error(`No canvas context`);
        }
        this.ctxPiece = this.game.canvasContextPiece;
        this.from(game);
    }

    from({ tileW, tileH }: { tileH: number; tileW: number }) {
        this.tileH = tileH;
        this.tileW = tileW;
    }

    realPositions() {
        return this.tiles.map((tile) => ({ x: this.x + tile.x, y: this.y + tile.y }));
    }

    allY() {
        return this.realPositions().map((p) => p.y);
    }

    maxNegativeY() {
        const n = Math.min(...this.allY());
        if (n < 0) {
            return n;
        }
        return 0;
    }

    distanceToYorigin() {
        return Math.abs(this.maxNegativeY());
    }

    setToStartPosition() {
        this.y += this.distanceToYorigin();
    }

    drawOnCtx(ctx: CanvasRenderingContext2D, xF: number, yF: number) {
        let x, y, i;
        ctx.fillStyle = this.color;
        for (i = 0; i < 4; i++) {
            x = xF + this.tiles[i].x * this.tileW;
            y = yF + this.tiles[i].y * this.tileH;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;
            ctx.shadowBlur = 5;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(x, y, this.tileW, this.tileH);
            ctx.strokeRect(x, y, this.tileW, this.tileH);
        }
    }

    draw() {
        const xF = this.x * this.tileW;
        const yF = this.y * this.tileH;
        this.drawOnCtx(this.ctx, xF, yF);
    }

    drawNext() {
        this.drawOnCtx(this.ctxPiece, 30, 30);
    }

    touchingMoving(offset: number, axis: 'x' | 'y') {
        let touching;
        this[axis] += offset;
        touching = this.touching();
        this[axis] -= offset;
        return touching;
    }

    touching() {
        return this.realPositions().find((tile) => {
            if (tile.x >= this.game.width || tile.y >= this.game.height) {
                return true;
            }
            if (tile.x < 0 || tile.y < 0) {
                return true;
            }
            return !!this.game.matrix[tile.y][tile.x];
        });
    }

    move_up() {
        if (this.name == 'square') {
            return;
        }

        const rot = this.tiles;

        for (let i = 0; i < rot.length; i++) {
            rot[i] = { x: -rot[i].y, y: rot[i].x };
        }
        if (this.touching()) {
            for (let i = 0; i < rot.length; i++) {
                rot[i] = { x: rot[i].y, y: -rot[i].x };
            }
        }
    }

    move_down() {
        if (this.touchingMoving(1, 'y')) {
            this.game.lockPiece(this);
            return false;
        }
        this.y += 1;
        return true;
    }

    move_downAll() {
        while (this.move_down());
        this.game.keyboardActions = [];
    }

    move_leftAll() {
        while (this.move_left());
        this.game.keyboardActions = [];
    }

    move_rightAll() {
        while (this.move_right());
        this.game.keyboardActions = [];
    }

    move_left() {
        if (this.touchingMoving(-1, 'x')) {
            return false;
        }
        this.x -= 1;
        return true;
    }

    move_right() {
        if (this.touchingMoving(1, 'x')) {
            return false;
        }
        this.x += 1;
        return true;
    }
}
