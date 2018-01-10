	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.Component = window.MinerGame.Component || (window.MinerGame.Component = {});
	
	MinerGame.Component.World = function(game, desired_character, num_tiles_x, num_tiles_y, max_sky) {
		this.game = game;
		this.map = null;
		this.layer = null;
		
		this.background = null;
		
		this.tiles = [];
		this.width = num_tiles_x || 100;
		this.height = num_tiles_y || 250;
		this.height_sky = max_sky || 30;
		this.spawn = null;
		
		this.desired_character = desired_character;
		
		this.tile_drops = null;
		this.tile_cracks = null;
		this.player = null;
		
		this.create();
	};
	
	MinerGame.Component.World.prototype = Object.create(Phaser.Component.prototype);
	MinerGame.Component.World.prototype.constructor = MinerGame.Component.World;
	
	MinerGame.Component.World.prototype.create = function() {
		// background
		this.background = this.game.add.image(0, 0, 'background');
		this.background.fixedToCamera = true;
		
		// arcade physics
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		
		// create world
		var world_generator = new MinerGame.Component.WorldGenerator(this.game, this.width, this.height, this.height_sky);
		world_generator.create();
		
		// apply generated world
		this.applyRawTiles(world_generator.getTiles());
		
		// set spawn
		//this.setSpawn(world_generator.getTopSpawnablePoints());
		this.setSpawn(world_generator.getPlayerSpawn());
		
		// add world data to game cache
		this.game.cache.addTilemap('dynamicMap', null, this.toJSON(), Phaser.Tilemap.TILED_JSON);
		
		// tilemap
		this.map = this.game.add.tilemap('dynamicMap', TILE_WIDTH, TILE_HEIGHT);
		
		// addTilesetImage(tileset [, key] [, tileWidth] [, tileHeight] [, tileMargin] [, tileSpacing] [, gid])
		this.map.addTilesetImage('world', 'world', TILE_WIDTH, TILE_HEIGHT);
		
		// layer 0
		this.layer = this.map.createLayer("Tile Layer 1");
		
		// resize world to match layer tilemap size
		this.layer.resizeWorld();
		
		// set collisions
		this.updateCollision();
		
		// tile drops group
		this.tile_drops = this.game.add.group();
		
		// tile breaking animations group
		this.tile_cracks = this.game.add.group();   // @TODO remove?
		
		// player
		this.player = new MinerGame.Entity.Player(this.game, this, this.desired_character);
		
		// make camera follow player
		this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);
		
		// enable gravity
		this.game.physics.arcade.gravity.y = (TILE_HEIGHT * 9.8 * 2);
		
		// mini map
		this.mini_map = new MinerGame.Component.MiniMap(this.game, this);
		
		// input callbacks
		//this.game.input.addMoveCallback(this.handleMouseMove, this);
		this.game.input.activePointer.leftButton.onDown.add(this.handleLeftClick, this);
		this.game.input.activePointer.rightButton.onDown.add(this.handleRightClick, this);
		//this.game.input.mouse.capture = true;   // prevent scrolling the window ["If true the DOM mouse events will have event.preventDefault applied to them, if false they will propagate fully."]
		
		// mouseWheelCallback doesn't keep instance context, so make self reference
		this.game.input.mouse.mouseWheelCallback = this.handleMouseWheel(this);
	};
	
	MinerGame.Component.World.prototype.update = function() {
		// update collisions
		this.game.physics.arcade.collide(this.player, this.layer);
		this.game.physics.arcade.collide(this.tile_drops, this.layer);
		
		// overlap(object1, object2 [, overlapCallback] [, processCallback] [, callbackContext])
		this.game.physics.arcade.overlap(this.player, this.tile_drops, this.player.handleItemDropPickup, null, this.player);
		
		this.mini_map.requestDraw();
	};
	
	MinerGame.Component.World.prototype.render = function() {
		
	};
	
	MinerGame.Component.World.prototype.emitItemDrop = function(tile_type, quantity, tileX, tileY) {
		quantity = quantity || 1;
		
		this.tile_drops.add(new MinerGame.Entity.TileDrop(this.game, this, tile_type, tileX, tileY, quantity));
	};
	
	MinerGame.Component.World.prototype.applyRawTiles = function(raw_tiles) {
		var x, y;
		
		for(y = 0; y < raw_tiles.length; y++) {
			this.tiles[ y ] = [];
			
			for(x = 0; x < raw_tiles[ y ].length; x++) {
				this.tiles[ y ][ x ] = new MinerGame.Component.WorldTile(this.game, this, x, y, raw_tiles[ y ][ x ]);
			}
		}
	};
	
	MinerGame.Component.World.prototype.updateCollision = function() {
		// update collision based on tiles
		// add collision to layer tiles
		this.map.setCollisionByExclusion(this.getTileSpritesNotCollideableWithPlayer(), true, this.layer);
	};
	
	MinerGame.Component.World.prototype.replaceTile = function(x, y, new_tile_type) {
		// replace tile
		var new_world_tile = new MinerGame.Component.WorldTile(this.game, this, x, y, new_tile_type);
		var newTile = new Phaser.Tile(this.layer, new_world_tile.getTileSprite(), x, y, TILE_WIDTH, TILE_HEIGHT);
		
		// get existing tile and destroy
		if(!_.isUndefined(this.tiles[ y ]) && !_.isUndefined(this.tiles[ y ][ x ])) {
			this.tiles[ y ][ x ].destroy();
		}
		
		//this.map.removeTile(x, y, this.layer);
		this.map.putTile(newTile, x, y, this.layer);
		
		this.tiles[ y ][ x ] = new_world_tile;
		
		this.requestTileUpdate();
	};
	
	MinerGame.Component.World.prototype.requestTileUpdate = function() {
		// set the map layer 'dirty' so Phaser redraws it
		// used when updating display aspects of tile(s)
		// == not done anymore because replaceTile() works:
		//this.layer.dirty = true;
		
		// set minimap to dirty
		this.mini_map.isDirty = true;
	};
	
	MinerGame.Component.World.prototype.hitTile = function(x, y, hit_strength) {
		// returns true if tile broken, false if not
		hit_strength = hit_strength || 1;
		
		var world_tile = this.getTile(x, y);
		
		if(false === world_tile) {
			return false;
		}
		
		var tile_broken = world_tile.takeHit(hit_strength);
		
		if(!tile_broken) {
			return false;
		}
		
		// broke tile, replace with air
		this.replaceTile(x, y, "air");
		
		return true;
	};
	
	MinerGame.Component.World.prototype.setSpawn = function(point) {
		this.spawn = point;
	};
	
	MinerGame.Component.World.prototype.getSpawn = function() {
		// return {x: X, y: Y} of spawn point
		return this.spawn;
	};
	
	
	MinerGame.Component.World.prototype.getTileSpritesNotCollideableWithPlayer = function() {
		// build index of tile sprites that don't collide with player
		var sprites = [];
		
		_.each(MinerGame.Data.tile_types, function(value, key) {
			if(!value.collide && value.sprites.length) {
				sprites = sprites.concat( value.sprites );
			}
		});
		
		return sprites;
	};
	
	MinerGame.Component.World.prototype.getTileSpritesCollideableWithPlayer = function() {
		// build index of tile sprites that collide with player
		var sprites = [];
		
		_.each(MinerGame.Data.tile_types, function(value, key) {
			if(value.collide && value.sprites.length) {
				sprites = sprites.concat( value.sprites );
			}
		});
		
		return sprites;
	};
	
	
	MinerGame.Component.World.prototype.getTile = function(x, y) {
		// return WorldTile at x,y
		if(!this.tiles[ y ].length || !this.tiles[ y ][ x ]) {
			return false;
		}
		
		return this.tiles[ y ][ x ];
	};
	
	MinerGame.Component.World.prototype.getMapTile = function(x, y) {
		return this.map.getTile(x, y, this.layer);
	};
	
	MinerGame.Component.World.prototype.getMapTileXY = function(worldX, worldY) {
		return new Phaser.Point(
			this.layer.getTileX(worldX),
			this.layer.getTileY(worldY)
		);
	};
	
	MinerGame.Component.World.prototype.getTiles = function(x, y, width, height) {
		// get multi-dimentional array of tiles from x,y to x+width,y+height
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
	};
	
	MinerGame.Component.World.prototype.toCSV = function() {
		// generate CSV of map
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
	
	MinerGame.Component.World.prototype.toJSON = function() {
		// generate Tiled JSON of map
		var raw_layer_tiles = [];
		var tile_properties = {};
		
		// convert tile multi array to single array
		var x, y, tmp, tile, sprite_number;
		for(y = 0; y < this.height; y++) {
			tmp = [];
			
			for(x = 0; x < this.width; x++) {
				tile = this.tiles[ y ][ x ];
				
				sprite_number = tile.getTileSprite();
				tmp.push(sprite_number +"("+ tile.properties.type +")");
				
				raw_layer_tiles.push(sprite_number);
				
				// doesn't work: (maybe tileproperties is limited to properties of tile type, not exact tile)
				//tile_properties[ ((this.width * (y - 1)) + x).toString() ] = tile.properties;
			}
		}
		
		// http://docs.mapeditor.org/fr/latest/reference/json-map-format/
		return {
			"height": 75,
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
			"tileheight": TILE_HEIGHT,
			"tilesets": [
				{
					"firstgid": 0,
					"image": "/static/images/world.png",
					"imageheight": 2400,
					"imagewidth": 1280,
					"margin": 0,
					"name": "world",
					"properties": {
						
					},
					"spacing": 0,
					"tileheight": TILE_HEIGHT,
					"tileproperties": tile_properties,
					"tilewidth": TILE_WIDTH
				}
			],
			"tilewidth": TILE_WIDTH,
			"version": 1,
			"width": 40
		};
	};
	
	
	// mouse move
	MinerGame.Component.World.prototype.handleMouseMove = function() {
		//var tile_x = this.custWorld.layer.getTileX(this.game.input.activePointer.worldX);
		//var tile_y = this.custWorld.layer.getTileY(this.game.input.activePointer.worldY);
		
		
	};
	
	// left mouse click
	MinerGame.Component.World.prototype.handleLeftClick = function() {
		if(this.game.physics.arcade.isPaused) {
			// game is paused
			return;
		}
		
		if(!this.game.input.activePointer.withinGame) {
			// mouse outside of game canvas
			return;
		}
		
		// check if click is in backpack
		if(this.player.captureClick()) {
			return;
		}
	};
	
	// right mouse click
	MinerGame.Component.World.prototype.handleRightClick = function() {
		if(this.game.physics.arcade.isPaused) {
			// game is paused
			return;
		}
		
		if(!this.game.input.activePointer.withinGame) {
			// mouse outside of game canvas
			return;
		}
		
		// @TMP debug
		console.log("num item drops: ", this.tile_drops.children.length);
		console.log("num item cracks: ", this.tile_cracks.children.length);
	};
	
	// mouse wheel
	MinerGame.Component.World.prototype.handleMouseWheel = function(context) {
		return function() {
			if(context.game.physics.arcade.isPaused) {
				// game is paused
				return;
			}
			
			// player capture scroll
			context.player.captureMouseWheel();
		};
	};
	