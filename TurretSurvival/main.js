class Object {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.sx = 0;
        this.sy = 0;
    }
    isColliding(object) {
        let colliding = true;
    
        let thisHalfWidth = this.sx / 2;
        let thisHalfHeight = this.sy / 2;
        let objectHalfWidth = object.sx / 2;
        let objectHalfHeight = object.sy / 2;
    
        let thisCenterX = this.x + thisHalfWidth;
        let thisCenterY = this.y + thisHalfHeight;
        let objectCenterX = object.x + objectHalfWidth;
        let objectCenterY = object.y + objectHalfHeight;
    
        let dx = thisCenterX - objectCenterX;
        let dy = thisCenterY - objectCenterY;

        let combinedHalfWidths = thisHalfWidth + objectHalfWidth;
        let combinedHalfHeights = thisHalfHeight + objectHalfHeight;
    
        if (Math.abs(dx) > combinedHalfWidths) {
            colliding = false;
        }
    
        if (Math.abs(dy) > combinedHalfHeights) {
            colliding = false;
        }
    
        return colliding;
    }
}
class Entity extends Object {
    constructor() {
        super();
        this.health = 0;
        this.maxHealth = 0;
        this.speed = 0;
        this.sprite = new Image();
        this.angle = 0;
    }
    damage(amount) {
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
        }
    }
    heal(amount) {
        this.health += amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
    }
    isDestroyed() {
        return this.health <= 0;
    }
    moveTowards(x, y) {
        let dx = this.x - x;
        let dy = this.y - y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let angle = Math.atan2(dy, dx);
        this.angle = angle;
        if (distance > 0) {
            this.x -= Math.cos(angle) * this.speed;
            this.y -= Math.sin(angle) * this.speed;
        }
    }
    draw() {
        ctx.drawImage(this.sprite, this.x - viewport.x, this.y - viewport.y, this.sx, this.sy);
    }
}
class Player extends Entity {
    constructor() {
        super();
        this.health = 100;
        this.maxHealth = 100;
        this.stamina = 100;
        this.maxStamina = 100;
        this.sprite.src = "sprites/entities/player.png";
    }
}
class Enemy extends Entity {
    constructor() {
        super();
        this.health = 50;
        this.maxHealth = 50;
        this.reward = 10;
        this.sx = 10;
        this.sy = 20;
        this.speed = 0.5;
        this.sprite.src = "sprites/entities/enemy.png";
        this.angle = 0;
    }
    draw() {
        // flip if left facing
        ctx.save();
        ctx.translate(this.x - viewport.x, this.y - viewport.y);
        if (this.angle < Math.PI/2 && this.angle > -Math.PI/2) {
            ctx.scale(-1,1);
            ctx.translate(-this.sx, 0);
        }
        ctx.drawImage(this.sprite, 0, 0, this.sx, this.sy);
        ctx.restore();
    }
}
class Boss extends Enemy {
    constructor() {
        super();
        this.health = 10000;
        this.maxHealth = 10000;
        this.reward = 100;
        this.sx = 150;
        this.sy = 200;
        this.speed = 0.1;
    }
}
class Projectile extends Entity {
    constructor() {
        super();
        this.health = 10;
        this.maxHealth = 10;
        this.speed = 10;
        this.vx = 0;
        this.vy = 0;
        this.sprite.src = "sprites/entities/bullet.png";
    }
}
class Turret extends Entity {
    constructor() {
        super();
        this.sx = 20;
        this.sy = 20;
        this.health = 200;
        this.maxHealth = 200;
        this.firePower = 10;
        this.projectileSize = 5;
        this.fireRate = 0.5;
        this.lastFire = 0.00;
        this.projectileCount = 1;
        this.projectileSpeed = 10;
        this.type = "turret";
        this.sprite.src = "sprites/turrets/base_default.png";
        this.gun = new Image();
        this.gun.src = "sprites/turrets/top_default.png";
        this.angle = 0;
        this.target = true;
    }
    shootAt(x, y) {
        let projectiles = [];
        for (let i = 0; i < this.projectileCount; i++) {
            let projectile = new Projectile();
            projectile.maxHealth = this.firePower;
            projectile.health = projectile.firePower;
            projectile.speed = this.projectileSpeed;

            projectile.x = this.x + this.sx/2;
            projectile.y = this.y + this.sy/2;
            projectile.sx = this.projectileSize;
            projectile.sy = this.projectileSize;
            
            let angle = Math.atan2(y - this.y, x - this.x) + i / Math.PI / 4;
            this.angle = angle;
            projectile.vx = Math.cos(angle);
            projectile.vy = Math.sin(angle);

            projectiles.push(projectile);
        }
        return projectiles;
    }
    draw() {
        ctx.drawImage(this.sprite, this.x - viewport.x - this.sx/2, this.y - viewport.y - this.sy/2, this.sx*2, this.sy*2);
    }
    drawGun() {
        ctx.save();
        ctx.translate(this.x - viewport.x + this.sx/2, this.y - viewport.y + this.sy/2);
        ctx.rotate(this.angle);
        ctx.drawImage(this.gun, -this.sx, -this.sy, this.sx*2, this.sy*2);
        ctx.restore();
    }
}
class ShotgunTurret extends Turret {
    constructor() {
        super();
        this.fireRate = 1; // 1 per second
        this.projectileCount = 3;
        this.gun.src = "sprites/turrets/top_shotgun.png";
        this.type = "shotgun";
    }
}
class SpiderTurret extends Turret {
    constructor() {
        super();
        this.fireRate = 1; // 1 per second
        this.projectileCount = 79;
        this.gun.src = "sprites/turrets/top_spider.png";
        this.target = false;
        this.type = "spider";
    }
}
class RailgunTurret extends Turret {
    constructor() {
        super();
        this.fireRate = 5; // 1 per 5 seconds
        this.firePower = 1000;
        this.projectileSize = 10;
        this.projectileCount = 1;
        this.projectileSpeed = 20;
        this.type = "railgun";
    }
}
class CannonTurret extends Turret {
    constructor() {
        super();
        this.fireRate = 3; // 1 per 3 seconds
        this.firePower = 100;
        this.projectileSize = 20;
        this.gun.src = "sprites/turrets/top_cannon.png";
        this.type = "cannon";
    }
}
class SpamTurret extends Turret {
    constructor() {
        super();
        this.fireRate = 0.01; // 10 per second
        this.firePower /= 2;
        this.projectileSize /= 2;
        this.type = "spam";
    }
}
class UIElement extends Object {
    constructor() {
        super();
    }
}
class Button extends UIElement {
    constructor(text) {
        super();
        this.sx = 50;
        this.sy = 50;
        this.text = text;
        this.top = "";
        this.bottom = "";
        this.callback = () => {};
        this.off = () => {};
    }
    click() {
        this.callback();
    }
    unclick() {
        this.off();
    }
    isClicked(x, y) {
        if (x > this.x && x < this.x + this.sx && y > this.y && y < this.y + this.sy) {
            return true;
        }
        return false;
    }
    draw() {
        ctx.fillStyle = "#999999";
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.sx, this.sy, [4]);
        ctx.fill();

        ctx.font = `bold ${this.sx / 2}px sans-serif`;
        ctx.fillStyle = 'black';
        ctx.fillText(this.text, this.x + this.sx / 3, this.y + this.sy / 1.5);

        ctx.font = "12px sans-serif";
        ctx.fillText(this.top, this.x, this.y - 4);
        ctx.fillText(this.bottom, this.x, this.y + this.sy + 12);
    }
}
class IconButton extends Button {
    constructor(icon) {
        super();
        this.sprite = new Image();
        this.sprite.src = icon;
    }
    draw() {
        ctx.fillStyle = "#999999";
        ctx.drawImage(this.sprite, this.x, this.y, this.sx, this.sy);

        ctx.fillStyle = 'black';
        ctx.font = "12px sans-serif";
        ctx.fillText(this.top, this.x, this.y - 4);
        ctx.fillText(this.bottom, this.x, this.y + this.sy + 12);
    }
}
class Icon extends UIElement {
    constructor(icon) {
        super();
        this.sprite = new Image();
        this.sprite.src = icon;
    }
    draw() {
        ctx.drawImage(this.sprite, this.x, this.y, this.sx, this.sy);
    }
}
class StatBar extends UIElement {
    constructor(max, current) {
        super();
        this.maxValue = max;
        this.value = current;
    }
    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.sx, this.sy);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.value / this.maxValue * this.sx, this.sy);
        ctx.font = `${this.sy * 1.5}px Arial`;
        ctx.fillStyle = 'black';
        ctx.fillText(this.value, this.x, this.y - this.sy/2);
    }
}
class Fighter extends Enemy {
    constructor() {
        super();
        this.sx *= 1.5;
        this.maxHealth *= 2;
        this.health *= 2;
    }
}
class Healthpack extends Entity {
    constructor() {
        super();
        this.sx = 15;
        this.sy = 15;
        this.sprite.src = "sprites/entities/healthpack.png";
    }
}
class Hazard extends Entity {
    constructor() {
        super();
        this.damage = 10;
    }
}
class Landmine extends Entity {
    constructor() {
        super();
        this.sx = 15;
        this.sy = 15;
        this.damage = 30;
        this.sprite.src = "sprites/entities/mine.png";
    }
}
class Fire extends Entity {
    constructor() {
        super();
        this.sx = 30;
        this.sy = 30;
        this.damage = 10;
        this.sprite.src = "sprites/entities/fire_1.png";
        this.frames = [
            "sprites/entities/fire_1.png",
            "sprites/entities/fire_1.png",
            "sprites/entities/fire_1.png",
            "sprites/entities/fire_1.png",
            "sprites/entities/fire_2.png",
            "sprites/entities/fire_2.png",
            "sprites/entities/fire_2.png",
            "sprites/entities/fire_2.png",
            "sprites/entities/fire_3.png",
            "sprites/entities/fire_3.png",
            "sprites/entities/fire_3.png",
            "sprites/entities/fire_3.png",
        ];
        this.sprites = [];
        for (let i = 0; i < this.frames.length; i++) {
            this.sprites.push(new Image());
            this.sprites[i].src = this.frames[i];
        }
        this.frame = 0;
    }
    draw() {
        ctx.drawImage(this.sprites[this.frame], this.x - viewport.x, this.y - viewport.y, this.sx, this.sy);
        this.frame++;
        if (this.frame >= this.frames.length) {
            this.frame = 0;
        }
    }
}

const turretShop = [
    {
        name: "Turret",
        price: 50,
    },
    {
        name: "Shotgun",
        price: 100,
    },
    {
        name: "Cannon",
        price: 150,
    },
    {
        name: "Spam",
        price: 500,
    },
    {
        name: "Spider",
        price: 800,
    },
    {
        name: "Railgun",
        price: 1500,
    }
]
function getTurretFromI(i) {
    switch (i) {
        case 0:
            return new Turret();
            break;
        case 1:
            return new ShotgunTurret();
            break;
        case 2:
            return new CannonTurret();
            break;
        case 3:
            return new SpamTurret();
            break;
        case 4:
            return new SpiderTurret();
            break;
        case 5:
            return new RailgunTurret();
            break;
        default:
            return new Turret();
            break;
    }
}

// UI
const fpsElement = document.getElementById('fps');
const healthElement = document.getElementById('health');
const staminaElement = document.getElementById('stamina');
const coinsElement = document.getElementById('coins');
const enemiesElement = document.getElementById('enemies');
const turretsElement = document.getElementById('turrets');
const hotbarElement = document.getElementById('hotbar');
const healthBarFill = document.getElementById('healthBarFill');
const staminaBarFill = document.getElementById('staminaBarFill');

const canvas = document.getElementById('renderer');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.imageSmoothingEnabled = false;
const ctx = canvas.getContext('2d');
let viewport = {"x": 0, "y": 0};

const chunkSize = 10;
/*
const width = Math.ceil(canvas.width / chunkSize) * 10;
const height = Math.ceil(canvas.height / chunkSize) * 10;
const persistence = 0.7;
const octaves = 6;

let perlinNoise = generatePerlinNoise(width, height, persistence, octaves);
// append flipped array to each array then append flipped perlinNoise to istelf
const perlinNoiseFlippedX = perlinNoise.map((row) => row.slice().reverse());
for (let i = 0; i < perlinNoise.length; i++) {
    perlinNoise[i] = perlinNoise[i].concat(perlinNoiseFlippedX[i]);
}
const perlinNoiseFlippedY = perlinNoise.slice().reverse();
perlinNoise = perlinNoise.concat(perlinNoiseFlippedY);
*/
let enemies = [];
let fighters = [];
let healthPacks = [];
let hazards = [];
let projectiles = [];
let turrets = [];
let currency = 10;
let kills = 0;
let pricing = 1;
let pricingIncrease = 0.1;

if (location.href.includes('localhost') || location.href.includes('127.0.0.1')) {
    currency = 999999;
}

function createNewEnemy() {
    let enemy = new Enemy();
    let rate = Math.round(Math.sqrt(Math.pow(viewport.x, 2) + Math.pow(viewport.y, 2)) / 1000) + 1;
    let rand = Math.random() * rate;
    if (rand > 1) {
        enemy.speed += rate / 10;
        enemy.health += enemy.health * rate / 10;
        enemy.maxHealth = enemy.health;
        enemy.sx += Math.min(100, enemy.sx * rate / 10);
        enemy.sy += Math.min(100, enemy.sy * rate / 10);
        enemy.reward += enemy.reward * rate / 10;
    }

    if (Math.random() < 1/(10 * enemies.length) && rate > 5) {
        enemy = new Boss();
        enemy.health *= rate;
        enemy.maxHealth *= rate;
        enemy.reward *= rate;
    }

    let choice = Math.floor(Math.random() * 4);
    if (choice == 0) {
        enemy.x = Math.random() * canvas.width + viewport.x;
        enemy.y = canvas.height + viewport.y + enemy.sy;
    } else if (choice == 1) {
        enemy.x = Math.random() * canvas.width + viewport.x;
        enemy.y = viewport.y - enemy.sy * 2;
    } else if (choice == 2) {
        enemy.x = canvas.width + viewport.x + enemy.sx;
        enemy.y = Math.random() * canvas.height + viewport.y;
    } else if (choice == 3) {
        enemy.x = viewport.x - enemy.sx * 2;
        enemy.y = Math.random() * canvas.height + viewport.y;
    }

    return enemy;
}
function createTurret(i) {
    let turretDetails = turretShop[i];
    let turretPrice = turretDetails.price;
    if (currency >= turretPrice * pricing) {
        let turret = getTurretFromI(i);
        turret.x = player.x + player.sx/2 - turret.sx/2;
        turret.y = player.y + player.sy/2 - turret.sy/2;
        turrets.push(turret);
        currency = (Math.round(currency*100) - Math.round(turretPrice*pricing*100))/100;
        pricing = (Math.round(pricing*100) + Math.round(pricingIncrease*100))/100;
    }
}
function buyEnemy() {
    if (currency >= 20) {
        let enemy = createNewEnemy();
        enemies.push(enemy);
        currency -= 20;
    }
}
function buyMine() {
    if (currency >= 20) {
        let mine = new Landmine();
        mine.x = Math.random() * canvas.width + viewport.x;
        mine.y = Math.random() * canvas.height + viewport.y;
        hazards.push(mine);
        currency -= 20;
    }
}
function buyMedkit() {
    if (currency >= 200) {
        let healthPack = new Healthpack();
        healthPack.x = Math.random() * canvas.width + viewport.x;
        healthPack.y = Math.random() * canvas.height + viewport.y;
        healthPacks.push(healthPack);
        currency -= 200;
    }
}
function shoot() {
    if (currency >= 1) {
        let projectile = new Projectile();
        projectile.x = player.x + player.sx/2;
        projectile.y = player.y + player.sy/2;
        projectile.sx = 4;
        projectile.sy = 4;
        
        let angle = Math.atan2(mousePosition.y - player.y, mousePosition.x - player.x);
        projectile.vx = Math.cos(angle);
        projectile.vy = Math.sin(angle);

        projectiles.push(projectile);
        currency -= 1;
    }
}

let player = new Player();
player.x = canvas.width / 2;
player.y = canvas.height / 2;
player.sx = 10;
player.sy = 20;
player.speed = 5;

let playerHealthBar = new StatBar(player.maxHealth, player.health);
playerHealthBar.x = 50;
playerHealthBar.y = canvas.height - 270;
playerHealthBar.sx = 100;
playerHealthBar.sy = 10;

let mousePosition = {"x": 0, "y": 0};

let playerVelocity = {"left": 0, "up":0, "right":0, "down":0};

let lastRender = performance.now();
let frameCount = 0;
let fps = 0;

let menuButtons = [];
let menuButtonPrices = [];

const buyEnemyElement = document.getElementById("buyEnemy");
buyEnemyElement.onclick = () => {buyEnemy()};

const buyMineElement = document.getElementById("buyMine");
buyMineElement.onclick = () => {buyMine()};

const buyMedkitElement = document.getElementById("buyMedkit");
buyMedkitElement.onclick = () => {buyMedkit()};

for (i = 0; i < turretShop.length; i++) {
    let btn = document.createElement('button');
    let name = document.createElement('span');
    name.innerText = turretShop[i].name;
    btn.appendChild(name);
    let key = document.createElement('span')
    key.innerText = i+1;
    btn.appendChild(key);
    let price = document.createElement('span')
    price.innerText = "$" + turretShop[i].price;
    btn.appendChild(price);
    btn.addEventListener('click', (function(index) {
        return function() {
            createTurret(index);
        }
    })(i));
    hotbarElement.appendChild(btn);
    menuButtonPrices.push(price);
    menuButtons.push(btn);
}

for (let i = 0; i < 5; i++) {
    let enemy = createNewEnemy();
    enemies.push(enemy);
}

for (let i = 0; i < 5; i++) {
    let healthPack = new Healthpack();
    healthPack.x = Math.random() * canvas.width + viewport.x;
    healthPack.y = Math.random() * canvas.height + viewport.y;
    healthPacks.push(healthPack);

    let landmine = new Landmine();
    landmine.x = Math.random() * canvas.width + viewport.x;
    landmine.y = Math.random() * canvas.height + viewport.y;
    hazards.push(landmine);

    let fire = new Fire();
    fire.x = Math.random() * canvas.width + viewport.x;
    fire.y = Math.random() * canvas.height + viewport.y;
    hazards.push(fire);
}

function setMousePosition(e) {
    mousePosition.x = e.clientX + viewport.x;
    mousePosition.y = e.clientY + viewport.y;
}
document.addEventListener("mousemove",  (e) => {
    setMousePosition(e);
});
canvas.addEventListener("mousedown", (e) => {
    setMousePosition(e);
    shoot();
});

// moving keys
document.addEventListener('keydown', function(event) {
    if (event.key == 'ArrowLeft') {
        playerVelocity.left = player.speed;
    } else if (event.key == 'ArrowRight') {
        playerVelocity.right = player.speed;
    } else if (event.key == 'ArrowUp') {
        playerVelocity.up = player.speed;
    } else if (event.key == 'ArrowDown') {
        playerVelocity.down = player.speed;
    } else if (event.key == 'w') {
        playerVelocity.up = player.speed;
    } else if (event.key == 'a') {
        playerVelocity.left = player.speed;
    } else if (event.key =='s') {
        playerVelocity.down = player.speed;
    } else if (event.key == 'd') {
        playerVelocity.right = player.speed;
    }
});
document.addEventListener('keyup', function(event) {
    if (event.key == 'ArrowLeft') {
        playerVelocity.left = 0;
    } else if (event.key == 'ArrowRight') {
        playerVelocity.right = 0;
    } else if (event.key == 'ArrowUp') {
        playerVelocity.up = 0;
    } else if (event.key == 'ArrowDown') {
        playerVelocity.down = 0;
    } else if (event.key == 'w') {
        playerVelocity.up = 0;
    } else if (event.key == 'a') {
        playerVelocity.left = 0;
    } else if (event.key =='s') {
        playerVelocity.down = 0;
    } else if (event.key == 'd') {
        playerVelocity.right = 0;
    }
});
document.addEventListener('keydown', function(event) {
    if (parseInt(event.key) - 1 < turretShop.length) {
        createTurret(parseInt(event.key) - 1);
    }
});

function drawScene() {
    let chunkCountX = canvas.width / chunkSize;
    let chunkCountY = canvas.height / chunkSize;
    for (let x = 0; x < chunkCountX; x++) {
        for (let y = 0; y < chunkCountY; y++) {
            let chunkPositionX = chunkSize * x + viewport.x;
            let chunkPositionY = chunkSize * y + viewport.y;
            // let perlinPositionX = Math.floor(Math.abs(chunkPositionX / chunkSize) % perlinNoise.length);
            // let perlinPositionY = Math.floor(Math.abs(chunkPositionY / chunkSize) % perlinNoise[0].length);
            // let perlinValue = perlinNoise[perlinPositionX][perlinPositionY];

            let distanceFromCenter = Math.sqrt(Math.pow(chunkPositionX - canvas.width / 2, 2) + Math.pow(chunkPositionY - canvas.height / 2, 2)) / 20;

            const white = [255, 255, 255];
            const red = [255, 20, 20];
            const black = [0, 0, 0];

            let t = Math.min(distanceFromCenter / (canvas.width / 2), 1);

            let r = white[0] * (1 - t) + red[0] * t;
            let g = white[1] * (1 - t) + red[1] * t;
            let b = white[2] * (1 - t) + red[2] * t;

            if (distanceFromCenter > canvas.width / 2) {
                t = Math.min((distanceFromCenter - canvas.width / 2) / (canvas.width / 2), 1);
                r = red[0] * (1 - t) + black[0] * t;
                g = red[1] * (1 - t) + black[1] * t;
                b = red[2] * (1 - t) + black[2] * t;
            }

            // r *= 1 - (perlinValue / 2);
            // g *= 1 - (perlinValue / 2);
            // b *= 1 - (perlinValue / 2);

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(chunkPositionX - viewport.x, chunkPositionY - viewport.y, chunkSize, chunkSize);
        }
    }
}

function updateUI() {
    const now = performance.now();
    const delta = now - lastRender;
    frameCount++;
    if (delta >= 1000) {
        fps = frameCount * (1000 / delta);
        frameCount = 0;
        lastRender = now;
    }
    fpsElement.innerText = `FPS: ${Math.round(fps)}`;
    healthElement.innerText = `Health: ${player.health} / ${player.maxHealth}`;
    staminaElement.innerText = `Stamina: ${player.stamina} / ${player.maxStamina}`;
    coinsElement.innerText = `Coins: ${Math.round(currency*100)/100}`;
    enemiesElement.innerText = `Enemies: ${enemies.length} & ${fighters.length} (${kills} kills)`;
    turretsElement.innerText = `Turrets: ${turrets.length}`;

    for (i = 0; i < turretShop.length; i++) {
        menuButtonPrices[i].innerText = `$${(Math.round(turretShop[i].price*pricing*100)/100)}`;
    }

    healthBarFill.style.width = player.health + "%";
    staminaBarFill.style.width = player.stamina + "%";
}

function render() {
    // move entities towards player
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].moveTowards(player.x, player.y);
    }
    for (let i = 0; i < fighters.length; i++) {
        // find closest turret
        let closestTurret = null;
        let closestDistance = Infinity;
        for (let j = 0; j < turrets.length; j++) {
            let turret = turrets[j];
            let distance = Math.sqrt(Math.pow(turret.x - fighters[i].x, 2) + Math.pow(turret.y - fighters[i].y, 2));
            if (distance < closestDistance) {
                closestDistance = distance;
                closestTurret = turret;
            }
        }
        if (closestTurret) {
            fighters[i].moveTowards(closestTurret.x, closestTurret.y);
        }
    }

    // move player
    player.x += playerVelocity.right - playerVelocity.left;
    player.y += playerVelocity.down - playerVelocity.up;

    if (player.x < viewport.x + 100) {
        viewport.x = player.x - 101;
    } else if (player.x > canvas.width + viewport.x - 200) {
        viewport.x = player.x + 201 - canvas.width;
    }
    if (player.y < viewport.y + 100) {
        viewport.y = player.y - 101;
    } else if (player.y > canvas.height + viewport.y - 200) {
        viewport.y = player.y + 201 - canvas.height;
    }

    // move projectiles
    for (let i = 0; i < projectiles.length; i++) {
        let projectile = projectiles[i];
        projectile.x += projectile.vx * projectile.speed;
        projectile.y += projectile.vy * projectile.speed;
    }

    // shoot closest enemy with turrets
    for (let i = 0; i < turrets.length; i++) {
        let turret = turrets[i];
        // if in viewport
        if (turret.x > viewport.x - 20 && turret.x < viewport.x + canvas.width + 40 &&
            turret.y > viewport.y - 20 && turret.y < viewport.y + canvas.height + 40) {

            // check turret fireRate and increment LastFire
            let now = performance.now();
            if (now - turret.lastFire >= turret.fireRate * 1000) {

                let closestEnemy = null;
                let closestDistance = Infinity;
                if (!turret.target) {
                    closestEnemy = new Enemy(turret.x, turret.y);
                } else {
                    for (let j = 0; j < enemies.length; j++) {
                        let enemy = enemies[j];
                        let distance = Math.sqrt(Math.pow(enemy.x - turret.x, 2) + Math.pow(enemy.y - turret.y, 2));
                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestEnemy = enemy;
                        }
                    }
                }
                
                if (closestEnemy != null) {
                    let projectileList = turret.shootAt(closestEnemy.x, closestEnemy.y);
                    for (let j = 0; j < projectileList.length; j++) {
                        projectiles.push(projectileList[j]);
                    }
                    turret.lastFire = now;
                    // maybe make fighters
                    if (Math.random() < 1/200) {
                        let fighter = new Fighter();
                        let newEnemy = createNewEnemy();
                        fighter.x = newEnemy.x;
                        fighter.y = newEnemy.y;
                        fighters.push(fighter);
                    }
                }
            }
        }
    }

    // check collisions
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        if (player.isColliding(enemy)) {
            player.damage(enemy.reward);
            enemies[i] = createNewEnemy();
        }
        for (let j = 0; j < turrets.length; j++) {
            let turret = turrets[j];
            if (enemy.isColliding(turret)) {
                turret.damage(enemy.health);
                enemy.damage(turret.maxHealth);
            }
        }
    }
    for (let i = 0; i < fighters.length; i++) {
        let fighter = fighters[i];
        if (player.isColliding(fighter)) {
            player.damage(fighter.reward);
            fighters.splice(i, 1);
        }
        for (let j = 0; j < turrets.length; j++) {
            let turret = turrets[j];
            if (fighter.isColliding(turret)) {
                turret.damage(fighter.health);
                fighter.damage(turret.maxHealth);
            }
        }
    }

    for (let i = 0; i < healthPacks.length; i++) {
        let healthPack = healthPacks[i];
        if (player.isColliding(healthPack)) {
            player.heal(10);
            currency += 5;
            healthPack.x = Math.random() * canvas.width + viewport.x;
            healthPack.y = Math.random() * canvas.height + viewport.y;
        }
    }

    for (let i = 0; i < hazards.length; i++) {
        let hazard = hazards[i];
        if (player.isColliding(hazard)) {
            player.damage(hazard.damage);
            hazard.x = Math.random() * canvas.width + viewport.x;
            hazard.y = Math.random() * canvas.height + viewport.y;
        }
        for (let j = 0; j < enemies.length; j++) {
            let enemy = enemies[j];
            if (enemy.isColliding(hazard)) {
                enemy.damage(hazard.damage);
                hazard.x = Math.random() * canvas.width + viewport.x;
                hazard.y = Math.random() * canvas.height + viewport.y;
            }
        }
        for (let j = 0; j < fighters.length; j++) {
            let fighter = fighters[j];
            if (fighter.isColliding(hazard)) {
                fighter.damage(hazard.damage);
                hazard.x = Math.random() * canvas.width + viewport.x;
                hazard.y = Math.random() * canvas.height + viewport.y;
            }
        }
    }

    for (let i = 0; i < projectiles.length; i++) {
        let projectile = projectiles[i];
        for (let j = 0; j < enemies.length; j++) {
            let enemy = enemies[j];
            if (projectile.isColliding(enemy)) {
                projectile.damage(enemy.health);
                enemy.damage(projectile.maxHealth);
            }
        }
        for (let j = 0; j < fighters.length; j++) {
            let fighter = fighters[j];
            if (projectile.isColliding(fighter)) {
                projectile.damage(fighter.health);
                fighter.damage(projectile.maxHealth);
            }
        }
    }

    // check deaths
    if (player.isDestroyed()) {
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
        player.health = player.maxHealth;
        currency = 0;
        viewport = {"x": 0, "y": 0};
    }

    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        if (enemy.isDestroyed()) {
            currency += enemy.reward;
            enemies.splice(i, 1);
            let newEnemy = createNewEnemy();
            enemies.push(newEnemy);
            kills++;
        }
        if (enemies[i].x < viewport.x - enemies[i].sx * 3) {
            let newEnemy = createNewEnemy();
            enemies[i].x = newEnemy.x;
            enemies[i].y = newEnemy.y;
        } else if (enemies[i].x > canvas.width + viewport.x + enemies[i].sx * 2) {
            let newEnemy = createNewEnemy();
            enemies[i].x = newEnemy.x;
            enemies[i].y = newEnemy.y;
        }
        if (enemies[i].y < viewport.y - enemies[i].sy * 3) {
            let newEnemy = createNewEnemy();
            enemies[i].x = newEnemy.x;
            enemies[i].y = newEnemy.y;
        } else if (enemies[i].y > canvas.height + viewport.y + enemies[i].sy * 2) {
            let newEnemy = createNewEnemy();
            enemies[i].x = newEnemy.x;
            enemies[i].y = newEnemy.y;
        }
    }

    for (let i = 0; i < projectiles.length; i++) {
        let projectile = projectiles[i];
        if (projectile.isDestroyed()) {
            projectiles.splice(i, 1);
        }
        if (projectile.x < viewport.x - projectile.sx || projectile.x > viewport.x + canvas.width || 
            projectile.y < viewport.y - projectile.sy || projectile.y > viewport.y + canvas.height) {
            projectiles.splice(i, 1);
        }
    }

    for (let i = 0; i < healthPacks.length; i++) {
        let healthPack = healthPacks[i];
        if (healthPack.x < viewport.x - healthPack.sx || healthPack.x > viewport.x + canvas.width || 
            healthPack.y < viewport.y - healthPack.sy || healthPack.y > viewport.y + canvas.height) {
            healthPack.x = Math.random() * canvas.width + viewport.x;
            healthPack.y = Math.random() * canvas.height + viewport.y;
        }
    }

    for (let i = 0; i < hazards.length; i++) {
        let hazard = hazards[i];
        if (hazard.x < viewport.x - hazard.sx || hazard.x > viewport.x + canvas.width || 
            hazard.y < viewport.y - hazard.sy || hazard.y > viewport.y + canvas.height) {
            hazard.x = Math.random() * canvas.width + viewport.x;
            hazard.y = Math.random() * canvas.height + viewport.y;
        }
    }

    for (let i = 0; i < turrets.length; i++) {
        let turret = turrets[i];
        if (turret.isDestroyed()) {
            turrets.splice(i, 1);
        }
    }
    
    for (let i = 0; i < fighters.length; i++) {
        let fighter = fighters[i];
        if (fighter.isDestroyed()) {
            fighters.splice(i, 1);
            kills++;
        } else if (fighter.x < viewport.x - 20) {
            let newEnemy = createNewEnemy();
            fighter.x = newEnemy.x;
            fighter.y = newEnemy.y;
        } else if (fighter.x > canvas.width + viewport.x + 40) {
            let newEnemy = createNewEnemy();
            fighter.x = newEnemy.x;
            fighter.y = newEnemy.y;
        }
        if (fighter.y < viewport.y - 20) {
            let newEnemy = createNewEnemy();
            fighter.x = newEnemy.x;
            fighter.y = newEnemy.y;
        } else if (fighter.y > canvas.height + viewport.y + 40) {
            let newEnemy = createNewEnemy();
            fighter.x = newEnemy.x;
            fighter.y = newEnemy.y;
        }
    }

    // draw entities
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let distanceFromCenter = Math.sqrt(Math.pow(canvas.width / 2 - viewport.x, 2) + Math.pow(canvas.height / 2 - viewport.y, 2)) / 20;
    const white = [255, 255, 255];
    const red = [255, 20, 20];
    const black = [0, 0, 0];
    let t = Math.min(distanceFromCenter / (canvas.width / 2), 1);

    let r = white[0] * (1 - t) + red[0] * t;
    let g = white[1] * (1 - t) + red[1] * t;
    let b = white[2] * (1 - t) + red[2] * t;

    if (distanceFromCenter > canvas.width / 2) {
        t = Math.min((distanceFromCenter - canvas.width / 2) / (canvas.width / 2), 1);
        r = red[0] * (1 - t) + black[0] * t;
        g = red[1] * (1 - t) + black[1] * t;
        b = red[2] * (1 - t) + black[2] * t;
    }

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // draw scene
    // drawScene();

    player.draw();

    for (let i = 0; i < healthPacks.length; i++) {
        healthPacks[i].draw();
    }

    for (let i = 0; i < hazards.length; i++) {
        hazards[i].draw();
    }

    for (let i = 0; i < enemies.length; i++) {
        enemies[i].draw();
    }
    for (let i = 0; i < fighters.length; i++) {
        fighters[i].draw();
    }
    
    for (let i = 0; i < turrets.length; i++) {
        let turret = turrets[i];
        turret.draw();
        turret.drawGun();
    }

    // draw projectiles
    for (let i = 0; i < projectiles.length; i++) {
        let projectile = projectiles[i];
        projectile.draw();
    }

    // draw health bars
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        let healthBar = new StatBar(enemy.maxHealth, enemy.health);
        healthBar.x = enemy.x - viewport.x;
        healthBar.y = enemy.y - viewport.y - 10;
        healthBar.sx = enemy.sx;
        healthBar.sy = 5;
        healthBar.draw();
    }

    for (let i = 0; i < fighters.length; i++) {
        let enemy = fighters[i];
        let healthBar = new StatBar(enemy.maxHealth, enemy.health);
        healthBar.x = enemy.x - viewport.x;
        healthBar.y = enemy.y - viewport.y - 10;
        healthBar.sx = enemy.sx;
        healthBar.sy = 5;
        healthBar.draw();
    }

    for (let i = 0; i < turrets.length; i++) {
        let turret = turrets[i];
        let healthBar = new StatBar(turret.maxHealth, turret.health);
        healthBar.x = turret.x - viewport.x;
        healthBar.y = turret.y - viewport.y - 10;
        healthBar.sx = turret.sx;
        healthBar.sy = 5;
        healthBar.draw();
    }

    updateUI();
    requestAnimationFrame(render);
}
render();