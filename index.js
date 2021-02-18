const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

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

class Object {
  constructor(x, y, objectImage, H, W, health, move) {
    this.x = x;
    this.y = y;
    this.image = objectImage;
    this.H = H;
    this.W = W;
    this.health = health;
    this.move = move;
  }
}

class Segment extends Object {
  constructor(x, y, objectImage, H, W, health, move, reverse) {
    super(x, y, objectImage, H, W, health, move);
    this.reverse = reverse;
  }

  draw() {
    c.fillStyle = this.image;
    c.fillRect(this.x, this.y, this.W, this.H);
    c.fill();
  }

  // TO DO: create distance detection so segments never greater than 1
  // pixel away from next segment
  update(delta) {
    var xMovement = Math.min(Math.floor(delta / 10), this.move);
    var yMovement = this.H / 2;
    // reverse X direction
    if (this.x + xMovement > gameArea.xMax && this.reverse > 0) {
      xMovement *= -1;
      this.reverse = -1;
      this.y += yMovement;
    } else if (this.x - xMovement < gameArea.x && this.reverse < 0) {
      xMovement *= -1;
      this.reverse = 1;
      this.y += yMovement;
    }
    // reverse Y direction
    if (this.y + yMovement > gameArea.yMax || this.y - yMovement < gameArea.y) {
      yMovement *= -1;
    }

    this.x += (xMovement + this.move) * this.reverse;
    this.y = this.y;

    this.draw();
  }
}

class Archer extends Object {
  constructor(x, y, objectImage, H, W, health, move) {
    super(x, y, objectImage, H, W, health, move);
    this.fireRate = 10;
  }
}

let gameArea;
let segment;
let centipedes;
let lastRender;
let delta;
let numOfCentipedes;
let numOfSegments;

function init() {
  delta = 0;
  centipedes = [];
  numOfCentipedes = 2;
  numOfSegments = 15;
  gameArea = new Pane(0.2, 0.9, 0, 0.9, c); // the pane the playable game happens in
  lastRender = Date.now();
  createEnemies(numOfCentipedes, numOfSegments);
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

function createEnemies(numOfCentipedes, numOfSegments) {
  var startingX = canvas.width;
  var startingY = gameArea.y;
  var reverse = -1;
  for (var e = 0; e < numOfCentipedes; e++) {
    startingY += 30; // must be equal to height below
    reverse *= -1;
    var newCentipede = [];
    for (var i = 0; i < numOfSegments; i++) {
      segment = new Segment(
        startingX, // starting x location
        startingY, // starting y location
        randomColor(), // to be replaced w/image later
        30, // height
        30, // width
        30, // health
        2, // movement speed
        reverse // used to reverse direction
      );
      newCentipede.push(segment);

      startingX -= 30;
    }
    centipedes.push(newCentipede);
  }
}

function updateCentipede() {}

function animate() {
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  delta = Date.now() - lastRender;
  lastRender = Date.now();

  centipedes.forEach((centipede) => {
    centipede.forEach((segment) => {
      segment.update(delta);
      // console.log(segment);
    });
  });

  requestAnimationFrame(animate);
}

init();
