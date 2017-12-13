	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.State = window.MinerGame.State || (window.MinerGame.State = {});
	
	MinerGame.State.MainMenu = function() {
		this.startButton = null;
		
		Phaser.State.call(this);
	};
	
	MinerGame.State.MainMenu.prototype = Object.create(Phaser.State.prototype);
	MinerGame.State.MainMenu.prototype.constructor = MinerGame.State.MainMenu;
	
	MinerGame.State.MainMenu.prototype.init = function() {
		console.log("State: MainMenu");
	};
	
	MinerGame.State.MainMenu.prototype.preload = function() {
		//game.load.image('button_start', "/static/images/button_start.png");
	};
	
	MinerGame.State.MainMenu.prototype.create = function() {
		//this.startButton = this.game.add.button((this.game.width / 2), (this.game.height / 2), 'button_start', this.startGame, this);
		//this.startButton.setScaleMinMax(0.2, 0.2, 0.5, 0.5);
		//this.startButton.anchor.setTo(0.5, 0.5);
		
		this.startGame();
	};
	
	MinerGame.State.MainMenu.prototype.startGame = function() {
		this.state.start('Game');
	};
	