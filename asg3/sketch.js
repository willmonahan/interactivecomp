var theCanvas;

var drops = []; //this will hold all of the drops
var dropCount = 30; //this affects the number of drops in the game
var veggies = [];

var p; //this will be the player
var face;
var goal; //this will be the goal
var treats = [];

var bg;

var mode = "mouse";
var state = 1;

var points = 0;
var deaths = 0;

var respawnCountdown = -1;

var countdown = 60*60;

var highscore = 0;

function preload() {
	basso = loadSound("sounds/Basso.mp3");
	tink = loadSound("sounds/Tink.mp3");
	pop = loadSound("sounds/Pop.mp3");

	face = loadImage("images/face.png");

	treats[0] = loadImage("images/donut.png");
	treats[1] = loadImage("images/cookie.png");

	veggies[0] = loadImage("images/cucumber.png");
	veggies[1] = loadImage("images/onion.png");
	veggies[2] = loadImage("images/tomato.png");

	bg = loadImage("images/countertop.png");
	theCanvas.parent("#gameContainer");
}

function setup() {
	theCanvas = createCanvas(700,700);
	theCanvas.parent("#gameContainer");
	background(0);
	noStroke();
	noCursor();
	imageMode(CENTER);

	for (var i = 0; i < dropCount; i++) { //populates the array with drop objects
		drops[i] = new Drop();
	}

	p = new Player(); //this makes the variable p a player object
	goal = new Goal();
}

function draw() {
	if (state == 3) {
		endScreen();
	}
	else if (state == 2) {
		gamePlay(); //execute the game in its "playing" state
	}
	else {
		startScreen();
	}
}

function startScreen() {
	image(bg,350,350,700,700);
	fill(255);
	rect(250,500,200,100);
	textSize(44);
	text("Welcome to the kitchen! Please select difficulty below, and press the button to begin. Collect the treats, and avoid the veggies!",75,65,600,400);
	ellipse(mouseX,mouseY,10,10);
	fill(0);
	textSize(56);
	text("BEGIN",262,570);

}

function gamePlay() { //this function is the game in its "playing" state
	image(bg,350,350,700,700);

	goal.show();
	goal.update();

	for (var i = 0; i < drops.length; i++) { //show and update all drops
		drops[i].show();
		drops[i].move();
	}

	p.show(); //show and update the player character
	p.move();

	fill(255);
	textSize(12);
	text("Points: "+points,20,30); //these lines display the score
	text("Deaths: "+deaths,20,48);
	if (respawnCountdown > 0) {
		respawnCountdown -= 1;
		var respawnSeconds = Math.floor(respawnCountdown/60)+1
		text("Respawn: "+respawnSeconds,20,66);
		fill(0);
		text(respawnSeconds,p.x-3,p.y+4);
		fill(255);
	}

	if (countdown > 0) {
		countdown -= 1;
		var countdownSeconds = Math.floor(countdown/60)+1;
		textSize(54);
		text(countdownSeconds,width-75,65);
	}
	else {
		state = 3;
	}
}

function endScreen() {
	image(bg,350,350,700,700);
	fill(255);
	rect(250,500,200,100);
	textSize(56);
	var score = points-deaths;
	if (score<0) {
		score = 0;
	}
	if (score > highscore) {
		highscore = score;
	}
	text("Points: "+points+"\nDeaths: "+deaths+"\nScore: "+score+"\nHigh score: "+highscore,75,65,600,400);
	ellipse(mouseX,mouseY,10,10);
	fill(0);
	text("AGAIN",262,570);

}

function Drop() { //this defines the drop objects
	this.x = random(width);
	this.y = -500;
	this.speed = random(2,6);
	this.size = random(20,50);
	this.sprite = random(veggies);

	this.show = function() {
		image(this.sprite,this.x,this.y,this.size,this.size);
	}

	this.move = function() {
		this.y += this.speed;

		if (this.y >= width+this.size/2) { //when a drop leaves the screen, respawn with new values
			this.x = random(width);
			this.y = 0;
			this.speed = random(2,6);
			this.size = random(20,50);
			this.sprite = random(veggies);
		}
	}
}

function Player() { //this defines the player object
	this.x = 350;
	this.y = 550;
	this.size = 30;
	this.sprite = face;

	this.speed = 5; //for keys mode

	this.xSpeed = 0; //these are for acceleration mode
	this.ySpeed = 0;
	this.acc = 0.25;
	this.dec = 0.05;

	this.show = function() {
		image(this.sprite,this.x,this.y,this.size,this.size);
		if (respawnCountdown > 0) {
			fill(0,50);
		} else {
			fill(255,0);
		}
		ellipse(this.x,this.y,this.size,this.size);
	}

	this.respawn = function() {
		if (mode != "mouse") {
			this.x = 350;
			this.y = 550;
			this.xSpeed = 0;
			this.ySpeed = 0;
		}

		deaths += 1;
		basso.play();

		respawnCountdown = 120;
	}

	this.move = function() {
		if (mode == "mouse") { //if in mouse mode, follow the mouse
			this.x = mouseX;
			this.y = mouseY;
		}
		else if (mode == "keys") { //if in keys mode, use simple keyboard navigation
			if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
				this.x -= this.speed;
			}
			if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
				this.x += this.speed;
			}
			if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
				this.y -= this.speed;
			}
			if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
				this.y += this.speed;
			}
		}
		else if (mode == "acceleration") { //if in acceleration mode, used advanced keyboard controls
			if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
				this.xSpeed -= this.acc;
			}
			if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
				this.xSpeed += this.acc;
			}
			if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
				this.ySpeed -= this.acc;
			}
			if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
				this.ySpeed += this.acc;
			}
			this.x += this.xSpeed;
			this.y += this.ySpeed;

			//this bit of code will decelerate to a stop
			if (this.xSpeed > 0) {
				this.xSpeed -= this.dec;
			}
			if (this.xSpeed < 0) {
				this.xSpeed += this.dec;
			}
			if (this.ySpeed > 0) {
				this.ySpeed -= this.dec;
			}
			if (this.ySpeed < 0) {
				this.ySpeed += this.dec;
			}
			if (Math.abs(this.xSpeed) <= this.dec) {
				this.xSpeed = 0;
			}
			if (Math.abs(this.ySpeed) <= this.dec) {
				this.ySpeed = 0;
			}
		}

		if (mode != "mouse") { //wraparound logic (it shouldn't apply to the mouse controls)
			if (this.x > width) {
				this.x = 0;
			}
			if (this.x < 0) {
				this.x = width;
			}
			if (this.y > height) {
				this.y = 0;
			}
			if (this.y < 0) {
				this.y = height;
			}
		}

		for (var i = 0; i < drops.length; i++) {
			if (respawnCountdown <= 0 && dist(drops[i].x,drops[i].y,this.x,this.y) < drops[i].size/2+this.size/2) {
				this.respawn();
			}
		}
	}
}

function Goal() {
	this.size = 50;
	this.x = random(2*this.size, width-2*this.size)
	this.y = random(85, 250);
	this.sprite = random(treats);

	this.show = function() {
		image(this.sprite,this.x,this.y,this.size,this.size);
	}

	this.update = function() {
		if (respawnCountdown <= 0 && dist(p.x,p.y,this.x,this.y)<p.size/2+this.size/2) {
			points += 1;
			tink.play();
			this.sprite = random(treats);

			while (dist(p.x,p.y,this.x,this.y)<350) {
				this.x = random(2*this.size, width-2*this.size)
				this.y = random(85, height-2*this.size);
			}
		}
	}
}

function updateMode(modeIn) {
	mode = modeIn.value;

	if (mode != "mouse") {
		p.respawn();
	}
}

function mousePressed() {
	if (state != 2) {
		if (mouseX>250 && mouseX<450 && mouseY>500 && mouseY<600) {
			newGame();
			pop.play();
		}
	}
}

function newGame() {
	state = 2;

	p = new Player();
	goal = new Goal();
	for (var i = 0; i < dropCount; i++) { //populates the array with drop objects
		drops[i] = new Drop();
	}
	points = 0;
	deaths = 0;
	countdown = 60*60;
	respawnCountdown = -1;
}
