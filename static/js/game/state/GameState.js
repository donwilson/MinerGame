	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.State = window.MinerGame.State || (window.MinerGame.State = {});
	
	MinerGame.State.Game = function() {
		this.custWorld = null;
		
		this.fullscreenButton = null;
		
		this.background = null;
		this.player = null;
		this.backpack = null;
		
		this.marker = null;
		this.currentDataString = "";
		
		Phaser.State.call(this);
	};
	
	MinerGame.State.Game.prototype = Object.create(Phaser.State.prototype);
	MinerGame.State.Game.prototype.constructor = MinerGame.State.Game;
	
	MinerGame.State.Game.prototype.create = function() {
		// background
		this.background = this.game.add.image(0, 0, 'background');
		this.background.fixedToCamera = true;
		
		// arcade physics
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		
		// make world
		this.custWorld = new MinerGame.Component.World(this.game, this.game.rnd.between(150, 200), this.game.rnd.between(300, 350), 5);
		
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
		this.game.input.addMoveCallback(this.handleMouseMove, this);
		this.game.input.onDown.add(this.handleClick, this);
		//this.game.input.mouse.capture = true;   // prevent scrolling the window ["If true the DOM mouse events will have event.preventDefault applied to them, if false they will propagate fully."]
		
		// mouseWheelCallback doesn't keep instance context, so make self reference
		this.game.input.mouse.mouseWheelCallback = this.GameHandleMouseWheel(this);
	};
	
	MinerGame.State.Game.prototype.update = function() {
		this.game.physics.arcade.collide(this.player, this.custWorld.layer);
		
		this.marker.x = (this.custWorld.layer.getTileX(this.game.input.activePointer.worldX) * TILE_WIDTH);
		this.marker.y = (this.custWorld.layer.getTileY(this.game.input.activePointer.worldY) * TILE_HEIGHT);
	};
	
	MinerGame.State.Game.prototype.render = function() {
		// marker info
		if(this.currentDataString) {
			this.game.debug.text(this.currentDataString, 16, 16);
		}
	};
	
	// mouse move
	MinerGame.State.Game.prototype.handleMouseMove = function() {
		var marker_tile_x = this.custWorld.layer.getTileX(this.game.input.activePointer.worldX);
		var marker_tile_y = this.custWorld.layer.getTileY(this.game.input.activePointer.worldY);
		
		this.marker.x = (marker_tile_x * TILE_WIDTH);
		this.marker.y = (marker_tile_y * TILE_HEIGHT);
		
		var distance_from_player = this.game.math.distance(this.custWorld.layer.getTileX(this.player.x), this.custWorld.layer.getTileY(this.player.y), marker_tile_x, marker_tile_y);
		var max_distance = this.player.getReach();
		var marker_alpha = 1;
		
		if(distance_from_player > max_distance) {
			marker_alpha = 0.2;
		}
		
		this.marker.alpha = marker_alpha;
	};
	
	// mouse click
	MinerGame.State.Game.prototype.handleClick = function() {
		var x = this.custWorld.layer.getTileX(this.game.input.activePointer.worldX);
		var y = this.custWorld.layer.getTileY(this.game.input.activePointer.worldY);
		
		if((x < 0) || (x > this.custWorld.width) || (y < 0) || (y > this.custWorld.height)) {
			this.currentDataString = "";
			
			return;
		}
		
		var distance_from_player = this.game.math.distance(this.custWorld.layer.getTileX(this.player.x), this.custWorld.layer.getTileY(this.player.y), x, y);
		var max_distance = this.player.getReach();
		
		var tile = this.custWorld.getTile(x, y);
		
		if((distance_from_player <= max_distance) && (distance_from_player > 0.5)) {
			var new_tile_type = "";
			
			// this is where the game can decide to pick item up or place an item
			if("air" != tile.type) {
				new_tile_type = "air";
			} else {
				//new_tile_type = "dirt";
			}
			
			if("" !== new_tile_type) {
				this.backpack.addItem(tile);
				this.custWorld.replaceTile(x, y, new_tile_type);
			}
		}
	};
	
	// mouse wheel
	MinerGame.State.Game.prototype.GameHandleMouseWheel = function(context) {
		return function() {
			// backpack scroll
			context.backpack.handleMouseWheel();
		};
	};
	