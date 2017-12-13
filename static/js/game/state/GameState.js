	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.State = window.MinerGame.State || (window.MinerGame.State = {});
	
	MinerGame.State.Game = function() {
		this.custWorld = null;
		this.map = null;
		this.layer = null;
		
		this.fullscreenButton = null;
		
		this.player = null;
		this.backpack = null;
		
		this.marker = null;
		this.currentDataString = null;
		
		Phaser.State.call(this);
	};
	
	MinerGame.State.Game.prototype = Object.create(Phaser.State.prototype);
	MinerGame.State.Game.prototype.constructor = MinerGame.State.Game;
	
	MinerGame.State.Game.prototype.create = function() {
		// arcade physics
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		
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
		this.player = new MinerGame.Entity.Player(this.game, this.custWorld);
		
		// backpack
		this.backpack = new MinerGame.Component.Backpack(this.game, this.custWorld);
		
		// make camera follow player
		this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);
		
		// enable gravity
		this.game.physics.arcade.gravity.y = (TILE_HEIGHT * 9.8);
		
		// input callbacks
		this.game.input.addMoveCallback(this.updateMarker, this);
		this.game.input.onDown.add(this.clickTile, this);
	};
	
	MinerGame.State.Game.prototype.update = function() {
		this.game.physics.arcade.collide(this.player, this.layer);
		
		this.marker.x = (this.layer.getTileX(this.game.input.activePointer.worldX) * TILE_WIDTH);
		this.marker.y = (this.layer.getTileY(this.game.input.activePointer.worldY) * TILE_HEIGHT);
	};
	
	MinerGame.State.Game.prototype.render = function() {
		// marker info
		if(this.currentDataString) {
			this.game.debug.text(this.currentDataString, 16, 16);
		}
	};
	
	MinerGame.State.Game.prototype.updateMarker = function() {
		var marker_tile_x = this.layer.getTileX(this.game.input.activePointer.worldX);
		var marker_tile_y = this.layer.getTileY(this.game.input.activePointer.worldY);
		
		this.marker.x = (marker_tile_x * TILE_WIDTH);
		this.marker.y = (marker_tile_y * TILE_HEIGHT);
		
		var distance_from_player = this.game.math.distance(this.layer.getTileX(this.player.x), this.layer.getTileY(this.player.y), marker_tile_x, marker_tile_y);
		var max_distance = this.player.getReach();
		var marker_alpha = 1;
		
		if(distance_from_player > max_distance) {
			marker_alpha = 0.2;
		}
		
		this.marker.alpha = marker_alpha;
	};
	
	// tile properties
	MinerGame.State.Game.prototype.clickTile = function() {
		var x = this.layer.getTileX(this.game.input.activePointer.worldX);
		var y = this.layer.getTileY(this.game.input.activePointer.worldY);
		
		if((x < 0) || (x > this.custWorld.width) || (y < 0) || (y > this.custWorld.height)) {
			this.currentDataString = "";
			
			return;
		}
		
		var distance_from_player = this.game.math.distance(this.layer.getTileX(this.player.x), this.layer.getTileY(this.player.y), x, y);
		var max_distance = this.player.getReach();
		
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
				this.backpack.addItem(tile.type);
				this.custWorld.replaceTile(x, y, new_tile_type);
				
				this.currentDataString = "replaced "+ tile.type +" with "+ new_tile_type +" at "+ x +","+ y;
			}
		} else {
			// just show tile info since player can't interact this far away
			this.currentDataString = x +","+ y +" ("+ tile.type +"): "+ JSON.stringify( tile.properties );
		}
	};
	