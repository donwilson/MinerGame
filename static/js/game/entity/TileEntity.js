	
	// tile object
	function customTile(map_x, map_y, type, properties) {
		this.type = type;
		this.x = map_x;
		this.y = map_y;
		this.sprite = 0;
		this.properties = {};
		this.collides = false;
		
		this.setTileType = function(type) {
			this.type = type;
			this.sprite = Phaser.ArrayUtils.getRandomItem( tile_types[ this.type ].sprites );
			this.properties = tile_types[ this.type ].properties;
			this.collides = tile_types[ this.type ].collide || false;
		};
		
		this.getTileSprite = function() {
			return this.sprite;
		};
		
		this.collidesWithPlayer = function() {
			return this.collides;
		};
		
		// set tile type on create
		this.setTileType(type, properties);
	}
	