	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.Entity = window.MinerGame.Entity || (window.MinerGame.Entity = {});
	
	MinerGame.Entity.Player = function(game, custWorld) {
		this.game = game;
		this.custWorld = custWorld;
		
		this.tweens = {
			'tool':  null
		};
		
		this.character = this.pickCharacter();
		this.spawn = this.custWorld.getSpawn();
		this.backpack = new MinerGame.Component.Backpack(this, this.game, this.custWorld);
		
		this.facing_right = false;
		this.is_standing = true;
		
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
		var active_backpack_item = this.backpack.getActiveItem();
		
		this.tool = this.addChild(game.make.sprite(0, 0, 'world', tile_types.air.sprites[0]));
		this.positionTool();
		
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
		this.is_standing = this.body.onFloor();
		var running_left = this.cursors.left.isDown || this.wasd.left.isDown || false;
		var running_right = this.cursors.right.isDown || this.wasd.right.isDown || false;
		
		if(do_jump && this.is_standing) {
			this.body.velocity.y = -player_jump_amount;
		}
		
		if(running_left && !running_right) {
			this.faceLeft();
			this.body.velocity.x = -player_speed;
			
			if(do_jump || !this.is_standing) {
				this.animations.play('stand_left');
			} else if(is_fast) {
				this.animations.play('run_left');
			} else {
				this.animations.play('walk_left');
			}
		} else if(running_right && !running_left) {
			this.faceRight();
			
			this.body.velocity.x = player_speed;
			
			if(do_jump || !this.is_standing) {
				this.animations.play('stand_right');
			} else if(is_fast) {
				this.animations.play('run_right');
			} else {
				this.animations.play('walk_right');
			}
		} else {
			// standing still
			this.body.velocity.x = 0;
			
			//this.animations.stop();
			//this.frame = this.character.default_frame;
			if(this.facing_right) {
				this.animations.play('stand_right');	
			} else {
				this.animations.play('stand_left');
			}
		}
		
		// mouse down
		if(this.game.input.activePointer.leftButton.isDown) {
			this.processMouseDown();
		}
	};
	
	MinerGame.Entity.Player.prototype.faceLeft = function() {
		if(!this.facing_right) {
			return;
		}
		
		this.facing_right = false;
		
		this.positionTool();
	};
	
	MinerGame.Entity.Player.prototype.faceRight = function() {
		if(this.facing_right) {
			return;
		}
		
		this.facing_right = true;
		
		this.positionTool();
	};
	
	MinerGame.Entity.Player.prototype.positionTool = function() {
		var backpack_active_item = this.backpack.getActiveItem();
		
		if((null === backpack_active_item) || !backpack_active_item.type || !backpack_active_item.item_name || !backpack_active_item.quantity) {
			this.tool.alpha = 0;
			
			return;
		}
		
		var item_name = backpack_active_item.item_name;
		var item = tile_types[ item_name ];
		
		if(("tile" === item.type) && ("air" === item_name)) {
			// hide air
			this.tool.alpha = 0;
			
			return;
		}
		
		this.tool.name = backpack_active_item.item_name;
		this.tool.frame = item.sprites[0];
		
		this.tool.anchor.setTo(0, 0);
		
		this.tool.x = (this.character.hand_offset.x - this.character.crop.left);
		this.tool.y = (this.character.hand_offset.y - this.character.crop.top);
		
		if("tool" === item.type) {
			if(this.facing_right) {
				this.tool.scale.x = 1;
				this.tool.scale.y = 1;
			} else {
				this.tool.scale.x = -1;
				this.tool.scale.y = 1;
			}
			
			this.tool.anchor.setTo(
				((item.grip_offset.x / this.tool.width) * this.tool.scale.x),
				((item.grip_offset.y / this.tool.height) * this.tool.scale.y)
			);
			
			if(!this.tweens.tool || (null === this.tweens.tool) || !this.tweens.tool.isRunning) {
				console.log("item["+ this.tool.name +"].angle_resting = "+ item.angle_resting +" (calc: "+ this.calculateToolAngle(item.angle_resting) +") :: Player.positionTool");
				this.tool.angle = this.calculateToolAngle(item.angle_resting);
			}
			
			this.tool.angle = (Math.abs(this.tool.angle) * this.tool.scale.x);
		} else {
			this.tool.anchor.setTo(0.5, 0.5);
			this.tool.angle = 0;
			this.tool.scale.x = 0.5;
			this.tool.scale.y = 0.5;
		}
		
		this.tool.alpha = 1;
	};
		
	/*MinerGame.Entity.Player.prototype.calculateToolAngle = function(desired_angle) {
		var multiplier = 1;
		
		if(!this.facing_right) {
			multiplier = -1;
		}
		
		return ((-tile_types[ this.tool.name ].angle_offset + desired_angle) * multiplier);
	};*/
	
	MinerGame.Entity.Player.prototype.calculateToolAngle = function(desired_angle) {
		var angle_calc = 0;
		
		angle_calc -= tile_types[ this.tool.name ].angle_offset;
		
		angle_calc += desired_angle;
		
		if(!this.facing_right) {
			angle_calc *= -1;
		}
		
		return angle_calc;
	};
	
	MinerGame.Entity.Player.prototype.pickCharacter = function() {
		var picked_character = _.sample(_.keys(playable_characters));
		
		return _.extend({'key': picked_character}, playable_characters[ picked_character ]);
	};
	
	MinerGame.Entity.Player.prototype.maybeCrop = function() {
		// crop player sprite based on character-specific settings
		this.croppedRect = Phaser.Rectangle(0, 0, TILE_WIDTH, TILE_HEIGHT);
		
		if(!this.character.crop.top && !this.character.crop.right && !this.character.crop.bottom && !this.character.crop.left) {
			// No need to crop
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
	
	MinerGame.Entity.Player.prototype.processMouseDown = function() {
		if((null !== this.tweens.tool) && this.tweens.tool.isRunning) {
			// tool is tweening, do nothing
			return;
		}
		
		var worldX = this.game.input.activePointer.worldX;
		var worldY = this.game.input.activePointer.worldY;
		
		// determine if mouse is too near or too far away from player
		var distance_from_player = this.getDistance(worldX, worldY);
		
		if(distance_from_player > (this.getReach() * TILE_WIDTH)) {
			// too far away
			return;
		}
		
		
		var tileX = this.custWorld.layer.getTileX(worldX);
		var tileY = this.custWorld.layer.getTileY(worldY);
		
		var playerTileX = this.custWorld.layer.getTileX(this.centerX);
		var playerTileY = this.custWorld.layer.getTileY(this.centerY);
		
		if((tileX == playerTileX) && (tileY == playerTileY)) {
			// too close
			return;
		}
		
		
		// attempt to use active item in backpack
		var backpack_active_item = this.backpack.getActiveItem();
		
		if(null === backpack_active_item) {
			return;
		}
		
		if(backpack_active_item.type && ("tool" === backpack_active_item.type)) {
			// cant use tool while jumping (for now)
			if(!this.is_standing) {
				return;
			}
			
			var tile_hit = this.custWorld.getTile(tileX, tileY);
			
			if("air" === tile_hit.type) {
				return;
			}
			
			this.animateTool(tileX, tileY);
		} else if(backpack_active_item.type && ("weapon" === backpack_active_item.type)) {
			// future...
			
		} else {
			this.backpack.useSelectedItemSlot(tileX, tileY);
		}
	};
	
	MinerGame.Entity.Player.prototype.captureClick = function() {
		if(this.backpack.captureClick()) {
			// clicked inside backpack, don't process further
			
			return;
		}
		
		this.processMouseDown();
	};
	
	MinerGame.Entity.Player.prototype.captureMouseWheel = function() {
		this.backpack.handleMouseWheel();
	};
	
	MinerGame.Entity.Player.prototype.animateTool = function(tileX, tileY, callable_done) {
		if(null !== this.tweens.tool) {
			if(this.tweens.tool.isRunning) {
				// prevent from running multiple times
				
				return;
			}
			
			this.tweens.tool.stop(true);
			
			this.tweens.tool = null;
		}
		
		var backpack_active_item = this.backpack.getActiveItem();
		
		var angle_start = this.calculateToolAngle(tile_types[ backpack_active_item.item_name ].angle_resting);
		var angle_end = this.calculateToolAngle(tile_types[ backpack_active_item.item_name ].angle_max);
		
		this.tool.angle = angle_start;
		
		console.log("tool["+ backpack_active_item.item_name +"].angle_resting = "+ tile_types[ backpack_active_item.item_name ].angle_resting +" (calc: "+ angle_start +") :: player.animateTool.tweenStart");
		console.log("tool["+ backpack_active_item.item_name +"].angle_max     = "+ tile_types[ backpack_active_item.item_name ].angle_max +" (calc: "+ angle_end +") :: player.animateTool.tweenTo");
		
		//Phaser.Tween.to(properties [, duration] [, ease] [, autoStart] [, delay] [, repeat] [, yoyo])
		this.tweens.tool = this.game.add.tween(this.tool);
		this.tweens.tool.to({
			'angle': angle_end
		}, 240, Phaser.Easing.Linear.None, true);
		
		this.tweens.tool.onComplete.add(function(target, tween) {
			//target.alpha = 0;
			console.log("tool["+ backpack_active_item.item_name +"].angle_resting = "+ tile_types[ backpack_active_item.item_name ].angle_resting +" (calc: "+ angle_start +") :: player.animateTool.tweenComplete");
			target.angle = angle_start;
			
			//if(callable_done) {
			//	(callable_done)(this);
			//}
			this.backpack.useSelectedItemSlot(tileX, tileY);
			
			this.tweens.tool = null;
		}, this);
	};