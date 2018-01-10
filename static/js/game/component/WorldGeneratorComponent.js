	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.Component = window.MinerGame.Component || (window.MinerGame.Component = {});
	
	MinerGame.Component.WorldGenerator = function(game, width, height, max_sky) {
		this.game = game;
		
		this.debug = false;   // set to true to show log messages
		
		this.tiles = [];
		this.width = width || 100;
		this.height = height || 250;
		this.height_sky = max_sky || 30;
		
		this.spawnable_points = [];
		this.player_spawn = null;
		
		this.objects = {
			'trees': []
		};
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
		
		
		// fill entire map with dirt
		this.generate_dirt();
		
		
		// middle stuff
		// stone
		this.generate_random_stone();
		
		// ore
		//this.generate_random_ore();
		
		// caverns
		this.generate_random_caverns();
		
		// lava at bottom
		this.generate_lava();
		
		
		// these blatantly overwrite existing tiles
		// sky
		this.generate_sky();
		
		// bedrock
		this.generate_bedrock();
		
		
		// objects
		// trees
		this.generate_trees();
	};
	
	MinerGame.Component.WorldGenerator.prototype.renderStatusText = function(txt) {
		if(!!this.debug) {
			return;
		}
		
		console.log("renderStatusText:", txt);
	}
	
	MinerGame.Component.WorldGenerator.prototype.getTiles = function() {
		return this.tiles;
	};
	
	MinerGame.Component.WorldGenerator.prototype.getTopSpawnablePoints = function() {
		this.renderStatusText("Calculating spawnable points");
		
		// skim map for sun-exposed spots and return array of Phaser.Point objects
		var points = [];
		var x, y;
		var tile_name, tile, tile_below_name, tile_below;
		
		// scan left to right, top to bottom, find bottom most air from top
		for(x = 0; x < this.width; x++) {
			for(y = 0; y < this.height; y++) {
				tile_name = this.get_tile(x, y);
				tile = MinerGame.Data.tile_types[ tile_name ];
				
				if(tile.collide) {
					continue;
				}
				
				tile_below_name = this.get_tile(x, (y + 1));
				
				if(false === tile_below_name) {
					continue;
				}
				
				tile_below = MinerGame.Data.tile_types[ tile_below_name ];
				
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
	
	MinerGame.Component.WorldGenerator.prototype.getPlayerSpawn = function() {
		if(null === this.player_spawn) {
			this.renderStatusText("Calculating Player spawn point");
			
			if(_.isEmpty(this.spawnable_points)) {
				this.spawnable_points = this.getTopSpawnablePoints();
			}
			
			this.player_spawn = this.game.rnd.pick(this.spawnable_points);
		}
		
		return this.player_spawn;
	};
	
	MinerGame.Component.WorldGenerator.prototype.place_tile = function(x, y, tile_type) {
		// place tile
		this.tiles[ y ][ x ] = tile_type;
	};
	
	MinerGame.Component.WorldGenerator.prototype.get_tile = function(x, y) {
		// get tile at x,y or false if not exist
		if(_.isUndefined(this.tiles[ y ]) || !this.tiles[ y ].length || _.isUndefined(this.tiles[ y ][ x ])) {
			return false;
		}
		
		return this.tiles[ y ][ x ];
	};
	
	MinerGame.Component.WorldGenerator.prototype.generate_dirt = function() {
		this.renderStatusText("Generating dirt...");
		
		// generate full map of dirt
		for(y = 0; y < this.height; y++) {
			for(x = 0; x < this.width; x++) {
				this.place_tile(x, y, 'dirt');
			}
		}
	};
	
	MinerGame.Component.WorldGenerator.prototype.generate_random_stone = function() {
		this.renderStatusText("Generating stone...");
		
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
		this.renderStatusText("Generating ore...");
		
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
		this.renderStatusText("Generating caverns...");
		
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
		this.renderStatusText("Generating lava...");
		
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
	
	MinerGame.Component.WorldGenerator.prototype.generate_trees = function() {
		this.renderStatusText("Generating trees...");
		
		// add trees to world
		var num_trees_raw = Math.round( (this.width / this.game.rnd.between(5, 9)) );
		
		var spawnable_points = this.getTopSpawnablePoints();
		
		var num_trees = Math.min(spawnable_points.length, num_trees_raw);
		
		if(!num_trees) {
			return;
		}
		
		// shuffle spawnable points
		var tree_points = _.shuffle(spawnable_points);
		var tree_point;
		var tree;
		var tree_tiles;
		
		for(i = 0; i < num_trees; i++) {
			// spawnable points are randomized, so iterating up is same as grabbing randomly
			tree_point = tree_points[ i ];
			
			// check if tile below tree stump is plantable
			if(_.isUndefined(this.tiles[ (tree_point.y + 1) ]) || _.isUndefined(this.tiles[ (tree_point.y + 1) ][ tree_point.x ]) || (-1 === _.indexOf(["dirt"], this.tiles[ (tree_point.y + 1) ][ tree_point.x ]))) {
				continue;
			}
			
			tree = new MinerGame.Component.Tree(this.game, tree_point.x, tree_point.y);
			tree_tiles = tree.mapExportTiles();
			
			if(_.isEmpty(tree_tiles)) {
				continue;
			}
			
			_.each(tree_tiles, function(tree_part) {
				if((tree_part.point.x < 0) || (tree_part.point.x >= this.width) || (tree_part.point.y < 0) || (tree_part.point.y >= this.height)) {
					// out of map
					return;
				}
				
				if("air" === tree_part.tile_type) {
					// "air" is used by Tree to suggest nothing is placed at this tile
					return;
				}
				
				if("tree_trunk" === tree_part.tile_type) {
					// only place trunk if current tile is not leaf
					if("left" === this.tiles[ tree_part.point.y ][ tree_part.point.x ]) {
						return;
					}
				}
				
				if(("tree_stump_arm_left" === tree_part.tile_type) || ("tree_stump_arm_right" === tree_part.tile_type)) {
					// only place stump arm on air tiles
					if("air" !== this.tiles[ tree_part.point.y ][ tree_part.point.x ]) {
						return;
					}
					
					// don't place stump arm on top of air tiles
					if(_.isUndefined(this.tiles[ (tree_part.point.y + 1) ]) || _.isUndefined(this.tiles[ (tree_part.point.y + 1) ][ tree_part.point.x ]) || (-1 !== _.indexOf(["air"], this.tiles[ (tree_part.point.y + 1) ][ tree_part.point.x ]))) {
						return;
					}
				}
				
				// place tree part
				this.place_tile(tree_part.point.x, tree_part.point.y, tree_part.tile_type);
			}, this);
			
			this.objects.trees.push(tree);
		}
		
		// @TODO: iterate over tree stumps, check left/right sides and replace with appropriate stump if different than what looks best
		_.each(this.objects.trees, function(tree) {
			var stump_tile_type = this.get_tile(tree.stump.x, tree.stump.y);
			var tile_left_of_stump = this.get_tile((tree.stump.x - 1), tree.stump.y);
			var tile_right_of_stump = this.get_tile((tree.stump.x + 1), tree.stump.y);
			var new_stump_tile_type = stump_tile_type;
			
			if(("tree_stump_arm_left" === tile_left_of_stump) && ("tree_stump_arm_right" === tile_right_of_stump)) {
				new_stump_tile_type = "tree_stump_both";
			} else if(("tree_stump_arm_left" === tile_left_of_stump) && ("tree_stump_arm_right" !== tile_right_of_stump)) {
				new_stump_tile_type = "tree_stump_left";
			} else if(("tree_stump_arm_left" !== tile_left_of_stump) && ("tree_stump_arm_right" === tile_right_of_stump)) {
				new_stump_tile_type = "tree_stump_right";
			} else {
				new_stump_tile_type = "tree_stump";
			}
			
			
			if(new_stump_tile_type !== stump_tile_type) {
				// stump tile changed, update tile
				this.place_tile(tree.stump.x, tree.stump.y, new_stump_tile_type);
				
				this.renderStatusText("adjusted stump #"+ tree.uuid);
			}
		}, this);
		
		this.renderStatusText(":: generated "+ this.objects.trees.length +" trees");
	};
	
	MinerGame.Component.WorldGenerator.prototype.generate_sky = function() {
		this.renderStatusText("Generating sky...");
		
		// fill sky with air
		var y, x;
		
		for(x = 0; x < this.width; x++) {
			for(y = 0; y < this.height_sky; y++) {
				this.place_tile(x, y, 'air');
			}
		}
	};
	
	MinerGame.Component.WorldGenerator.prototype.generate_bedrock = function() {
		this.renderStatusText("Generating bedrock...");
		
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
	
	