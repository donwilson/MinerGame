	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.State = window.MinerGame.State || (window.MinerGame.State = {});
	
	MinerGame.State.MainMenu = function() {
		Phaser.State.call(this);
		
		this.available_characters = _.keys(MinerGame.Data.playable_characters);
		this.selected_character = null;
		this.character_data = null;
		
		this.logo = null;
		this.character = null;
		this.arrow_left = null;
		this.arrow_right = null;
		this.character_text = null;
		
		this.keys = null;
	};
	
	MinerGame.State.MainMenu.prototype = Object.create(Phaser.State.prototype);
	MinerGame.State.MainMenu.prototype.constructor = MinerGame.State.MainMenu;
	
	MinerGame.State.MainMenu.prototype.init = function() {
		console.log("State: MainMenu init");
		
		// set stage bg
		this.game.stage.backgroundColor = "#10151d";
	};
	
	//MinerGame.State.MainMenu.prototype.preload = function() {
	//	game.load.image('button_start', "static/images/button_start.png");
	//};
	
	MinerGame.State.MainMenu.prototype.create = function() {
		if(window.location.hash && ("skip_menu" === window.location.hash.substring(1))) {
			this.startGame();
		}
		
		// logo
		this.logo = this.game.add.sprite(0, 0, 'logo');
		this.logo.x = ((this.game.width / 2) - (this.logo.width / 2));
		this.logo.y = 100;
		
		// character
		var spacing_between_logo_and_character = 100;
		this.selectCharacter();
		
		this.character = this.game.add.sprite(
			(this.game.width / 2),
			(this.logo.bottom + spacing_between_logo_and_character + (TILE_HEIGHT / 2)),
			this.character_data.spritesheet
		);
		this.character.anchor.set(0.5);
		
		// render character
		this.renderCharacter();
		
		// buttons
		var spacing_between_arrow_and_character = 32;
		
		this.arrow_left = this.game.add.button(
			(this.character.x - (this.character.width / 2) - spacing_between_arrow_and_character - (TILE_WIDTH / 2)),
			this.character.y,
			MinerGame.Data.buttons.arrow_left.spritesheet,
			this.changeCharacterLeft,
			this
		);
		this.arrow_left.anchor.set(0.5);
		this.arrow_left.frame = MinerGame.Data.buttons.arrow_left.frame;
		
		this.arrow_right = this.game.add.button(
			(this.character.x + (this.character.width / 2) + spacing_between_arrow_and_character + (TILE_WIDTH / 2)),
			this.character.y,
			MinerGame.Data.buttons.arrow_right.spritesheet,
			this.changeCharacterRight,
			this
		);
		this.arrow_right.anchor.set(0.5);
		this.arrow_right.frame = MinerGame.Data.buttons.arrow_right.frame;
		
		// character text
		var spacing_between_text_and_character = 12;
		this.character_text = this.game.add.text(
			0, 
			(this.character.bottom + spacing_between_text_and_character),
			this.character_data.title, {
			'font': "normal 12px Verdana",
			'fill': "#ffffff",
			'boundsAlignH': "center",
			'boundsAlignV': "top"
		});
		this.character_text.setTextBounds(
			0,
			0,
			this.game.width,
			12
		);
		
		
		// button
		var spacing_between_button_and_text = 18;
		var button_text_size = 20;
		var button_padding_x = 12;
		var button_padding_y = 8;
		
		this.button_start_text = this.game.add.text(0, 0, "Start Game", {
			'font': "bold "+ button_text_size +"px Arial",
			'fill': "#ffffff"
		});
		
		this.button_start_bg = this.game.add.graphics(
			((this.game.width / 2) - ((button_padding_x + this.button_start_text.width + button_padding_x) / 2)),
			(this.character_text.bottom + spacing_between_button_and_text)
		);
		this.button_start_bg.beginFill(0x162640);
		this.button_start_bg.fillAlpha = 1;
		this.button_start_bg.drawRect(
			0,
			0,
			(button_padding_x + this.button_start_text.width + button_padding_x),
			(button_padding_y + this.button_start_text.height + button_padding_y)
		);
		this.button_start_bg.endFill();
		
		this.button_start_text.alignIn(this.button_start_bg, Phaser.CENTER);
		this.button_start_text.y += ((this.button_start_text.height - button_text_size) / 4);   // not sure why this works but it vertically centers the text properly within the button
		this.button_start_text.bringToTop();   // text is drawn first above, bring to top to draw over button bg
		
		this.button_start_bg.inputEnabled = true;
		this.button_start_bg.input.useHandCursor = true;
		this.button_start_bg.events.onInputDown.add(this.startGame, this);
	};
	
	//MinerGame.State.MainMenu.prototype.render = function() {
	//	
	//};
	
	MinerGame.State.MainMenu.prototype.changeCharacterLeft = function() {
		var index_key = _.find(_.keys(this.available_characters), function(key) {
			return (this.available_characters[ key ] === this.selected_character);
		}, this);
		
		if(_.isUndefined(index_key)) {
			index_key = 0;
		}
		
		index_key = parseInt(index_key, 10);
		index_key -= 1;
		
		this.selectCharacter(index_key);
		this.renderCharacter();
	};
	
	MinerGame.State.MainMenu.prototype.changeCharacterRight = function() {
		var index_key = _.find(_.keys(this.available_characters), function(key) {
			return (this.available_characters[ key ] === this.selected_character);
		}, this);
		
		if(_.isUndefined(index_key)) {
			index_key = (this.available_characters.length - 1);
		}
		
		index_key = parseInt(index_key, 10);
		index_key += 1;
		
		this.selectCharacter(index_key);
		this.renderCharacter();
	};
	
	MinerGame.State.MainMenu.prototype.selectCharacter = function(character_index) {
		if(("undefined" === typeof character_index) || (null === character_index)) {
			character_index = 0;
		} else if(character_index < 0) {
			character_index = (this.available_characters.length - 1);
		} else if(character_index >= this.available_characters.length) {
			character_index = 0;
		}
		
		this.selected_character = this.available_characters[ character_index ];
		this.character_data = MinerGame.Data.playable_characters[ this.selected_character ];
	};
	
	MinerGame.State.MainMenu.prototype.renderCharacter = function() {
		if(null !== this.character) {
			this.character.animations.add('walk_right', this.character_data.animations.walk_right.frames, this.character_data.animations.walk_right.speed, true);
			
			this.character.play('walk_right');
		}
		
		if(null !== this.character_text) {
			this.character_text.setText(this.character_data.title);
		}
	};
	
	MinerGame.State.MainMenu.prototype.startGame = function() {
		this.state.start('Game', true, false, this.selected_character);
	};
	