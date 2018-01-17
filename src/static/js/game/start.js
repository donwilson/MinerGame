/**
* @author       Don Wilson <donwilson@gmail.com>
* @copyright    2017 Pyxol
*/
	
	//var MinerGame = window.MinerGame || (window.MinerGame = {});
	
	MinerGame.Game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO);
	
	MinerGame.Game.state.add('Boot', MinerGame.State.Boot);
	MinerGame.Game.state.add('Preloader', MinerGame.State.Preloader);
	MinerGame.Game.state.add('MainMenu', MinerGame.State.MainMenu);
	MinerGame.Game.state.add('Game', MinerGame.State.Game);
	
	MinerGame.Game.state.start('Boot');
	