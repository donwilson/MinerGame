/**
* @author       Don Wilson <donwilson@gmail.com>
* @copyright    2017 Pyxol
*/
	
	//var MinerGame = window.MinerGame || (window.MinerGame = {});
	//MinerGame.State = window.MinerGame.State || (window.MinerGame.State = {});
	
	MinerGame.State.Boot = function() {
		Phaser.State.call(this);
	};
	
	MinerGame.State.Boot.prototype = Object.create(Phaser.State.prototype);
	MinerGame.State.Boot.prototype.constructor = MinerGame.State.Boot;
	
	MinerGame.State.Boot.prototype.init = function() {
		//console.log("State: Boot");
		
		// set stage bg
		this.game.stage.backgroundColor = "#10151d";
		
		// comment this out to enable multi-touch
		this.input.maxPointers = 1;
		
		// prevent disabling game on browser blur
		this.stage.disableVisibilityChange = true;
		
		if(this.game.device.desktop) {
			// desktop-specific settings
			this.scale.pageAlignHorizontally = true;
			this.game.scale.pageAlignVertically = true;
		} else {
			// mobile-specific settings
			this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
			this.scale.setMinMax(480, 260, 1024, 768);
			this.scale.forceLandscape = true;
			this.scale.pageAlignHorizontally = true;
			this.game.scale.pageAlignVertically = true;
		}
		
		this.game.canvas.oncontextmenu = function(e) {
			// prevent right click contextmenu
			e.preventDefault();
		};
		
		//this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		//this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.scale.refresh();
	};
	
	MinerGame.State.Boot.prototype.create = function() {
		this.state.start('Preloader');
	};
	