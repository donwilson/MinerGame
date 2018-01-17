/**
* @author       Don Wilson <donwilson@gmail.com>
* @copyright    2017 Pyxol
*/
	
	//var MinerGame = window.MinerGame || (window.MinerGame = {});
	//MinerGame.Component = window.MinerGame.Component || (window.MinerGame.Component = {});
	
	/**
	 * Backpack that stores tools and items collected from world
	 * 
	 * @class MinerGame.Component.Backpack
	 * @constructor
	 * @extends Phaser.Component
	 * @param {MinerGame.Entity.Player} player    Player entity
	 * @param {Phaser.Game} game      Phaser game
	 * @param {MinerGame.Component.WorldComponent} custWorld World instance
	 */
	MinerGame.Component.Backpack = function(player, game, custWorld) {
		/**
		 * @property {MinerGame.Entity.Player} player - A Player instance
		 */
		this.player = player;
		
		/**
		 * @property {Phaser.Game} game - Phaser game instance
		 */
		this.game = game;
		
		/**
		 * @property {MinerGame.Component.World} custWorld - World instance
		 */
		this.custWorld = custWorld;
		
		/**
		 * @property {Object[]} inventory - Backpack inventory slots
		 * @property {String} inventory[].item_name - Key from MinerGame.Data.tile_types
		 * @property {Number} inventory[].quantity - Quantity in this inventory slot
		 * @property {String} inventory[].type - Type of item (tile, tool, ...)
		 */
		this.inventory = [];
		
		/**
		 * @property {Array<Phaser.Sprite>} Sprites drawn in backpack
		 */
		this.box_slots = [];
		
		/**
		 * @property {Number} num_bottom_slots - Number of backpack slots at bottom
		 * @default
		 */
		this.num_bottom_slots = 8;
		
		/**
		 * @property {Number} selected_slot - Current selected slot in backpack
		 * @default
		 */
		this.selected_slot = 0;
		
		/**
		 * @property {Phaser.Rectangle} backpack_rect - Rectangle of backpack graphic
		 */
		this.backpack_rect = null;
		
		/**
		 * @property {Phaser.Graphics} box_graphic - Container graphics for backpack
		 */
		this.box_graphic = null;
		
		/**
		 * @property {Number} box_margin - Margin from side of screen
		 * @default
		 */
		this.box_margin = 16;   // margin from side of game
		
		/**
		 * @property {Number} box_padding - padding from box to box items
		 * @default
		 */
		this.box_padding = 8;
		
		/**
		 * @property {Number} box_slot_padding - padding from box slot container to sprite
		 * @default
		 */
		this.box_slot_padding = 6;
		
		/**
		 * @property {Number} box_slot_spacing - space between each box slot in backpack
		 * @default
		 */
		this.box_slot_spacing = 8;
		
		/**
		 * @property {Number} box_background_color - Background color of backpack
		 * @default
		 */
		this.box_background_color = 0x000000;
		
		/**
		 * @property {Number} box_background_alpha - Alpha applied to background color of backpack
		 * @default
		 */
		this.box_background_alpha = 0.8;
		
		/**
		 * @property {Number} box_slot_background_color - Background color of box slot
		 * @default
		 */
		this.box_slot_background_color = 0x333333;
		
		/**
		 * @property {Number} box_slot_background_alpha - Alpha applied to background color of box slot
		 * @default
		 */
		this.box_slot_background_alpha = 0.5;
		
		/**
		 * @property {Number} box_slot_corner_radius - Radius on the corner of each box slot
		 * @default
		 */
		this.box_slot_corner_radius = 6;
		
		/**
		 * @property {Number} box_slot_selected_background_color - Background color of selected box slot
		 * @default
		 */
		this.box_slot_selected_background_color = 0x333333;
		
		/**
		 * @property {Number} box_slot_selected_border_width - Border size of selected box slot
		 * @default
		 */
		this.box_slot_selected_border_width = 1;
		
		/**
		 * @property {Number} box_slot_selected_border_color - Border color of selected box slot
		 * @default
		 */
		this.box_slot_selected_border_color = 0xFFFC00;
		
		/**
		 * @property {Number} box_slot_selected_border_alpha - Alpha applied to border of selected box slot
		 * @default
		 */
		this.box_slot_selected_border_alpha = 0.5;
		
		
		this.create();
		
		/**
		 * Mapped array of Phaser.Key instances for keys 1-8, used to make specific box slot active
		 *
		 * @type {Object<Phaser.Key>}
		 */
		this.keys = this.game.input.keyboard.addKeys({
			'one': Phaser.Keyboard.ONE,
			'two': Phaser.Keyboard.TWO,
			'three': Phaser.Keyboard.THREE,
			'four': Phaser.Keyboard.FOUR,
			'five': Phaser.Keyboard.FIVE,
			'six': Phaser.Keyboard.SIX,
			'seven': Phaser.Keyboard.SEVEN,
			'eight': Phaser.Keyboard.EIGHT
		});
	};
	
	MinerGame.Component.Backpack.prototype = Object.create(Phaser.Component.prototype);
	MinerGame.Component.Backpack.prototype.constructor = MinerGame.Component.Backpack;
	
	/**
	 * @method
	 */
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
		for(let i = 0; i < this.num_bottom_slots; i++) {
			let rect = this.getItemBoxRelativeRect(i);
			
			this.box_slots[ i ] = {
				'sprite': this.game.add.sprite(0, 0, 'world', MinerGame.Data.tile_types.air.sprites[0]),
				'type': "air",
				'draw_text': this.game.add.text(0, 0, "", {
					'font': "10px Verdana",
					'fill': "#ffffff"
				}),
				'container': rect
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
		
		// starter tools
		this.addTool("wood_shovel");
		this.addTool("wood_pickaxe");
		this.addTool("wood_axe");
	};
	
	/**
	 * @method
	 */
	MinerGame.Component.Backpack.prototype.update = function() {
		// change active item slots based on pressing keys 1-8
		if(this.keys.one.isDown) {
			this.setActiveItemSlot(0);
		} else if(this.keys.two.isDown) {
			this.setActiveItemSlot(1);
		} else if(this.keys.three.isDown) {
			this.setActiveItemSlot(2);
		} else if(this.keys.four.isDown) {
			this.setActiveItemSlot(3);
		} else if(this.keys.five.isDown) {
			this.setActiveItemSlot(4);
		} else if(this.keys.six.isDown) {
			this.setActiveItemSlot(5);
		} else if(this.keys.seven.isDown) {
			this.setActiveItemSlot(6);
		} else if(this.keys.eight.isDown) {
			this.setActiveItemSlot(7);
		}
	};
	
	/**
	 * @method
	 */
	MinerGame.Component.Backpack.prototype.draw = function() {
		// clear any existing drawing
		this.box_graphic.clear();
		
		// backpack background
		this.box_graphic.beginFill(this.box_background_color);
		this.box_graphic.fillAlpha = this.box_background_alpha;
		//this.box_graphic.drawRect(0, 0, this.backpack_rect.width, this.backpack_rect.height);
		this.box_graphic.drawRoundedRect(0, 0, this.backpack_rect.width, this.backpack_rect.height, this.box_corner_radius);
		this.box_graphic.endFill();
		
		// item boxes
		for(let i = 0; i < this.num_bottom_slots; i++) {
			// draw item box
			let rect = this.getItemBoxRelativeRect(i);
			
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
			//this.box_graphic.drawRect(rect.x, rect.y, rect.width, rect.height);
			this.box_graphic.drawRoundedRect(rect.x, rect.y, rect.width, rect.height, this.box_slot_corner_radius);
			/*this.box_graphic.moveTo(rect.topLeft.x, rect.topLeft.y);
			this.box_graphic.lineTo(rect.topRight.x, rect.topRight.y);
			this.box_graphic.lineTo(rect.bottomRight.x, rect.bottomRight.y);
			this.box_graphic.lineTo(rect.bottomLeft.x, rect.bottomLeft.y);*/
			this.box_graphic.endFill();
		}
	};
	
	/**
	 * Add an item by name to backpack
	 *
	 * @method
	 * 
	 * @param {string} item_name    Key from MinerGame.Data.tile_types
	 * @param {number} add_quantity How many to add (defaults to 1
	 * 
	 * @return {boolean}
	 */
	MinerGame.Component.Backpack.prototype.addItem = function(item_name, add_quantity) {
		if(!item_name || ("air" === item_name)) {
			return false;
		}
		
		if(_.isUndefined(MinerGame.Data.tile_types[ item_name ])) {
			console.error("Unknown tile_type '"+ item_name +"'");
			
			return false;
		}
		
		let tile_data = MinerGame.Data.tile_types[ item_name ];
		add_quantity = add_quantity || 1;
		
		let invIndex = null;
		let backupIndex = null;
		
		_.each(this.inventory, function(value, index) {
			// @TODO max quantity per slot (based on MinerGame.Data.tile_types.max_inventory_slot_quantity?)
			if(value.item_name === item_name) {
				invIndex = index;
			} else if((null === invIndex) && (null === backupIndex) && ("air" === value.item_name)) {
				backupIndex = index;
			}
		});
		
		if(null !== invIndex) {
			this.inventory[ invIndex ].quantity += add_quantity;
		} else {
			// use first slot that has air?
			if(null !== backupIndex) {
				invIndex = backupIndex;
			}
			
			// new inventory slot
			if(null === invIndex) {
				invIndex = this.inventory.length;
			}
			
			this.inventory[ invIndex ] = {
				'item_name': item_name,
				'quantity': add_quantity,
				'type': "tile"
			};
			
			if(this.box_slots[ invIndex ]) {
				this.box_slots[ invIndex ].type = item_name;
				
				if(!_.isUndefined(MinerGame.Data.tile_types[ item_name ].inventory_sprite)) {
					this.box_slots[ invIndex ].sprite.frame = MinerGame.Data.tile_types[ item_name ].inventory_sprite;   // inventory sprite
				} else {
					this.box_slots[ invIndex ].sprite.frame = MinerGame.Data.tile_types[ item_name ].sprites[0];   // default sprite
				}
			}
		}
		
		this.updateItemBoxes();
		
		return true;
	};
	
	/**
	 * Add a tool by name to backpack
	 *
	 * @method
	 * 
	 * @param {string} item_name    Key from MinerGame.Data.tile_types
	 * @param {number} add_quantity How many to add (defaults to 1
	 * 
	 * @return {boolean}
	 */
	MinerGame.Component.Backpack.prototype.addTool = function(item_name, add_quantity) {
		if(!MinerGame.Data.tile_types[ item_name ]) {
			return false;
		}
		
		let item = MinerGame.Data.tile_types[ item_name ];
		
		if(!item.type || ("tool" !== item.type)) {
			return false;
		}
		
		add_quantity = add_quantity || 1;
		
		let invIndex = null;
		
		_.each(this.inventory, function(value, index) {
			// @TODO max quantity per slot (based on MinerGame.Data.tile_types.max_inventory_slot_quantity?)
			if(value.item_name === item.type) {
				invIndex = index;
			}
		});
		
		if(null !== invIndex) {
			this.inventory[ invIndex ].quantity += add_quantity;
		} else {
			invIndex = this.inventory.length;
			
			this.inventory[ invIndex ] = {
				'item_name': item_name,
				'quantity': add_quantity,
				'type': item.type
			};
			
			if(this.box_slots[ invIndex ]) {
				this.box_slots[ invIndex ].type = item_name;
				this.box_slots[ invIndex ].sprite.frame = item.sprites[0];   // default sprite
			}
		}
		
		this.updateItemBoxes();
		
		return true;
	};
	
	/**
	 * Empty out a specific box slot
	 *
	 * @method
	 * 
	 * @param  {number} slot Box slot number
	 */
	MinerGame.Component.Backpack.prototype.emptySlot = function(slot) {
		this.inventory[ slot ] = {
			'item_name': "air",
			'quantity': 0,
			'type': "tile"
		};
		
		if(this.box_slots[ slot ]) {
			this.box_slots[ slot ].type = "air";
			this.box_slots[ slot ].sprite.frame = MinerGame.Data.tile_types['air'].sprites[0];
		}
	};
	
	/**
	 * Trigger a box slot as used
	 *
	 * @method
	 * 
	 * @param  {number} slot Box slot number
	 * 
	 * @return {boolean}
	 */
	MinerGame.Component.Backpack.prototype.useInventory = function(slot) {
		if(!this.inventory[ slot ]) {
			return false;
		}
		
		if("tool" === this.inventory[ slot ].type) {
			// future...
			
			return true;
		} else if("tile" === this.inventory[ slot ].type) {
			this.inventory[ slot ].quantity -= 1;
			
			if(this.inventory[ slot ].quantity <= 0) {
				// empty out inventory slot
				this.emptySlot(slot);
			}
			
			this.updateItemBoxes();
			
			return true;
		}
	};
	
	/**
	 * Use selected box slot on specific world tile
	 * 
	 * @method
	 * 
	 * @param  {number} tileX World tile X
	 * @param  {number} tileY World tile Y
	 * 
	 * @return {boolean}
	 */
	MinerGame.Component.Backpack.prototype.useSelectedItemSlot = function(tileX, tileY) {
		//console.log("useSelectedItemSlot: "+ tileX +", "+ tileY);
		
		// make sure activePointer is still at tileX, tileY
		let activePointerTileX = this.custWorld.layer.getTileX(this.game.input.activePointer.worldX);
		let activePointerTileY = this.custWorld.layer.getTileY(this.game.input.activePointer.worldY);
		
		if((activePointerTileX != tileX) || (activePointerTileY != tileY)) {
			return false;
		}
		
		if(!this.inventory[ this.selected_slot ]) {
			return false;
		}
		
		let selected_inventory_item = this.inventory[ this.selected_slot ];
		
		if(!selected_inventory_item.quantity || ("air" === selected_inventory_item.item_name)) {
			// nothing to do
			return false;
		}
		
		let tile_hit = this.custWorld.getTile(tileX, tileY);
		let item_holding = MinerGame.Data.tile_types[ selected_inventory_item.item_name ];
		
		if("tool" === item_holding.type) {
			// use tool
			if("air" === tile_hit.type) {
				return false;
			}
			
			if(item_holding && item_holding.properties && item_holding.properties.effective_tiles && item_holding.properties.effective_tiles.length && (-1 !== _.indexOf(item_holding.properties.effective_tiles, tile_hit.type))) {
				// tool can be used against this
				//console.log("tile_hit.strength = ", tile_hit.strength);
				//console.log("tile_hit.health = ", tile_hit.health);
				
				if(!tile_hit.strength) {
					// impossible to break
					return false;
				}
				
				if(true === this.custWorld.hitTile(tileX, tileY, item_holding.properties.strength)) {
					// broke tile, add to inventory
					//console.log("tile_hit=", tile_hit);
					
					if(!_.isUndefined(tile_hit.properties.drops)) {
						// this tile breaks up into different 'drops', iterate over and add each
						_.each(tile_hit.properties.drops, function(drop) {
							let drop_quantity = drop.quantity || 1;
							
							this.custWorld.emitItemDrop(drop.type, drop_quantity, tileX, tileY);
							//this.addItem(drop.type, drop_quantity);
						}, this);
					} else {
						// add this tile to inventory
						
						this.custWorld.emitItemDrop(tile_hit.type, 1, tileX, tileY);
						//this.addItem(tile_hit.type);
					}
					
					//this.custWorld.replaceTile(tileX, tileY, "air");
					//this.useInventory(this.selected_slot);
					this.updateItemBoxes();
					//this.player.positionTool();
					
					return true;
				}
			}
			
			return false;
		}
		
		if("tile" === item_holding.type) {
			// place a tile
			if("air" !== tile_hit.type) {
				// cant overwrite non-air
				return false;
			}
			
			this.useInventory(this.selected_slot);
			this.custWorld.replaceTile(tileX, tileY, selected_inventory_item.item_name);
			
			this.player.positionTool();
			
			return true;
		}
		
		return false;
	};
	
	/**
	 * Update box slot sprite/text values
	 * 
	 * @method
	 */
	MinerGame.Component.Backpack.prototype.updateItemBoxes = function() {
		for(let i = 0; i < this.num_bottom_slots; i++) {
			let quantity = 0;
			
			if(this.inventory[ i ] && this.inventory[ i ].quantity) {
				quantity = this.inventory[ i ].quantity;
			}
			
			if(quantity > 0) {
				// show sprite
				this.box_slots[ i ].sprite.alpha = 1;
				
				// show item text on tiles
				if("tool" === this.inventory[ i ].type) {
					this.box_slots[ i ].draw_text.setText("0");
					this.box_slots[ i ].draw_text.alpha = 0;
				} else {
					this.box_slots[ i ].draw_text.alpha = 1;
					this.box_slots[ i ].draw_text.setText(quantity);
				}
			} else {
				// hide sprite
				this.box_slots[ i ].sprite.alpha = 0;
				
				// hide+empty item text
				this.box_slots[ i ].draw_text.alpha = 0;
				this.box_slots[ i ].draw_text.setText("");
			}
		}
	};
	
	/**
	 * Calculate the backpack draw rectangle
	 * 
	 * @method
	 */
	MinerGame.Component.Backpack.prototype.setBackpackRect = function() {
		let width = (this.box_padding + ((this.box_slot_padding + TILE_HEIGHT + this.box_slot_padding) * this.num_bottom_slots) + (this.box_slot_spacing * Math.max(0, (this.num_bottom_slots - 1))) + this.box_padding);
		let height = (this.box_padding + this.box_slot_padding + TILE_HEIGHT + this.box_slot_padding + this.box_padding);
		
		this.backpack_rect = new Phaser.Rectangle(
			((this.game.camera.view.width / 2) - (width / 2)),
			(this.game.camera.view.height - this.box_margin - height),
			width,
			height
		);
	};
	
	/**
	 * Return a Rectangle of the specified box slot, position relative to backpack
	 * 
	 * @method
	 * 
	 * @param  {number} i Box slot number
	 *
	 * @return {Phaser.Rectangle}   Rectangle relative to top left of backpack
	 */
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
	
	/**
	 * Mark box slot as active
	 *
	 * @method
	 * 
	 * @param {number} index Box slot number
	 */
	MinerGame.Component.Backpack.prototype.setActiveItemSlot = function(index) {
		this.selected_slot = index;
		
		if((this.selected_slot < 0) || (this.selected_slot >= this.box_slots.length)) {
			// reset to 0 since outside of box_slots amount
			this.selected_slot = 0;
		}
		
		// redraw bottom inventory
		this.draw();
		
		// reposition player tool
		this.player.positionTool();
	};
	
	/**
	 * Get selected box slot
	 *
	 * @method
	 * 
	 * @return {Object|null}
	 */
	MinerGame.Component.Backpack.prototype.getActiveItem = function() {
		// return the currently selected item in backpack
		return this.inventory[ this.selected_slot ] || null;
	};
	
	/**
	 * Attempt to capture click
	 * 
	 * @method
	 * 
	 * @return {boolean} True if backpack is able to capture click (inside backpack), otherwise false
	 */
	MinerGame.Component.Backpack.prototype.captureClick = function() {
		let cameraX = (this.game.input.activePointer.worldX - this.game.camera.view.x);
		let cameraY = (this.game.input.activePointer.worldY - this.game.camera.view.y);
		
		// check if click is inside backpack, if so do logic and capture (return true), otherwise release click (return false)
		if(!this.backpack_rect.contains(cameraX, cameraY)) {
			//console.log("backpack(["+ this.backpack_rect.x +","+ this.backpack_rect.y +"],["+ (this.backpack_rect.x + this.backpack_rect.width) +","+ (this.backpack_rect.y + this.backpack_rect.height) +"]) not contain "+ cameraX +","+ cameraY);
			
			return false;
		}
		
		// determine which box slot is clicked
		let relativeX = (cameraX - this.backpack_rect.topLeft.x);
		let relativeY = (cameraY - this.backpack_rect.topLeft.y);
		let invIndex = null;
		
		_.each(this.box_slots, function(box_slot, index) {
			// @TODO max quantity per slot (based on MinerGame.Data.tile_types.max_inventory_slot_quantity?)
			if((null === invIndex) && box_slot.container.contains(relativeX, relativeY)) {
				invIndex = index;
			}
		});
		
		if(null !== invIndex) {
			this.setActiveItemSlot(invIndex);
		}
		
		return true;
	};
	
	/**
	 * Process a mouse wheel event. Sets next/previous box slot as active when possible
	 * 
	 * @method
	 */
	MinerGame.Component.Backpack.prototype.handleMouseWheel = function() {
		let new_selected_slot = this.selected_slot;
		
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
		
		this.setActiveItemSlot(new_selected_slot);
	};
	
	/**
	 * Key down event
	 *
	 * @param  {object} event Mouse event
	 */
	MinerGame.Component.Backpack.prototype.handleKeyDown = function(event) {
		console.log("Backpack.handleKeyDown.event = ", event);
		
		//this.setActiveItemSlot(new_selected_slot);
	};
	