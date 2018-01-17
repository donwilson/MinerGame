/**
* @author       Don Wilson <donwilson@gmail.com>
* @copyright    2017 Pyxol
*/
	
	//var MinerGame = window.MinerGame || (window.MinerGame = {});
	//MinerGame.Entity = window.MinerGame.Entity || (window.MinerGame.Entity = {});
	
	MinerGame.Entity.TileDrop = function(game, custWorld, tile_type, tileX, tileY, quantity) {
		this.game = game;
		this.custWorld = custWorld;
		
		this.properties = {
			'quantity': quantity || 1
		};
		
		let tile_data = MinerGame.Data.tile_types[ tile_type ];
		
		let x = ((tileX * TILE_WIDTH) + (TILE_WIDTH / 2) + this.game.rnd.between(0, 4));
		let y = ((tileY * TILE_HEIGHT) + (TILE_HEIGHT / 2));
		
		// determine sprite frame
		let frame = MinerGame.Data.missing_tile_sprite;
		
		if(!_.isUndefined(tile_data.inventory_sprite)) {
			frame = tile_data.inventory_sprite;
		} else if(!_.isUndefined(tile_data.sprites) && tile_data.sprites.length) {
			// pick sprite from this tile's sprite list
			frame = tile_data.sprites[0];
		}
		
		Phaser.Sprite.call(this, this.game, x, y, 'world', frame);
		
		// name used for backpack pickup
		this.name = tile_type;
		
		// add generated player to game
		this.game.add.existing(this);
		
		// anchor
		this.anchor.set(0.5);
		
		// scale
		this.scale.set(0.4);
		
		// physics
		this.game.physics.enable(this);
		
		// physics
		this.body.bounce.x = 1;
		this.body.bounce.y = 0.2;
		this.body.collideWorldBounds = true;
		this.body.allowRotation = false;
		this.body.drag.x = 30;
		
		// set initial velocity a bit
		this.body.velocity.x = (20 * this.game.rnd.pick([-1, 1]));//this.body.velocity.x = this.game.rnd.between(-10, 10);
		this.body.velocity.y = -60;//this.body.velocity.y = this.game.rnd.between(-10, -30);
		
		
	};
	
	MinerGame.Entity.TileDrop.prototype = Object.create(Phaser.Sprite.prototype);
	MinerGame.Entity.TileDrop.prototype.constructor = MinerGame.Entity.TileDrop;
	
	MinerGame.Entity.TileDrop.prototype.update = function() {
		//this.body.velocity.x = 0;
	};
	
	MinerGame.Entity.TileDrop.prototype.getTileName = function() {
		return this.name;
	};
	
	MinerGame.Entity.TileDrop.prototype.getQuantity = function() {
		return this.properties.quantity;
	};
	