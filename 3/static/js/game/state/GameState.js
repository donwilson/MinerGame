	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.State = window.MinerGame.State || (window.MinerGame.State = {});
	
	MinerGame.State.Game = function() {
		this.custWorld = null;
		this.map = null;
		this.layer = null;
		
		this.fullscreenButton = null;
		
		this.player = null;
		this.playerCharacter = null;
		
		this.marker = null;
		this.currentDataString = null;
		this.cursors = null;
		this.wasd = null;
	};
	
	MinerGame.State.Game.prototype = {
		'init': function() {
			console.log("State: Game");
			
			//this.game.plugins.add(Phaser.Plugin.AdvancedTiming);
		},
		'preload': function() {
			
		},
		'create': function() {
			// arcade physics
			this.game.physics.startSystem(Phaser.Physics.P2JS);
			
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
			
			// make world
			this.custWorld = new customGameWorld(this.game, this.game.rnd.between(150, 200), this.game.rnd.between(300, 350), 5);
			
			// add world data to game cache
			this.game.cache.addTilemap('dynamicMap', null, this.custWorld.toJSON(), Phaser.Tilemap.TILED_JSON);
			
			// tilemap
			this.map = this.game.add.tilemap('dynamicMap', TILE_WIDTH, TILE_HEIGHT);
			
			// 'tiles' = cache image key
			this.map.addTilesetImage('tiles', 'tiles', TILE_WIDTH, TILE_HEIGHT);
			
			// layer 0
			//layer = map.createLayer(0);
			this.layer = this.map.createLayer("Tile Layer 1");
			
			// resize world to match layer tilemap size
			this.layer.resizeWorld();
			
			// assign map+layer
			this.custWorld.setMapLayer(this.map, this.layer);
			
			// this is done before generating p2 bodies
			this.custWorld.updateCollision();
			
			// enable physics on tiles
			//this.game.physics.p2.convertTilemap(this.map, this.layer);
			
			// make cursor marker
			this.marker = this.game.add.graphics();
			this.marker.lineStyle(2, 0xffffff, 1);
			this.marker.drawRect(0, 0, TILE_WIDTH, TILE_HEIGHT);
			
			// player
			this.playerCharacter = playable_characters[ this.game.rnd.pick( _.keys(playable_characters) ) ];
			
			var playerSpawn = this.custWorld.getSpawn();
			this.player = this.game.add.sprite(((playerSpawn.x * TILE_WIDTH) + (TILE_WIDTH / 2)), ((playerSpawn.y * TILE_HEIGHT) + (TILE_HEIGHT / 2)), 'players', this.playerCharacter.default_frame);   // + TILE_WIDTH/2 and + TILE_HEIGHT/2 because p2 changes anchor to 0.5,0.5
			
			for(var key in this.playerCharacter.animations) {
				if(this.playerCharacter.animations.hasOwnProperty(key)) {
					this.player.animations.add(key, this.playerCharacter.animations[ key ], 10, true);
				}
			}
			
			this.game.physics.p2.enable(this.player);
			this.player.body.fixedRotation = true;
			
			// make camera follow player
			this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);
			
			// reset physics bounds to resized world (from layer.resizeWorld)
			this.game.physics.p2.setBoundsToWorld(true, true, true, true, false);
			
			// enable gravity
			this.game.physics.p2.gravity.y = 300;
			this.game.physics.p2.restitution = 0;
			
			// input callbacks
			this.game.input.addMoveCallback(this.updateMarker, this);
			this.game.input.onDown.add(this.clickTile, this);
		},
		'update': function() {
			this.marker.x = (this.layer.getTileX(this.game.input.activePointer.worldX) * TILE_WIDTH);
			this.marker.y = (this.layer.getTileY(this.game.input.activePointer.worldY) * TILE_HEIGHT);
			
			
			var player_speed = (TILE_WIDTH * 4);
			
			if(this.wasd.shift.isDown) {
				player_speed = (TILE_WIDTH * 18);
			}
			
			var jumping = this.cursors.up.isDown || this.wasd.jump.isDown || false;
			var running_left = this.cursors.left.isDown || this.wasd.left.isDown || false;
			var running_right = this.cursors.right.isDown || this.wasd.right.isDown || false;
			
			if(jumping && this.canPlayerJump()) {
				//var player_jump_amount = (TILE_HEIGHT * 2.5);
				var player_jump_amount = 100;
				
				this.player.body.moveUp(player_jump_amount);
			}
			
			if(running_left && !running_right) {
				//player.body.x -= player_speed;
				this.player.body.moveLeft(player_speed);
				
				if(jumping) {
					this.player.animations.play('stand_left');
				} else {
					this.player.animations.play('run_left');
				}
			} else if(running_right && !running_left) {
				//this.player.body.x += player_speed;
				this.player.body.moveRight(player_speed);
				
				if(jumping) {
					this.player.animations.play('stand_right');
				} else {
					this.player.animations.play('run_right');
				}
			} else {
				// standing still
				this.player.animations.stop();
				this.player.frame = this.playerCharacter.default_frame;
			}
		},
		'render': function() {
			//this.game.debug.cameraInfo(this.game.camera, 16, 38);
			
			// fps
			//this.game.debug.gameTimeInfo(16, 38);
			
			//// marker info
			if(this.currentDataString) {
				this.game.debug.text(this.currentDataString, 16, 16);
			}
			
			
			
			// player info
			//this.game.debug.text("Player at: "+ this.layer.getTileX(player.x) +","+ this.layer.getTileY(player.y), 16, 36);
			
			//this.game.debug.spriteInfo(this.player, 300, 16);
		},
		
		
		'updateMarker': function() {
			return;
			
			var marker_tile_x = this.layer.getTileX(this.game.input.activePointer.worldX);
			var marker_tile_y = this.layer.getTileY(this.game.input.activePointer.worldY);
			
			this.marker.x = (marker_tile_x * 16);
			this.marker.y = (marker_tile_y * 16);
			
			var distance_from_player = this.game.math.distance(this.layer.getTileX(this.player.x), this.layer.getTileY(this.player.y), marker_tile_x, marker_tile_y);
			var max_distance = this.playerCharacter.reach;
			var marker_alpha = 1;
			
			if(distance_from_player > max_distance) {
				marker_alpha = 0.2;
			}
			
			this.marker.alpha = marker_alpha;
		},
		
		// tile properties
		'clickTile': function() {
			var x = this.layer.getTileX(this.game.input.activePointer.worldX);
			var y = this.layer.getTileY(this.game.input.activePointer.worldY);
			
			if((x < 0) || (x > this.custWorld.width) || (y < 0) || (y > this.custWorld.height)) {
				this.currentDataString = "";
				
				return;
			}
			
			var distance_from_player = this.game.math.distance(this.layer.getTileX(this.player.x), this.layer.getTileY(this.player.y), x, y);
			var max_distance = this.playerCharacter.reach;
			
			var tile = this.custWorld.getTile(x, y);
			
			if((distance_from_player <= max_distance) && (distance_from_player > 0.5)) {
				this.currentDataString = "";
				
				var new_tile_type = "";
				
				if("air" != tile.type) {
					new_tile_type = "air";
				} else {
					//new_tile_type = "dirt";
				}
				
				if("" !== new_tile_type) {
					this.custWorld.replaceTile(x, y, new_tile_type);
					
					this.currentDataString = "replaced "+ tile.type +" with "+ new_tile_type +" at "+ x +","+ y;
				}
			} else {
				// just show tile info since player can't interact this far away
				this.currentDataString = x +","+ y +" ("+ tile.type +"): "+ JSON.stringify( tile.properties );
			}
			
			// set property value on the fly:
			//tile.properties.wibble = true;
		},
		
		//'toggleFullscreen': function() {
		//	if(this.game.scale.isFullScreen) {
		//		this.game.scale.stopFullScreen();
		//	} else {
		//		this.game.scale.startFullScreen(false);
		//	}
		//},
		//'fullscreenChanged': function(scale) {
		//	if(scale.isFullScreen) {
		//		// 0=full, 1=min
		//		// out=normal, over=hover, down=active
		//		// setFrames( [overFrame] [, outFrame] [, downFrame] [, upFrame])
		//		this.fullscreenButton.setFrames(1, 0, 1);
		//		this.fullscreenButton.setFrame(0);
		//	} else {
		//		// 0=full, 1=min
		//		// out=normal, over=hover, down=active
		//		// setFrames( [overFrame] [, outFrame] [, downFrame] [, upFrame])
		//		this.fullscreenButton.setFrames(0, 1, 0);
		//		this.fullscreenButton.setFrame(1);
		//	}
		//	
		//	this.game.scale.refresh();
		//},
		
		
		'canPlayerJump': function() {
			var result = false;
			var yAxis = p2.vec2.fromValues(0, 1);
			
			for (var i=0; i < this.game.physics.p2.world.narrowphase.contactEquations.length; i++) {
				var c = this.game.physics.p2.world.narrowphase.contactEquations[ i ];
				
				if((c.bodyA === this.player.body.data) || (c.bodyB === this.player.body.data)) {
					var d = p2.vec2.dot(c.normalA, yAxis);
					
					if(c.bodyA === this.player.body.data) {
						d *= -1;
					}
					
					if(d > 0.5) {
						result = true;
					}
				}
			}
			
			return result;
		}
	};
	