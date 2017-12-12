	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.State = window.MinerGame.State || (window.MinerGame.State = {});
	
	MinerGame.State.Preloader = function() {};
	
	MinerGame.State.Preloader.prototype = {
		'init': function() {
			console.log("State: Preloader");
			
			
		},
		'preload': function() {
			this.game.load.image('tiles', "/static/images/world.png");
			this.game.load.spritesheet('players', "/static/images/players.png", TILE_WIDTH, TILE_HEIGHT);
			this.game.load.spritesheet('button_sprite', "/static/images/button-sprite.png", 32, 32);
		},
		'create': function() {
			this.state.start('MainMenu');
		}
	};
	