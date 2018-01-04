	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.State = window.MinerGame.State || (window.MinerGame.State = {});
	
	MinerGame.State.Game = function() {
		Phaser.State.call(this);
		
		this.custWorld = null;
		
		this.desired_character = null;
	};
	
	MinerGame.State.Game.prototype = Object.create(Phaser.State.prototype);
	MinerGame.State.Game.prototype.constructor = MinerGame.State.Game;
	
	MinerGame.State.Game.prototype.init = function(selected_character) {
		// set stage bg
		this.game.stage.backgroundColor = "#10151d";
		
		// character selected from menu?
		if(!_.isUndefined(selected_character)) {
			this.desired_character = selected_character;
		}
	};
	
	MinerGame.State.Game.prototype.create = function() {
		//this.game.plugins.add(Phaser.Plugin.AdvancedTiming, {mode: 'graph'});
		
		// make world
		//this.custWorld = new MinerGame.Component.World(this.game, this.game.rnd.between(150, 200), this.game.rnd.between(300, 350), 35);
		this.custWorld = new MinerGame.Component.World(this.game, this.desired_character, this.game.rnd.between(60, 80), this.game.rnd.between(80, 100), 35);
		//this.custWorld = new MinerGame.Component.World(this.game, 30, 30, 5);
	};
	
	MinerGame.State.Game.prototype.update = function() {
		this.custWorld.update();
	};
	
	//MinerGame.State.Game.prototype.render = function() {
	//	
	//};
	