var tile_types = {
	'air': {
		'sprites': [16],
		'collide': false,
		'properties': {
			'title': "Air",
			'strength': 0
		}
	},
	'dirt': {
		'sprites': [80, 81, 82, 83, 84, 85, 86, 87],
		'collide': true,
		'properties': {
			'title': "Dirt",
			'strength': 1
		}
	},
	'stone': {
		'sprites': [32, 33, 34, 35, 36, 37, 38, 39],
		'collide': true,
		'properties': {
			'title': "Stone",
			'strength': 3
		}
	},
	'wood': {
		'sprites': [1024, 1025, 1026, 1027],
		'collide': true,
		'properties': {
			'title': "Wood",
			'strength': 3
		}
	},
	'ore': {
		'sprites': [672, 673, 674, 675],
		'collide': true,
		'properties': {
			'title': "Ore",
			'strength': 5
		}
	},
	'lava': {
		'sprites': [448, 449, 450, 451],
		'collide': true,
		'properties': {
			'title': "Lava",
			'strength': 0
		}
	}
};