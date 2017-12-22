	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.Component = window.MinerGame.Component || (window.MinerGame.Component = {});
	
	MinerGame.Component.World = function(game, num_tiles_x, num_tiles_y, max_sky) {
		this.game = game;
		this.map = null;
		this.layer = null;
		
		this.tiles = [];
		this.width = num_tiles_x || 100;
		this.height = num_tiles_y || 250;
		this.height_sky = max_sky || 30;
		this.spawn = null;
		
		this.create();
	};
	
	MinerGame.Component.World.prototype = Object.create(Phaser.Component.prototype);
	MinerGame.Component.World.prototype.constructor = MinerGame.Component.World;
	
	MinerGame.Component.World.prototype.create = function() {
		// create world
		var world_generator = new MinerGame.Component.WorldGenerator(this.game, this.width, this.height, this.height_sky);
		world_generator.create();
		
		// apply generated world
		this.applyRawTiles(world_generator.getTiles());
		
		// set spawn
		this.setSpawn(world_generator.getTopSpawnablePoints());
		
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
		
		this.map.removeTile(x, y, this.layer);
		this.map.putTile(newTile, x, y, this.layer);
		
		this.tiles[ y ][ x ] = new_world_tile;
	};
	
	MinerGame.Component.World.prototype.requestTileUpdate = function() {
		// set the map layer 'dirty' so Phaser redraws it
		// used when updating display aspects of tile(s)
		this.layer.dirty = true;
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
	
	MinerGame.Component.World.prototype.setSpawn = function(points) {
		this.spawn = this.game.rnd.pick(points);
	};
	
	MinerGame.Component.World.prototype.getSpawn = function() {
		// return {x: X, y: Y} of spawn point
		return this.spawn;
	};
	
	
	MinerGame.Component.World.prototype.getTileSpritesNotCollideableWithPlayer = function() {
		// build index of tile sprites that don't collide with player
		var sprites = [];
		var key;
		
		for(key in tile_types) {
			if(tile_types.hasOwnProperty(key)) {
				if(!tile_types[ key ].collide && tile_types[ key ].sprites.length) {
					sprites = sprites.concat( tile_types[ key ].sprites );
				}
			}
		}
		
		return sprites;
	};
	
	MinerGame.Component.World.prototype.getTileSpritesCollideableWithPlayer = function() {
		// build index of tile sprites that collide with player
		var sprites = [];
		var key;
		
		for(key in tile_types) {
			if(tile_types.hasOwnProperty(key)) {
				if(tile_types[ key ].collide && tile_types[ key ].sprites.length) {
					sprites = sprites.concat( tile_types[ key ].sprites );
				}
			}
		}
		
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
	