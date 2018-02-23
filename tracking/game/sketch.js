var world;
var marker;
var coins = [];
var bombs = [];
var points = 0;

var x = -200;
var y = -200;

function setup() {
	world = new World('ARScene');

	textAlign(CENTER,CENTER);

	marker = world.getMarker('w_marker');

	for (var i = 0; i < 100; i++) {
		coins[i] = new Coin();
	}

	for (var i = 0; i < 20; i++) {
		bombs[i] = new Bomb();
	}
}


function draw() {
    world.clearDrawingCanvas();

    if (marker.isVisible()) {
		x = marker.getScreenPosition().x;
		y = marker.getScreenPosition().y;
    }

    // draw all coins
    for (var i = 0; i < coins.length; i++) {
        coins[i].do();
    }

	for (var i = 0; i < bombs.length; i++) {
        bombs[i].do();
    }

    // draw the player
	fill("#2962FF");
    ellipse(x,y,30,30);

    // draw points
    fill(255);
    text(points,x,y);
}

function Coin() {
	this.x = random(width);
	this.y = random(-100,-600);
	this.speed = random(3,7);

	this.do = function() {
		this.y += this.speed;
		fill("#FFD54F");
		ellipse(this.x,this.y,10,10);

		if (this.y > height+5) {
			this.x = random(width);
			this.y = random(-100,-600);
			this.speed = random(3,7);
		}

		if (dist(this.x,this.y,x,y)<20) {
			this.x = random(width);
			this.y = random(-100,-600);
			this.speed = random(3,7);
			points ++;
		}
	}
}

function Bomb() {
	this.x = random(width);
	this.y = random(-100,-600);
	this.speed = random(2,5);

	this.do = function() {
		this.y += this.speed;
		fill("#DD2C00");
		ellipse(this.x,this.y,25,25);

		if (this.y > height+12.5) {
			this.x = random(width);
			this.y = random(-100,-600);
			this.speed = random(2,5);
		}

		if (dist(this.x,this.y,x,y)<27.5) {
			this.x = random(width);
			this.y = random(-100,-600);
			this.speed = random(2,5);
			points -= 5;
		}
	}
}
