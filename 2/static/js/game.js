	
	// https://phaser.io/examples
	// https://phaser.io/tutorials/making-your-first-phaser-game
	
	var TILE_WIDTH = 16;
	var TILE_HEIGHT = 16;
	
	var game = new Phaser.Game(800, 600, Phaser.AUTO, "", {
		'preload': preload,
		'create': create,
		'update': update,
		'render': render
	});
	
	
	// preload
	
	function preload() {
		game.load.image('tiles', "/static/images/world.png");
		game.load.spritesheet('players', "/static/images/players.png", TILE_WIDTH, TILE_HEIGHT);
	}
	
	
	// create
	var custWorld;
	var map;
	var layer;
	
	var player;
	var playerCharacter;
	var yAxis = p2.vec2.fromValues(0, 1);
	
	var marker;
	var currentDataString;
	var cursors;
	var wasd;
	
	var playable_characters = {
		'man': {
			'spritesheet': "players",
			'default_frame': 0,
			'animations': {
				'stand_left': [9],
				'run_left': [10, 11],
				'stand_right': [18],
				'run_right': [19, 20]
			},
			'reach': 5
		},
		'woman': {
			'spritesheet': "players",
			'default_frame': 3,
			'animations': {
				'stand_left': [12],
				'run_left': [13, 14],
				'stand_right': [21],
				'run_right': [22, 23]
			},
			'reach': 5
		},
		'alien': {
			'spritesheet': "players",
			'default_frame': 6,
			'animations': {
				'stand_left': [15],
				'run_left': [16, 17],
				'stand_right': [24],
				'run_right': [25, 26]
			},
			'reach': 5
		}
	};
	var playable_character_keys = ["man", "woman", "alien"];
	
	function create() {
		// arcade physics
		game.physics.startSystem(Phaser.Physics.P2JS);
		
		// controls
		cursors = game.input.keyboard.createCursorKeys();
		wasd = {
			'up': game.input.keyboard.addKey(Phaser.Keyboard.W),
			'left': game.input.keyboard.addKey(Phaser.Keyboard.A),
			'down': game.input.keyboard.addKey(Phaser.Keyboard.S),
			'right': game.input.keyboard.addKey(Phaser.Keyboard.D),
			'jump': game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
		};
		
		// make world
		custWorld = new customGameWorld(game.rnd.between(150, 200), game.rnd.between(300, 350), 5);
		
		// add world data to game cache
		game.cache.addTilemap('dynamicMap', null, custWorld.toJSON(), Phaser.Tilemap.TILED_JSON);
		
		// tilemap
		map = game.add.tilemap('dynamicMap', TILE_WIDTH, TILE_HEIGHT);
		
		// 'tiles' = cache image key
		map.addTilesetImage('tiles', 'tiles', TILE_WIDTH, TILE_HEIGHT);
		
		// layer 0
		//layer = map.createLayer(0);
		layer = map.createLayer("Tile Layer 1");
		
		// resize world to match layer tilemap size
		layer.resizeWorld();
		
		// this is done before generating p2 bodies
		custWorld.updateCollision();
		
		// enable physics on tiles
		game.physics.p2.convertTilemap(map, layer);
		
		// make cursor marker
		marker = game.add.graphics();
		marker.lineStyle(2, 0xffffff, 1);
		marker.drawRect(0, 0, TILE_WIDTH, TILE_HEIGHT);
		
		// player
		var playerSpawn = custWorld.getSpawn();
		playerCharacter = playable_characters[ game.rnd.pick( playable_character_keys ) ];
		player = game.add.sprite(((playerSpawn.x * TILE_WIDTH) + (TILE_WIDTH / 2)), ((playerSpawn.y * TILE_HEIGHT) + (TILE_HEIGHT / 2)), 'players', playerCharacter.default_frame);   // + TILE_WIDTH/2 and + TILE_HEIGHT/2 because p2 changes anchor to 0.5,0.5
		
		for(var key in playerCharacter.animations) {
			if(playerCharacter.animations.hasOwnProperty(key)) {
				player.animations.add(key, playerCharacter.animations[ key ], 10, true);
			}
		}
		
		game.physics.p2.enable(player);
		player.body.fixedRotation = true;
		
		// make camera follow player
		game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);
		
		// reset physics bounds to resized world (from layer.resizeWorld)
		game.physics.p2.setBoundsToWorld(true, true, true, true, false);
		
		// enable gravity
		game.physics.p2.gravity.y = 9.8;
		//game.physics.p2.restitution = 0;
		
		// input callbacks
		game.input.addMoveCallback(updateMarker, this);
		game.input.onDown.add(clickTile, this);
	}
	
	
	// update
	
	function update() {
		marker.x = (layer.getTileX(game.input.activePointer.worldX) * TILE_WIDTH);
		marker.y = (layer.getTileY(game.input.activePointer.worldY) * TILE_HEIGHT);
		
		var player_jump_amount = (TILE_HEIGHT * 2.5);
		var player_speed = (TILE_WIDTH * 4);
		
		var jumping = cursors.up.isDown || wasd.jump.isDown || false;
		var running_left = cursors.left.isDown || wasd.left.isDown || false;
		var running_right = cursors.right.isDown || wasd.right.isDown || false;
		
		if(jumping && canPlayerJump()) {
			//player.body.velocity.y = -player_jump_amount;
			player.body.moveUp(player_jump_amount);
		}
		
		if(running_left && !running_right) {
			//player.body.x -= player_speed;
			player.body.moveLeft(player_speed);
			
			if(jumping) {
				player.animations.play('stand_left');
			} else {
				player.animations.play('run_left');
			}
		} else if(running_right && !running_left) {
			//player.body.x += player_speed;
			player.body.moveRight(player_speed);
			
			if(jumping) {
				player.animations.play('stand_right');
			} else {
				player.animations.play('run_right');
			}
		} else {
			// standing still
			player.animations.stop();
			player.frame = playerCharacter.default_frame;
		}
	}
	
	
	// render
	
	function render() {
		//game.debug.cameraInfo(game.camera, 16, 38);
		
		// marker info
		if(currentDataString) {
			game.debug.text(currentDataString, 16, 16);
		}
		
		// player info
		//game.debug.text("Player at: "+ layer.getTileX(player.x) +","+ layer.getTileY(player.y), 16, 36);
		
		//game.debug.spriteInfo(player, 300, 16);
	}
	
	
	
	
	// UTILITIES
	////////////
	
	function canPlayerJump() {
		var result = false;
		
		for (var i=0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++) {
			var c = game.physics.p2.world.narrowphase.contactEquations[ i ];
			
			if((c.bodyA === player.body.data) || (c.bodyB === player.body.data)) {
				var d = p2.vec2.dot(c.normalA, yAxis);
				
				if(c.bodyA === player.body.data) {
					d *= -1;
				}
				
				if(d > 0.5) {
					result = true;
				}
			}
		}
		
		return result;
	}
	
	function getDistanceFromPlayer(obj_x, obj_y) {
		return game.math.distance(layer.getTileX(player.x), layer.getTileY(player.y), obj_x, obj_y);
	}
	
	function updateMarker() {
		var marker_tile_x = layer.getTileX(game.input.activePointer.worldX);
		var marker_tile_y = layer.getTileY(game.input.activePointer.worldY);
		
		marker.x = (marker_tile_x * 16);
		marker.y = (marker_tile_y * 16);
		
		var distance_from_player = getDistanceFromPlayer(marker_tile_x, marker_tile_y);
		var max_distance = playerCharacter.reach;
		var marker_alpha = 1;
		
		if(distance_from_player > max_distance) {
			marker_alpha = 0.2;
		}
		
		marker.alpha = marker_alpha;
	}
	
	// tile properties
	function clickTile() {
		var x = layer.getTileX(game.input.activePointer.worldX);
		var y = layer.getTileY(game.input.activePointer.worldY);
		
		if((x < 0) || (x > custWorld.width) || (y < 0) || (y > custWorld.height)) {
			currentDataString = "";
			
			return;
		}
		
		var distance_from_player = getDistanceFromPlayer(x, y);
		var max_distance = playerCharacter.reach;
		
		var tile = custWorld.getTile(x, y);
		
		if((distance_from_player <= max_distance) && (distance_from_player > 0.5)) {
			currentDataString = "";
			
			var new_tile_type = "";
			
			if("air" != tile.type) {
				new_tile_type = "air";
			} else {
				//new_tile_type = "dirt";
			}
			
			if("" !== new_tile_type) {
				custWorld.replaceTile(x, y, new_tile_type);
				
				currentDataString = "replaced "+ tile.type +" with "+ new_tile_type +" at "+ x +","+ y;
			}
		} else {
			// just show tile info since player can't interact this far away
			currentDataString = x +","+ y +" ("+ tile.type +"): "+ JSON.stringify( tile.properties );
		}
		
		// set property value on the fly:
		//tile.properties.wibble = true;
	}
	
	var tile_types = {
		'air': {
			'sprites': [90],
			'collide': false,
			'properties': {
				'title': "Air",
				'strength': 0
			}
		},
		'dirt': {
			'sprites': [3, 5, 6],
			'collide': true,
			'properties': {
				'title': "Dirt",
				'strength': 1
			}
		},
		'stone': {
			'sprites': [27, 28, 29, 30],
			'collide': true,
			'properties': {
				'title': "Stone",
				'strength': 3
			}
		},
		'wood': {
			'sprites': [36, 37, 38, 39, 40],
			'collide': true,
			'properties': {
				'title': "Wood",
				'strength': 3
			}
		},
		'ore': {
			'sprites': [16, 17, 18, 19, 20],
			'collide': true,
			'properties': {
				'title': "Ore",
				'strength': 5
			}
		},
		'lava': {
			'sprites': [76],
			'collide': true,
			'properties': {
				'title': "Lava",
				'strength': 0
			}
		}
	};
	
	// tile object
	function customTile(map_x, map_y, type, properties) {
		this.type = type;
		this.x = map_x;
		this.y = map_y;
		this.sprite = 0;
		this.properties = {};
		this.collides = false;
		
		this.setTileType = function(type) {
			this.type = type;
			this.sprite = Phaser.ArrayUtils.getRandomItem( tile_types[ this.type ].sprites );
			this.properties = tile_types[ this.type ].properties;
			this.collides = tile_types[ this.type ].collide || false;
		};
		
		this.getTileSprite = function() {
			return this.sprite;
		};
		
		this.collidesWithPlayer = function() {
			return this.collides;
		};
		
		// set tile type on create
		this.setTileType(type, properties);
	}
	
	// game world object
	function customGameWorld(num_tiles_x, num_tiles_y, max_sky) {
		this.tiles = [];
		this.width = num_tiles_x || 100;
		this.height = num_tiles_y || 250;
		this.height_sky = max_sky || 30;
		this.spawn = null;
		
		// update collision based on tiles
		this.updateCollision = function() {
			// add collision to layer tiles
			map.setCollisionByExclusion(this.getTileSpritesNotCollideableWithPlayer(), true, layer);
			game.physics.p2.convertTilemap(map, layer);
		};
		
		// place tile
		this.placeTile = function(x, y, tile_type) {
			if((x < 0) || (x >= this.width) || (y < 0) || (y >= this.height) || !tile_types.hasOwnProperty(tile_type)) {
				return false;
			}
			
			this.tiles[ y ][ x ] = new customTile(x, y, tile_type);
		};
		
		// replace tile
		this.replaceTile = function(x, y, new_tile_type) {
			this.placeTile(x, y, new_tile_type);
			
			var newTile = new Phaser.Tile(layer, this.getTile(x, y).getTileSprite(), x, y, 16, 16);
			
			map.removeTile(x, y, layer);
			map.putTile(newTile, x, y, layer);
			
			this.updateCollision();
		}
		
		// start world creation by filling entire world with air
		this.generate_addAir = function() {
			var y, x;
			
			for(y = 0; y < this.height; y++) {
				this.tiles[ y ] = [];
				
				for(x = 0; x < this.width; x++) {
					this.placeTile(x, y, 'air');
				}
			}
		};
		
		// add dirt to world
		this.generate_addDirt = function() {
			var y, x;
			
			for(y = this.height_sky; y < this.height; y++) {
				for(x = 0; x < this.width; x++) {
					this.placeTile(x, y, 'dirt');
				}
			}
		};
		
		// add stone to world
		this.generate_addStone = function() {
			
			var y_min = (this.height_sky + 5);
			//var num_groups = game.rnd.between(6, 10);   // number of stone groups to make
			var num_groups = Math.round(Math.sqrt( (this.width * this.height) ));   // number of stone groups to make
			var i;
			var center_x, center_y;
			
			for(i = 0; i < num_groups; i++) {
				center_x = game.rnd.between(0, this.width);
				center_y = game.rnd.between(y_min, this.height);
				
				
				this.placeTile(center_x, (center_y - 1), 'stone');
				this.placeTile((center_x - 1), center_y, 'stone');
				this.placeTile(center_x, center_y, 'stone');
				this.placeTile((center_x + 1), center_y, 'stone');
				this.placeTile(center_x, (center_y + 1), 'stone');
			}
		};
		
		// add wood to world
		this.generate_addWood = function() {
			
		};
		
		// add ore to world
		this.generate_addOre = function() {
			
		};
		
		// add lava to world
		this.generate_addLava = function() {
			var x, y;
			var lava_height = 3;
			
			for(y = (this.height - 1); y > ((this.height - 1) - lava_height); y--) {
				for(x = 0; x < this.width; x++) {
					this.placeTile(x, y, 'lava');
				}
			}
		};
		
		// return {x: X, y: Y} of spawn point
		this.getSpawn = function() {
			if(null === this.spawn) {
				var points = [];
				var x, y;
				var tile, tile_below;
				
				// scan left to right, top to bottom, find bottom most air from top
				for(x = 0; x < this.width; x++) {
					for(y = 0; y < this.height; y++) {
						tile = this.getTile(x, y);
						
						if("air" === tile.type) {
							tile_below = this.getTile(x, (y + 1));
							
							if((false !== tile_below) && tile_below.collidesWithPlayer()) {
								points.push({'x': x, 'y': y});
								
								break;
							}
						}
					}
				}
				
				if(points.length) {
					this.spawn = game.rnd.pick(points);
				} else {
					// unable to organically find a spawn, choose one at random that "should" have something open
					this.spawn = {
						'x': game.rnd.between(0, (this.width - 1)),
						'y': (this.height_sky - 1)
					};
				}
			}
			
			return this.spawn;
		};
		
		// build index of tile sprites that don't collide with player
		this.getTileSpritesNotCollideableWithPlayer = function() {
			var sprites = [];
			var key;
			
			for(key in tile_types) {
				if(tile_types.hasOwnProperty(key)) {
					if(!tile_types[ key ].collide && tile_types[ key ].sprites.length) {
						//console.log("gTSCWP("+ key +") collides: "+ tile_types[ key ].sprites);
						
						sprites = sprites.concat( tile_types[ key ].sprites );
					}
				}
			}
			
			//console.log("gTSCWP collisions: "+ sprites.join(","));
			
			return sprites;
		};
		
		// build index of tile sprites that collide with player
		this.getTileSpritesCollideableWithPlayer = function() {
			var sprites = [];
			var key;
			
			for(key in tile_types) {
				if(tile_types.hasOwnProperty(key)) {
					if(tile_types[ key ].collide && tile_types[ key ].sprites.length) {
						//console.log("gTSCWP("+ key +") collides: "+ tile_types[ key ].sprites);
						
						sprites = sprites.concat( tile_types[ key ].sprites );
					}
				}
			}
			
			//console.log("gTSCWP collisions: "+ sprites.join(","));
			
			return sprites;
		};
		
		
		// return customTile at x,y
		this.getTile = function(x, y) {
			if(!this.tiles[ y ].length || !this.tiles[ y ][ x ]) {
				return false;
			}
			
			return this.tiles[ y ][ x ];
		};
		
		// get multi-dimentional array of tiles from x,y to x+width,y+height
		this.getTiles = function(x, y, width, height) {
			if(!width || !height) {
				return [];
			}
			
			var xy_tiles = [];
			var tx, ty;
			var tx_to = Math.min((x + width), this.width);
			var ty_to = Math.min((y + height), this.height);
			
			for(ty = y; ty <= ty_to; ty++) {
				var x_tiles = [];
				
				for(tx = x; tx <= tx_to; tx++) {
					x_tiles.push( this.tiles[ ty ][ tx ] );
				}
				
				xy_tiles.push(x_tiles);
			}
			
			return xy_tiles;
		}
		
		// generate CSV of map
		this.toCSV = function() {
			var y_data = [],
				x_data;
			
			for(var y = 0; y < this.height; y++) {
				x_data = [];
				
				for(var x = 0; x < this.width; x++) {
					x_data.push(this.tiles[ y ][ x ].getTileSprite());
				}
				
				y_data.push( x_data.join(",") );
			}
			
			return y_data.join("\n");
		};
		
		// generate Tiled JSON of map
		this.toJSON = function() {
			var raw_layer_tiles = [];
			var tile_properties = {};
			
			// convert tile multi array to single array
			for(var y = 0; y < this.height; y++) {
				var tmp = [];
				
				for(var x = 0; x < this.width; x++) {
					var tile = this.tiles[ y ][ x ];
					
					var sprite_number = tile.getTileSprite();
					tmp.push(sprite_number +"("+ tile.properties.type +")");
					
					raw_layer_tiles.push(sprite_number);
					
					// doesn't work: (maybe tileproperties is limited to properties of tile type, not exact tile)
					//tile_properties[ ((this.width * (y - 1)) + x).toString() ] = tile.properties;
				}
			}
			
			// http://docs.mapeditor.org/fr/latest/reference/json-map-format/
			var data = {
				"height": 6,
				"layers": [
					{
						"data": raw_layer_tiles,
						"height": this.height,
						"name": "Tile Layer 1",
						"opacity": 1,
						"type": "tilelayer",
						"visible": true,
						"width": this.width,
						"x": 0,
						"y": 0
					}
				],
				"nextobjectid": 6,
				"orientation": "orthogonal",
				"properties": {
					
				},
				"renderorder": "right-down",
				"tileheight": 16,
				"tilesets": [
					{
						"firstgid": 1,
						"image": "/static/images/world.png",
						"imageheight": 240,
						"imagewidth": 96,
						"margin": 0,
						"name": "tiles",
						"properties": {
							
						},
						"spacing": 0,
						"tileheight": 16,
						"tileproperties": tile_properties,
						"tilewidth": 16
					}
				],
				"tilewidth": 16,
				"version": 1,
				"width": 15
			};
			
			//return JSON.stringify(data);
			return data;
		}
		
		
		// create world
		this.generate_addAir();
		this.generate_addDirt();
		this.generate_addStone();
		this.generate_addWood();
		this.generate_addOre();
		this.generate_addLava();
	}