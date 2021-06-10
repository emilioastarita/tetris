import Game from '@/lib/Game';
import Piece from '@/lib/Piece';

export type PieceNames =
    | 'Z-shape'
    | 'S-shape'
    | 'line'
    | 'T-shape'
    | 'square'
    | 'L-shape'
    | 'mirror';

export type PieceDef = {
    color: string;
    name: PieceNames;
    prob: number;
    tiles: { x: number; y: number }[];
};

const arr: PieceDef[] = [
    {
        color: '#66CCCC',
        name: 'Z-shape',
        prob: 10,
        tiles: [
            { x: 1, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: -1 },
            { x: -1, y: -1 },
        ],
    },
    {
        color: '#CC6666',
        name: 'S-shape',
        prob: 10,
        tiles: [
            { x: 1, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: -1, y: 1 },
        ],
    },
    {
        color: '#DAAA00',
        name: 'line',
        prob: 10,
        tiles: [
            { x: -1, y: 0 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
        ],
    },
    {
        color: '#66CC66',
        name: 'T-shape',
        prob: 10,
        tiles: [
            { x: -1, y: 0 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
        ],
    },
    {
        color: '#CCCC66',
        name: 'square',
        prob: 10,
        tiles: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
        ],
    },
    {
        color: '#6666CC',
        name: 'L-shape',
        prob: 10,
        tiles: [
            { x: -1, y: 1 },
            { x: -1, y: 0 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
        ],
    },
    {
        color: '#CC66CC',
        name: 'mirror',
        prob: 10,
        tiles: [
            { x: 1, y: 1 },
            { x: 1, y: 0 },
            { x: 0, y: 0 },
            { x: -1, y: 0 },
        ],
    },
];

const totalProb = arr.reduce((prob, b) => prob + b.prob, 0);

export function randomPieceMaker(game: Game) {
    let rnd;
    let piece;
    let i, l, boundMax;
    let boundMin = 0;

    rnd = Math.floor(Math.random() * totalProb);
    for (i = 0, l = arr.length; i < l; i++) {
        const p = arr[i];
        boundMax = boundMin + p.prob;
        if (rnd >= boundMin && rnd < boundMax) {
            piece = new Piece(game, p.name, p.color, [...p.tiles]);
            return piece;
        }
        boundMin += p.prob;
    }
    throw new Error('Mal formed data.');
}
