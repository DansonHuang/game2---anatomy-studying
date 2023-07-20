let bg;
let spaceship;
let spaceshipImg;
let asteroids = [];
let asteroidImgs = [];
let asteroidNames = [];  // 新增：存储小行星的名字
let bullets = [];
let gameOver = false;  // New global variable to track the game state
let hitAsteroids = [];  // 新增：存储被击中的小行星信息

function preload() {
  spaceshipImg = loadImage('./spaceship.png');
  asteroidImgs[0] = loadImage('./Craniomaxillofacial.png');
  asteroidNames[0] = 'Craniomaxillofacial';  // 新增：存储小行星的名字
  asteroidImgs[1] = loadImage('./Maxilla-R.png');
  asteroidNames[1] = 'Maxilla-R';  // 新增：存储小行星的名字
  asteroidImgs[2] = loadImage('./Maxilla-L.png');
  asteroidNames[2] = 'Maxilla-L';  // 新增：存储小行星的名字
  asteroidImgs[3] = loadImage('./Mandible.png');
  asteroidNames[3] = 'Mandible';  // 新增：存储小行星的名字
  asteroidImgs[4] = loadImage('./Frontal.png');
  asteroidNames[4] = 'Frontal';  // 新增：存储小行星的名字
  asteroidImgs[5] = loadImage('./Zygomatic.png');
  asteroidNames[5] = 'Zygomatic';  // 新增：存储小行星的名字
  asteroidImgs[6] = loadImage('./Temporal.png');
  asteroidNames[6] = 'Temporal';  // 新增：存储小行星的名字
  asteroidImgs[7] = loadImage('./Sphenoid.png');
  asteroidNames[7] = 'Sphenoid';  // 新增：存储小行星的名字
  bg = loadImage('./background.png');
}

function setup() {
  let canvasHeight = 5000;
  let canvasWidth = Math.round(canvasHeight * 1.6);  // Use the aspect ratio of your image here
  createCanvas(canvasWidth, canvasHeight);
  spaceship = new Spaceship();
  for(let i = 0; i < 7; i++) {
    asteroids.push(new Asteroid(spaceship));
  }
}

function draw() {
  let scaleFactor = max(width / bg.width, height / bg.height);
  image(bg, 0, 0, bg.width * scaleFactor, bg.height * scaleFactor);

  spaceship.show();
  spaceship.move();

  for(let a of asteroids) {
    a.show();
    a.move();
    if(spaceship.hits(a)) {
      console.log("GAME OVER");
      gameOver = true;  // Set gameOver to true when the spaceship hits an asteroid
      noLoop();
    }
  }

  for(let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].show();
    bullets[i].move();

    // If bullet is out of canvas, remove it
    if (bullets[i].pos.x < 0 || bullets[i].pos.x > width || bullets[i].pos.y < 0 || bullets[i].pos.y > height) {
      bullets.splice(i, 1);
      continue;
    }

   for(let j = asteroids.length - 1; j >= 0; j--) {
      if(bullets[i] && bullets[i].hits(asteroids[j])) {
		hitAsteroids.push({  // 新增：存储被击中的小行星信息
		  name: asteroids[j].name,  // 将小行星的名字保存到 hitAsteroids 中  // 新增：存储被击中的小行星的名字
          pos: asteroids[j].pos.copy(),  // Copy the position of the asteroid
          timer: millis()  // Record the current time
        });
        asteroids.splice(j, 1);
        bullets.splice(i, 1);
        break;
      }
    }
  }

  if(asteroids.length === 0) {
    textSize(200);
    fill(255,255,0);
    text("YOU WIN", width / 2, height / 2);
    noLoop();
  }

  for (let i = hitAsteroids.length - 1; i >= 0; i--) {  // 新增：显示被击中的小行星名字
    fill(255,255,0); // 设置为黄色
    textSize(80); // 调整字体大小
    text(hitAsteroids[i].name, hitAsteroids[i].pos.x, hitAsteroids[i].pos.y);  // 显示小行星的名字

    if (millis() - hitAsteroids[i].timer > 2000) {
      hitAsteroids.splice(i, 1);
    }
  }
  
  if(gameOver) {  // Show "GAME OVER" when gameOver is true
    textSize(200);  // Change this value to scale the text
    fill(255,0,0);
    text("GAME OVER", width / 2, height / 2);
  }
}

function mousePressed() {
  let angle = spaceship.getAngle(createVector(mouseX, mouseY));
  let bulletPos = spaceship.getCenter().copy().add(p5.Vector.fromAngle(angle).mult(spaceshipImg.width / 2));	
  let newBullet = new Bullet(bulletPos, createVector(mouseX, mouseY)); // 使用飞船的中心作为子弹的初始位置
  bullets.push(newBullet);
  console.log("New bullet at:", newBullet.pos, "with velocity:", newBullet.vel);
}

function keyPressed() {  // New function to reset the game when the "R" key is pressed
  if (key == 'r' || key == 'R') {
    resetGame();
  }
}

function resetGame() {  // New function to reset the game state
  asteroids = [];
  bullets = [];
  spaceship = new Spaceship();
  for(let i = 0; i < 5; i++) {
    asteroids.push(new Asteroid(spaceship));
  }
  gameOver = false;
  loop();
}

class Spaceship {
  constructor() {
    this.pos = createVector(width / 2, height / 2);
    this.r = 60;
  }

  // 新增方法：获取飞船的中心点
  getCenter() {
    return createVector(this.pos.x + spaceshipImg.width / 2, this.pos.y + spaceshipImg.height / 2);
  }

  // 新增方法：计算角度
  getAngle(target) {
    let dx = target.x - this.getCenter().x;
    let dy = target.y - this.getCenter().y;
    let angle = atan2(dy, dx);
    return angle;
  }

  show() {
    push();  // 保存当前的坐标变换
    translate(this.getCenter().x, this.getCenter().y);  // 将原点移动到飞船的中心
    rotate(this.getAngle(createVector(mouseX, mouseY)) + HALF_PI);  // 旋转坐标系
    imageMode(CENTER);  // 设置图像模式为中心模式
    image(spaceshipImg, 0, 0, this.r * 8, this.r * 8);  // 在原点处绘制飞船图像
    pop();  // 恢复之前的坐标变换
  }

  move() {
    //不执行任何操作，使飞船保持静止
  }

  hits(asteroid) {
    let d = dist(this.pos.x, this.pos.y, asteroid.pos.x, asteroid.pos.y);
    if (d < this.r + asteroid.r) {  // When the spaceship hits an asteroid
      gameOver = true;  // Set gameOver to true
      return true;
    }
    return false;
  }
}

class Asteroid {
  constructor(target) {
    // 随机决定小行星是从上下还是左右出现
    if (random() < 0.5) {
      // 上下出现
      let x = random(width);
      let y = random() < 0.5 ? 0 : height;
      this.pos = createVector(x, y);
    } else {
      // 左右出现
      let x = random() < 0.5 ? 0 : width;
      let y = random(height);
      this.pos = createVector(x, y);
    }
	
	let asteroidIndex = floor(random(asteroidImgs.length));  // 随机选择一个小行星图片的索引
    this.img = asteroidImgs[asteroidIndex];  // 使用索引获取图片
    this.name = asteroidNames[asteroidIndex];  // 使用索引获取图片名字  // 新增：存储小行星的名字

    this.vel = p5.Vector.sub(target.pos, this.pos);
    this.vel.setMag(0.5);// 新增：存储小行星的名字
	this.r = 30;  // Set the radius of the asteroid
  }

  show() {
    let imgWidth = this.img.width / 1.5;
    let imgHeight = this.img.height / 1.5;
    image(this.img, this.pos.x - imgWidth / 2, this.pos.y - imgHeight / 2, imgWidth, imgHeight);  // Draw the image centered at its position
  }

  move() {
    this.pos.add(this.vel);
  }
}


class Bullet {
  constructor(pos, target) {
    this.pos = pos;
    this.vel = p5.Vector.sub(target, pos);
    this.vel.setMag(10);
    this.r = 7;
    console.log("Created bullet with position:", this.pos, "and velocity:", this.vel);
  }

  show() {
    let diameter = this.r * 10;  // Change this value to scale the bullet
    fill(255);
    ellipse(this.pos.x, this.pos.y, diameter, diameter); // Draw the ellipse centered at its position
  }

  move() {
    this.pos.add(this.vel);
  }

  hits(asteroid) {
     let d = dist(this.pos.x, this.pos.y, asteroid.pos.x, asteroid.pos.y);
  let hit = d < (this.r + asteroid.r*10);
  if (hit) {
    console.log('Hit detected');
  }
  return hit;
}
}