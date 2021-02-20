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
  // constructor(x, y, objectImage, H, W, health, move) {
  constructor(x, y, objectImage, H, W, health, move, reverse) {
    this.x = x;
    this.y = y;
    this.image = objectImage;
    this.H = H;
    this.W = W;
    this.health = health;
    // this.move = move;
    this.xMovement = move;
    this.reverse = reverse;
    this.yMovement = this.H / 2;
  }

  // xReverse(xMovement, yMovement) {
  xReverse() {
    // if (this.x + xMovement > gameArea.xMax && this.reverse > 0) {

    if (this.x + this.xMovement > gameArea.xMax) {
      // xMovement *= -1;
      this.x = gameArea.xMax;
      this.xMovement *= -1;
      this.reverse = -1;
      this.y += this.yMovement;

      // } else if (this.x - xMovement < gameArea.x && this.reverse < 0) {
    } else if (this.x - this.xMovement < gameArea.x) {
      // xMovement *= -1;
      this.x = gameArea.x;
      this.xMovement *= -1;
      this.reverse = 1;
      this.y += this.yMovement;
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
}

class Segment extends GameObject {
  constructor(x, y, objectImage, H, W, health, move, reverse) {
    super(x, y, objectImage, H, W, health, move, reverse);
    // this.reverse = reverse;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.H / 2, 0, Math.PI * 2, false);
    c.fillStyle = this.image;
    c.fill();
  }
  update(centipedeIndex, segmentIndex) {
    // var yMovement = this.H / 2;
    // reverse X direction
    // this.xReverse(this.move, this.yMovement);
    this.xReverse();

    // reverse Y direction
    // this.yReverse(yMovement);
    this.yReverse();

    // this.x += this.move * this.reverse;
    this.x += this.xMovement * this.reverse;
    this.y = this.y;

    this.draw();
  }
}

class Archer extends GameObject {
  constructor(x, y, objectImage, H, W, health, move) {
    super(x, y, objectImage, H, W, health, move);
    this.fireRate = 10;
  }
  controller() {
    if (playerArea.x && playerArea.y) {
      // keeps player inside game area
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

    //   // move player left
    //   if (keys["KeyA"] || keys["ArrowLeft"]) {
    //     this.image.src = playerImage[1];
    //     this.x -= this.speed;
    //   }
    //   // move player right
    //   if (keys["KeyD"] || keys["ArrowRight"]) {
    //     this.image.src = playerImage[2];
    //     this.x += this.speed;
    //   }
    //   if (keys["KeyS"]) {
    //     if (this.now() > this.fireTimer) {
    //       if (this.nukes > 0) {
    //         this.projectiles.push(
    //           new Projectile(
    //             this.x,
    //             this.y,
    //             10, //size
    //             "yellow",
    //             this.projectileSpeed,
    //             0, // damage
    //             4 // owner
    //           )
    //         );
    //         let nukeLaunch = new Audio("assets/nukeLaunch");
    //         nukeLaunch.volume = 0.6;
    //         nukeLaunch.play();
    //         this.nukes--;
    //         this.fireTimer = this.timeTracker();
    //         displayNukes(this.nukes);
    //       }
    //     }
    //   }
    //   // pause feature
    //   if (keys["KeyP"]) {
    //     cancelAnimationFrame(timeStamp);
    //     pause();
    // }

    //   // player fire
    //   if (keys["Space"]) {
    //     // check for Rapid Fire and adjust fire rate if present
    //     if (this.now() > this.fireTimer) {
    //       // play sound when end game
    //       let playerFire = new Audio("assets/playerFire");
    //       playerFire.volume = 0.6;
    //       playerFire.play();
    //       this.projectiles.push(
    //         new Projectile(
    //           this.x,
    //           this.y,
    //           this.projectilesize,
    //           this.projectileColor,
    //           this.projectileSpeed,
    //           this.projectileDamage,
    //           6
    //         )
    //       );
    //       this.fireTimer = this.timeTracker();
    //     }
    //   }
  }

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
let centipedes;
let lastRender;
// let delta;
let numOfCentipedes;
let numOfSegments;
let highScore = 0;
let player;

function init() {
  // delta = 0;
  centipedes = [];
  numOfCentipedes = 1;
  numOfSegments = 15;
  gameArea = new Pane(0.2, 0.8, 0.1, 0.85, c); // the pane the playable game happens in
  playerArea = new Pane(0.2, 0.8, 0.6, 0.85, c); // the area the player can move in
  // lastRender = Date.now();
  createEnemies(numOfCentipedes, numOfSegments);
  player = createPlayer();
  animate();
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (min - max + 1)) + min;
}

function randomColor() {
  var r = randomInt(0, 255) * -1;
  var g = randomInt(0, 255) * -1;
  var b = randomInt(0, 255) * -1;
  var rgb = "rgb(" + r + "," + g + "," + b + ")";
  return rgb;
}

function saveHighScore(score) {
  if (score > highScore) {
    highScore = score;
  }
}

function createEnemies(numOfCentipedes, numOfSegments) {
  var startingX = gameArea.xMax - 30;
  var startingY = gameArea.y + 30;
  var segment;
  for (var e = 0; e < numOfCentipedes; e++) {
    startingY;
    var newCentipede = [];
    for (var i = 0; i < numOfSegments; i++) {
      segment = new Segment(
        startingX, // starting x location
        startingY, // starting y location
        randomColor(), // to be replaced w/image later
        30, // height
        30, // width
        30, // health
        6, // xMovement speed
        1 // used to reverse direction
      );
      newCentipede.push(segment);

      startingX -= 30;
    }
    centipedes.push(newCentipede);
  }
}

function createPlayer() {
  var startingX = (gameArea.xMax - gameArea.x) / 2 + gameArea.x;
  var startingY = gameArea.yMax - 40;
  let player = new Archer(startingX, startingY, randomColor(), 30, 03, 30, 10);
  return player;
}

function updateCentipede() {}

function animate() {
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  // delta = Date.now() - lastRender;
  // lastRender = Date.now();

  centipedes.forEach((centipede, centipedeIndex) => {
    centipede.forEach((segment, segmentIndex) => {
      segment.update(centipedeIndex, segmentIndex);
    });
  });
  player.update();
  requestAnimationFrame(animate);
}

// to detect mouse movement
addEventListener("mousemove", (e) => {
  playerArea.x = e.pageX;
  playerArea.y = e.pageY;
});
init();
