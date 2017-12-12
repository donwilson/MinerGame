var tile_types = {
	'air': {
		'sprites': [90],
		'collide': false,
		'properties': {
			'title': "Air",
			'strength': 0
		}
	},
	'dirt': {
		'sprites': [3, 5, 6],
		'collide': true,
		'properties': {
			'title': "Dirt",
			'strength': 1
		}
	},
	'stone': {
		'sprites': [27, 28, 29, 30],
		'collide': true,
		'properties': {
			'title': "Stone",
			'strength': 3
		}
	},
	'wood': {
		'sprites': [36, 37, 38, 39, 40],
		'collide': true,
		'properties': {
			'title': "Wood",
			'strength': 3
		}
	},
	'ore': {
		'sprites': [16, 17, 18, 19, 20],
		'collide': true,
		'properties': {
			'title': "Ore",
			'strength': 5
		}
	},
	'lava': {
		'sprites': [76],
		'collide': true,
		'properties': {
			'title': "Lava",
			'strength': 0
		}
	}
};