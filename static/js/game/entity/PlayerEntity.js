	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.Entity = window.MinerGame.Entity || (window.MinerGame.Entity = {});
	
	MinerGame.Entity.Player = function(game, custWorld) {
		this.custWorld = custWorld;
		
		this.character = this.pickCharacter();
		this.spawn = this.custWorld.getSpawn();
		
		Phaser.Sprite.call(this, game, (this.spawn.x * TILE_WIDTH), (this.spawn.y * TILE_HEIGHT), 'players', this.character.default_frame);
		//Phaser.Sprite.call(this, game, 0, 0, 'players');
		
		//this.character = playable_characters[ game.rnd.pick( _.keys(playable_characters) ) ];
		
		// animations
		for(var key in this.character.animations) {
			if(this.character.animations.hasOwnProperty(key)) {
				this.animations.add(key, this.character.animations[ key ], 10, true);
			}
		}
		
		// crop
		this.maybeCrop();
		
		// physics
		this.game.physics.enable(this);
		
		// physics
		this.body.bounce.y = 0;
		this.body.linearDamping = 1;
		this.body.collideWorldBounds = true;
		
		// controls
		this.cursors = this.game.input.keyboard.createCursorKeys();
		this.wasd = {
			'up': this.game.input.keyboard.addKey(Phaser.Keyboard.W),
			'left': this.game.input.keyboard.addKey(Phaser.Keyboard.A),
			'down': this.game.input.keyboard.addKey(Phaser.Keyboard.S),
			'right': this.game.input.keyboard.addKey(Phaser.Keyboard.D),
			'jump': this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
			'shift': this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT)
		};
		
		// add generated player to game
		this.game.add.existing(this);
	};
	
	MinerGame.Entity.Player.prototype = Object.create(Phaser.Sprite.prototype);
	MinerGame.Entity.Player.prototype.constructor = MinerGame.Entity.Player;
	
	MinerGame.Entity.Player.prototype.update = function() {
		var player_jump_amount = (TILE_HEIGHT * 9.8);
		var player_speed = (TILE_WIDTH * 4);
		
		if(this.wasd.shift.isDown) {
			player_speed = (TILE_WIDTH * 18);
		}
		
		var do_jump = this.cursors.up.isDown || this.wasd.jump.isDown || false;
		var is_standing = this.body.onFloor();
		var running_left = this.cursors.left.isDown || this.wasd.left.isDown || false;
		var running_right = this.cursors.right.isDown || this.wasd.right.isDown || false;
		
		if(do_jump && is_standing) {
			this.body.velocity.y = -210;
		}
		
		if(running_left && !running_right) {
			this.body.velocity.x = -player_speed;
			
			if(do_jump && is_standing) {
				this.animations.play('stand_left');
			} else {
				this.animations.play('run_left');
			}
		} else if(running_right && !running_left) {
			this.body.velocity.x = player_speed;
			
			if(do_jump && is_standing) {
				this.animations.play('stand_right');
			} else {
				this.animations.play('run_right');
			}
		} else {
			// standing still
			this.body.velocity.x = 0;
			
			this.animations.stop();
			this.frame = this.character.default_frame;
		}
	};
	
	MinerGame.Entity.Player.prototype.pickCharacter = function() {
		var playable_characters = {
			'man': {
				'spritesheet': "players",
				'crop': {
					'top': 0,
					'right': 6,
					'bottom': 0,
					'left': 6
				},
				'default_frame': 0,
				'animations': {
					'stand_left': [9],
					'run_left': [10, 11],
					'stand_right': [18],
					'run_right': [19, 20]
				},
				'properties': {
					'reach': 5
				}
			},
			'woman': {
				'spritesheet': "players",
				'crop': {
					'top': 0,
					'right': 4,
					'bottom': 0,
					'left': 4
				},
				'default_frame': 3,
				'animations': {
					'stand_left': [12],
					'run_left': [13, 14],
					'stand_right': [21],
					'run_right': [22, 23]
				},
				'properties': {
					'reach': 5
				}
			},
			'alien': {
				'spritesheet': "players",
				'crop': {
					'top': 0,
					'right': 6,
					'bottom': 0,
					'left': 6
				},
				'default_frame': 6,
				'animations': {
					'stand_left': [15],
					'run_left': [16, 17],
					'stand_right': [24],
					'run_right': [25, 26]
				},
				'properties': {
					'reach': 5
				}
			}
		};
		
		var picked_character = _.sample(_.keys(playable_characters));
		
		return _.extend({'key': picked_character}, playable_characters[ picked_character ]);
	};
	
	MinerGame.Entity.Player.prototype.maybeCrop = function() {
		// crop player sprite based on character-specific settings
		this.croppedRect = Phaser.Rectangle(0, 0, TILE_WIDTH, TILE_HEIGHT);
		
		if(!this.character.crop.top && !this.character.crop.right && !this.character.crop.bottom && !this.character.crop.left) {
			console.log("No need to crop");
			return;
		}
		
		this.croppedRect = new Phaser.Rectangle(
			this.character.crop.left,
			this.character.crop.top,
			(TILE_WIDTH - (this.character.crop.left + this.character.crop.right)),
			(TILE_HEIGHT - (this.character.crop.top + this.character.crop.bottom))
		);
		
		this.crop(this.croppedRect);
	};
	
	MinerGame.Entity.Player.prototype.getReach = function() {
		return this.character.properties.reach;
	};
	