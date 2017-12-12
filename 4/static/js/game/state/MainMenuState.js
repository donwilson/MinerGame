	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.State = window.MinerGame.State || (window.MinerGame.State = {});
	
	MinerGame.State.MainMenu = function() {
		this.startButton = null;
	};
	
	MinerGame.State.MainMenu.prototype = {
		'init': function() {
			console.log("State: MainMenu");
		},
		'preload': function() {
			//game.load.image('button_start', "/static/images/button_start.png");
		},
		'create': function() {
			//this.startButton = this.game.add.button((this.game.width / 2), (this.game.height / 2), 'button_start', this.startGame, this);
			//this.startButton.setScaleMinMax(0.2, 0.2, 0.5, 0.5);
			//this.startButton.anchor.setTo(0.5, 0.5);
			
			this.startGame();
		},
		'update': function() {
			
		},
		'render': function() {
			
		},
		
		'startGame': function() {
			this.state.start('Game');
		}
	};
		
	
	
	
	