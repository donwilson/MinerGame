	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.Component = window.MinerGame.Component || (window.MinerGame.Component = {});
	
	MinerGame.Component.Tree = function(game, x, y) {
		this.game = game;
		
		// tree has an 'anchor' point called stump - this is where tree is planted in world
		this.uuid = this.game.rnd.uuid();
		this.stump = new Phaser.Point(x, y);
		
		this.topLeft = new Phaser.Point(x, y);
		this.width = 1;
		this.height = 1;
		
		this.tree_parts = [];
		
		this.create();
	};
	
	MinerGame.Component.Tree.prototype = Object.create(Phaser.Component.prototype);
	MinerGame.Component.Tree.prototype.constructor = MinerGame.Component.Tree;
	
	MinerGame.Component.Tree.prototype.create = function() {
		/*
				  L  
				 LLL 
				LLTLL
				LLTLL
				 LTL 
				  T  
				 SSS 
		*/
		
		this.tree_parts = [
			["air","air","tree_leaf","air","air"],
			["air","tree_leaf","tree_leaf","tree_leaf","air"],
			["tree_leaf","tree_leaf","tree_leaf","tree_leaf","tree_leaf"],
			["tree_leaf","tree_leaf","tree_trunk","tree_leaf","tree_leaf"],
			["air","tree_leaf","tree_trunk","tree_leaf","air"],
		];
		
		// trunk
		let trunk_height = this.game.rnd.between(1, 6);
		
		for(let i = 1; i <= trunk_height; i++) {
			this.tree_parts.push(["air","air","tree_trunk","air","air"]);
		}
		
		// stump
		this.tree_parts.push(["air","tree_stump_arm_left","tree_stump_both","tree_stump_arm_right","air"]);
		
		// update topLeft and width/height instance variables
		_.each(this.tree_parts, function(rows, offset_y) {
			_.each(rows, function(col, offset_x) {
				if(("tree_stump" === col) || ("tree_stump_both" === col) || ("tree_stump_left" === col) || ("tree_stump_right" === col)) {
					this.topLeft.x = (this.stump.x - offset_x);
					this.topLeft.y = (this.stump.y - offset_y);
				}
			}, this);
		}, this);
		
		this.width = this.tree_parts[0].length;
		this.height = this.tree_parts.length;
	};
	
	MinerGame.Component.Tree.prototype.mapExportTiles = function() {
		// generate array of {'tile_type': "...", 'point': Phaser.Point}
		if(_.isEmpty(this.tree_parts)) {
			return [];
		}
		
		let tiles = [];
		let tile_type;
		let topLeft = this.topLeft;
		
		_.each(this.tree_parts, function(cols, offset_y) {
			_.each(cols, function(tile_type, offset_x) {
				tiles.push({
					//'tile_type': this.alternate_tile_type(tile_type),
					'tile_type': tile_type,
					'point': new Phaser.Point(
						(topLeft.x + offset_x),
						(topLeft.y + offset_y)
					)
				});
			}, this);
		}, this);
		
		return tiles;
	};
	
	/*MinerGame.Component.Tree.prototype.alternate_tile_type = function(tile_type) {
		let groups = [
			["tree_trunk", "tree_trunk_alt", "tree_trunk_alt2"]
		];
		
		_.each(groups, function(group) {
			if(-1 !== _.indexOf(group, tile_type)) {
				tile_type = this.game.rnd.pick(group);
			}
		}, this);
		
		return tile_type;
	};*/
	
	
	//MinerGame.Component.Tree.prototype.update = function() {
	//	
	//};
	