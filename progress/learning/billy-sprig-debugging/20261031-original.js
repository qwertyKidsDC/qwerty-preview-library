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

const mapWidth = width();

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

var gameRunning = true;
let isOn = true;

function setupLevel() {
  const currentLevel = levels[level];
  if (currentLevel !== undefined) {
    setMap(currentLevel);

    if (level === 4) {
      addSprite(0, 2, "b");
      addSprite(4, 3, "b");
      addSprite(2, 4, "b");
    }
  }
}

setupLevel();

function movePlayers() {
  let players = getAll(player);
  for (let i = 0; i < players.length; i++) {
    players[i].y += 1;
  }
}  

function toggleOnOffBlocks() {
  isOn = !isOn;

  if (isOn) {
    setSolids([player, floor, onoff]);
     addText("Locks are solid!", { y: 1, color: color`3`  });
    setTimeout(() => {
      addText("");
    }, 2000);
  } else {
    setSolids([player, floor]);
    addText("Locks are clear!", { y: 1, color: color`3`  });
    setTimeout(() => {
      addText("");
    }, 1000);
  }
}

function checkHit() {
  let spikes = getAll(spike);
  let bullets = getAll(bullet);
  let p = getFirst(player);

  if (!p) return false;
  
  for (let i = 0; i < spikes.length; i++) {
    if (spikes[i].x == p.x && spikes[i].y == p.y) {
      return true;
    }
  }
  
  for (let i = 0; i < bullets.length; i++) {
    if (bullets[i].x == p.x && bullets[i].y == p.y) {
      return true;
    }
  }
  
  return false;
}

function lBozo() {
  gameRunning = false;
  addText("Game Over!", {
    x: 5,
    y: 6,
    color: color`3`
  });
}

setInterval(() => {
  if (!gameRunning) return;
  
  const bullets = getAll("b");
  const p = getFirst(player);

  bullets.forEach(sprite => {
    if (!sprite.dx) {
      sprite.dx = 1;
    }
    
    const nextX = sprite.x + sprite.dx;
    const nextY = sprite.y;
    
    if (nextX < 0 || nextX >= width()) {
      sprite.dx *= -1;
      return; 
    }

    const tilesAtNextPos = getTile(nextX, nextY);
    const hitSolid = tilesAtNextPos.some(s => s.type === "f" || (isOn && s.type === "o"));

    if (hitSolid) {
      sprite.dx *= -1;
    } else {
      sprite.x += sprite.dx;
    }

    if (p && sprite.x === p.x && sprite.y === p.y) {
      lBozo();
    }
  });
}, 200);

onInput("w", () => {
  if (gameRunning) getFirst(player).y -= 1;
});

onInput("a", () => {
  if (gameRunning) getFirst(player).x -= 1;
});

onInput("d", () => {
  if (gameRunning) getFirst(player).x += 1;
});

onInput("j", () => {
  if (gameRunning) setupLevel();
});

onInput("s", () => {
  if (gameRunning) toggleOnOffBlocks();
});
  
    
    
var gameLoop = setInterval(() => {
  movePlayers();

  if (checkHit()) {
    lBozo();
  }
}, 900);

  

afterInput(() => {
  if (!gameRunning) return;
  
  const numberCovered = tilesWith(goal, player).length;
  const targetNumber = tilesWith(goal).length;
  
  if (numberCovered > 0 && numberCovered === targetNumber) {
    setSolids([floor, player, onoff]);
    level = level + 1;

    const currentLevel = levels[level];

    if (currentLevel !== undefined) {
      setupLevel();
    } else {
      addText("You Win!", { y: 3, color: color`3` });
      gameRunning = false;
    }
  }
  
  
  const qTiles = tilesWith(qwerty);
  const numberCovered1 = tilesWith(qwerty, player).length;
  const targetNumber1 = tilesWith(qwerty).length;
  if (qTiles.length > 0 && tilesWith(qwerty, player).length === qTiles.length) {

  if (targetNumber1 > 0 && numberCovered1 === targetNumber1) {
    addText("Qwerty Winner!", {
      x: 2,
      y: 5,
      color: color`H`
    });
    gameRunning = false;
  }
}
});