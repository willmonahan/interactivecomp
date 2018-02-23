
var world;

var containers = [];

var sound1, sound2;

function preload() {
	sound1 = loadSound("sounds/Tink.mp3");
	sound2 = loadSound("sounds/Pop.mp3");
}

function setup() {
	noCanvas();

	world = new World('VRScene');
	var ground = new Plane({x:0, y:0, z:0, width:100, height:100, red:185, green:185, blue:185, rotationX:-90, metalness:0.25, opacity:0.45});
	world.add(ground);
	//world.setFlying(true);
	noiseDetail(24);

	for (var i = 0; i < 50; i++) {
		containers[i] = new CustomContainer();
		containers[i].populate();
		world.add(containers[i].c);
	}
}

function draw() {
	for (var i = 0; i < containers.length; i++) {
		containers[i].update();
	}

	if (mouseIsPressed) {
		world.moveUserForward(0.05);
	}
}

function CustomContainer() {
	this.c = new Container3D();
	this.currentRotation = random(360);
	this.rotationSpeed = random(-0.3,0.3);

	this.populate = function() {
		var box = new Box({
			asset:"stonebrick"
		});
		this.c.addChild(box);

		var sphere = new Sphere({
			y:1,
			red:random(255),
			green:random(255),
			blue:random(255),
			radius:0.5,
			clickFunction: function(thisSphere) {
				thisSphere.hide();
				sound2.play();
			}
		});
		this.c.addChild(sphere);

		var knot = new TorusKnot({
			y:1.8,
			red:random(255),
			green:random(255),
			blue:random(255),
			radius:0.5,
			radiusTubular:0.05,
			p:3,
			q:5,
			rotationX:90,
		});
		this.c.addChild(knot);

		var cone = new Cone({
			red:random(255),
			green:random(255),
			blue:random(255),
			x:0,
			y:2,
			radiusBottom:0.5,
			radiusTop:0.05,
			clickFunction: function(thisCone) {
				thisCone.hide();
				sound1.play();
			}
		});
		this.c.addChild(cone);

		this.c.setY(0.5);
		this.c.setX(random(-45,45));
		this.c.setZ(random(-45,45));
	};

	this.update = function() {
		this.c.rotateY(this.currentRotation);
		this.currentRotation += this.rotationSpeed;
	};
}
