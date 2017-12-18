	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.State = window.MinerGame.State || (window.MinerGame.State = {});
	
	MinerGame.State.Game = function() {
		this.custWorld = null;
		
		this.fullscreenButton = null;
		
		this.background = null;
		this.player = null;
		this.backpack = null;
		
		this.marker = null;
		
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
		//this.backpack = new MinerGame.Component.Backpack(this.game, this.custWorld);
		
		// make camera follow player
		this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);
		
		// enable gravity
		this.game.physics.arcade.gravity.y = (TILE_HEIGHT * 9.8 * 2);
		
		// input callbacks
		this.game.input.addMoveCallback(this.handleMouseMove, this);
		this.game.input.onDown.add(this.handleClick, this);
		//this.game.input.mouse.capture = true;   // prevent scrolling the window ["If true the DOM mouse events will have event.preventDefault applied to them, if false they will propagate fully."]
		this.game.canvas.oncontextmenu = function(e) {
			// prevent right click contextmenu
			e.preventDefault();
		};
		
		// mouseWheelCallback doesn't keep instance context, so make self reference
		this.game.input.mouse.mouseWheelCallback = this.GameHandleMouseWheel(this);
	};
	
	MinerGame.State.Game.prototype.update = function() {
		this.game.physics.arcade.collide(this.player, this.custWorld.layer);
		
		this.marker.x = (this.custWorld.layer.getTileX(this.game.input.activePointer.worldX) * TILE_WIDTH);
		this.marker.y = (this.custWorld.layer.getTileY(this.game.input.activePointer.worldY) * TILE_HEIGHT);
	};
	
	MinerGame.State.Game.prototype.render = function() {
		
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
			marker_alpha = 0;//marker_alpha = 0.2;
		}
		
		this.marker.alpha = marker_alpha;
	};
	
	// mouse click
	MinerGame.State.Game.prototype.handleClick = function() {
		if(!this.game.input.activePointer.withinGame) {
			return;
		}
		
		var worldX = this.game.input.activePointer.worldX;
		var worldY = this.game.input.activePointer.worldY;
		
		var screenX = (worldX - this.game.camera.view.topLeft.x);
		var screenY = (worldY - this.game.camera.view.topLeft.y);
		
		// check if in backpack
		if(true === this.player.backpack.capturedClick(screenX, screenY)) {
			return;
		}
		
		var tileX = this.custWorld.layer.getTileX(worldX);
		var tileY = this.custWorld.layer.getTileY(worldY);
		
		if((tileX < 0) || (tileX > this.custWorld.width) || (tileY < 0) || (tileY > this.custWorld.height)) {
			return;
		}
		
		
		// @TODO
		// move following code into new PlayerEntity.hitTile(tileX, tileY)
		this.player.hitTile(tileX, tileY);
	};
	
	// mouse wheel
	MinerGame.State.Game.prototype.GameHandleMouseWheel = function(context) {
		return function() {
			// backpack scroll
			context.player.backpack.handleMouseWheel();
		};
	};
	