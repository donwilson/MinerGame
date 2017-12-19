	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.Entity = window.MinerGame.Entity || (window.MinerGame.Entity = {});
	
	MinerGame.Entity.Player = function(game, custWorld) {
		this.game = game;
		this.custWorld = custWorld;
		
		this.character = this.pickCharacter();
		this.spawn = this.custWorld.getSpawn();
		this.backpack = new MinerGame.Component.Backpack(this.game, this.custWorld);
		
		this.backpack.addTool("wood_shovel");
		
		Phaser.Sprite.call(this, game, (this.spawn.x * TILE_WIDTH), (this.spawn.y * TILE_HEIGHT), this.character.spritesheet, this.character.default_frame);
		
		// add generated player to game
		this.game.add.existing(this);
		
		//this.character = playable_characters[ game.rnd.pick( _.keys(playable_characters) ) ];
		
		// animations
		for(var key in this.character.animations) {
			if(this.character.animations.hasOwnProperty(key)) {
				this.animations.add(key, this.character.animations[ key ].frames, this.character.animations[ key ].speed, true);
			}
		}
		
		// crop sprite to contain just image
		this.maybeCrop();
		
		// physics
		this.game.physics.enable(this);
		
		// physics
		this.body.bounce.y = 0;
		this.body.linearDamping = 1;
		this.body.collideWorldBounds = true;
		
		// tool
		this.tool = this.addChild(game.make.sprite((this.width / 2), (this.height / 2), 'world', tile_types.wood_shovel.sprites[0]));
		this.tool.pivot.x = (TILE_WIDTH / 2);
		this.tool.pivot.y = (TILE_HEIGHT / 2);
		this.tool.alpha = 0;
		this.tool.rotation = 90;
		this.toolTween = null;
		
		// controls
		this.cursors = this.game.input.keyboard.createCursorKeys();
		this.wasd = {
			'up': this.game.input.keyboard.addKey(Phaser.Keyboard.W),
			'left': this.game.input.keyboard.addKey(Phaser.Keyboard.A),
			'down': this.game.input.keyboard.addKey(Phaser.Keyboard.S),
			'right': this.game.input.keyboard.addKey(Phaser.Keyboard.D),
			'jump': this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
		};
	};
	
	MinerGame.Entity.Player.prototype = Object.create(Phaser.Sprite.prototype);
	MinerGame.Entity.Player.prototype.constructor = MinerGame.Entity.Player;
	
	MinerGame.Entity.Player.prototype.update = function() {
		var is_fast = false;//var is_fast = this.wasd.shift.isDown;
		
		var player_jump_amount = (TILE_HEIGHT * 9);
		var player_speed = (TILE_WIDTH * 4);
		
		if(is_fast) {
			player_speed = (TILE_WIDTH * 18);
		}
		
		var do_jump = this.cursors.up.isDown || this.wasd.jump.isDown || false;
		var is_standing = this.body.onFloor();
		var running_left = this.cursors.left.isDown || this.wasd.left.isDown || false;
		var running_right = this.cursors.right.isDown || this.wasd.right.isDown || false;
		
		if(do_jump && is_standing) {
			this.body.velocity.y = -player_jump_amount;
		}
		
		if(running_left && !running_right) {
			this.body.velocity.x = -player_speed;
			
			if(do_jump || !is_standing) {
				this.animations.play('stand_left');
			} else if(is_fast) {
				this.animations.play('run_left');
			} else {
				this.animations.play('walk_left');
			}
		} else if(running_right && !running_left) {
			this.body.velocity.x = player_speed;
			
			if(do_jump || !is_standing) {
				this.animations.play('stand_right');
			} else if(is_fast) {
				this.animations.play('run_right');
			} else {
				this.animations.play('walk_right');
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
			'boy': {
				'spritesheet': "world",
				'crop': {
					'top': 0,
					'right': 6,
					'bottom': 0,
					'left': 6
				},
				'default_frame': 626,
				'animations': {
					'stand_left': {
						'frames': [666],
						'speed': 20
					},
					'walk_left': {
						'frames': [666, 668],
						'speed': 10
					},
					'run_left': {
						'frames': [666, 668],
						'speed': 20
					},
					'stand_right': {
						'frames': [669],
						'speed': 20
					},
					'walk_right': {
						'frames': [669, 671],
						'speed': 10
					},
					'run_right': {
						'frames': [669, 671],
						'speed': 20
					}
				},
				'properties': {
					'reach': 5
				}
			},
			'girl': {
				'spritesheet': "world",
				'crop': {
					'top': 0,
					'right': 4,
					'bottom': 0,
					'left': 4
				},
				'default_frame': 706,
				'animations': {
					'stand_left': {
						'frames': [746],
						'speed': 20
					},
					'walk_left': {
						'frames': [746, 747, 748],
						'speed': 10
					},
					'run_left': {
						'frames': [746, 747, 748],
						'speed': 20
					},
					'stand_right': {
						'frames': [749],
						'speed': 20
					},
					'walk_right': {
						'frames': [749, 750, 751],
						'speed': 10
					},
					'run_right': {
						'frames': [749, 750, 751],
						'speed': 20
					}
				},
				'properties': {
					'reach': 5
				}
			},
			'alien': {
				'spritesheet': "world",
				'crop': {
					'top': 0,
					'right': 6,
					'bottom': 0,
					'left': 6
				},
				'default_frame': 786,
				'animations': {
					'stand_left': {
						'frames': [826],
						'speed': 20
					},
					'walk_left': {
						'frames': [826, 827, 828],
						'speed': 10
					},
					'run_left': {
						'frames': [826, 827, 828],
						'speed': 20
					},
					'stand_right': {
						'frames': [829],
						'speed': 20
					},
					'walk_right': {
						'frames': [829, 830, 831],
						'speed': 10
					},
					'run_right': {
						'frames': [829, 830, 831],
						'speed': 20
					}
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
	
	MinerGame.Entity.Player.prototype.getDistance = function(x, y) {
		//return this.game.math.distance(this.custWorld.layer.getTileX(this.x), this.custWorld.layer.getTileY(this.y), tileX, tileY);
		return this.game.math.distance(this.centerX, this.centerY, x, y);
	};
	
	MinerGame.Entity.Player.prototype.captureClick = function(worldX, worldY) {
		var distance_from_player = this.getDistance(worldX, worldY);
		var max_distance = this.getReach();
		
		if(distance_from_player > (max_distance * TILE_WIDTH)) {
			// too far away
			return false;
		}
		
		
		
		// --v this could be better
		//console.log("worldX,worldY = ("+ worldX +","+ worldY +")");
		//console.log("player.centerX,centerY = ("+ this.x +","+ this.y +")");
		//console.log("distance_from_player = "+ distance_from_player);
		
		var tileX = this.custWorld.layer.getTileX(worldX);
		var tileY = this.custWorld.layer.getTileY(worldY);
		
		var playerTileX = this.custWorld.layer.getTileX(this.centerX);
		var playerTileY = this.custWorld.layer.getTileY(this.centerY);
		
		if((distance_from_player < Math.max((this.width / 2), (this.height / 2)))) {
			// too close
			return false;
		} else if((tileX == playerTileX) && (tileY == playerTileY)) {
			// too close
			return false;
		}
		// --^ this could be better
		
		var backpack_active_item = this.backpack.getActiveItem();
		
		if((null !== backpack_active_item) && backpack_active_item.type && ("tool" === backpack_active_item.type)) {
			// @TODO limit this from being called on "air" tiles
			if(null !== this.toolTween) {
				if(this.toolTween.isRunning) {
					// delay clicks when tool is working
					return;
				}
				
				this.toolTween.stop(true);
				this.toolTween = null;
			}
			
			this.tool.frame = tile_types[ backpack_active_item.item_name ].sprites[0];
			this.tool.angle = 90;
			this.tool.alpha = 0.9;
			
			this.toolTween = this.game.add.tween(this.tool).to({
				'angle': 180
			}, 300, Phaser.Easing.Linear.None, true);
			
			this.toolTween.onComplete.add(function(target, tween) {
				target.alpha = 0;
				target.angle = 90;
			}, this);
		}
		
		this.backpack.useSelectedItemSlot(tileX, tileY);
	};
	