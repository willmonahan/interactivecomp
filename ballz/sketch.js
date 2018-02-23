var blocks; //this holds all the blocks, 7x7
var canvasRef;

var score; //this will count the score
var highscore = 1;
if (getCookie("highScore") != "") {
	highscore = getCookie("highScore");
}
var startScore = 1;
var gameState = "start"; //right now, this is the only gamestate I'm holding

var mouseX1; //these variables hold the mouse X and Y when we start dragging
var mouseY1;

var ballSize = 30; //ball size
var ballX; //ball starting positions
var ballY = 1250-ballSize/2;
var gravity = 0.0075;

var balls; //this will eventually hold all of the balls;

var ballsCounter = -1; //this will be used to count frames when shooting balls, to sequence them
var ballDelay = 7; //this is how many frames between a new ball is shot (the balls are sequenced)
var ballsLanded; //this is how many balls have landed so far in the turn
var addBall; //this is how many balls should be added at the end of the turn (how many "new ball" bonuses have been hit)
var ballsShot; //this is how many balls have been shot so far in this turn
var ballCountX; //this is just a variable to hold the previous position, to display the number of balls

var lightning; //all of these variables control the "lightning mode"
var showLightning;
var lightningMode;
var lightningInterval = 9;
var lightningCountdown;
var timer;

function preload() {
	lightning = loadImage("images/lightning.png");
}

function setup() {
	canvasRef = createCanvas(885,1500);
	windowResized();
	noStroke();
	bg(); //draw the background
	textAlign(CENTER,CENTER); //all text will be center aligned vertically and horizontally
	imageMode(CENTER);
	angleMode(DEGREES); //all angles will be measured in degrees
}

function draw() {
	if (gameState == "start") {
		gameStart();
	} else if (gameState == "play") {
		gamePlay();
	} else if (gameState == "end") {
		gameEnd();
	}
}

function newGame() { //initializes variables to set up a new game
	blocks = [];

	for (var i = 0; i < 7; i++) {
		var tempRow = [];
		for (var j = 0; j < 7; j++) {
			tempRow[j] = new Block(125*j,250+125*1,0);
		}
		blocks[i] = tempRow;
	}

	score = startScore;
	newRow();

	mouseX1 = mouseX;
	mouseY1 = mouseY;

	balls = [];
	ballX = 442.5;
	ballsLanded = 0;
	addBall = 0;
	ballsShot = 0;
	ballCountX = ballX;

	showLightning = false;
	lightningMode = false;
	lightningCountdown = 1;
	timer = 0;

	for (var i = 0; i < score; i++) {
		balls.push(new Ball());
	}

	gameState = "play";
}

function gameStart() {
	bg();
	textSize(48);
	fill(255);
	textAlign(CENTER,CENTER);
	text("Click and drag to aim.\nCollect balls and destroy blocks.\nDon't let the the blocks hit the bottom.\nGood luck!",width/2,687.5);
	text("Click here to begin.",width/2,height-125);
	textSize(28);
	fill(52,73,94);
	text("a game by Will Monahan",width/2,125/2);
}

function gamePlay() { //this is during the "gameplay" state
	bg(); //start by drawing a background
	showBlocks(); //show all existing blocks
	textSize(48);
	text(score,width/2,125/2); //this displays the score
	textSize(24);
	text("x "+(balls.length-ballsShot),ballCountX,1250+24); //this just shows how many balls the player has that they can still shoot

	if (ballsShot == 0) {
		balls[0].show();
	}

	if (ballsLanded <= ballsShot) {
		if (ballsLanded < ballsShot && !showLightning && !lightningMode) {
			timer++
		}

		if (ballsLanded > 0) {
			fill(255);
			ellipse(ballX,ballY,ballSize);
		}

		while (lightningCountdown > 0) {
			for (var i = 0; i < balls.length; i++) {
				if (lightningCountdown == 1 && balls[i].state!=0) {
					balls[i].show();
				}
				balls[i].move();
			}

			if (ballsCounter >= 0) { //this is the if statement that sequences the shooting.
				if (balls[int(ballsCounter/ballDelay)].state == 0) { //the int() casting will let me sequences frames, while checking each ball 7 times (that's the number of frames between each shot). if the ball we're looking at hasn't been shot yet...
					ballsShot++; //increase the number of balls shot
					balls[int(ballsCounter/ballDelay)].state = 1; //and put that ball into an active state
				}
				ballsCounter--; //this counts down our function
			}
			lightningCountdown--;
		}
		if (lightningMode) {
			lightningCountdown = lightningInterval
		} else {
			lightningCountdown = 1;
		}
	}



	if (mouseIsPressed && ballsShot == 0) { //while we drag the mouse... and have not shot any balls yet this turn...
		stroke(255);
		//all of this will calculate (and map) the aiming line...
		var length = map(dist(mouseX,mouseY,mouseX1,mouseY1),0,250,0,900,true);
		length = constrain(length, 0, 900);
		var tanValue = atan((mouseY-mouseY1)/(mouseX1-mouseX));
		var xLen = cos(tanValue)*length;
		if (mouseX1<mouseX) {
			xLen *= -1;
		}
		var yLen = abs(sin(tanValue))*length;
		if (mouseY1<mouseY) {
			//line(ballX,ballY,ballX+xLen,ballY-yLen); //and finally draw the aiming line if the aiming line faces upwards!
			for (var i = 0; i < 16; i++) {
				ellipse(ballX+((i+1)*xLen/16),ballY-((i+1)*yLen/16),15*length/900);
			}
		}
		noStroke();
	}

	if (ballsLanded == balls.length) { //once the number of landed balls is the same as the total number of existing balls, we know that we're done that round.

		var lastTotal = 0;
		for (var i = 0; i < blocks[6].length; i++) {
			if (blocks[6][i].val != -1) {
				lastTotal += blocks[6][i].val;
			}
		}

		if (lastTotal != 0) {
			gameState = "end"; //end the game
			if (score > highscore) {
				highscore = score;
				setCookie("highScore", highscore);
			}
		} else {
			ballsLanded = 0; //reset balls landed to 0
			score++; //add 1 to the score (the score is just the number of rounds that the player has survived)
			newRow(); //add a new row to the top and bump all of the others down
			for (var i = 0; i < addBall; i++) { //for however many bonuses the player collected, add a new ball to their arsenal
				balls.push(new Ball());
			}
			addBall = 0; //reset all of these values so we can start the next round
			ballsShot = 0;
			ballCountX = ballX;
			lightningMode = false;
			showLightning = false;
			timer = 0;
		}
	}

	if (timer >= 60*5) {
		showLightning = true;
	}
	if (showLightning) {
		image(lightning,width-125/2,125/2,50*lightning.width/lightning.height,50);
	}
}

function gameEnd() {
	bg();
	textSize(48);
	fill(255);
	text("Your final score was "+score+"\n\nYour high score is "+highscore,width/2,687.5);
	text("Click here to try again",width/2,height-125);
}

function bg() { //this just redraws the background each time
	//background(52, 73, 94);
	fill(52,73,94);
	rect(0,0,width,height);

	fill(40, 55, 71);
	rect(0,0,width,125);
	rect(0,1250,width,250);
}

function Block(inX,inY,inVal) { //this is the block class
	this.border = 5; //these variables hold values for each block.
	this.size = 125-2*this.border;
	this.x = inX+this.border;
	this.y = inY+this.border;
	this.val = inVal;
	this.maxVal = score*2
	this.fill;
	var fill1 = [255,193,7]; //yellow
	var fill2 = [183,28,28]; //red
	var fill3 = [58,216,243]; //blue
	var fill4 = [0,208,154]; //green


	this.do = function() { //this draws the block with its value
		if (this.val > 0) { //if the value is more than 0, draw the block with it's value written on it
			if (this.val <= 15) {
				this.fill = [map(this.val,1,15,fill1[0],fill2[0]),map(this.val,1,15,fill1[1],fill2[1]),map(this.val,1,15,fill1[2],fill2[2])];
			} else if (this.val >= 16 && this.val <= 30) {
				this.fill = [map(this.val,16,30,fill2[0],fill3[0]),map(this.val,16,30,fill2[1],fill3[1]),map(this.val,16,30,fill2[2],fill3[2])];
			} else if (this.val >= 31 && this.val <= 60) {
				this.fill = [map(this.val,31,60,fill3[0],fill4[0]),map(this.val,31,60,fill3[1],fill4[1]),map(this.val,31,60,fill3[2],fill4[2])];
			} else {
				this.fill = fill4;
			}

			fill(this.fill);
			rect(this.x,this.y,this.size,this.size);

			fill(255);
			textSize(32);
			text(this.val,this.x+this.size/2,this.y+this.size/2)
		}

		if (this.val == -1) { //the value of -1 will be the "bonus ball" value (one of these will appear in each row) (this is not properly implemented yet)
			noFill();
			stroke(255);
			strokeWeight(6);
			ellipse(this.x+this.size/2,this.y+this.size/2, 55);
			noStroke();
			fill(255);
			ellipse(this.x+this.size/2,this.y+this.size/2, 35);
		}
	}

	this.checkHit = function(x,y,size,xSpeed,ySpeed) { //THIS IS THE CURRENTLY IN USE COLLISION DETECTION ALGORITHM
		x += xSpeed; //this tells the program where the ball WOULD be in the next frame
		y += ySpeed;
		if (this.val == -1 && dist(x,y,this.x+this.size/2,this.y+this.size/2)<=size/2+55/2) { //if it's intersecting a "bonus ball" block, return "ball"
			return "ball";
		} else if (this.val > 0) { //if the value of the block is more than 0...
			if (x+size/2>=this.x && x-size/2<=this.x+this.size && y+size/2>=this.y && y-size/2<=this.y+this.size) { //if the ball WILL be in the block...

				if (x-xSpeed+size/2>=this.x && x-xSpeed-size/2<=this.x+this.size) { //if it's currently directly above or below the block...
					return "y"; //this means the ball should reverse the Y direction
				} else {
					return "x"; //this means the ball should reverse the X direction
				}
			}
		} else {
			return false;
		}
	}
}

function Ball() { //this is the ball class
	this.size = ballSize;
	this.x = ballX;
	this.y = ballY;
	this.state = 0; //0 is idle, 1 is active, 2 is travelling along the bottom;

	this.speed = 25; //total speed. this is used with trig functions to determine X and Y speed each turn
	this.xSpeed = 0;
	this.ySpeed = 0;

	this.show = function() {
		fill(255);
		ellipse(this.x,this.y,this.size); //draws the ball
	}

	this.move = function() { //this updates the ball
		if (this.state == 1) { //we ONLY do this if the ball is active
			var readyToCollide = true;
			for (var i = 0; i < blocks.length; i++) {
				for (var j = 0; j < blocks[i].length; j++) {
				var thisBlock = blocks[i][j];
				if (readyToCollide == true &&  dist(this.x+this.xSpeed,this.y+this.ySpeed,thisBlock.x+thisBlock.size/2,thisBlock.y+thisBlock.size/2) <= thisBlock.size+this.size) { //
						if (thisBlock.val != 0) { //if the block has a value over 0
							var hit = thisBlock.checkHit(this.x,this.y,this.size,this.xSpeed,this.ySpeed);
							if (hit=="ball") { //if the checkHit() funciton tells us to reverse the X speed, we do that and subtract 1 from the block's value
								addBall ++;
								blocks[i][j].val=0;

							} else if (hit=="y") { //if the checkHit() function tells us to reverse the Y speed, we do that and subtract 1 from the block's value
								this.ySpeed *= -1;
								blocks[i][j].val--;

								var b = getBlock(this.x,this.y);
								//console.log(b);
								if (b[0] == -1) {
									readyToCollide = false;
									break;
								} else {
									var left = false;
									var right = false;
									if (b[1] > 0) {
										if (blocks[b[0]][b[1]-1].val > 0) {
											left = true;
										}
									}
									if (b[1] < 6) {
										if (blocks[b[0]][b[1]+1].val > 0) {
											right = true;
										}
									}

									if (!left && !right) {
										readyToCollide = false;
										break;
									}
								}

							} else if (hit=="x") { ///if the checkHit() function tells us to reverse the X speed, we do that and subtract 1 from the block's value
								this.xSpeed *= -1;
								blocks[i][j].val--;

								var b = getBlock(this.x,this.y);
								//console.log(b);
								if (b[0] == -1) {
									readyToCollide = false;
									break;
								} else {
									var up = false;
									var down = false;
									if (b[0] > 0 && b[0] < score-1) {
										if (blocks[b[0]-1][b[1]].val > 0) {
											up = true;
										}
									}
									if (b[0] < 6 && b[0] < score-1) {
										if (blocks[b[0]+1][b[1]].val > 0) {
											down = true;
										}
									}

									if (!up && !down) {
										readyToCollide = false;
										break;
									}
								}
							}
						}
					}
				}
			}

			if (this.x + this.xSpeed > width-this.size/2 || this.x + this.xSpeed < this.size/2) { //bounces off the side walls
				this.xSpeed *= -1;
			}

			if (this.y + this.ySpeed <= 125+this.size/2) { //bounces off the top wall
				this.ySpeed *= -1;
			}

			this.ySpeed += gravity; //gravity function

			if (this.y + this.ySpeed > 1250-this.size/2) { //this is what happens when the ball lands back on the bottom

				if (ballsLanded == 0) { //if this is the first ball to land...
					ballsLanded++; //we add 1 to the number of balls landed this turn
					this.state = 0; //and we change the ball to an idle state
					this.x = constrain(this.x,this.size/2,width-this.size/2); //make sure this ball is properly within the bounds of the game
					ballX = this.x; //this is where the next round of balls will shoot from...
					this.y = ballY;
				} else { //if this is not the first ball to land...
					this.y = ballY;
					this.state = 2;
				}
			} else { //if it's not landed, we add to the X and Y value
				this.x += this.xSpeed;
				this.y += this.ySpeed;
			}
		} else if (this.state == 2) {
			if (dist(ballX,ballY,this.x,this.y) > 26) {
				if (this.x < ballX) {
					this.x += 25;
				} else {
					this.x -= 25;
				}
			} else {
				this.x = ballX;
				this.y = ballY;
				this.state = 0;
				ballsLanded ++;
			}
		}
	}
}

function showBlocks() { //this function just displays each block
	for (var i = 0; i < blocks.length; i++) {
		for (var j = 0; j < blocks[i].length; j++) {
			blocks[i][j].do();
		}
	}
}

function newRow() {
	blocks.splice(6,1); //remove the last row

	//move all blocks down a row, 125 pixels
	for (var i = 0; i < blocks.length; i++) {
		for (var j = 0; j < blocks[i].length; j++) {
			blocks[i][j].y += 125;
		}
	}

	var tempRow = []; //this loop populates a temporary row
	var totalVal = 0;
	for (var i = 0; i < 7; i++) { //this will add 7 blocks to the temporary row
		var tempVal;
		switch (int(random(6))) { //this switch chooses what the value of the block should be
			case 0:
			case 5:
				tempVal = 0;
				break;
			case 1:
				tempVal = score;
				break;
			case 2:
				tempVal = int(score*0.5);
				break;
			case 3:
				tempVal = int(score*1.5);
				break;
			case 4:
				tempVal = score*2;
				break;

		}
		tempRow[i] = new Block(5+i*125,250,tempVal); //adds the temp block to the temp row
		totalVal += tempVal;
	}
	if (totalVal < score) {
		random(tempRow).val = score;
		random(tempRow).val = score;
		random(tempRow).val = score;
		random(tempRow).val = score;
	}
	random(tempRow).val = -1; //this chooses 1 random block from every row to be the "bonus ball" block (which has a -1 value);
	blocks.splice(0,0,tempRow); //add the temporary row to the top of the screen
}

function mousePressed() {
	if (gameState == "start") {
		if (mouseY > height-250) {
			newGame();
		}
	} else if (gameState == "play") {
		//sets the origin of the mouse X and Y when the player begins to drag
		if (ballsShot == 0) {
			mouseX1 = mouseX;
			mouseY1 = mouseY;
		}

		if (showLightning && mouseX>width-125 && mouseY<125) {
			lightningMode = true;
			showLightning = false;
			timer = 0;
		}
	} else if (gameState == "end") {
		if (mouseY > height-250) {
			newGame();
		}
	}
}

function mouseReleased() {
	if (gameState == "play") {
		if (ballsShot == 0 && mouseY > mouseY1) { //if the ball is going to fire upwards...
			var tanValue = atan((mouseY-mouseY1)/(mouseX1-mouseX)) //gets the degree value from the inverse tan function
			var sine = abs(sin(tanValue)); //this is the sine value
			var cosine = abs(cos(tanValue)); //this is the cosine value

			if (abs(tanValue)>2.5) {
				for (var i = 0; i < balls.length; i++) {
					balls[i].ySpeed = -1*sine*balls[i].speed; //uses the sine value to compute the Y speed for the ball
					if (mouseX1 > mouseX) { //uses the cosine value to computer the X speed for the ball (depending on direction)
						balls[i].xSpeed = cosine*balls[i].speed;
					} else {
						balls[i].xSpeed = -1*cosine*balls[i].speed;
					}
				}
				ballsCounter = ballDelay*balls.length-1;
			}
		}
	}
}

function windowResized() {
	//console.log(windowWidth + ", " + windowHeight);
	var scalingFactor = windowHeight*100 / 1500;
	//console.log(scalingFactor);
	canvasRef.style('height', windowHeight + "px");
	canvasRef.style('width', "auto");
	canvasRef.style('display', 'block');
	canvasRef.style('margin', 'auto');
}

function cheat(newScore) {
	startScore = newScore;
	newGame();
}

function setCookie(cname, cvalue) { //cookie setting function for highscore, from w3Schools tutorial
    var d = new Date();
    d.setTime(d.getTime() + (14 * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) { //cookie reading function for highscore, from w3Schools tutorial
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function mouseMoved() {
	//console.log(getBlock(mouseX,mouseY));
}

function getBlock(x,y) {
	if (y < 250 || y > 1125) {
		return [-1,-1];
	} else {
		var blockX = int((y-250)/125);
		var blockY = int(x/125);
		return [blockX,blockY];
	}
}
