	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.State = window.MinerGame.State || (window.MinerGame.State = {});
	
	MinerGame.State.Preloader = function() {
		this.startButton = null;
		
		Phaser.State.call(this);
	};
	
	MinerGame.State.Preloader.prototype = Object.create(Phaser.State.prototype);
	MinerGame.State.Preloader.prototype.constructor = MinerGame.State.Preloader;
	
	MinerGame.State.Preloader.prototype.init = function() {
		console.log("State: Preloader");
	};
	
	MinerGame.State.Preloader.prototype.preload = function() {
		this.game.load.image('background', "static/images/background.jpg");
		//this.game.load.image('tiles', "static/images/world-tiles.png");
		this.game.load.spritesheet('tiles', "static/images/world-tiles.png", TILE_WIDTH, TILE_HEIGHT);
		this.game.load.spritesheet('players', "static/images/players.png", TILE_WIDTH, TILE_HEIGHT);
		this.game.load.spritesheet('button_sprite', "static/images/button-sprite.png", 32, 32);
	};
	
	MinerGame.State.Preloader.prototype.create = function() {
		this.state.start('MainMenu');
	};
	