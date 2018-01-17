/**
* @author       Don Wilson <donwilson@gmail.com>
* @copyright    2017 Pyxol
*/
	
	//var MinerGame = window.MinerGame || (window.MinerGame = {});
	//MinerGame.Component = window.MinerGame.Component || (window.MinerGame.Component = {});
	
	MinerGame.Component.PauseMenu = function(game, custWorld) {
		this.game = game;
		this.custWorld = custWorld;
		
		this.elements = this.game.add.group();
		
		this.graphics = this.game.make.graphics(0, 0);
		this.graphics.fixedToCamera = true;
		
		this.elements.add(this.graphics);
		
		this.button_texts = this.game.add.group(this.elements);
		
		this.active = false;
		
		// keypress callbacks
		this.escape_key = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
		this.escape_key.onDown.add(this.toggleMenu, this);
	};
	
	MinerGame.Component.PauseMenu.prototype = Object.create(Phaser.Component.prototype);
	MinerGame.Component.PauseMenu.prototype.constructor = MinerGame.Component.PauseMenu;
	
	MinerGame.Component.PauseMenu.prototype.toggleMenu = function() {
		console.log("toggle pause menu");
		
		this.active = !this.active;
		
		// toggle physics
		this.game.physics.arcade.isPaused = this.isPaused();
		
		// draw or clear out menu
		this.draw_menu();
	};
	
	MinerGame.Component.PauseMenu.prototype.update = function() {
		
	};
	
	MinerGame.Component.PauseMenu.prototype.draw_menu = function() {
		// clear any graphics
		this.elements.removeAll(true, true);
		
		if(!this.isPaused()) {
			return;
		}
		
		// background
		let graphics = this.game.make.graphics(0, 0);
		this.elements.add(graphics);
		
		graphics.fixedToCamera = true;
		
		graphics.moveTo(0, 0);
		graphics.beginFill(0x000000, 0.4);
		graphics.drawRect(0, 0, this.game.camera.width, this.game.camera.height);
		graphics.endFill();
		
		// menu
		/*let menu_width = 250;
		let menu_padding = 10;
		
		graphics.moveTo(
			((this.game.camera.width / 2) - ((menu_padding + menu_width + menu_padding) / 2)),
			((this.game.camera.width / 2) - ((menu_padding + menu_width + menu_padding) / 2))
		);*/
		
		// button
		let button_text_size = 20;
		let button_padding_x = 12;
		let button_padding_y = 8;
		
		let button_resume_text = this.game.make.text(0, 0, "Resume Game", {
			'font': "bold "+ button_text_size +"px Arial",
			'fill': "#ffffff"
		});
		
		this.elements.add(button_resume_text);
		
		button_resume_text.fixedToCamera = true;
		
		let button_resume_bg = this.game.make.graphics(
			((this.game.camera.width / 2) - ((button_padding_x + button_resume_text.width + button_padding_x) / 2)),
			((this.game.camera.height / 2) - ((button_padding_y + button_resume_text.height + button_padding_y) / 2))
		);
		
		this.elements.add(button_resume_bg);
		
		button_resume_bg.fixedToCamera = true;
		button_resume_bg.beginFill(0x162640);
		button_resume_bg.drawRect(
			0,
			0,
			(button_padding_x + button_resume_text.width + button_padding_x),
			(button_padding_y + button_resume_text.height + button_padding_y)
		);
		button_resume_bg.endFill();
		
		//doesnt work with fixedToCamera: button_resume_text.alignIn(button_resume_bg, Phaser.CENTER);
		button_resume_text.cameraOffset.x = (button_resume_bg.x + ((button_resume_bg.width / 2) - (button_resume_text.width / 2)));
		button_resume_text.cameraOffset.y = (button_resume_bg.y + ((button_resume_bg.height / 2) - (button_resume_text.height / 2)));
		button_resume_text.cameraOffset.y += ((button_resume_text.height - button_text_size) / 4);   // not sure why this works but it vertically centers the text properly within the button
		
		button_resume_text.bringToTop();   // text is drawn first above, bring to top to draw over button bg
		
		button_resume_bg.inputEnabled = true;
		button_resume_bg.input.useHandCursor = true;
		button_resume_bg.events.onInputDown.add(this.toggleMenu, this);
	};
	
	MinerGame.Component.PauseMenu.prototype.isPaused = function() {
		return !!this.active;
	};
	