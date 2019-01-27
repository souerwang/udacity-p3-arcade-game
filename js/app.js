// the pace is preset for moving horizationally 
const columnShift = [100,200,300,400];
// the pace is preset for moving vertically as well
const laneShift = [60,145,230,315,400];

// array for changing player's imange
const players = ['images/char-boy.png','images/char-cat-girl.png','images/char-horn-girl.png',
'images/char-pink-girl.png','images/char-princess-girl.png'];

// initial the sum of gems
let gemSum = 3;
// array for the imanges of gem
const gems = ['images/Gem Blue.png','images/Gem Green.png','images/Gem Orange.png'];
let allGems = [];

// initial the sum of enemies
let enemySum = 4;
let allEnemies = [];
// the enemy runs at random speed which ranges from the minima to the maxima
let enemyMinSpeed = 80;
let enemyMaxSpeed = 200;

let startTime = Date.now();

let gameEnd = false;

// Enemies our player must avoid
const Enemy = function(s,y) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    // the enemy starts out from the position of x =0 and y= certain lane
    this.x = 0; 
    this.y = laneShift[y];
    // the enemy's speed
    this.s = s;
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images 
    this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt, player, canvas) {
    // multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for all computers.

    // dealing with 2 issues while enemy runs
    // reset the player's postion while collisions happen within the range [50,50]
    if ((Math.abs(this.x - player.x) < 50) && (Math.abs(this.y - player.y) < 50)){
        player.reset();
        borad.reset();
    }
    // enemy runs cross the canvas at the same speed then happen again at x=0
    if (this.x < canvas.width) {
        this.x += this.s*dt;
    } else {
        this.reset();
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}; 

// Reset enemy's attribute of location and random speed. 
Enemy.prototype.reset = function() {
    this.x = 0;
    this.y = laneShift[Math.floor(Math.random() * 3)];
    this.s = Math.floor(Math.random() * enemyMaxSpeed)+enemyMinSpeed;
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
let Player = function() {
    this.sprite = players[0];
    this.reset();
}

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// reset the player's position to 200,315
Player.prototype.reset = function() {
    this.x = 200;
    this.y = 315;
};

// change player sequently
Player.prototype.changePlayer = function() {
    let currentPlayer = this.sprite;
    let index = players.findIndex(function(player) {
        return currentPlayer == player;
    });
    //loop the sequence 
    if (index+1 == players.length) {
        this.sprite = players[0];
    } else {
        this.sprite = players[++index];
    }
};
// callback function for handling mouse&'Enter'keypress
// to deal with player moving and changing role
Player.prototype.handleInput = function(keyCode) {
    // moving player within the range as following setting-up
    const playStage = {
        horizontalStart: 0,
        horizontalEnd: ctx.canvas.width - 200,
        verticalStart: -25,
        verticalEnd: ctx.canvas.height - 255
    }

    if (keyCode == 'right' && (this.x < playStage.horizontalEnd))
        this.x += 100;
    if (keyCode == 'left' && (this.x > playStage.horizontalStart))
        this.x -= 100;
    if (keyCode == 'up' && (this.y > playStage.verticalStart))
        this.y -= 85;
    if (keyCode == 'down' && (this.y < playStage.verticalEnd))
        this.y += 85;
    if (keyCode == 'enter')
        player.changePlayer();     
    
    // When the player arrive at the edge of river (within 80)
    // the success of player crossing     
    if (Math.abs(this.y-playStage.verticalStart) < 80) {
        gameEnd = true;
        elapsedTime = Math.floor((Date.now() - this.startTime)/1000);
    }    
};

// Gems may be selected by our player
let Gems  = function(x,y,gemType) {
    // the location of gem
    this.x = columnShift[x]+12;
    this.y = laneShift[y]+20;
    // collected state indicate weather the player meet with the gem 
    this.collected = false; 
    this.sprite = gems[gemType];
};

Gems.prototype.update = function() {
    // gem disappear while the player meet with the gem within the range [50,50]
    if ((Math.abs(this.x - player.x) < 50) && (Math.abs(this.y - player.y) < 50)){
        this.disappear();
    }    
};

Gems.prototype.disappear = function() {
    console.log(this.collected);
    if (!this.collected) {
        this.sprite = '';
        this.collected = true;
        // count the sum of collected gems 
        borad.collectedGems++;
    }
};

// draw all the gems
Gems.prototype.render = function() {
    if(this.sprite) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y , 80, 136);
    }
};

// borad for displaying information of game going
let Board = function() {
    this.gameEnd = false;
    this.startTime = Date.now();
    this.collectedGems = 0;
    this.elapsedTime = 0;
}

Board.prototype.render = function() {
    this.elapsedTime = Math.floor((Date.now() - this.startTime)/1000);
    ctx.save();
    // to draw the board
    ctx.globalAlpha = 0.3;
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "#a0a0a0";
    ctx.fillRect(10, ctx.height, ctx.width, 30);
    // to show elapsed time
    ctx.font = "20px Comic Sans MS";
    ctx.fillStyle = "white";
    ctx.fillText(`elapsed time: ${this.elapsedTime} s`, 
            15, ctx.canvas.clientHeight - 35);
    // to show the sum of collected gems
    ctx.fillText(`Gems: ${this.collectedGems}`, 
    ctx.canvas.width - 100, ctx.canvas.clientHeight - 35);        
    ctx.restore();        
}

// if collisions happen, the sum of collected gems will be reset to 0
Board.prototype.reset = function() {
    this.collectedGems = 0;
}

Board.prototype.update = function() {
    // noop
}

// instantiate all the objects.
// Place all enemy objects in an array called allEnemies
const loadEnemies = (function loadEnemies() {
    allEnemies.length = 0;
    for(let i =0; i < enemySum; i++) {
        allEnemies.push(new Enemy(Math.floor(Math.random() * enemyMaxSpeed)+enemyMinSpeed,
                    Math.floor(Math.random() * 3)));
    }
}());    

// Place the player object in a variable called player
let player = new Player();

// Place all gem objects in an array called allGems
const loadGems = (function loadGems(){
    allGems.length = 0;
    for (let i =0; i < gemSum; i++){
        allGems.push(new Gems(Math.floor(Math.random() * columnShift.length),
                    Math.floor(Math.random() * laneShift.length),Math.floor(Math.random() * gems.length)));
    }
}());

let borad = new Board();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        13: 'enter'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

// this listens for mouse click and callback the changePlayer funcation
document.addEventListener('click', function (e) {
    e.preventDefault();
    player.changePlayer();
});
