	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.Component = window.MinerGame.Component || (window.MinerGame.Component = {});
	
	MinerGame.Component.MiniMap = function(game, custWorld) {
		this.game = game;
		this.custWorld = custWorld;
		
		this.last_render_position = new Phaser.Point(0, 0);
		this.last_render = 0;
		this.render_every_ms = 1000;
		this.isDirty = true;   // set to true to redraw minimap
		
		this.properties = {
			'background_color': 0x000000,
			'margin': 12,
			'padding': 4
		};
		
		Phaser.Graphics.call(this, this.game, 0, 0);
		
		this.fixedToCamera = true;
		this.cameraOffset.x = this.properties.margin;//this.cameraOffset.x = (this.game.camera.width - this.margin - width);
		this.cameraOffset.y = this.properties.margin;
		
		// add generated minimap to game
		this.game.add.existing(this);
	};
	
	MinerGame.Component.MiniMap.prototype = Object.create(Phaser.Graphics.prototype);
	MinerGame.Component.MiniMap.prototype.constructor = MinerGame.Component.MiniMap;
	
	MinerGame.Component.MiniMap.prototype.update = function() {
		var playerPosition = null;
		
		if(!this.isDirty && ((this.game.time.now - this.last_render) >= this.render_every_ms)) {
			this.isDirty = true;
		}
		
		if(!this.isDirty) {
			playerPosition = this.custWorld.player.getTilePositionXY();
			
			if(!Phaser.Point.equals(this.last_render_position, playerPosition)) {
				this.isDirty = true;
			}
		}
		
		if(!this.isDirty) {
			return;
		}
		
		var scale = 0.1;
		
		var width = (this.game.camera.view.width * scale);
		var height = (this.game.camera.view.height * scale);
		
		var dot_width = (TILE_WIDTH * scale);
		var dot_height = (TILE_HEIGHT * scale);
		
		var num_dots_x = Math.ceil( (width / dot_width) );
		var num_dots_y = Math.ceil( (height / dot_height) );
		
		var camera_tile_point = this.custWorld.getMapTileXY(this.game.camera.x, this.game.camera.y);
		
		// begin drawing
		this.clear();
		
		this.beginFill(0x000000);
		this.drawRect(
			0,
			0,
			(this.properties.padding + width + this.properties.padding),
			(this.properties.padding + height + this.properties.padding)
		);
		this.endFill();
		
		var y, x, tile, tile_color;
		
		// draw colored tiles
		for(y = 0; y < num_dots_y; y++) {
			for(x = 0; x < num_dots_x; x++) {
				tile = this.custWorld.getTile(
					(camera_tile_point.x + x),
					(camera_tile_point.y + y)
				);
				
				if(false === tile) {
					continue;
				}
				
				tile_color = tile.getMiniMapColor();
				
				if(false === tile_color) {
					continue;
				}
				
				this.beginFill(tile_color);
				this.drawRect(
					((x * dot_width) + this.properties.padding),
					((y * dot_height) + this.properties.padding),
					dot_width,
					dot_height
				);
				this.endFill();
			}
		}
		
		// draw player dot
		if(null === playerPosition) {
			playerPosition = this.custWorld.player.getTilePositionXY();
		}
		
		var playerMiniMapPositionX = this.game.math.clamp((playerPosition.x - camera_tile_point.x), 0, (num_dots_x - 1));
		var playerMiniMapPositionY = this.game.math.clamp((playerPosition.y - camera_tile_point.y), 0, (num_dots_y - 1));
		
		var playerDotColor = 0xFF00FF;
		
		this.beginFill(playerDotColor);
		this.drawRect(
			((playerMiniMapPositionX * dot_width) + this.properties.padding),
			((playerMiniMapPositionY * dot_height) + this.properties.padding),
			dot_width,
			dot_height
		);
		this.endFill();
		
		this.isDirty = false;
		this.last_render_position.set(playerPosition.x, playerPosition.y);
		this.last_render = this.game.time.now;
	};
	