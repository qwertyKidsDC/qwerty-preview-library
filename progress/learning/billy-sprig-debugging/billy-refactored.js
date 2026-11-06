// REFACTORED REFERENCE · Billy's Sprig platformer (31 October 2026)
// Same game art, six levels, controls, hazards and endings.
// Organised around clear lifecycle, movement, hazards, goals and input.
// An example to study and compare — not a replacement for Billy's work.

/*
@title: Billy's Platformer — Refactored
@description: Six-level platform game with switches, bullets and a hidden ending.
@author: Billy (game); Qwerty Labs (reference refactor)
@tags: ['platformer', 'javascript', 'sprig']
*/

const player = "p";
const floor = "f";
const goal = "g";
const spike = "s";
const onoff = "o";
const qwerty = "q";
const bullet = "b";

setLegend(
    [bullet, bitmap`
................
................
................
......1111......
....11LLLL11....
.111LLL00LLL111.
.1LLL000000LLL1.
1LL0003333000LL1
1LL0003333000LL1
.1LLL000000LLL1.
.111LLL00LLL111.
....11LLLL11....
......1111......
................
................
................` ],
  [player, bitmap`
................
................
................
................
................
................
................
......5555......
.....505505.....
.....505505.....
.....555555.....
......5555......
.....5....5.....
....5......5....
....5......5....
....5......5....` ],
  [floor, bitmap`
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000` ],
    [goal, bitmap`
................
.....333........
.3333333333333..
..333333333333..
...33333333333..
...33333333333..
....3333333333..
...33333333333..
...33333333333..
..333333333333..
.3333.L.333333..
......L.........
......L.........
......L.........
......L.........
......L.........`],
  [spike, bitmap`
................
................
................
................
................
................
................
................
................
................
................
................
1.1.1.1.1.1.1.1.
1.1.1.1.1.1.1.1.
1111111111111111
1111111111111111` ],
  [onoff, bitmap`
1..1..1..L..L..L
................
................
1..1..1..L..L..L
................
................
1..1..1..L..L..L
................
................
L..L..L..1..1..1
................
................
L..L..L..1..1..1
................
................
L..L..L..1..1..1` ],
  [qwerty, bitmap`
....FFFFFFFF....
...FF666666FF...
..FF66666666FF..
.FF6666666666FF.
FF666206602666FF
F66662066026666F
F66666666666666F
F66666666666666F
F66666666666666F
F66660666606666F
F66666000066666F
FF666666666666FF
.FF6666666666FF.
..FF66666666FF..
...FF666666FF...
....FFFFFFFF....` ]
);


// ─── Game content ─────────────────────────────────────────────
// Six original levels. The arrays are zero-indexed: level 5 is index 4.
const levels = [map`
.......g
.......f
......f.
....f...
p.f.....`,
                map`
.......
.......
pfssf.g`,
                map`
........
.....ooo
.....ooo
p....oog`,
                map`
po...f
ooooof
sosf.f
ooofof
sssf.g`,
                map`
.....g
ofofof
......
......
......
offfff
.....p`,
                map`
.fo..o
pf..o.
of.oso
ofosfo
.o.fg.
ofo.ff
s.fooq`
];

// These three bullets are spawned when level 5 loads.
// Keeping their positions here makes level setup easy to change.
const BULLET_SPAWNS = {
  4: [[0, 2], [4, 3], [2, 4]]
};

const GRAVITY_MS = 900;
const BULLET_MS = 200;

// One object holds the state that must survive between events.
const game = {
  levelIndex: 0,
  phase: "playing", // playing | lost | won
  locksOn: true,
  bulletDirections: [],
  noticeTimer: null
};

// ─── Level lifecycle ──────────────────────────────────────────
// Resetting a level means resetting its RULES, not just its artwork.
function loadLevel() {
  cancelNotice();
  clearText();
  game.phase = "playing";
  game.locksOn = true;
  game.bulletDirections = [];
  setSolids([player, floor, onoff]);
  setMap(levels[game.levelIndex]);

  for (const [x, y] of BULLET_SPAWNS[game.levelIndex] ?? []) {
    addSprite(x, y, bullet);
    game.bulletDirections.push(1); // Each bullet starts moving right.
  }
}

function restart() {
  // A completed run starts again at level 1; a loss retries its level.
  if (game.phase === "won") game.levelIndex = 0;
  loadLevel();
}

// All terminal states go through the same gate.
function endGame(message, phase) {
  if (game.phase !== "playing") return;
  game.phase = phase;
  cancelNotice();
  clearText();
  addText(message, {
    x: message === "Qwerty Winner!" ? 2 : 5,
    y: 5,
    color: color`3`
  });
}

// ─── Notices and lock state ────────────────────────────────────
function cancelNotice() {
  if (game.noticeTimer !== null) clearTimeout(game.noticeTimer);
  game.noticeTimer = null;
}

function showNotice(message, duration) {
  cancelNotice();
  clearText();
  addText(message, { y: 1, color: color`3` });
  game.noticeTimer = setTimeout(() => {
    game.noticeTimer = null;
    if (game.phase === "playing") clearText();
  }, duration);
}

function toggleLocks() {
  game.locksOn = !game.locksOn;
  setSolids(game.locksOn ? [player, floor, onoff] : [player, floor]);
  showNotice(game.locksOn ? "Locks are solid!" : "Locks are clear!", 1200);
}

// ─── Movement and collision ────────────────────────────────────
function movePlayer(dx, dy) {
  if (game.phase !== "playing") return;
  const sprite = getFirst(player);
  if (!sprite) return;
  sprite.x += dx;
  sprite.y += dy;
}

function overlapsPlayer(sprite) {
  const p = getFirst(player);
  return p !== undefined && sprite.x === p.x && sprite.y === p.y;
}

function playerHitHazard() {
  return [...getAll(spike), ...getAll(bullet)].some(overlapsPlayer);
}

function updateGravity() {
  if (game.phase !== "playing") return;
  movePlayer(0, 1);
  if (playerHitHazard()) endGame("Game Over!", "lost");
}

// Sprig exposes sprite.x and sprite.y as writable positions, but
// sprite.dx as read-only. Keep bullet directions in our own array.
function updateBullets() {
  if (game.phase !== "playing") return;

  const bullets = getAll(bullet);
  for (let index = 0; index < bullets.length; index += 1) {
    const sprite = bullets[index];
    const direction = game.bulletDirections[index] ?? 1;
    const nextX = sprite.x + direction;

    const offMap = nextX < 0 || nextX >= width();
    const blocked = !offMap && getTile(nextX, sprite.y).some(
      tile => tile.type === floor || (game.locksOn && tile.type === onoff)
    );

    if (offMap || blocked) {
      game.bulletDirections[index] = -direction;
    } else {
      sprite.x = nextX;
    }

    if (playerHitHazard()) {
      endGame("Game Over!", "lost");
      return;
    }
  }
}

// ─── Goals ─────────────────────────────────────────────────────
// A level with zero target tiles must never be counted as finished.
function allTargetsCovered(target) {
  const count = tilesWith(target).length;
  return count > 0 && tilesWith(target, player).length === count;
}

function checkProgress() {
  if (game.phase !== "playing") return;

  // A player stepping onto a bullet dies immediately, not at the next tick.
  if (playerHitHazard()) {
    endGame("Game Over!", "lost");
    return;
  }

  // Check the secret goal first so it cannot be swallowed by normal progress.
  if (allTargetsCovered(qwerty)) {
    endGame("Qwerty Winner!", "won");
    return;
  }

  if (!allTargetsCovered(goal)) return;
  game.levelIndex += 1;
  if (game.levelIndex === levels.length) {
    endGame("You Win!", "won");
  } else {
    loadLevel();
  }
}

// ─── Controls and clocks ──────────────────────────────────────
// W = jump, A/D = move, S = toggle locks, J = retry / new game.
onInput("w", () => movePlayer(0, -1));
onInput("a", () => movePlayer(-1, 0));
onInput("d", () => movePlayer(1, 0));
onInput("s", () => {
  if (game.phase === "playing") toggleLocks();
});
onInput("j", restart);
afterInput(checkProgress);

// Install each interval once. A stopped game leaves them safely idle,
// and retrying never stacks duplicate timers.
setInterval(updateGravity, GRAVITY_MS);
setInterval(updateBullets, BULLET_MS);

loadLevel();
