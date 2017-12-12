	
	var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO);
	
	game.state.add('Boot', MinerGame.State.Boot);
	game.state.add('Preloader', MinerGame.State.Preloader);
	game.state.add('MainMenu', MinerGame.State.MainMenu);
	game.state.add('Game', MinerGame.State.Game);
	
	game.state.start('Boot');
	