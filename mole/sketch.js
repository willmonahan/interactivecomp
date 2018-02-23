var moles; //this holds all the moles
var startMole; //this is the "start" and "restart" button

var hits; //hits and misses global variables
var misses;
var countdown = 60*30; //countdown for the game timer
var countdownSeconds;
var gameState = 0; //0=start screen, 1=game playing, 2=end screen

//image sprite variables
var moleimg;
var hammer;
var hammerDown;

//sound variables
var basso;
var pop;

//preloads all of the images and sounds
function preload() {
	moleimg = loadImage("images/mole.png");
	hammer = loadImage("images/hammer.png");
	hammerDown = loadImage("images/hammerDown.png");

	basso = loadSound("sounds/Basso.mp3");
	pop = loadSound("sounds/Pop.mp3");

	theCanvas.parent("#gameContainer");
}

function setup() {
	theCanvas = createCanvas(600,600);
	theCanvas.parent("#gameContainer");
	imageMode(CENTER);
	noCursor();

	hits = 0;
	misses = 0;

	moles = []; //creates an array of moles. the array is populated when the user presses the starter mole

	//this section sets up the starter mole, which is used during the start and endscreens to initiate the game
	startMole = new Mole();
	startMole.x = 300;
	startMole.y = 400;
	startMole.count = 60*random(2,5);
	startMole.checkHit = function() {
		if (dist(mouseX,mouseY,this.x,this.y)<=this.size/1.5 && this.state==1) {
			return true;
		} else {
			return false;
		}
	}
}

function draw() {
	//depending on which state the game is in, it draws from different functions
	if (gameState==0) {
		gameStart();
	} else if (gameState==2) {
		gameEnd();
	} else {
		gamePlay();
	}

	//the mouse is always drawn as a hammer, and this if/else determines if the hammer is up or down
	if (mouseIsPressed) {
		image(hammerDown,mouseX,mouseY,0.2*hammerDown.width,0.2*hammerDown.height);
	} else {
		image(hammer,mouseX,mouseY,0.2*hammer.width,0.2*hammer.height);
	}
}

function gameStart() { //the start screen just tells the user to whack the mole to start the game. it displays and updates the starter mole
	background(0);
	fill(255);
	noStroke();
	textSize(48);
	textAlign(CENTER);
	text("Whack the mole to begin", 300,200);

	startMole.update();
	startMole.display();
}

function gamePlay() {
	background(0);

	//the following lines calculate and display the countdown timer
	fill(255);
	noStroke();
	textSize(54);
	textAlign(RIGHT);
	countdown--;
	countdownSeconds = parseInt(countdown/60)+1;
	if (countdownSeconds==0) { //if the countdown reaches 0, the starter mole (button) is reset and the game goes to the endscreen state
		gameState = 2;
		startMole.state = 0;
		startMole.count = 60*random(2,5);
	}
	text(countdownSeconds,width-10,60);

	textSize(12);
	textAlign(LEFT);
	text("Hits: "+hits,20,30); //these lines display the score
	text("Misses: "+misses,20,48);

	for (var i = 0; i < moles.length; i++) { //this for loop updates and displays all of the moles
		moles[i].update();
		moles[i].display();
	}
}

function gameEnd() { //this section is functionally identical to the start screen, but it also displays the user's score.
	background(0);
	fill(255);
	noStroke();
	textSize(30);
	textAlign(CENTER);
	text("You hit "+hits+" moles, and missed "+misses+" times.", 300,100);
	var score = hits-misses;
	text("Your total score was "+score, 300,175);
	text("Whack the mole to try again.", 300,250);

	startMole.update();
	startMole.display();
}

function Mole() { //this is the mole object
	this.x; //x and y are declared when it is created, so i have no values for them now
	this.y;
	this.size = 100;
	this.state = 0; //0=down, 1=up
	this.count = 60*random(8); //this will count down until the mole changes state

	this.display = function() { //display function draws the mole as either up or down
		stroke(255);
		strokeWeight(8);

		if (this.state==0) {
			fill(0);
		} else {
			fill(255);
		}

		ellipse(this.x,this.y,this.size,this.size);

		if (this.state==1) {
			image(moleimg,this.x,this.y,0.175*moleimg.width,0.175*moleimg.height);
		}
	}

	this.update = function() { //update function counts down the counter for this mole, and then switches the state when the timer drops below 0
		this.count--;

		if (this.count<=0) {
			this.switch();
		}
	}

	this.checkHit = function() { //this function is called whenever the mouse is pressed
		if (dist(mouseX,mouseY,this.x,this.y)<=this.size/1.5) { //it only does something if the mouse is within the mole (I made the hitbox larger because of the size of the cursor/hammer, hence the "this.size/1.5" bit instead of "this.size/2")
			if (this.state==1) { //if the mole is up, add a hit, play a sound, and switch the state...
				hits++;
				pop.play();
				this.switch();
			} else { //otherwise count it as a miss
				misses++;
				basso.play();
			}
		}
	}

	this.switch = function() { //this function quickly and easily switches the mole's state
		if (this.state==0) {
			this.state = 1;
		} else {
			this.state = 0;
		}
		this.count = 60*random(2,5);
	}
}

function mousePressed() { //called whenever the mouse is pressed
	if (gameState!=1) { //if the game is not in the gameplay state (either start or end screen) it does this...
		if (startMole.checkHit()) { //if the starter mole is hit, it plays a sound and resets the game
			pop.play();
			gameState=1;
			for (var i = 0; i < 9; i++) { //populates the moles array
				moles[i] = new Mole();
				moles[i].x = 100+200*((9+i)%3);
				moles[i].y = 120+200*(parseInt(i/3));
			}
			countdown = 60*30; //resets countdown
		}
		else {
			basso.play();
		}
	} else { //if in gameplay mode...
		for (var i = 0; i < moles.length; i++) { //this loop checks each mole to see if it was hit. the appropriate action is hard-coded into the checkHit() function in the mole.
			moles[i].checkHit();
		}
	}
}
