	
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
		
		this.playerInventory = [];
	};
	
	MinerGame.State.Game.prototype = {
		'init': function() {
			
		},
		'preload': function() {
			
		},
		'create': function() {
			// arcade physics
			this.game.physics.startSystem(Phaser.Physics.ARCADE);
			
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
			this.layer = this.map.createLayer("Tile Layer 1");
			
			// resize world to match layer tilemap size
			this.layer.resizeWorld();
			
			// assign map+layer
			this.custWorld.setMapLayer(this.map, this.layer);
			
			// make cursor marker
			this.marker = this.game.add.graphics();
			this.marker.lineStyle(2, 0xffffff, 1);
			this.marker.drawRect(0, 0, TILE_WIDTH, TILE_HEIGHT);
			
			// player
			this.playerCharacter = playable_characters[ this.game.rnd.pick( _.keys(playable_characters) ) ];
			
			var playerSpawn = this.custWorld.getSpawn();
			//this.player = this.game.add.sprite(((playerSpawn.x * TILE_WIDTH) + (TILE_WIDTH / 2)), ((playerSpawn.y * TILE_HEIGHT) + (TILE_HEIGHT / 2)), 'players', this.playerCharacter.default_frame);   // + TILE_WIDTH/2 and + TILE_HEIGHT/2 because p2 changes anchor to 0.5,0.5
			this.player = this.game.add.sprite((playerSpawn.x * TILE_WIDTH), (playerSpawn.y * TILE_HEIGHT), 'players', this.playerCharacter.default_frame);
			
			for(var key in this.playerCharacter.animations) {
				if(this.playerCharacter.animations.hasOwnProperty(key)) {
					this.player.animations.add(key, this.playerCharacter.animations[ key ], 10, true);
				}
			}
			
			this.game.physics.enable(this.player);
			
			this.player.body.bounce.y = 0;
			this.player.body.linearDamping = 1;
			this.player.body.collideWorldBounds = true;
			
			// make camera follow player
			this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);
			
			// enable gravity
			this.game.physics.arcade.gravity.y = (TILE_HEIGHT * 9.8);
			
			// input callbacks
			this.game.input.addMoveCallback(this.updateMarker, this);
			this.game.input.onDown.add(this.clickTile, this);
		},
		'update': function() {
			this.game.physics.arcade.collide(this.player, this.layer);
			
			this.marker.x = (this.layer.getTileX(this.game.input.activePointer.worldX) * TILE_WIDTH);
			this.marker.y = (this.layer.getTileY(this.game.input.activePointer.worldY) * TILE_HEIGHT);
			
			
			var player_jump_amount = (TILE_HEIGHT * 9.8);
			
			var player_speed = (TILE_WIDTH * 4);
			
			if(this.wasd.shift.isDown) {
				player_speed = (TILE_WIDTH * 18);
			}
			
			var do_jump = this.cursors.up.isDown || this.wasd.jump.isDown || false;
			var is_standing = this.player.body.onFloor();
			var running_left = this.cursors.left.isDown || this.wasd.left.isDown || false;
			var running_right = this.cursors.right.isDown || this.wasd.right.isDown || false;
			
			if(do_jump && is_standing) {
				this.player.body.velocity.y = -210;
			}
			
			if(running_left && !running_right) {
				this.player.body.velocity.x = -player_speed;
				
				if(do_jump && is_standing) {
					this.player.animations.play('stand_left');
				} else {
					this.player.animations.play('run_left');
				}
			} else if(running_right && !running_left) {
				this.player.body.velocity.x = player_speed;
				
				if(do_jump && is_standing) {
					this.player.animations.play('stand_right');
				} else {
					this.player.animations.play('run_right');
				}
			} else {
				// standing still
				this.player.body.velocity.x = 0;
				
				this.player.animations.stop();
				this.player.frame = this.playerCharacter.default_frame;
			}
		},
		'render': function() {
			// marker info
			if(this.currentDataString) {
				this.game.debug.text(this.currentDataString, 16, 16);
			}
		},
		
		
		'updateMarker': function() {
			var marker_tile_x = this.layer.getTileX(this.game.input.activePointer.worldX);
			var marker_tile_y = this.layer.getTileY(this.game.input.activePointer.worldY);
			
			this.marker.x = (marker_tile_x * TILE_WIDTH);
			this.marker.y = (marker_tile_y * TILE_HEIGHT);
			
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
		}
	};
	