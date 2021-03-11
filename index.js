const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;
// replace mouse cursor with player image
canvas.style.cursor = "none";

// for brevity later, using cX and cY
const cX = canvas.width;
const cY = canvas.height;

// A Pane is the area to work within for a given task
class Pane {
  constructor(xStart, xStop, yStart, yStop, context) {
    this.x = cX * xStart;
    this.xMax = cX * xStop;
    this.y = cY * yStart;
    this.yMax = cY * yStop;
    this.context = context;
  }
}

class GameObject {
  constructor(x, y, objectImage, H, W, health, move) {
    this.x = x;
    this.y = y;
    this.image = objectImage;
    this.H = H;
    this.W = W;
    this.health = health;
    this.xMovement = move;
    this.yMovement = this.H / 2;
  }

  xReverse() {
    if (this.x + this.xMovement > gameArea.xMax) {
      this.x = gameArea.xMax;
      this.xMovement *= -1;
      this.y += this.yMovement;
    } else if (this.x - this.xMovement < gameArea.x) {
      this.x = gameArea.x;
      this.xMovement *= -1;
      this.y += this.yMovement;
    } else {
      mushrooms.forEach((mushroom) => {
        if (this.collisionDetection(mushroom)) {
          this.xMovement *= -1;
          this.y += this.yMovement;
        }
      });
    }
  }
  yReverse() {
    let bottom = gameArea.yMax;
    let top = gameArea.y;
    if (this.inGame) {
      // once in play area, moves up and down screen
      if (this.y > bottom || this.y < top) {
        this.y -= this.yMovement;
        this.yMovement *= -1;
      }
    } else {
      if (this.y > gameArea.y) {
        this.inGame = true;
      }
    }
  }

  yEdgeDetection(thisIndex, thisArray) {
    if (this.y < -10 || this.y > gameArea.yMax) {
      this.removeItem(thisIndex, thisArray);
    }
  }

  xEdgeDetection(thisIndex, thisArray) {
    if (this.x > gameArea.xMax) {
      this.removeItem(thisIndex, thisArray);
    }
  }

  removeItem(thisIndex, thisArray) {
    thisArray.splice(thisIndex, 1);
  }

  now() {
    let now = new Date();
    return now.getTime();
  }

  timeTracker(timer) {
    return this.now() + timer;
  }

  leaveMushroom() {
    generateMushroom(this.x, this.y - 5);
  }

  collisionDetection(otherObject) {
    const dist = Math.hypot(this.x - otherObject.x, this.y - otherObject.y);
    if (dist - otherObject.H / 2 - this.H / 2 < 1) {
      return true;
    }
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.H / 2, 0, Math.PI * 2, false);
    c.fillStyle = this.image;
    c.fill();
  }
}

class Segment extends GameObject {
  constructor(x, y, objectImage, H, W, health, move) {
    super(x, y, objectImage, H, W, health, move);
    this.value = 100;
    this.inGame = false;
  }

  damage(segmentIndex) {
    // convert segment to mushroom at location, then remove segment
    this.leaveMushroom();
    this.removeItem(segmentIndex, centipede);
    player.score(this.value);
    if (centipede.length < 1) {
      levelProgression();
    }
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.H / 2, 0, Math.PI * 2, false);
    c.fillStyle = this.image;
    c.fill();
  }
  update() {
    this.xReverse();
    this.yReverse();
    this.x += this.xMovement;
    this.y = this.y;
    if (this.collisionDetection(player)) {
      player.damage();
    }
    this.draw();
  }
}

class Beetle extends GameObject {
  constructor(x, y, objectImage, H, W, health) {
    super(x, y, objectImage, H, W, health);
    this.movement = 8;
    this.xMovement = randomInt(10, -10);
    this.value = 300;
  }
  damage(beetleIndex) {
    // convert beetle to mushroom at location, then remove beetle
    this.leaveMushroom();
    this.removeItem(beetleIndex, beetles);
    player.score(this.value);
  }

  update(thisIndex) {
    this.y += this.movement;
    this.x += this.xMovement;
    this.xReverse();
    this.yEdgeDetection(thisIndex, beetles);
    if (this.collisionDetection(player)) {
      player.damage();
    }
    super.draw();
  }
}

class Ant extends GameObject {
  constructor(x, y, objectImage, H, W, health) {
    super(x, y, objectImage, H, W, health);
    this.movement = 11;
    this.value = 400;
    this.trailTimer = 0;
  }

  damage(antIndex) {
    // convert ant to mushroom at location, then remove ant
    this.leaveMushroom();
    this.removeItem(antIndex, ants);
    player.score(this.value);
  }

  trail() {
    if (this.trailTimer > 3) {
      this.leaveMushroom();
      this.trailTimer = 0;
    } else {
      this.trailTimer += randomInt(1);
    }
  }

  update(thisIndex) {
    this.y += this.movement;
    this.yEdgeDetection(thisIndex, ants);
    if (this.collisionDetection(player)) {
      player.damage();
    }
    this.trail();
    super.draw();
  }
}

class Spider extends GameObject {
  constructor(x, y, objectImage, H, W, health) {
    super(x, y, objectImage, H, W, health);
    this.yMovement = randomInt(6, 3);
    this.movement = randomInt(6, 3);
    this.value = 500;
  }

  spiderMovement() {
    var top = gameArea.yMax - randomInt(300, 100);
    if (this.y > gameArea.yMax || this.y < top) {
      this.yMovement *= -1;
    }
    this.y += this.yMovement;
    this.x += this.movement + randomInt(8, -8);
  }

  damage(spiderIndex) {
    // convert spider to mushroom at location, then remove spider
    this.leaveMushroom();
    this.removeItem(spiderIndex, spiders);
    player.score(this.value);
  }

  update(thisIndex) {
    this.spiderMovement();
    this.xEdgeDetection(thisIndex, spiders);
    if (this.collisionDetection(player)) {
      player.damage();
    }
    super.draw();
  }
}

class Mushroom extends GameObject {
  constructor(x, y, objectImage, H, W, health) {
    super(x, y, objectImage, H, W, health);
    this.value = 10;
  }

  damage(damageDelt, thisIndex) {
    this.health -= damageDelt;
    player.score(this.value);
    if (this.health < 0) {
      this.removeItem(thisIndex, mushrooms);
    }
  }

  update() {
    super.draw();
  }
}

class Projectile extends GameObject {
  constructor(x, y, objectImage, H, W, health, move) {
    super(x, y, objectImage, H, W, health, move);
  }

  update(thisIndex, thisArray) {
    this.yEdgeDetection(thisIndex, thisArray);
    this.y -= this.xMovement; // moves projectile up screen
    centipede.forEach((segment, segmentIndex) => {
      if (segment.collisionDetection(this)) {
        segment.damage(segmentIndex);
        this.removeItem(thisIndex, thisArray);
      }
    });
    mushrooms.forEach((mushroom, mushroomIndex) => {
      if (mushroom.collisionDetection(this)) {
        mushroom.damage(this.health, mushroomIndex);
        this.removeItem(thisIndex, thisArray);
      }
    });
    spiders.forEach((spider, spiderIndex) => {
      if (spider.collisionDetection(this)) {
        spider.damage(spiderIndex);
      }
    });
    beetles.forEach((beetle, beetleIndex) => {
      if (beetle.collisionDetection(this)) {
        beetle.damage(beetleIndex);
      }
    });
    ants.forEach((ant, antIndex) => {
      if (ant.collisionDetection(this)) {
        ant.damage(antIndex);
      }
    });
    super.draw();
  }
}

class Archer extends GameObject {
  constructor(x, y, objectImage, H, W, health, move) {
    super(x, y, objectImage, H, W, health);
    this.movementSpeed = move;
    this.fireRate = 0; // interval between firing, now + pauseTimer
    this.pauseTimer = 200; // higher number = slower rate of fire
    this.projectiles = [];
    this.projectileDamage = 1;
  }

  controller() {
    // move player
    if (player.x < playerArea.x) {
      player.x = playerArea.x;
    } else if (player.x > playerArea.xMax) {
      player.x = playerArea.xMax;
    } else if (player.y < playerArea.y) {
      player.y = playerArea.y;
    } else if (player.y > playerArea.yMax) {
      player.y = playerArea.yMax;
    }

    if (playerArea.x && playerArea.y) {
      // keeps player inside game area
      // player moves by mouse
      player.x = playerArea.x;
      if (player.x < gameArea.x) {
        player.x = gameArea.x;
      } else if (player.x > gameArea.xMax) {
        player.x = gameArea.xMax;
      }

      player.y = playerArea.y;
      if (player.y < gameArea.y + 400) {
        player.y = gameArea.y + 400;
      } else if (player.y > gameArea.yMax) {
        player.y = gameArea.yMax;
      }
    }
    if (shoot) {
      this.fire();
    }
  }

  // player fires with button
  fire() {
    if (this.now() > this.fireRate) {
      this.projectiles.push(
        new Projectile(
          this.x,
          this.y,
          "white",
          5,
          5,
          player.projectileDamage,
          7
        )
      );
      this.fireRate = this.timeTracker(this.pauseTimer);
    }
  }

  damage() {
    gameOver();
  }

  score(value) {
    score += value;
    uiUpdate();
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.H / 2, 0, Math.PI * 2, false);
    c.fillStyle = this.image;
    c.fill();
  }

  update() {
    this.draw();
  }
}

let gameArea;
let centipede;
let mushrooms;
let spiders;
let beetles;
let ants;
let numOfSegments;
let highScore = 0;
let player;
let keys;
let shoot;
let score;
let level;
let insectInterval;
let pauseRelay;

function init() {
  keys = [];
  centipede = [];
  mushrooms = [];
  spiders = [];
  beetles = [];
  ants = [];
  insectInterval = 9995;
  numOfSegments = 15;
  // gameArea = new Pane(0.2, 0.8, 0.1, 0.85, c); // the pane the playable game happens in
  // playerArea = new Pane(0.2, 0.8, 0.6, 0.85, c); // the area the player can move in
  createCentipede(numOfSegments);
  createStartingMushrooms(25);
  player = createPlayer();
  score = 0;
  level = 1;
  pauseRelay = false;
}

function randomInt(max, min = 0) {
  return Math.random(min) * max;
}

function randomColor() {
  var r = randomInt(255);
  var g = randomInt(255);
  var b = randomInt(255);
  var rgb = "rgb(" + r + "," + g + "," + b + ")";
  return rgb;
}

function saveHighScore(score) {
  if (score > highScore) {
    highScore = score;
  }
  return highScore;
}

function checkForEnemies() {
  var randNum = randomInt(10000);
  if (randNum > insectInterval) {
    var randInsect = Math.floor(randomInt(3));
    if (randInsect == 0) {
      createSpider();
    } else if (randInsect == 1) {
      createBeetle();
    } else {
      createAnt();
    }
  }
}

function createCentipede(numOfSegments) {
  var startingX = gameArea.xMax - 30;
  var startingY = -20;
  var segment;
  for (var i = 0; i < numOfSegments; i++) {
    segment = new Segment(
      startingX, // starting x location
      startingY, // starting y location
      randomColor(), // to be replaced w/image later
      30, // height
      30, // width
      30, // health
      5 // xMovement speed,
    );
    centipede.push(segment);
    startingX -= 30;
  }
}

function createSpider() {
  let newSpider = new Spider(
    gameArea.x,
    gameArea.yMax - randomInt(500, 100),
    "gray",
    20,
    20,
    1
  );
  spiders.push(newSpider);
}

function createBeetle() {
  var startX = gameArea.xMax - gameArea.x;
  let newBeetle = new Beetle(
    gameArea.x + randomInt(startX),
    gameArea.y - 30,
    "green",
    20,
    20,
    1
  );
  beetles.push(newBeetle);
}

function createAnt() {
  var startX = gameArea.xMax - gameArea.x;
  let newAnt = new Ant(
    gameArea.x + randomInt(startX),
    gameArea.y - 30,
    "red",
    20,
    20,
    1
  );
  ants.push(newAnt);
}

function createPlayer() {
  var startingX = (gameArea.xMax - gameArea.x) / 2 + gameArea.x;
  var startingY = gameArea.yMax - 40;
  let player = new Archer(
    startingX,
    startingY,
    "white", // to be replaced by image
    30, // height
    30, // width
    30, // health
    10 // movement speed
  );
  return player;
}

function generateMushroom(mushroomX, mushroomY) {
  let newMushroom = new Mushroom(mushroomX, mushroomY, "brown", 20, 20, 4);
  mushrooms.push(newMushroom);
}

function createStartingMushrooms(numOfMushrooms) {
  for (let i = 0; i < numOfMushrooms; i++) {
    let mushroomX = gameArea.x + randomInt(gameArea.xMax - gameArea.x);
    let mushroomY =
      gameArea.y + 50 + randomInt(gameArea.yMax - gameArea.y - 50);
    generateMushroom(
      mushroomX,
      mushroomY,
      "brown", // to be replaced with image
      4 // health
    );
  }
}

function levelProgression() {
  level++;
  numOfSegments++;
  insectInterval -= 5;
  uiUpdate();
  setTimeout(() => {
    createCentipede(numOfSegments);
  }, 1000);
}

function uiUpdate() {
  levelElement.innerHTML = level;
  scoreElement.innerHTML = score;
  highScoreElement.innerHTML = highScore;
}

function pause() {
  cancelAnimationFrame(timeStamp);
  pauseModalElement.style.display = "flex";
  pauseRelay = false;
}

function gameOver() {
  cancelAnimationFrame(timeStamp);
  gameOverModalElement.style.display = "flex";
  gameOverHighScoreElement.innerHTML = "";
  gameOverScoreElement.innerHTML = "";
  gameOverHighScoreElement.innerHTML += highScore;
  gameOverScoreElement.innerHTML += score;
}

function animate() {
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  timeStamp = requestAnimationFrame(animate);

  player.controller();
  player.projectiles.forEach((projectile, index) => {
    projectile.update(index, player.projectiles);
  });

  mushrooms.forEach((mushroom) => {
    mushroom.update();
  });

  centipede.forEach((segment, segmentIndex) => {
    segment.update(segmentIndex);
  });

  checkForEnemies();
  spiders.forEach((spider, spiderIndex) => {
    spider.update(spiderIndex);
  });
  beetles.forEach((beetle, beetleIndex) => {
    beetle.update(beetleIndex);
  });
  ants.forEach((ant, antIndex) => {
    ant.update(antIndex);
  });

  player.update();
}

gameArea = new Pane(0.2, 0.8, 0.1, 0.85, c); // the pane the playable game happens in
playerArea = new Pane(0.2, 0.8, 0.6, 0.85, c); // the area the player can move in

addEventListener("keydown", (event) => {
  keys[event.code] = true;
});
addEventListener("keyup", (event) => {
  keys[event.code] = false;
});

// to detect mouse movement
addEventListener("mousemove", (e) => {
  playerArea.x = e.pageX;
  playerArea.y = e.pageY;
});
addEventListener("mousedown", () => {
  shoot = true;
});
addEventListener("mouseup", () => {
  shoot = false;
});

pauseModalElement.style.display = "none";
gameOverModalElement.style.display = "none";
startModalElement.style.display = "flex";

addEventListener("keypress", (e) => {
  if (e.code == "KeyP") {
    if (pauseRelay) {
      pauseModalElement.style.display = "none";
      timeStamp = 0;
      animate();
      pauseRelay = false;
    } else {
      cancelAnimationFrame(timeStamp);
      pauseModalElement.style.display = "flex";
      pauseRelay = true;
    }
  }
});

restartGameButton.addEventListener("click", () => {
  gameOverModalElement.style.display = "none";
  highScore = saveHighScore(score);
  init();
  uiUpdate();
  animate();
});

// start game on clicking "start game" button
startGameButton.addEventListener("click", () => {
  startModalElement.style.display = "none";
  init();
  animate();
});
