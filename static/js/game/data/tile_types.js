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
	'bedrock': {
		'type': "tile",
		'sprites': [360, 361, 362, 363],
		'collide': true,
		'properties': {
			'title': "Bedrock",
			'strength': 0
		}
	},
	'dirt': {
		'type': "tile",
		'sprites': [200, 201, 203, 204, 205, 206, 207],
		'collide': true,
		'properties': {
			'title': "Dirt",
			'strength': 1
		}
	},
	'stone': {
		'type': "tile",
		'sprites': [80, 81, 82, 83, 84, 85, 86, 87],
		'collide': true,
		'properties': {
			'title': "Stone",
			'strength': 3
		}
	},
	'ore': {
		'type': "tile",
		'sprites': [2640, 2641, 2642, 2643],
		'collide': true,
		'properties': {
			'title': "Ore",
			'strength': 5
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
		},
		'grip_offset': {
			'x': 7,
			'y': 24
		},
		'angle_offset': 45,
		'angle_resting': 110,
		'angle_max': 20
	},
	'wood_pickaxe': {
		'type': "tool",
		'sprites': [106],
		'collide': false,
		'properties': {
			'strength': 1,
			'effective_tiles': ['stone', 'ore']
		},
		'grip_offset': {
			'x': 7,
			'y': 24
		},
		'angle_offset': 45,
		'angle_resting': 40,
		'angle_max': 110
	}
};