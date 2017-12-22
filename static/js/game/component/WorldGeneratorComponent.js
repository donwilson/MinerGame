	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.Component = window.MinerGame.Component || (window.MinerGame.Component = {});
	
	MinerGame.Component.WorldGenerator = function(game, width, height, max_sky) {
		this.game = game;
		
		this.tiles = [];
		this.width = width || 100;
		this.height = height || 250;
		this.height_sky = max_sky || 30;
	};
	
	MinerGame.Component.WorldGenerator.prototype = Object.create(Phaser.Component.prototype);
	MinerGame.Component.WorldGenerator.prototype.constructor = MinerGame.Component.WorldGenerator;
	
	MinerGame.Component.WorldGenerator.prototype.create = function() {
		// create world
		var x, y;
		
		// start instance tile array
		for(y = 0; y < this.height; y++) {
			this.tiles[ y ] = [];
		}
		
		
		// start:
		// fill map with dirt
		this.generate_dirt();
		
		
		
		// middle:
		
		// stone
		this.generate_random_stone();
		
		// ore
		//this.generate_random_ore();
		
		// caverns
		this.generate_random_caverns();
		
		// lava at bottom
		this.generate_lava();
		
		
		
		// last:
		
		// sky
		this.generate_sky();
		
		// bedrock
		this.generate_bedrock();
	};
	
	MinerGame.Component.WorldGenerator.prototype.getTiles = function() {
		return this.tiles;
	};
	
	MinerGame.Component.WorldGenerator.prototype.getTopSpawnablePoints = function() {
		// skim map for sun-exposed spots and return array of Phaser.Point objects
		var points = [];
		var x, y;
		var tile_name, tile, tile_below_name, tile_below;
		
		// scan left to right, top to bottom, find bottom most air from top
		for(x = 0; x < this.width; x++) {
			for(y = 0; y < this.height; y++) {
				tile_name = this.get_tile(x, y);
				tile = tile_types[ tile_name ];
				
				if(tile.collide) {
					continue;
				}
				
				tile_below_name = this.get_tile(x, (y + 1));
				
				if(false === tile_below_name) {
					continue;
				}
				
				tile_below = tile_types[ tile_below_name ];
				
				if(tile_below.collide) {
					points.push(new Phaser.Point(x, y));
					
					break;
				}
			}
		}
		
		if(!points.length) {
			// unable to organically find a spawn, choose one at random that "should" have something open
			points.push(new Phaser.Point(
				this.game.rnd.between(0, (this.width - 1)),
				(this.height_sky - 1)
			));
		}
		
		return points;
	};
	
	MinerGame.Component.WorldGenerator.prototype.place_tile = function(x, y, tile_type) {
		// place tile
		this.tiles[ y ][ x ] = tile_type;
	};
	
	MinerGame.Component.WorldGenerator.prototype.get_tile = function(x, y) {
		// get tile at x,y or false if not exist
		if(!this.tiles[ y ] || !this.tiles[ y ].length || !this.tiles[ y ][ x ]) {
			return false;
		}
		
		return this.tiles[ y ][ x ];
	};
	
	MinerGame.Component.WorldGenerator.prototype.generate_dirt = function() {
		// generate full map of dirt
		for(y = 0; y < this.height; y++) {
			for(x = 0; x < this.width; x++) {
				this.place_tile(x, y, 'dirt');
			}
		}
	};
	
	MinerGame.Component.WorldGenerator.prototype.generate_random_stone = function() {
		var perlin = new PerlinNoise(),
			px, px, pnoise,
			pz,
			pscale,
			pnoise_round;
		
		// SETTINGS
		//pz = this.game.rnd.between(0.4, 0.6);
		pz = (Math.random() * 10);//pz = 0;
		pscale = (this.width / TILE_WIDTH);
		
		// perlin map generator
		var perlin_tile_type;
		var cutoff = this.game.rnd.between(42, 46);
		
		// stone and ore
		for(y = 0; y < this.height; y++) {
			for(x = 0; x < this.width; x++) {
				//px = (x / this.width);
				//py = (y / this.height);
				px = (x / TILE_WIDTH);
				py = (y / TILE_HEIGHT);
				
				pnoise = perlin.noise((px * pscale), (py * pscale), pz);
				
				pnoise_round = Math.round( (pnoise * 100) );
				
				perlin_tile_type = "";
				
				if(pnoise_round < cutoff) {
					perlin_tile_type = "stone";
				}
				
				if("" !== perlin_tile_type) {
					this.place_tile(x, y, perlin_tile_type);
				}
			}
		}
	};
	
	MinerGame.Component.WorldGenerator.prototype.generate_random_ore = function() {
		var perlin = new PerlinNoise(),
			num_x = this.width,
			num_y = this.height,
			x, y,
			px, px, pnoise,
			pz,
			pscale,
			pnoise_round;
		
		// SETTINGS
		pz = this.game.rnd.between(0.3, 0.5);
		pscale = 1;//pscale = this.game.rnd.between(3, 10);
		
		// perlin map generator
		var perlin_tile_type;
		
		// stone and ore
		for(y = 0; y < this.height; y++) {
			for(x = 0; x < this.width; x++) {
				px = (x / this.width);
				py = (y / this.height);
				
				pnoise = perlin.noise((px * pscale), (py * pscale), pz);
				
				pnoise_round = Math.round( (pnoise * 100) );
				
				perlin_tile_type = "";
				
				if(pnoise_round >= 80) {
					perlin_tile_type = "ore";
				}
				
				if("" !== perlin_tile_type) {
					this.place_tile(x, y, perlin_tile_type);
				}
			}
		}
	};
	
	MinerGame.Component.WorldGenerator.prototype.generate_random_caverns = function() {
		var perlin = new PerlinNoise(),
			px, px, pnoise,
			pz,
			pscale,
			pnoise_round;
		
		// SETTINGS
		pz = (Math.random() * 10);//pz = 0;
		pscale = (this.width / TILE_WIDTH);
		
		// perlin map generator
		var perlin_tile_type;
		var cutoff = this.game.rnd.between(28, 33);
		
		// stone and ore
		for(y = 0; y < this.height; y++) {
			for(x = 0; x < this.width; x++) {
				px = (x / TILE_WIDTH);
				py = (y / TILE_HEIGHT);
				
				pnoise = perlin.noise((px * pscale), (py * pscale), pz);
				
				pnoise_round = Math.round( (pnoise * 100) );
				
				perlin_tile_type = "";
				
				if(pnoise_round < cutoff) {
					perlin_tile_type = "air";
				}
				
				if("" !== perlin_tile_type) {
					this.place_tile(x, y, perlin_tile_type);
				}
			}
		}
	};
	
	MinerGame.Component.WorldGenerator.prototype.generate_lava = function() {
		// add lava to world
		// fill bottom to (bottom-lava_height) with lava
		var lava_height = 5;
		
		var x, y;
		
		for(x = 0; x < this.width; x++) {
			for(y = (this.height - lava_height); y < this.height; y++) {
				this.place_tile(x, y, 'lava');
			}
		}
	};
	
	MinerGame.Component.WorldGenerator.prototype.generate_sky = function() {
		// fill sky with air
		var y, x;
		
		for(x = 0; x < this.width; x++) {
			for(y = 0; y < this.height_sky; y++) {
				this.place_tile(x, y, 'air');
			}
		}
	};
	
	MinerGame.Component.WorldGenerator.prototype.generate_bedrock = function() {
		// add lava to world
		// fill bottom with bedrock
		var bedrock_min_height = 1;
		var bedrock_max_height = 3;
		
		var x, y;
		
		for(x = 0; x < this.width; x++) {
			// randomize height of bedrock a little by picking between max and min bedrock height
			var column_height = this.game.rnd.between(bedrock_min_height, bedrock_max_height);
			
			for(y = (this.height - column_height); y < this.height; y++) {
				this.place_tile(x, y, 'bedrock');
			}
		}
	};
	
	