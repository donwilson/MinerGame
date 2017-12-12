	
	// https://phaser.io/examples
	// https://phaser.io/tutorials/making-your-first-phaser-game
	
	var game = new Phaser.Game(800, 600, Phaser.AUTO, "", {
		'preload': preload,
		'create': create,
		'update': update,
		'render': render
	});
	
	
	// preload
	
	function preload() {
		// load images/sprites/sounds
		game.load.image('sky', "/static/images/sky.png");
		game.load.image('ground', "/static/images/platform.png");
		game.load.image('star', "/static/images/star.png");
		//game.load.image('mute', "/static/images/mute.png");
		game.load.spritesheet('dude', "/static/images/dude.png", 32, 48);
		//game.load.audio('music', "/static/audio/music.mp3");
		game.load.audio('collect_star', "/static/audio/collect_star.mp3");
	}
	
	
	// create
	var platforms;
	var player;
	var cursors;
	var stars;
	var score = 0;
	var scoreText;
	//var music;
	//var musicLevel = 0.3;
	var coinSound;
	//var muteButton;
	var isMuted = false;
	
	function create() {
		game.world.setBounds(0, 0, 1920, 600);
		
		// arcade physics
		game.physics.startSystem(Phaser.Physics.ARCADE);
		
		// background
		game.add.sprite(0, 0, 'sky');
		
		// platform group
		platforms = game.add.group();
		
		// enable physics on platform group
		platforms.enableBody = true;
		
		// create the ground
		var ground = platforms.create(0, (game.world.height - 64), 'ground');
		
		// scale to fit the width of the game
		ground.scale.setTo(2, 2);
		
		// stop ground from falling
		ground.body.immovable = true;
		
		// create two ledges
		var ledge = platforms.create(400, 400, 'ground');
		
		ledge.body.immovable = true;
		
		ledge = platforms.create(-150, 250, 'ground');
		
		ledge.body.immovable = true;
		
		// create player
		player = game.add.sprite(32, game.world.height - 150, 'dude');
		
		// enable physics on player
		game.physics.arcade.enable(player);
		
		// play physics properties
		player.body.bounce.y = 0.2;
		player.body.gravity.y = 300;
		player.body.collideWorldBounds = true;
		
		// player animations
		player.animations.add('left', [0, 1, 2, 3], 10, true);
		player.animations.add('right', [5, 6, 7, 8], 10, true);
		
		// controls
		cursors = game.input.keyboard.createCursorKeys();
		
		// stars
		stars = game.add.group();
		
		// enable physics on stars
		stars.enableBody = true;
		
		for(var i = 0; i < 12; i++) {
			var star = stars.create((i * 70), 0, 'star');
			
			// set gravity
			star.body.gravity.y = 300;
			
			// random bounce for each star
			star.body.bounce.y = (0.7 + (Math.random() * 0.2));
		}
		
		// setup sound for coin collection
		coinSound = game.add.sound('collect_star');
		
		// score display
		scoreText = game.add.text(16, 16, "Score: 0", {
			'fontSize': "32px",
			'fill': "#000000"
		});
		
		//// bg music
		//music = game.add.audio('music');
		//music.allowMultiple = true;
		//
		//music.addMarker('main', 0, 27.4, musicLevel, true);
		//music.addMarker('challenge', 32.57, (36 - 32.57), musicLevel, true);
		//music.addMarker('end', 27.432, (28.97 - 27.432), musicLevel);
		//
		//music.play('main');
		
		// music mute button
		//muteButton = game.add.button((game.world.width - (16 + 32)), 16, 'mute', toggleMute, this);
		
		// camera follows player
		game.camera.follow(player);
		
		// camera deadzone - bounding box for camera so player can move around screen without camera always following, but when player reaches edge camera follows
		game.camera.deadzone = new Phaser.Rectangle(100, 100, (game.camera.width - 200), (game.camera.height - 200));
	}
	
	
	// update
	
	function update() {
		// collide the player and the stars with the platforms
		var hitPlatform = game.physics.arcade.collide(player, platforms);
		game.physics.arcade.collide(stars, platforms);
		
		// player collects star
		game.physics.arcade.overlap(player, stars, collectStar, null, this);
		
		// reset player velocity
		player.body.velocity.x = 0;
		
		if(cursors.left.isDown) {
			// move left
			player.body.velocity.x = -150;
			player.animations.play('left');
		} else if(cursors.right.isDown) {
			// move right
			player.body.velocity.x = 150;
			player.animations.play('right');
		} else {
			player.animations.stop();
			
			player.frame = 4;
		}
		
		// allow player to jump (when touching ground)
		if(cursors.up.isDown && player.body.touching.down && hitPlatform) {
			player.body.velocity.y = -350;
		}
		
	}
	
	
	// render
	
	function render() {
		game.debug.cameraInfo(game.camera, 32, 32);
		game.debug.spriteCoords(player, 32, 500);
	}
	
	
	
	// collision: player & star
	function collectStar(player, star) {
		// remove star
		star.kill();
		
		// add points
		score += 10;
		scoreText.text = "Score: "+ score;
		
		// sound
		if(!isMuted) {
			coinSound.play();
		}
		
		//if(stars.total == 1) {
		//	// challenging music
		//	music.stop();
		//	music.play('challenge');
		//} else if(stars.total == 0) {
		//	// done
		//	music.stop();
		//	music.play('end');
		//}
	}
	
	//// event: toggle mute
	//function toggleMute() {
	//	isMuted = !isMuted;
	//	
	//	music.mute = isMuted;
	//}