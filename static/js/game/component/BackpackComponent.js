	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.Component = window.MinerGame.Component || (window.MinerGame.Component = {});
	
	MinerGame.Component.Backpack = function(game, custWorld) {
		this.game = game;
		this.custWorld = custWorld;
		
		this.inventory = [];
	}
	
	MinerGame.Component.Backpack.prototype = Object.create(Phaser.Component.prototype);
	MinerGame.Component.Backpack.prototype.constructor = MinerGame.Component.Backpack;
	
	MinerGame.Component.Backpack.prototype.addItem = function(item_name, add_quantity) {
		add_quantity = add_quantity || 1;
		
		var invIndex = null;
		
		_.each(this.inventory, function(value, index) {
			if(value.item === item_name) {
				invIndex = index;
			}
		});
		
		if(null !== invIndex) {
			this.inventory[ invIndex ].quantity += add_quantity;
		} else {
			invIndex = this.inventory.length;
			
			this.inventory[ invIndex ] = {
				'item': item_name,
				'quantity': add_quantity
			};
		}
		
		console.dir(this.inventory);
	};
	