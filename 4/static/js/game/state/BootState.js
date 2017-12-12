	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.State = window.MinerGame.State || (window.MinerGame.State = {});
	
	MinerGame.State.Boot = function() {};
	
	MinerGame.State.Boot.prototype = {
		'init': function() {
			console.log("State: Boot");
			
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
			
			//this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
			//this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
			this.game.scale.refresh();
		},
		'preload': function() {
			
		},
		'create': function() {
			this.state.start('Preloader');
		}
	};
	