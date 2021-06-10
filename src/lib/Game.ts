import { randomPieceMaker } from '@/lib/pieceDefinitions';
import Piece from '@/lib/Piece';

type KeyboardAction = {
    pressed: boolean;
    name: 'right' | 'left' | 'up' | 'down' | 'downAll' | 'leftAll' | 'rightAll' | 'pause' | 'new';
};

export default class Game {
    width: number = 10;
    height: number = 18;
    matrix: (string | null)[][] = [];
    canvasContext: CanvasRenderingContext2D;
    canvasContextPiece: CanvasRenderingContext2D;
    tileW: number = 0;
    tileH: number = 0;
    keyboardActions: any[] = [];
    private deletedLine: false | number = false;
    private pause: boolean = false;
    private FPS: number = 30;
    private speed = 0.6;
    private counters: { [idx: string]: number } = {};
    private actualPiece: null | Piece = null;
    private zoom: number = 2.7;
    private keyboard: { [idx: string]: KeyboardAction } = {
        '39': { pressed: false, name: 'right' },
        '37': { pressed: false, name: 'left' },
        '38': { pressed: false, name: 'up' },
        '40': { pressed: false, name: 'down' },
        '32': { pressed: false, name: 'downAll' },
        '36': { pressed: false, name: 'leftAll' },
        '35': { pressed: false, name: 'rightAll' },
        '80': { pressed: false, name: 'pause' },
        '78': { pressed: false, name: 'new' },
    };
    private toAdd: number = 0;
    private titilar: boolean = false;
    private nextPiece: Piece;
    private widthPx: number = 0;
    private heightPx: number = 0;
    private now: Date;
    private elapsedSeconds: number = 0;
    private last: Date;
    private totalSeconds: number = 0;
    private start: Date;
    private actualKey: KeyboardAction | undefined;
    private interval: number = 0;

    constructor(
        private canvas: HTMLCanvasElement,
        private canvasPiece: HTMLCanvasElement,
        private ui: {
            status: string;
            lines: number;
            score: number;
            speed: number;
        },
    ) {
        this.now = new Date();
        this.start = new Date();
        this.last = new Date();
        this.canvasContext = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.canvasContextPiece = this.canvasPiece.getContext('2d') as CanvasRenderingContext2D;
        this.nextPiece = randomPieceMaker(this);
        this.init();
    }

    init() {
        this.setZoom(this.zoom);
        this.actualPiece = null;
        this.ui.lines = 0;
        this.ui.score = 0;
        this.pause = false;
        this.toAdd = 0;
        this.matrixFill();
        this.nextPiece = randomPieceMaker(this);
        this.ui.status = 'Playing';
        this.ui.lines = 0;
        this.ui.score = 0;
        this.setSpeed(0.6);
    }

    setZoom(zoom: number) {
        this.zoom = zoom;
        this.widthPx = 100 * zoom;
        this.heightPx = 180 * zoom;
        this.tileW = 10 * zoom;
        this.tileH = 10 * zoom;
        if (this.actualPiece) {
            this.actualPiece.from(this);
        }
        if (this.nextPiece) {
            this.nextPiece.from(this);
        }
        this.canvas.width = this.widthPx;
        this.canvas.height = this.heightPx;
    }

    clearCanvas() {
        if (!this.canvasContext || !this.canvasContextPiece) {
            throw new Error(`Called clear with no canvas`);
        }
        this.canvasContext.clearRect(0, 0, this.widthPx, this.heightPx);
        this.canvasContextPiece.clearRect(0, 0, this.widthPx, this.heightPx);
    }

    keyDown(e: KeyboardEvent) {
        const keyCode = e.keyCode.toString();
        if (typeof this.keyboard[keyCode] !== 'undefined') {
            if (this.keyboard[keyCode].name == 'new') {
                this.stop();
                this.init();
                this.run();
                return;
            }
            this.keyboard[keyCode].pressed = true;
            this.keyboardActions.push(this.keyboard[keyCode]);
            e.preventDefault();
        }
    }

    keyUp(e: KeyboardEvent) {
        if (this.keyboard[e.code]) {
            this.keyboard[e.code].pressed = false;
        }
    }

    newPiece() {
        this.actualPiece = this.nextPiece;
        this.nextPiece = randomPieceMaker(this);
        this.actualPiece.setToStartPosition();
        if (this.actualPiece.touching()) {
            this.ui.status = 'Game Over';
            this.stop();
        }
    }

    gameLoop() {
        this.now = new Date();
        this.elapsedSeconds = (this.now.getTime() - this.last.getTime()) / 1000;
        this.totalSeconds = (this.now.getTime() - this.start.getTime()) / 1000;
        this.last = this.now;
        this.actualKey = this.keyboardActions.pop();
        //this.actualKey = _(this.keyboard).detect(function(x){return x.pressed; });
        this.checkPause();
        if (this.pause) {
            return;
        }

        if (this.deletedLine !== false) {
            if (!this.checkTime('deletedLineAnimation', 0.3)) {
                this.highligh(this.deletedLine);
                return;
            } else {
                this.toAdd++;
                this.deleteLine(this.deletedLine);
                this.deletedLine = this.checkLines();
            }
        }
        if (this.deletedLine == false && this.toAdd) {
            this.addLines(this.toAdd);
            this.toAdd = 0;
        }

        if (!this.actualPiece || this.actualPiece.fixed) {
            this.newPiece();
        }
        this.clearCanvas();

        if (this.actualKey) {
            if (this.actualKey.name === 'down') {
                this.actualPiece?.move_down();
            } else if (this.actualKey.name === 'left') {
                this.actualPiece?.move_left();
            } else if (this.actualKey.name === 'right') {
                this.actualPiece?.move_right();
            } else if (this.actualKey.name === 'up') {
                this.actualPiece?.move_up();
            } else if (this.actualKey.name === 'rightAll') {
                this.actualPiece?.move_rightAll();
            } else if (this.actualKey.name === 'downAll') {
                this.actualPiece?.move_downAll();
            } else if (this.actualKey.name === 'leftAll') {
                this.actualPiece?.move_leftAll();
            }
        }

        this.actualPiece!.draw();
        this.nextPiece.drawNext();
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (this.matrix[i][j]) this.drawTile(j, i);
            }
        }

        if (this.checkTime('downPiece', this.speed)) {
            this.actualPiece!.move_down();
        }
    }

    checkTime(key: string, time: number) {
        this.counters[key] = this.counters[key] || 0;
        this.counters[key] += this.elapsedSeconds;
        if (this.counters[key] >= time) {
            this.counters[key] = 0;
            return true;
        }
        return false;
    }

    drawTile(x: number, y: number) {
        this.canvasContext.fillStyle = this.matrix[y][x] || '';
        this.canvasContext.fillRect(x * this.tileW, y * this.tileH, this.tileW, this.tileH);
        this.canvasContext.strokeRect(x * this.tileW, y * this.tileH, this.tileW, this.tileH);
    }

    matrixFill() {
        this.matrix = new Array(this.height);
        for (let i = 0; i < this.height; i++) {
            const rows = new Array<string | null>(this.width);
            rows.fill(null);
            this.matrix[i] = rows;
        }
    }

    checkPause() {
        if (this.actualKey && this.actualKey.name == 'pause') {
            this.pause = !this.pause;
            if (this.pause) {
                this.ui.status = 'Pause';
            } else {
                this.ui.status = 'Playing';
            }
        }
    }

    addLines(x: number) {
        this.ui.lines += x;
        this.ui.score += x * x;
        if (x && this.ui.lines % 2 == 0) {
            this.setSpeed(this.speed - 0.01);
        }
    }

    run() {
        this.interval = setInterval(this.gameLoop.bind(this), 1000 / this.FPS) as unknown as number;
        this.start = new Date();
        this.last = new Date();
    }

    stop() {
        clearInterval(this.interval);
    }

    lockPiece(piece: Piece) {
        let pos;
        piece.fixed = true;
        pos = piece.realPositions();
        pos.forEach((tile) => {
            this.matrix[tile.y][tile.x] = piece.color;
        });
        this.deletedLine = this.checkLines();
    }

    checkLines() {
        let line;
        for (line = this.height - 1; line >= 0; line--) {
            if (this.checkLine(line)) {
                return line;
            }
        }
        return false;
    }

    deleteLine(line: number) {
        let i, j;
        for (j = line; j > 1; j--) {
            for (i = 0; i < this.width; i++) {
                this.matrix[j][i] = this.matrix[j - 1][i];
            }
        }
    }

    highligh(line: number) {
        let i;
        this.canvasContext.save();
        if (this.titilar) {
            this.canvasContext.shadowOffsetX = 4;
            this.canvasContext.shadowOffsetY = 4;
            this.canvasContext.shadowBlur = 1;
            this.canvasContext.shadowColor = 'rgba(255, 95, 95, 0.5)';
            this.canvasContext.fillStyle = '#FFF';
            this.titilar = false;
        } else {
            this.canvasContext.shadowOffsetX = 5;
            this.canvasContext.shadowOffsetY = 5;
            this.canvasContext.shadowBlur = 3;
            this.canvasContext.shadowColor = 'rgba(255, 95, 95, 0.9)';
            this.canvasContext.fillStyle = '#000';
            this.titilar = true;
        }
        for (i = 0; i < this.width; i++) {
            this.canvasContext.fillRect(i * this.tileW, line * this.tileH, this.tileW, this.tileH);
            this.canvasContext.strokeRect(
                i * this.tileW,
                line * this.tileH,
                this.tileW,
                this.tileH,
            );
        }

        this.canvasContext.restore();
    }

    checkLine(line: number) {
        let complete = true;
        let i;
        for (i = 0; i < this.width; i++) {
            if (!this.matrix[line][i]) {
                complete = false;
            }
        }
        return complete;
    }

    private setSpeed(n: number) {
        if (this.speed > 0.1) {
            this.speed = n;
            this.ui.speed = Math.floor(this.speed * 100);
        }
    }
}
