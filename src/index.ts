import Game from '@/lib/Game';
import bind from '@/lib/bind';
import './css/style.css';

const element = document.createElement('div');

const ui = bind({
    status: '',
    lines: 0,
    score: 0,
    speed: 0,
});

element.innerHTML = `
    <a class="github-badge" href="https://github.com/emilioastarita/tetris"><img loading="lazy" width="149" height="149" src="https://github.blog/wp-content/uploads/2008/12/forkme_right_white_ffffff.png?resize=149%2C149" class="attachment-full size-full" alt="Fork me on GitHub" data-recalc-dims="1"></a>
    <h1>TYPESCRIPT TETRIS</h1>
    <div class="container">
        <canvas id="game"></canvas>
        <div id="info">
            <h2 class="status" data-bind:status></h2>
            <h3>Next</h3>
            <canvas id="nextPiece" ></canvas>
            <h4>
                Points: <span data-bind:score>0</span>
            </h4>
            <h4>
                Lines: <span data-bind:lines>0</span>
            </h4>
            <h4>
                Speed: <span data-bind:speed>0</span>
            </h4>
            <p>
                Arrows <span class="key">left</span> and 
                <span class="key">right</span> to move, 
                <span class="key">up</span> rotate the piece.
            </p>
            <p>
                <span class="key">Home</span> and 
                <span class="key">End</span> fast left and fast right.
            </p>
            <p>
                <span class="key">Down</span> slow, 
                <span class="key">space</span> fast down.
            </p>
            <p>
                <span class="key">n</span> New game
            </p>
            <p>
                <span class="key">p</span> Pause
            </p>
        </div>
    </div>
    <p>
     Developed by <a href="https://github.com/emilioastarita">Emilio Astarita</a>
    </p>
`;

document.body.append(element);

const canvas = document.getElementById('game') as HTMLCanvasElement;
const canvasPiece = document.getElementById('nextPiece') as HTMLCanvasElement;
if (!canvas || !canvasPiece) {
    throw new Error(`Missing canvas for game or nextPiece`);
}
const game = new Game(canvas, canvasPiece, ui);
const keyDown = game.keyDown.bind(game);
document.addEventListener('keydown', keyDown, false);
game.run();
