	
	// game world object
	function customGameWorld(game, num_tiles_x, num_tiles_y, max_sky) {
		this.game = game;
		this.map = null;
		this.layer = null;
		
		this.tiles = [];
		this.width = num_tiles_x || 100;
		this.height = num_tiles_y || 250;
		this.height_sky = max_sky || 30;
		this.spawn = null;
		
		// assign map+layer
		this.setMapLayer = function(map, layer) {
			this.map = map;
			this.layer = layer;
			
			this.updateCollision();
		};
		
		// update collision based on tiles
		this.updateCollision = function() {
			// add collision to layer tiles
			this.map.setCollisionByExclusion(this.getTileSpritesNotCollideableWithPlayer(), true, this.layer);
			//this.game.physics.p2.convertTilemap(this.map, this.layer);
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
			
			var newTile = new Phaser.Tile(this.layer, this.getTile(x, y).getTileSprite(), x, y, TILE_WIDTH, TILE_HEIGHT);
			
			this.map.removeTile(x, y, this.layer);
			this.map.putTile(newTile, x, y, this.layer);
			
			//this.updateCollision();
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
				center_x = this.game.rnd.between(0, this.width);
				center_y = this.game.rnd.between(y_min, this.height);
				
				
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
					this.spawn = this.game.rnd.pick(points);
				} else {
					// unable to organically find a spawn, choose one at random that "should" have something open
					this.spawn = {
						'x': this.game.rnd.between(0, (this.width - 1)),
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
						"image": "/static/images/world-tiles.png",
						"imageheight": 2400,
						"imagewidth": 512,
						"margin": 0,
						"name": "tiles",
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
				"width": 16
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
	