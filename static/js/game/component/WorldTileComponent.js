	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.Component = window.MinerGame.Component || (window.MinerGame.Component = {});
	
	MinerGame.Component.WorldTile = function(game, custWorld, x, y, type) {
		this.game = game;
		this.custWorld = custWorld;
		this.type = type;
		this.x = x;
		this.y = y;
		this.sprite = MinerGame.Data.missing_tile_sprite;
		this.inventory_sprite = MinerGame.Data.missing_tile_sprite;
		this.properties = {};
		this.collides = false;
		this.strength = 1;
		
		// random characters used in game timer to confirm event fired is the most up to date
		// because there's no event cancel functionality, store most recent event request into a unique key on this tile instance
		// once the event is ran, it compares against this value, and if it's not the same then it exits early
		this.timer_key = null;
		
		
		this.crack_sprite = null;
		
		this.create();
	};
	
	MinerGame.Component.WorldTile.prototype = Object.create(Phaser.Component.prototype);
	MinerGame.Component.WorldTile.prototype.constructor = MinerGame.Component.WorldTile;
	
	MinerGame.Component.WorldTile.prototype.create = function() {
		var tile_data = MinerGame.Data.tile_types[ this.type ];
		
		if(!_.isUndefined(tile_data.sprites) && tile_data.sprites.length) {
			// pick sprite from this tile's sprite list
			this.sprite = this.game.rnd.pick( tile_data.sprites );
		}
		
		// which sprite to show when added to inventory
		this.inventory_sprite = this.sprite;
		
		if(!_.isUndefined(tile_data.inventory_sprite)) {
			this.inventory_sprite = tile_data.inventory_sprite;
		}
		
		this.properties = tile_data.properties;
		this.collides = tile_data.collide || false;
		this.strength = tile_data.properties.strength;
		this.health = this.strength;
	};
	
	MinerGame.Component.WorldTile.prototype.getTileSprite = function() {
		return this.sprite;
		//return this.tile.getTileSprite();
	};
	
	MinerGame.Component.WorldTile.prototype.collidesWithPlayer = function() {
		return this.collides;
	};
	
	MinerGame.Component.WorldTile.prototype.takeHit = function(hit_strength) {
		// returns true if tile broken, false if not
		
		if(!this.strength) {
			// impossible to break
			return false;
		}
		
		this.health -= hit_strength;
		
		if(this.health > 0) {
			// tile not broken yet
			// @TMP reduce alpha (for now) to (health/strength)
			
			var map_tile = this.custWorld.getMapTile(this.x, this.y);
			
			if(null === map_tile) {
				// map tile not found
				return false;
			}
			
			//map_tile.alpha = (this.health / this.strength);
			//// tell map layer to redraw tiles since this map tile changed
			//this.custWorld.requestTileUpdate();
			
			var amount_cracked = (1 - (this.health / this.strength));
			
			var crack_frame;
			
			if(amount_cracked >= 0.75) {
				crack_frame = 1349;
			} else if(amount_cracked >= 0.50) {
				crack_frame = 1348;
			} else if(amount_cracked >= 0.25) {
				crack_frame = 1347;
			} else {
				crack_frame = 1346;
			}
			
			//console.log("with amount_cracked = ", amount_cracked, ", crack_frame = ", crack_frame);
			
			if(null === this.crack_sprite) {
				this.crack_sprite = this.game.add.sprite((this.x * TILE_WIDTH), (this.y * TILE_HEIGHT), 'world', crack_frame, this.custWorld.tile_cracks);
			}
			
			this.crack_sprite.frame = crack_frame;
			
			// set timer to reset tile health after X seconds
			this.startHitTimer();
			
			return false;
		}
		
		return true;
	};
	
	MinerGame.Component.WorldTile.prototype.startHitTimer = function() {
		// cancel previous timer (if any)
		this.cancelHitTimer();
		
		this.timer_key = this.game.rnd.uuid();
		
		//add(delayMS, callback, callbackContext[, arguments]<repeatable>)
		this.game.time.events.add(3000, this.resetTileHealth, this, this.timer_key);
	};
	
	MinerGame.Component.WorldTile.prototype.cancelHitTimer = function() {
		// cancel previous timer by resetting timer key
		this.timer_key = null;
	};
	
	MinerGame.Component.WorldTile.prototype.resetTileHealth = function(timer_key_check) {
		if(timer_key_check !== this.timer_key) {
			return;
		}
		
		var map_tile = this.custWorld.map.getTile(this.x, this.y);
		
		if(null === map_tile) {
			return;
		}
		
		// reset health
		this.health = this.strength;
		
		//// reset alpha
		//map_tile.alpha = 1;
		//
		//// tell map layer to refresh display
		//this.custWorld.requestTileUpdate();
		
		// destroy crack animation sprite
		if(null !== this.crack_sprite) {
			this.crack_sprite.destroy();
			this.crack_sprite = null;
		}
		
		// reset timer key
		this.timer_key = null;
	};
	
	MinerGame.Component.WorldTile.prototype.destroy = function() {
		if(null !== this.crack_sprite) {
			this.crack_sprite.destroy();
			this.crack_sprite = null;
		}
	};
	