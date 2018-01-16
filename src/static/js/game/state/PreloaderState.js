	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.State = window.MinerGame.State || (window.MinerGame.State = {});
	
	MinerGame.State.Preloader = function() {
		Phaser.State.call(this);
		
		this.container_padding = 6;   // padding from container to bar
		
		this.container_background_color = 0x111111;
		this.container_background_alpha = 1;
		this.progress_background_color = 0xFFFFFF;
		this.progress_background_alpha = 1;
		
		this.graphic_container = null;
		this.graphic_progress = null;
		this.loading_text = null;
	};
	
	MinerGame.State.Preloader.prototype = Object.create(Phaser.State.prototype);
	MinerGame.State.Preloader.prototype.constructor = MinerGame.State.Preloader;
	
	MinerGame.State.Preloader.prototype.init = function() {
		//console.log("State: Preloader");
		
		// set stage bg
		this.game.stage.backgroundColor = "#10151d";
		
		// bar rectangle
		let bar_width = (this.game.camera.view.width * 0.7);
		let bar_height = 10;
		
		this.rect_progress = new Phaser.Rectangle(
			(this.game.camera.view.centerX - (bar_width / 2)),
			(this.game.camera.view.centerY - (bar_height / 2)),
			bar_width,
			bar_height
		);
		
		this.loading_text = this.game.add.text(0, 0, "Loading...", {
			'font': "normal 12px Verdana",
			'fill': "#ffffff",
			'boundsAlignH': "center",
			'boundsAlignV': "bottom"
		});
		this.loading_text.setTextBounds(0, 0, this.game.width, (this.rect_progress.y - 10));
	};
	
	MinerGame.State.Preloader.prototype.preload = function() {
		this.game.load.onLoadStart.add(this.onLoadStart, this);
		this.game.load.onFileError.add(this.onFileError, this);
		this.game.load.onFileComplete.add(this.onFileComplete, this);
		this.game.load.onLoadComplete.add(this.onLoadComplete, this);
		
		// load assets
		this.game.load.image('background', "static/images/background.jpg");
		this.game.load.image('logo', "static/images/logo.png");
		this.game.load.spritesheet('world', "static/images/world.png", TILE_WIDTH, TILE_HEIGHT);
		this.game.load.spritesheet('buttons', "static/images/buttons.png", 32, 32);
	};
	
	MinerGame.State.Preloader.prototype.create = function() {
		
	};
	
	MinerGame.State.Preloader.prototype.setProgressBar = function(progress) {
		progress = this.game.math.clamp(progress, 0, 100);
		let progress_percent = (progress / 100);
		
		this.graphic_progress.clear();
		
		// set width
		this.graphic_progress.beginFill(this.progress_background_color);
		this.graphic_progress.fillAlpha = this.progress_background_alpha;
		this.graphic_progress.moveTo(0, 0);
		this.graphic_progress.lineTo((this.rect_progress.width * progress_percent), 0);
		this.graphic_progress.lineTo((this.rect_progress.width * progress_percent), this.rect_progress.height);
		this.graphic_progress.lineTo(0, this.rect_progress.height);
		this.graphic_progress.endFill();
	};
	
	MinerGame.State.Preloader.prototype.onLoadStart = function() {
		this.graphic_container = this.game.add.graphics(
			(this.rect_progress.x - this.container_padding),
			(this.rect_progress.y - this.container_padding)
		);
		
		let container_width = (this.container_padding + this.rect_progress.width + this.container_padding);
		let container_height = (this.container_padding + this.rect_progress.height + this.container_padding);
		
		this.graphic_container.beginFill(this.container_background_color);
		this.graphic_container.fillAlpha = this.container_background_alpha;
		this.graphic_container.moveTo(0, 0);
		this.graphic_container.lineTo(container_width, 0);
		this.graphic_container.lineTo(container_width, container_height);
		this.graphic_container.lineTo(0, container_height);
		this.graphic_container.endFill();
		
		this.graphic_progress = this.game.add.graphics(0, 0);
		this.graphic_progress.alignIn(this.graphic_container, Phaser.TOP_LEFT, -this.container_padding, -this.container_padding);
		
		this.setProgressBar(0);
	};
	
	MinerGame.State.Preloader.prototype.onFileError = function(file_key, file) {
		//alert("Failed to load '"+ file_key +"' from '"+ file +"'");
	};
	
	MinerGame.State.Preloader.prototype.onFileComplete = function(progress, file_key, success, total_loaded_files, total_files) {
		this.setProgressBar(progress);
	};
	
	MinerGame.State.Preloader.prototype.onLoadComplete = function() {
		this.setProgressBar(100);
		
		this.game.time.events.add((Phaser.Timer.SECOND * 1), function() {
			this.state.start('MainMenu');
		}, this);
	};
	