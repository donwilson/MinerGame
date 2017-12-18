var tile_types = {
	'air': {
		'sprites': [40],
		'collide': false,
		'properties': {
			'title': "Air",
			'strength': 0
		}
	},
	'dirt': {
		'sprites': [200, 201, 203, 204, 205, 206, 207],
		'collide': true,
		'properties': {
			'title': "Dirt",
			'strength': 1
		}
	},
	'stone': {
		'sprites': [80, 81, 82, 83, 84, 85, 86, 87],
		'collide': true,
		'properties': {
			'title': "Stone",
			'strength': 3
		}
	},
	'ore': {
		'sprites': [2640, 2641, 2642, 2643],
		'collide': true,
		'properties': {
			'title': "Ore",
			'strength': 5
		}
	},
	'lava': {
		'sprites': [1120, 1121, 1122, 1123],
		'collide': true,
		'properties': {
			'title': "Lava",
			'strength': 0
		}
	}
};