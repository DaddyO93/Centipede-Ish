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
    let bottom = gameArea.yMax + this.H;
    let top = gameArea.y;
    if (this.y > bottom || this.y < top) {
      this.y -= this.yMovement;
      this.yMovement *= -1;
    }
  }

  yEdgeDetection(thisIndex, thisArray) {
    if (this.y < -10 || this.y > canvas.height) {
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

  timeTracker() {
    return (this.fireRate = this.now() + this.pauseTimer);
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
  }

  damage(segmentIndex) {
    // convert segment to mushroom at location, then remove segment
    generateMushroom(this.x, this.y - 5, "brown", 4);
    this.removeItem(segmentIndex, centipede);
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
  update(segmentIndex) {
    this.xReverse();
    this.yReverse();
    this.x += this.xMovement;
    this.y = this.y;
    if (this.collisionDetection(player)) {
      console.log("game over");
      cancelAnimationFrame(timeStamp);
    }
    this.draw();
  }
}

class Mushroom extends GameObject {
  constructor(x, y, objectImage, H, W, health) {
    super(x, y, objectImage, H, W, health);
  }

  damage(damageDelt, thisIndex) {
    this.health -= damageDelt;
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
    super.draw();
  }
}

class Archer extends GameObject {
  constructor(x, y, objectImage, H, W, health) {
    super(x, y, objectImage, H, W, health);
    this.fireRate = 0; // interval between firing, now + pauseTimer
    this.pauseTimer = 200; // higher number = slower rate of fire
    this.projectiles = [];
  }
  controller() {
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
  }

  // player fires with mouse click
  fire() {
    if (this.now() > this.fireRate) {
      this.projectiles.push(
        new Projectile(this.x, this.y, randomColor(), 5, 5, 1, 7)
      );
      this.fireRate = this.timeTracker();
    }
  }

  damage() {}

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.H / 2, 0, Math.PI * 2, false);
    c.fillStyle = this.image;
    c.fill();
  }

  update() {
    this.controller();
    this.draw();
  }
}

let gameArea;
let centipede;
let mushrooms;
let lastRender;
// let delta;
let numOfSegments;
let highScore = 0;
let player;
let keys;

function init() {
  // delta = 0;
  keys = [];
  centipede = [];
  mushrooms = [];
  numOfSegments = 15;
  gameArea = new Pane(0.2, 0.8, 0.1, 0.85, c); // the pane the playable game happens in
  playerArea = new Pane(0.2, 0.8, 0.6, 0.85, c); // the area the player can move in
  // lastRender = Date.now();
  createEnemies(numOfSegments);
  createStartingMushrooms(25);
  player = createPlayer();
  animate();
}

function randomInt(max) {
  return Math.random() * max;
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
}

function createEnemies(numOfSegments) {
  var startingX = gameArea.xMax - 30;
  var startingY = gameArea.y + 30;
  var segment;
  for (var i = 0; i < numOfSegments; i++) {
    segment = new Segment(
      startingX, // starting x location
      startingY, // starting y location
      randomColor(), // to be replaced w/image later
      30, // height
      30, // width
      30, // health
      5 // xMovement speed
    );
    centipede.push(segment);
    startingX -= 30;
  }
}

function createPlayer() {
  var startingX = (gameArea.xMax - gameArea.x) / 2 + gameArea.x;
  var startingY = gameArea.yMax - 40;
  let player = new Archer(startingX, startingY, randomColor(), 30, 03, 30, 10);
  return player;
}

function generateMushroom(mushroomX, mushroomY, mushroomImage, life) {
  let newMushroom = new Mushroom(
    mushroomX,
    mushroomY,
    mushroomImage,
    20,
    20,
    life
  );
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
  setTimeout(() => {
    createEnemies(numOfSegments);
  }, 1000);
}

function animate() {
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  timeStamp = requestAnimationFrame(animate);
  // delta = Date.now() - lastRender;
  // lastRender = Date.now();

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

  player.update();
}

// Change to WASD for movement and spacebar for fire
// addEventListener("keydown", (event) => {
//   keys[event.code] = true;
// });
// addEventListener("keyup", (event) => {
//   keys[event.code] = false;
//   player.image.src = playerImage[0];
// });

// to detect mouse movement
addEventListener("mousemove", (e) => {
  playerArea.x = e.pageX;
  playerArea.y = e.pageY;
});
addEventListener("mousedown", () => {
  player.fire();
});
init();
