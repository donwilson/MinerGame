	
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
		let playerPosition = null;
		
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
		
		let scale = 0.1;
		
		let width = (this.game.camera.view.width * scale);
		let height = (this.game.camera.view.height * scale);
		
		let dot_width = (TILE_WIDTH * scale);
		let dot_height = (TILE_HEIGHT * scale);
		
		let num_dots_x = Math.ceil( (width / dot_width) );
		let num_dots_y = Math.ceil( (height / dot_height) );
		
		let camera_tile_point = this.custWorld.getMapTileXY(this.game.camera.x, this.game.camera.y);
		
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
		
		// draw colored tiles
		for(let y = 0; y < num_dots_y; y++) {
			for(let x = 0; x < num_dots_x; x++) {
				let tile = this.custWorld.getTile(
					(camera_tile_point.x + x),
					(camera_tile_point.y + y)
				);
				
				if(false === tile) {
					continue;
				}
				
				let tile_color = tile.getMiniMapColor();
				
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
		
		let playerMiniMapPositionX = this.game.math.clamp((playerPosition.x - camera_tile_point.x), 0, (num_dots_x - 1));
		let playerMiniMapPositionY = this.game.math.clamp((playerPosition.y - camera_tile_point.y), 0, (num_dots_y - 1));
		
		let playerDotColor = 0xFF00FF;
		
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
	