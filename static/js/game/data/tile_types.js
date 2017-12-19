var tile_types = {
	'air': {
		'type': "tile",
		'sprites': [40],
		'collide': false,
		'properties': {
			'title': "Air",
			'strength': 0
		}
	},
	'dirt': {
		'type': "tile",
		'sprites': [200, 201, 203, 204, 205, 206, 207],
		'collide': true,
		'properties': {
			'title': "Dirt",
			'strength': 4
		}
	},
	'stone': {
		'type': "tile",
		'sprites': [80, 81, 82, 83, 84, 85, 86, 87],
		'collide': true,
		'properties': {
			'title': "Stone",
			'strength': 6
		}
	},
	'ore': {
		'type': "tile",
		'sprites': [2640, 2641, 2642, 2643],
		'collide': true,
		'properties': {
			'title': "Ore",
			'strength': 6
		}
	},
	'lava': {
		'type': "tile",
		'sprites': [1120, 1121, 1122, 1123],
		'collide': true,
		'properties': {
			'title': "Lava",
			'strength': 0
		}
	},
	'wood_shovel': {
		'type': "tool",
		'sprites': [66],
		'collide': false,
		'properties': {
			'strength': 1,
			'effective_tiles': ['dirt']
		}
	},
	'wood_pickaxe': {
		'type': "tool",
		'sprites': [106],
		'collide': false,
		'properties': {
			'strength': 1,
			'effective_tiles': ['stone', 'ore']
		}
	}
};