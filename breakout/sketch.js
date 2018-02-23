//these variables are associated with the paddle
var paddleX = 250;
var speed = 0;
var accel = 0.24;
var decel = 0.08;
var dir = 0;
//these varriables are associated with the ball
var ballX = 250;
var ballY = 250;
var speedX = 0;
var speedY = 0;
var totalSpeed = 5;
//the variables are associated with the star (the objective)
var star;
var starX;
var starY;

var basso;
var tink;
var pop;

var points = 0;
var misses = 0;

function preload() { //preload the image
	star = loadImage("images/star.png"); //Star by Setyo Ari Wibowo from the Noun Project
	basso = loadSound("sounds/Basso.mp3");
	tink = loadSound("sounds/Tink.mp3");
	pop = loadSound("sounds/Pop.mp3");
}

function setup() {
	createCanvas(500,500);
	background(0);
	noStroke();
	drawWalls(); //this just draws the walls each time
	imageMode(CENTER);
	speedX = random(-3,3); //this randomizes the X and Y speed of the ball
	speedY = -1*(5-Math.abs(speedX)); //this statement makes sure the total speed of the ball will add up to an absolute value of 5 (regardless of direction) and that the ball always starts travelling upwards
	starX = random(80,420); //these randomize the location of the star at the beginning of the game
	starY = random(80,300);
}

function draw() {
	background(0); //the translucent background allows for the cool faded trails behind the ball
	drawWalls(); //draws the walls over every frame
	fill(255);

	text("Points: "+points,20,30); //these lines display the score
	text("Misses: "+misses,20,48);

	image(star,starX,starY,45,45); //this draws the star every frame
	if (dist(ballX,ballY,starX,starY) < (45/2+12)) { //collision detection between the ball and star
		resetStar();
		points++;
		tink.play();

		//the blocks below increase the total speed of the ball each time the star is collected
		if (speedX >=0) {
			speedX += 0.3
		} else {
			speedX -= 0.3;
		}

		if (speedY >=0) {
			speedY += 0.3
		} else {
			speedY -= 0.3;
		}

		totalSpeed += .6;
	}

	ellipse(ballX,ballY,24,24); //draw the ball every frame
	ballX += speedX; //increment the ball in the X direction
	ballY += speedY; //increment the ball in the Y direction

	if (ballX < 22 || ballX > 478) { //bounce logic for the left and right walls
		speedX *= -1;
		pop.play();
	}
	if (ballY < 22) { //bounce logic for the top wall
		speedY *= -1;
		pop.play();
	}

	if ((ballY > 468) && (ballX >= (paddleX-50)) && (ballX <= (paddleX+50))) { //bounce logic for the ball on the paddle
		pop.play();
		ballY = 468

		if (ballX >= (paddleX-50) && ballX < paddleX) { //if the ball is on the left side of the paddle, it calculates how far along it is and propels it to the left
			var quotient = (paddleX - ballX)/50;
			speedX = -1*0.9*quotient*totalSpeed;
			speedY = -1*(totalSpeed+speedX);
		}

		if (ballX <= (paddleX+50) && ballX > paddleX) { //if the ball is on the right side of the paddle, it calculates how far along it is and propels it to the right
			var quotient = (ballX - paddleX)/50;
			speedX = 0.9*quotient*totalSpeed;
			speedY = -1*(totalSpeed-speedX);
		}
	}

	if (ballY > 512) { //if the ball goes completely offscreen, it resets the ball
		resetBall();
		misses++;
		basso.play();
	}

	rectMode(CENTER);
	rect(paddleX,490,100,20); //draw the paddle every frame

	if (keyIsDown(65) || keyIsDown(37)) { //these if statements detect the keys being pressed to accellerate the ball in either direction
		speed -= accel;
	}
	if (keyIsDown(68) || keyIsDown(39)) {
		speed += accel;
	}

	if (speed > 0) { //these variables keep track of the direction of the ball at all times
		dir = 1;
	}
	if (speed < 0) {
		dir = -1;
	}
	if (speed == 0) {
		dir = 0;
	}

	paddleX += speed; //increment the paddle's position by the speed each loop
	if (paddleX <= 60) { //these 2 if statements allow the paddle to bounce off the walls as well, which I really wanted to implement
		speed *= -0.35;
		dir = 1;
	}
	if (paddleX >= 440) {
		speed *= -0.35;
		dir = -1;
	}

	speed -= dir*decel; //this line decellerates the ball by incrementing it down, which is why i need to keep track of the direction
	if (paddleX <= 60) { //these 2 if statements just solve a glitch where the paddle would go through the walls
		paddleX = 60;
	}
	if (paddleX >= 440) {
		paddleX = 440;
	}
}

function drawWalls() { //this function draws the walls every frame
	rectMode(CORNER);
	fill(215)
	rect(0,0,10,500);
	rect(0,0,500,10);
	rect(490,0,10,500);
}

function resetBall() { //this function resets the ball
	if (totalSpeed >= 10) {
		totalSpeed *= .6;
	}
	else {
		totalSpeed = 5;
	}
	speedX = random(-.6*totalSpeed,.6*totalSpeed);
	speedY = -1*(totalSpeed-Math.abs(speedX));
	ballX = random(50,450);
	ballY = random(50,400);
}

function resetStar() { //function to pick a new location for the star
	starX = random(80,420);
	starY = random(80,300);
}
