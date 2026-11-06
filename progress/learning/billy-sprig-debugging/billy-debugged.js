// DEBUGGED COPY · Billy's Sprig platformer (31 October 2026)
// Preserves Billy's original art, maps, controls and game idea.
// Changes are limited to reproducible game-state and collision problems.

/*
First time? Check out the tutorial game:
https://sprig.hackclub.com/gallery/getting_started

@title: platformer
@description: 
@author: 
@tags: ['tag1', 'tag2']
@addedOn: 2025-00-00
*/

const player = "p"
const floor = "f"
const goal = "g"
const spike = "s"
const onoff = "o"
const qwerty = "q"
const bullet = "b"

setLegend(
    [ "b", bitmap`
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
  [ "p", bitmap`
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
  [ "f", bitmap`
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
    [ "g", bitmap`
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
  [ "s", bitmap`
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
  [ "o", bitmap`
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
  [ "q", bitmap`
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


// Billy's six original maps and all original sprite artwork are unchanged.
let level = 0;
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

setSolids([player, floor, onoff]);

let gameRunning = true;
let gameWon = false;
let isOn = true;
let noticeTimer = null;
let bulletDirections = [];

// A new level (or a retry) must reset BOTH the map and its rules.
function setupLevel() {
  const currentLevel = levels[level];
  if (currentLevel === undefined) return;

  if (noticeTimer !== null) clearTimeout(noticeTimer);
  noticeTimer = null;
  clearText();
  isOn = true;
  setSolids([player, floor, onoff]);
  setMap(currentLevel);
  gameRunning = true;
  gameWon = false;

  // Billy's bullet level is level 5 (array index 4).
  if (level === 4) {
    addSprite(0, 2, bullet);
    addSprite(4, 3, bullet);
    addSprite(2, 4, bullet);
  }

  // One direction per bullet; Sprig's sprite.dx is read-only.
  bulletDirections = getAll(bullet).map(() => 1);
}

// Temporary notices must not erase a later Game Over or Win message.
function showNotice(message, delay) {
  if (noticeTimer !== null) clearTimeout(noticeTimer);
  clearText();
  addText(message, { y: 1, color: color`3` });
  noticeTimer = setTimeout(() => {
    noticeTimer = null;
    if (gameRunning) clearText();
  }, delay);
}

function movePlayers() {
  const p = getFirst(player);
  if (p) p.y += 1;
}

function toggleOnOffBlocks() {
  isOn = !isOn;
  setSolids(isOn ? [player, floor, onoff] : [player, floor]);
  showNotice(isOn ? "Locks are solid!" : "Locks are clear!", isOn ? 2000 : 1000);
}

// Check both spikes and bullets; a missing player must not crash the game.
function checkHit() {
  const p = getFirst(player);
  if (!p) return false;
  return [...getAll(spike), ...getAll(bullet)].some(
    hazard => hazard.x === p.x && hazard.y === p.y
  );
}

// Keep Billy's original name, but allow the function to run only once.
function lBozo() {
  if (!gameRunning) return;
  finishGame("Game Over!", false);
}

function finishGame(message, won) {
  gameRunning = false;
  gameWon = won;
  if (noticeTimer !== null) clearTimeout(noticeTimer);
  noticeTimer = null;
  clearText();
  addText(message, { x: message === "Qwerty Winner!" ? 2 : 5, y: 5, color: color`3` });
}

setupLevel();

// Timers stay installed, but do nothing when the game is over.
// This makes retrying possible without creating duplicate intervals.
setInterval(() => {
  if (!gameRunning) return;

  const bullets = getAll(bullet);
  bullets.forEach((sprite, index) => {
    if (!gameRunning) return;
    const direction = bulletDirections[index] ?? 1;
    const nextX = sprite.x + direction;
    const nextY = sprite.y;

    if (nextX < 0 || nextX >= width()) {
      bulletDirections[index] = -direction;
    } else {
      const blocked = getTile(nextX, nextY).some(
        tile => tile.type === floor || (isOn && tile.type === onoff)
      );
      if (blocked) {
        bulletDirections[index] = -direction;
      } else {
        sprite.x = nextX;
      }
    }

    if (checkHit()) lBozo();
  });
}, 200);

onInput("w", () => {
  if (gameRunning && getFirst(player)) getFirst(player).y -= 1;
});
onInput("a", () => {
  if (gameRunning && getFirst(player)) getFirst(player).x -= 1;
});
onInput("d", () => {
  if (gameRunning && getFirst(player)) getFirst(player).x += 1;
});

// J retries the current level, even after losing. After a win, J starts over.
onInput("j", () => {
  if (gameWon || level >= levels.length) level = 0;
  setupLevel();
});
onInput("s", () => {
  if (gameRunning) toggleOnOffBlocks();
});

setInterval(() => {
  if (!gameRunning) return;
  movePlayers();
  if (checkHit()) lBozo();
}, 900);

// Inputs are checked immediately; no waiting for the gravity timer.
afterInput(() => {
  if (!gameRunning) return;
  if (checkHit()) {
    lBozo();
    return;
  }

  const qTargets = tilesWith(qwerty).length;
  if (qTargets > 0 && tilesWith(qwerty, player).length === qTargets) {
    finishGame("Qwerty Winner!", true);
    return;
  }

  const goals = tilesWith(goal).length;
  if (goals > 0 && tilesWith(goal, player).length === goals) {
    level += 1;
    if (level < levels.length) {
      setupLevel();
    } else {
      finishGame("You Win!", true);
    }
  }
});
