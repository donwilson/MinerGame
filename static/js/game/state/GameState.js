	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.State = window.MinerGame.State || (window.MinerGame.State = {});
	
	MinerGame.State.Game = function() {
		this.custWorld = null;
		
		this.fullscreenButton = null;
		
		this.background = null;
		this.player = null;
		this.backpack = null;
		
		Phaser.State.call(this);
	};
	
	MinerGame.State.Game.prototype = Object.create(Phaser.State.prototype);
	MinerGame.State.Game.prototype.constructor = MinerGame.State.Game;
	
	MinerGame.State.Game.prototype.create = function() {
		this.game.plugins.add(Phaser.Plugin.AdvancedTiming, {mode: 'graph'});
		
		// background
		this.background = this.game.add.image(0, 0, 'background');
		this.background.fixedToCamera = true;
		
		// arcade physics
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		
		// make world
		this.custWorld = new MinerGame.Component.World(this.game, this.game.rnd.between(150, 200), this.game.rnd.between(300, 350), 5);
		
		// player
		this.player = new MinerGame.Entity.Player(this.game, this.custWorld);
		
		// backpack
		//this.backpack = new MinerGame.Component.Backpack(this.game, this.custWorld);
		
		// make camera follow player
		this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);
		
		// enable gravity
		this.game.physics.arcade.gravity.y = (TILE_HEIGHT * 9.8 * 2);
		
		// input callbacks
		//this.game.input.addMoveCallback(this.handleMouseMove, this);
		this.game.input.activePointer.leftButton.onDown.add(this.handleLeftClick, this);
		//this.game.input.mouse.capture = true;   // prevent scrolling the window ["If true the DOM mouse events will have event.preventDefault applied to them, if false they will propagate fully."]
		
		// mouseWheelCallback doesn't keep instance context, so make self reference
		this.game.input.mouse.mouseWheelCallback = this.GameHandleMouseWheel(this);
	};
	
	MinerGame.State.Game.prototype.update = function() {
		this.game.physics.arcade.collide(this.player, this.custWorld.layer);
		
		//this.player.tool.angle += 1;
	};
	
	MinerGame.State.Game.prototype.render = function() {
		//this.game.debug.text("tool: "+ this.player.tool.x +","+ this.player.tool.y, 16, 16);
		//this.game.debug.text("tool angle: "+ this.player.tool.angle, 16, 32);
		//this.game.debug.text("tool scale.x: "+ this.player.tool.scale.x, 16, 48);
		//this.game.debug.spriteBounds(this.player);
		//this.game.debug.spriteBounds(this.player.tool);
	};
	
	
	
	/*// mouse move
	MinerGame.State.Game.prototype.handleMouseMove = function() {
		var tile_x = this.custWorld.layer.getTileX(this.game.input.activePointer.worldX);
		var tile_y = this.custWorld.layer.getTileY(this.game.input.activePointer.worldY);
		
		
	};*/
	
	// mouse click
	MinerGame.State.Game.prototype.handleLeftClick = function() {
		if(!this.game.input.activePointer.withinGame) {
			return;
		}
		
		// check if click is in backpack
		if(this.player.captureClick()) {
			return;
		}
	};
	
	// mouse wheel
	MinerGame.State.Game.prototype.GameHandleMouseWheel = function(context) {
		return function() {
			// player capture scroll
			context.player.captureMouseWheel();
		};
	};
	