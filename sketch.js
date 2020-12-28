var backgroundImage;
var edge1, edge2;

var player, playerLeftImage, playerRightImage;
var helicopter, helicopterImage;
var winImage, gameOverImage;

var bullet, bulletImage, bulletGroup;
var ammoBox, ammoImage;
var armor, armorImage;

var zombie, zombieImage, zombieGroup;
var bossZombie, bossZombieImage;

var shootSound, zombieSound;

var zombieCount = 0, zombieHealth = 500;
var kills = 0, ammo = 50;
var timer = 120, life = 200;
var gameState = "INSTRUCTIONS";
var playerDirection = "right";

function preload()
{
  backgroundImage = loadImage("images/background.jpg");

  playerRightImage = loadImage("images/Player.png");
  playerLeftImage = loadImage("images/Player2.png");
  
  helicopterImage = loadImage("images/helicopter.png");
  bulletImage = loadImage("images/bullet.png");
  ammoImage = loadImage("images/ammo.png");
  armorImage = loadImage("images/armor.png");

  zombieImage = loadImage("images/zombie.png");
  bossZombieImage = loadImage("images/Boss.png");

  winImage = loadImage("images/win.jpg");
  gameOverImage = loadImage("images/gameOver.png");

  shootSound = loadSound("sounds/Gun.mp3");
  zombieSound = loadSound("sounds/zombie.mp3");
}

function setup()
{
  createCanvas(windowWidth, windowHeight);

  edge1 = createSprite(0, 350, 15, height);
  edge1.visible = false;

  edge2 = createSprite(width, 350, 15, height);
  edge2.visible = false;

  player = createSprite(150, 550, 20, 20);
  player.addImage("right", playerRightImage);
  player.addImage("left", playerLeftImage);
  player.scale = 0.3;
  player.setCollider("rectangle", -50, 0, 300, 250);

  ammoBox = createSprite(width/2 + 500, 515, 20, 20);
  ammoBox.addImage(ammoImage);
  ammoBox.scale = 0.2;

  armor = createSprite(width/2, 550, 20, 20);
  armor.addImage(armorImage);
  armor.scale = 0.3;

  helicopter = createSprite(width - 100, 425, 20, 20);
  helicopter.addImage(helicopterImage);
  helicopter.visible = false;

  bossZombie = createSprite(helicopter.x - 100, player.y - 100, 20, 20);
  bossZombie.addImage(bossZombieImage);
  bossZombie.scale = 0.65;
  bossZombie.visible = false;

  bulletGroup = new Group();
  zombieGroup = new Group();
}

function draw()
{
  background(backgroundImage);
  drawSprites();

  player.collide(edge1);
  player.collide(edge2);

  textSize(27);
  fill("blue")
  stroke("red");
  strokeWeight(2);
  textStyle(BOLD);
  textFont("Algerian");

  text("KILLS: " + kills, player.x, player.y - 250);
  text("AMMO: " + ammo, player.x, player.y - 200);
  text("LIFE: " + life, player.x, player.y - 150);

  if(gameState === "INSTRUCTIONS")
  {
    text("Kill 50 Zombies to lure the boss zombie.You have 50 bullets to do so.", 100, 25);
    text("Once you find the boss zombie, kill it and escape with the helicopter in the given time.", 100, 75);
    text("TIP : Aim at the Zombie's head." , 100, 125);
    text("Press UP ARROW to start." , 100, 175);

    if(keyDown(UP_ARROW))
    {
      gameState = "PLAY";
    }
  }

  if(gameState === "PLAY")
  {
    if(zombieCount <= 60)
    {
      spawnZombies();
    }

    commonPlay();

    if(zombieGroup.isTouching(player))
    {
      zombieGroup.get(0).velocityX = 0;
      life--;
    }

    if(life === 0 || ammo === 0)
    {
      gameState = "END";
      life = 0;
    }

    if(kills >= 50)
    {
      bulletGroup.destroyEach();
      zombieGroup.destroyEach();
      ammo = ammo + Math.abs(100 - ammo);
      player.x = 150;
      gameState = "EXTEND";
    }
  }

  if(gameState === "EXTEND")
  {
    fill("red");
    stroke("black");
    strokeWeight(7);
    textSize(12);

    text("KILL THE BOSS ZOMBIE & REACH THE HELICOPTER TO WIN.", 100, 100);
    text("TIME LEFT: " + timer, player.x, player.y + 100);
    text("ZOMBIE HEALTH: "+ zombieHealth, bossZombie.x - 150, bossZombie.y - 170);

    helicopter.visible = true;
    bossZombie.visible = true;
    bossZombie.velocityX = -0.5;

    commonPlay();

    zombieGroup.destroyEach();

    if(frameCount % 25 === 0)
    {
      timer = timer - 1;
    }

    if(bulletGroup.isTouching(bossZombie))
    {
      zombieHealth -= 5;
      life--;
      bulletGroup.get(0).destroy();
    }

    if(zombieHealth === 0)
    {
      zombieHealth = 0;
      bossZombie.destroy();
    }

    if(player.isTouching(helicopter))
    {   
      gameState = "WIN";
    }

    if(player.isTouching(bossZombie) || life === 0 || ammo === 0 || timer === 0)
    {
      gameState = "END";
    }
  }

  if(gameState === "WIN")
  {
    background(winImage);
    reset();
  }

  if(gameState === "END")
  {
    background(gameOverImage);
    reset();
  }
}

function keyPressed()
{
  if(keyCode === 32)
  {
    if(gameState === "PLAY" || gameState === "EXTEND")
    {
      shoot();
      ammo = ammo - 1;
    }
  }
}

function shoot()
{
  bullet = createSprite(player.x + 35, player.y - 45, 20, 20);
  bullet.addImage(bulletImage);
  bullet.scale = 0.2;

  bullet.setCollider("rectangle", 50, 0, 200, 50);
  bullet.velocityX = playerDirection === "left" ? -20 : 20;
  bullet.lifetime = 100;

  shootSound.play();
  bulletGroup.add(bullet);
}

function spawnZombies()
{
  if(frameCount % 85 === 0)
  {
    zombie = createSprite(width, random(480, 615), 20, 20);
    zombie.addImage(zombieImage);
    zombie.scale = random(0.3, 0.4);

    zombie.setCollider("rectangle", 0, -100, 70, 135);
    zombie.velocityX = -10;
    zombie.lifetime = 280;
    zombieSound.play();

    zombieCount++;
    zombieGroup.add(zombie);
  }
}

function commonPlay()
{
  checkPlayerLife();

  if(player.isTouching(armor) && life < 200)
  {
    armor.destroy();
    life = 200;
  }

  if(player.collide(ammoBox))
  {
    ammoBox.destroy();
    ammo += 20;
  }

  if(bulletGroup.isTouching(zombieGroup))
  {
    zombieGroup.get(0).destroy();
    bulletGroup.get(0).destroy();
    kills++;
  }

  if(keyDown(RIGHT_ARROW))
  {
    changePosition(10, 0);
    player.changeAnimation("right", playerRightImage);
    playerDirection = "right";
  }

  if(keyDown(LEFT_ARROW))
  {
    changePosition(-10, 0);
    player.changeAnimation("left", playerLeftImage);
    playerDirection = "left";
  }

  if(keyDown(UP_ARROW) && player.y > 470)
  {
    changePosition(0, -1);
    player.scale -= 0.001;
  }

  if(keyDown(DOWN_ARROW) && player.y < 600)
  {
    changePosition(0, 1);
    player.scale += 0.001;
  }
}

function checkPlayerLife()
{
  //Handle player's life based on the
  //1. Player's scale
  //2. Player's position
  //3. Zombie's position
}

function changePosition(x, y)
{
  player.x = player.x + x;
  player.y = player.y + y;
}

function reset()
{
  life = 0;
  ammo = 0;
  timer = 0;

  player.destroy();
  helicopter.destroy();
  armor.destroy();
  ammoBox.destroy();
  bossZombie.destroy();

  zombieGroup.destroyEach();
  bulletGroup.destroyEach();

  shootSound.stop();
  zombieSound.stop();
}