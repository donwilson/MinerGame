	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.Component = window.MinerGame.Component || (window.MinerGame.Component = {});
	
	MinerGame.Component.Backpack = function(game, custWorld) {
		this.game = game;
		this.custWorld = custWorld;
		
		this.inventory = [];
		
		this.box_slots = [];
		
		this.num_bottom_slots = 8;
		this.selected_slot = 0;
		
		this.backpack_rect = null;
		
		this.box_margin = 16;   // margin from side of game
		this.box_padding = 8;   // padding from box to box items
		this.box_slot_padding = 6;   // padding from box slot container to sprite
		this.box_slot_spacing = 8;   // space between each box
		
		this.box_background_color = 0x000000;
		this.box_background_alpha = 0.8;
		this.box_slot_background_color = 0x333333;
		this.box_slot_background_alpha = 0.5;
		this.box_slot_selected_background_color = 0x333333;
		this.box_slot_selected_border_width = 1;
		this.box_slot_selected_border_color = 0xFFFC00;
		this.box_slot_selected_border_alpha = 0.5;
		
		this.create();
	};
	
	MinerGame.Component.Backpack.prototype = Object.create(Phaser.Component.prototype);
	MinerGame.Component.Backpack.prototype.constructor = MinerGame.Component.Backpack;
	
	MinerGame.Component.Backpack.prototype.create = function() {
		this.setBackpackRect();
		
		// start backpack graphic
		this.box_graphic = this.game.add.graphics(
			this.backpack_rect.topLeft.x,
			this.backpack_rect.topLeft.y
		);
		this.box_graphic.fixedToCamera = true;
		
		// draw item backpack
		this.draw();
		
		// setup backpack item sprites
		var i, rect;
		for(i = 0; i < this.num_bottom_slots; i++) {
			rect = this.getItemBoxRelativeRect(i);
			
			//this.box_slots[ i ] = this.game.add.sprite(0, 0, 'tiles', Phaser.ArrayUtils.getRandomItem(tile_types.air.sprites));
			this.box_slots[ i ] = {
				'sprite': this.game.add.sprite(0, 0, 'tiles', Phaser.ArrayUtils.getRandomItem(tile_types.air.sprites)),
				'type': "air",
				'draw_text': this.game.add.text(0, 0, "", {
					'font': "10px Verdana",
					'fill': "#ffffff"
				})
			}
			
			// align sprite
			this.box_slots[ i ].sprite.alignIn(this.box_graphic, Phaser.TOP_LEFT, -(rect.topLeft.x + this.box_slot_padding), -(rect.topLeft.y + this.box_slot_padding));
			this.box_slots[ i ].sprite.fixedToCamera = true;
			this.box_slots[ i ].sprite.alpha = 0;
			
			// align draw text
			this.box_slots[ i ].draw_text.anchor.x = 1;
			this.box_slots[ i ].draw_text.anchor.y = 0;
			this.box_slots[ i ].draw_text.alignIn(this.box_slots[ i ].sprite, Phaser.BOTTOM_RIGHT, -3, 6);
			this.box_slots[ i ].draw_text.fixedToCamera = true;
			this.box_slots[ i ].draw_text.alpha = 0;
			this.box_slots[ i ].draw_text.setShadow(0, 0, 'rgba(0, 0, 0, 0.5)', 0);
		}
	};
	
	MinerGame.Component.Backpack.prototype.draw = function() {
		// clear any existing drawing
		this.box_graphic.clear();
		
		// backpack background
		this.box_graphic.beginFill(this.box_background_color);
		this.box_graphic.fillAlpha = this.box_background_alpha;
		this.box_graphic.moveTo(0, 0);
		this.box_graphic.lineTo(this.backpack_rect.width, 0);
		this.box_graphic.lineTo(this.backpack_rect.width, this.backpack_rect.height);
		this.box_graphic.lineTo(0, this.backpack_rect.height);
		this.box_graphic.endFill();
		
		// item boxes
		var i, rect;
		for(i = 0; i < this.num_bottom_slots; i++) {
			// draw item box
			rect = this.getItemBoxRelativeRect(i);
			
			if(i == this.selected_slot) {
				// selected slot
				this.box_graphic.beginFill(this.box_slot_selected_background_color);
				this.box_graphic.lineStyle(this.box_slot_selected_border_width, this.box_slot_selected_border_color, this.box_slot_selected_border_alpha);
			} else {
				// non-selected slot
				this.box_graphic.beginFill(this.box_slot_background_color);
				this.box_graphic.lineStyle(0);
			}
			
			this.box_graphic.fillAlpha = this.box_slot_background_alpha;
			this.box_graphic.moveTo(rect.topLeft.x, rect.topLeft.y);
			this.box_graphic.lineTo(rect.topRight.x, rect.topRight.y);
			this.box_graphic.lineTo(rect.bottomRight.x, rect.bottomRight.y);
			this.box_graphic.lineTo(rect.bottomLeft.x, rect.bottomLeft.y);
			this.box_graphic.endFill();
		}
	};
	
	MinerGame.Component.Backpack.prototype.addItem = function(item, add_quantity) {
		add_quantity = add_quantity || 1;
		
		var invIndex = null;
		
		_.each(this.inventory, function(value, index) {
			// @TODO max quantity per slot (based on tile_types.max_inventory_slot_quantity?)
			if(value.item_name === item.type) {
				invIndex = index;
			}
		});
		
		if(null !== invIndex) {
			this.inventory[ invIndex ].quantity += add_quantity;
		} else {
			invIndex = this.inventory.length;
			
			this.inventory[ invIndex ] = {
				'item_name': item.type,
				'quantity': add_quantity
			};
			
			if(this.box_slots[ invIndex ]) {
				this.box_slots[ invIndex ].sprite.frame = tile_types[ item.type ].sprites[0];   // default sprite
			}
		}
		
		this.updateItemBoxes();
		
		console.dir(this.inventory);
	};
	
	MinerGame.Component.Backpack.prototype.updateItemBoxes = function() {
		var i, quantity;
		
		for(i = 0; i < this.num_bottom_slots; i++) {
			quantity = 0;
			
			if(this.inventory[ i ] && this.inventory[ i ].quantity) {
				quantity = this.inventory[ i ].quantity;
			}
			
			if(quantity > 0) {
				// show sprite
				this.box_slots[ i ].sprite.alpha = 1;
				
				// show item text
				this.box_slots[ i ].draw_text.alpha = 1;
				this.box_slots[ i ].draw_text.setText(quantity);
			} else {
				// hide sprite
				this.box_slots[ i ].sprite.alpha = 0;
				
				// hide+empty item text
				this.box_slots[ i ].draw_text.alpha = 0;
				this.box_slots[ i ].draw_text.setText("");
			}
		}
	};
	
	MinerGame.Component.Backpack.prototype.setBackpackRect = function() {
		var width = (this.box_padding + ((this.box_slot_padding + TILE_HEIGHT + this.box_slot_padding) * this.num_bottom_slots) + (this.box_slot_spacing * Math.max(0, (this.num_bottom_slots - 1))) + this.box_padding);
		var height = (this.box_padding + this.box_slot_padding + TILE_HEIGHT + this.box_slot_padding + this.box_padding);
		
		this.backpack_rect = new Phaser.Rectangle(
			((this.game.camera.view.width / 2) - (width / 2)),
			(this.game.camera.view.height - this.box_margin - height),
			width,
			height
		);
	};
	
	MinerGame.Component.Backpack.prototype.getItemBoxRelativeRect = function(i) {
		// i = item box 0-X
		// returns rect relative to top left of backpack
		return new Phaser.Rectangle(
			(this.box_padding + ((this.box_slot_padding + TILE_WIDTH + this.box_slot_padding + this.box_slot_spacing) * i)),
			this.box_padding,
			(this.box_slot_padding + TILE_WIDTH + this.box_slot_padding),
			(this.box_slot_padding + TILE_HEIGHT + this.box_slot_padding)
		);
	};
	
	MinerGame.Component.Backpack.prototype.handleMouseWheel = function() {
		var new_selected_slot = this.selected_slot;
		
		console.log(this.game.input.mouse);
		
		if(this.game.input.mouse.wheelDelta == -1) {
			// wheel scrolled down, scroll right in inventory
			new_selected_slot += 1;
		} else if(this.game.input.mouse.wheelDelta == 1) {
			// wheel scrolled up, scroll left in inventory
			new_selected_slot -= 1;
		} else {
			// not sure
			return;
		}
		
		if(new_selected_slot < 0) {
			new_selected_slot = (this.num_bottom_slots - 1);
		} else if(new_selected_slot >= this.num_bottom_slots) {
			new_selected_slot = 0;
		}
		
		this.selected_slot = new_selected_slot;
		
		// redraw bottom inventory
		this.draw();
	};