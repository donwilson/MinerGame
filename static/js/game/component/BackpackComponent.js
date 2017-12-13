	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.Component = window.MinerGame.Component || (window.MinerGame.Component = {});
	
	MinerGame.Component.Backpack = function(game, custWorld) {
		this.game = game;
		this.custWorld = custWorld;
		
		this.inventory = [];
		
		this.box_slots = [];
		
		this.num_bottom_slots = 8;
		
		this.box_padding = 8;
		this.box_item_padding = 4;
		this.box_item_spacing = 8;   // space between each box
		this.box_margin = 16;
		
		this.buildDisplay();
	}
	
	MinerGame.Component.Backpack.prototype = Object.create(Phaser.Component.prototype);
	MinerGame.Component.Backpack.prototype.constructor = MinerGame.Component.Backpack;
	
	MinerGame.Component.Backpack.prototype.buildDisplay = function() {
		var box_height = (this.box_padding + this.box_item_padding + TILE_HEIGHT + this.box_item_padding + this.box_padding);
		var box_width = (this.box_padding + ((this.box_item_padding + TILE_HEIGHT + this.box_item_padding) * this.num_bottom_slots) + (this.box_item_spacing * Math.max(0, (this.num_bottom_slots - 1))) + this.box_padding);
		
		// start backpack graphic
		this.box_graphic = this.game.add.graphics(
			((this.game.camera.view.width / 2) - (box_width / 2)),
			(this.game.camera.view.height - this.box_margin - box_height)
		);
		this.box_graphic.fixedToCamera = true;
		
		// backpack background
		this.box_graphic.beginFill(0x000000);
		this.box_graphic.fillAlpha = 0.8;
		this.box_graphic.moveTo(0, 0);
		this.box_graphic.lineTo(box_width, 0);
		this.box_graphic.lineTo(box_width, box_height);
		this.box_graphic.lineTo(0, box_height);
		this.box_graphic.endFill();
		
		// item boxes
		var i, x, y, rect;
		for(i = 0; i < this.num_bottom_slots; i++) {
			// draw item box
			rect = new Phaser.Rectangle(
				(this.box_padding + ((this.box_item_padding + TILE_WIDTH + this.box_item_padding + this.box_item_spacing) * i)),
				this.box_padding,
				(this.box_item_padding + TILE_WIDTH + this.box_item_padding),
				(this.box_item_padding + TILE_HEIGHT + this.box_item_padding)
			);
			
			this.box_graphic.beginFill(0x333333);//this.box_graphic.beginFill(0x000000);
			this.box_graphic.fillAlpha = 0.5;
			this.box_graphic.moveTo(rect.topLeft.x, rect.topLeft.y);
			this.box_graphic.lineTo(rect.topRight.x, rect.topRight.y);
			this.box_graphic.lineTo(rect.bottomRight.x, rect.bottomRight.y);
			this.box_graphic.lineTo(rect.bottomLeft.x, rect.bottomLeft.y);
			this.box_graphic.endFill();
			
			
			// add filler sprite to box slots
			this.box_slots[ i ] = this.game.add.sprite(0, 0, 'tiles', Phaser.ArrayUtils.getRandomItem(tile_types.air.sprites));
			
			this.box_slots[ i ].alignIn(this.box_graphic, Phaser.TOP_LEFT, -(rect.topLeft.x + this.box_item_padding), -(rect.topLeft.y + this.box_item_padding));
			
			this.box_slots[ i ].fixedToCamera = true;
		}
		
		this.updateDisplay();
	};
	
	MinerGame.Component.Backpack.prototype.addItem = function(item, add_quantity) {
		add_quantity = add_quantity || 1;
		
		var invIndex = null;
		
		_.each(this.inventory, function(value, index) {
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
				'quantity': add_quantity,
			};
			
			if(this.box_slots[ invIndex ]) {
				this.box_slots[ invIndex ].frame = tile_types[ item.type ].sprites[0];   // default sprite
			}
		}
		
		this.updateDisplay();
		
		console.dir(this.inventory);
	};
	
	MinerGame.Component.Backpack.prototype.updateDisplay = function() {
		
	};
	
	