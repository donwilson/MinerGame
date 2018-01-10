	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.Component = window.MinerGame.Component || (window.MinerGame.Component = {});
	
	MinerGame.Component.MiniMap = function(game, custWorld) {
		this.game = game;
		this.custWorld = custWorld;
		
		this.debug = true;   // set to true to enable console log
		
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
		
		this.requestDraw(true);
	};
	
	MinerGame.Component.MiniMap.prototype = Object.create(Phaser.Graphics.prototype);
	MinerGame.Component.MiniMap.prototype.constructor = MinerGame.Component.MiniMap;
	
	MinerGame.Component.MiniMap.prototype.log = function(txt) {
		if(this.debug) {
			console.log("MiniMap:", txt);
		}
	};
	
	MinerGame.Component.MiniMap.prototype.requestDraw = function(force) {
		force = !!force;
		
		if(!force && !this.isDirty) {
			return;
		}
		
		this.log("Rendering minimap");
		
		var scale = 0.1;
		
		var width = (this.game.camera.view.width * scale);//var width = Math.floor((this.game.camera.width * scale));
		var height = (this.game.camera.view.height * scale);//var height = Math.floor((this.game.camera.height * scale));
		
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
		
		//this.log("camera = x: "+ this.game.camera.x +"-"+ (this.game.camera.x + this.game.camera.width) +", y: "+ this.game.camera.y +"-"+ (this.game.camera.y + this.game.camera.height))
		this.log("camera.view = x: "+ this.game.camera.view.x +"-"+ (this.game.camera.view.x + this.game.camera.view.width) +", y: "+ this.game.camera.view.y +"-"+ (this.game.camera.view.y + this.game.camera.view.height))
		//this.log("camera.position = x: "+ this.game.camera.position.x +"-"+ (this.game.camera.position.x + this.game.camera.width) +", y: "+ this.game.camera.position.y +"-"+ (this.game.camera.position.y + this.game.camera.height))
		this.log("minimap scale = "+ scale);
		this.log("minimap size = "+ width +"x"+ height);
		this.log("dot size = "+ dot_width +"x"+ dot_height);
		this.log("num_dots = "+ num_dots_x +","+ num_dots_y);
		this.log("camera = "+ this.game.camera.view.x +","+ this.game.camera.view.y);
		this.log("camera_tile_point = "+ camera_tile_point.x +","+ camera_tile_point.y);
		
		
		// draw colored tiles
		for(y = 0; y < num_dots_y; y++) {
			for(x = 0; x < num_dots_x; x++) {
				tile = this.custWorld.getTile(
					(camera_tile_point.x + x),
					(camera_tile_point.y + y)
				);
				
				if(false === tile) {
					this.log("tile not found at "+ x +","+ y);
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
		//var player
		
		
		this.isDirty = false;
	};
	